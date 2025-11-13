import { useEffect, useMemo, useState } from 'react';
import styles from '../../../styles/PerformanceDashboard.module.css';

function buildSparklinePath(points = []) {
  if (!Array.isArray(points) || points.length < 2) {
    return '';
  }

  const width = 90;
  const height = 36;
  const values = points.filter((value) => typeof value === 'number');
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coordinates = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return coordinates.join(' ');
}

function DeltaBadge({ delta }) {
  if (!delta || typeof delta !== 'object') return null;
  const { direction = 'up', value = 0, label = '' } = delta;
  const isDown = direction === 'down';
  const className = `${styles.delta} ${isDown ? styles.deltaDown : styles.deltaUp}`;
  const formattedValue = typeof value === 'number' ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%` : value;

  return (
    <span className={className} aria-label={`Change ${isDown ? 'down' : 'up'} ${formattedValue}`}>
      <span className={styles.deltaValue}>{formattedValue}</span>
      {label && <span className={styles.deltaLabel}>{label}</span>}
    </span>
  );
}

function formatHeadline(metric) {
  if (!metric) return '—';
  if (metric.headline) return metric.headline;
  const { value, unit = 'number' } = metric;
  if (typeof value !== 'number') return value || '—';
  if (unit === 'currency') {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(
      value
    );
  }
  if (unit === 'percent') {
    return `${value.toFixed(1)}%`;
  }
  if (unit === 'days') {
    return `${Math.round(value)} days`;
  }
  return value.toLocaleString();
}

function formatTarget(metric) {
  if (!metric || typeof metric.target === 'undefined') return null;
  const { target, unit = 'number' } = metric;
  if (typeof target !== 'number') return target;
  if (unit === 'currency') {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      target
    );
  }
  if (unit === 'percent') {
    return `${target}%`;
  }
  if (unit === 'days') {
    return `${Math.round(target)} days`;
  }
  return target.toLocaleString();
}

export default function KpiSummary({ timeframe = '90d', onUpdated }) {
  const [metrics, setMetrics] = useState([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    async function loadMetrics() {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/reports/kpis?timeframe=${encodeURIComponent(timeframe)}`, {
          credentials: 'include',
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
          const message = payload?.message || 'Unable to load KPIs';
          throw new Error(message);
        }
        const data = payload?.data || {};
        if (isActive) {
          setMetrics(Array.isArray(data.metrics) ? data.metrics : []);
          setUpdatedAt(data.updatedAt || '');
          onUpdated?.(data.updatedAt || '');
        }
      } catch (err) {
        if (isActive) {
          setMetrics([]);
          setUpdatedAt('');
          setError(err.message || 'Failed to load KPIs');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadMetrics();

    return () => {
      isActive = false;
    };
  }, [timeframe, onUpdated]);

  const emptyStateLabel = useMemo(() => {
    if (isLoading) return 'Loading metrics…';
    if (error) return error;
    return 'No metrics available for this timeframe yet.';
  }, [error, isLoading]);

  if (isLoading || error || metrics.length === 0) {
    return (
      <div className={`${styles.card} ${styles.cardFallback}`} role="status">
        <span>{emptyStateLabel}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${styles.kpiCard}`}>
      <header className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Key KPIs</h2>
        {updatedAt && <span className={styles.cardMeta}>Refreshed {new Date(updatedAt).toLocaleTimeString()}</span>}
      </header>
      <div className={styles.kpiGrid}>
        {metrics.map((metric) => {
          const targetText = formatTarget(metric);
          return (
            <article key={metric.id} className={styles.kpiItem}>
              <div className={styles.kpiItemHeader}>
                <span className={styles.kpiLabel}>{metric.label}</span>
                <DeltaBadge delta={metric.delta} />
              </div>
              <div className={styles.kpiValueRow}>
                <span className={styles.kpiValue}>{formatHeadline(metric)}</span>
                {targetText && <span className={styles.kpiTarget}>Target {targetText}</span>}
              </div>
              {Array.isArray(metric.sparkline) && metric.sparkline.length > 1 && (
                <svg
                  className={styles.kpiSparkline}
                  viewBox="0 0 90 36"
                  role="img"
                  aria-label={`${metric.label} sparkline`}
                >
                  <polygon
                    points={`0,36 ${buildSparklinePath(metric.sparkline)} 90,36`}
                    className={styles.kpiSparklineFill}
                  />
                  <polyline points={buildSparklinePath(metric.sparkline)} className={styles.kpiSparklineLine} />
                </svg>
              )}
              {metric.notes && <p className={styles.kpiNotes}>{metric.notes}</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}


