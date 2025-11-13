import { jsonError, jsonSuccess } from '../../../lib/response';

const KPI_DATA = {
  '30d': [
    {
      id: 'pipeline',
      label: 'Pipeline coverage',
      value: 1850000,
      unit: 'currency',
      delta: { direction: 'up', value: 8.4, label: 'vs prior 30 days' },
      target: 1600000,
      sparkline: [1520000, 1640000, 1710000, 1850000],
      notes: 'Inbound referrals increased due to campaigns.',
    },
    {
      id: 'conversion',
      label: 'Stage-to-offer conversion',
      value: 32.5,
      unit: 'percent',
      target: 30,
      delta: { direction: 'up', value: 2.1, label: 'goal 30%' },
      sparkline: [27.8, 28.4, 31.2, 32.5],
    },
    {
      id: 'time-to-fill',
      label: 'Median time-to-fill',
      value: 28,
      unit: 'days',
      target: 32,
      delta: { direction: 'down', value: '5.2 days', label: 'faster vs goal' },
      sparkline: [36, 34, 31, 28],
    },
    {
      id: 'offer-accept',
      label: 'Offer acceptance rate',
      value: 78.6,
      unit: 'percent',
      target: 75,
      delta: { direction: 'up', value: 3.5, label: 'vs prior period' },
      sparkline: [70.1, 72.4, 76.9, 78.6],
    },
  ],
  '90d': [
    {
      id: 'pipeline',
      label: 'Pipeline coverage',
      value: 4250000,
      unit: 'currency',
      delta: { direction: 'up', value: 12.6, label: 'vs last quarter' },
      target: 3800000,
      sparkline: [3020000, 3350000, 3890000, 4250000],
      notes: 'Momentum sustained by partner channels and referral programs.',
    },
    {
      id: 'conversion',
      label: 'Stage-to-offer conversion',
      value: 34.2,
      unit: 'percent',
      target: 33,
      delta: { direction: 'up', value: 1.4, label: 'goal 33%' },
      sparkline: [28.5, 30.1, 32.4, 34.2],
    },
    {
      id: 'time-to-fill',
      label: 'Median time-to-fill',
      value: 24,
      unit: 'days',
      target: 28,
      delta: { direction: 'down', value: '9.3 days', label: 'faster vs goal' },
      sparkline: [33, 31, 27, 24],
    },
    {
      id: 'offer-accept',
      label: 'Offer acceptance rate',
      value: 82.4,
      unit: 'percent',
      target: 80,
      delta: { direction: 'up', value: 2.7, label: 'vs last quarter' },
      sparkline: [75.5, 77.2, 80.6, 82.4],
    },
  ],
  '365d': [
    {
      id: 'pipeline',
      label: 'Pipeline coverage',
      value: 15800000,
      unit: 'currency',
      delta: { direction: 'up', value: 18.2, label: 'vs prior year' },
      target: 14000000,
      sparkline: [11000000, 12400000, 13950000, 15800000],
      notes: 'Largest lift driven by enterprise expansion in Q3.',
    },
    {
      id: 'conversion',
      label: 'Stage-to-offer conversion',
      value: 31.8,
      unit: 'percent',
      target: 32,
      delta: { direction: 'down', value: 0.8, label: 'slightly under goal' },
      sparkline: [28.1, 29.6, 30.7, 31.8],
    },
    {
      id: 'time-to-fill',
      label: 'Median time-to-fill',
      value: 26,
      unit: 'days',
      target: 27,
      delta: { direction: 'down', value: '4.1 days', label: 'faster vs last year' },
      sparkline: [34, 31, 28, 26],
    },
    {
      id: 'offer-accept',
      label: 'Offer acceptance rate',
      value: 80.3,
      unit: 'percent',
      target: 80,
      delta: { direction: 'up', value: 1.6, label: 'vs prior year' },
      sparkline: [73.5, 76.2, 79.1, 80.3],
    },
  ],
};

const DEFAULT_TIMEFRAME = '90d';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return jsonError(res, 405, 'Method not allowed');
  }

  const timeframe = (req.query.timeframe || DEFAULT_TIMEFRAME).toString().toLowerCase();
  const normalized = KPI_DATA[timeframe] ? timeframe : DEFAULT_TIMEFRAME;

  const metrics = KPI_DATA[normalized].map((metric) => ({
    ...metric,
    headline: metric.unit === 'currency' ? formatCurrency(metric.value) : undefined,
  }));

  return jsonSuccess(res, 200, 'KPI snapshot ready', {
    timeframe: normalized,
    updatedAt: new Date().toISOString(),
    metrics,
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
  }).format(value);
}


