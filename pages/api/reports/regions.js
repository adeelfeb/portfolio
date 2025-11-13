import { jsonError, jsonSuccess } from '../../../lib/response';

const REGIONAL_DATA = {
  '30d': {
    headline: 'EMEA momentum lifted by new partner hires.',
    segments: [
      { id: 'na', label: 'North America', share: 38, delta: -2.5, color: '#2563eb' },
      { id: 'emea', label: 'EMEA', share: 32, delta: 4.3, color: '#0ea5e9' },
      { id: 'latam', label: 'LATAM', share: 16, delta: 1.8, color: '#22c55e' },
      { id: 'apac', label: 'APAC', share: 14, delta: -1.2, color: '#f59e0b' },
    ],
  },
  '90d': {
    headline: 'North America remains the highest volume, EMEA growth accelerates.',
    segments: [
      { id: 'na', label: 'North America', share: 41, delta: 1.2, color: '#2563eb' },
      { id: 'emea', label: 'EMEA', share: 29, delta: 3.8, color: '#0ea5e9' },
      { id: 'latam', label: 'LATAM', share: 17, delta: 1.1, color: '#22c55e' },
      { id: 'apac', label: 'APAC', share: 13, delta: -0.6, color: '#f97316' },
    ],
  },
  '365d': {
    headline: 'Balanced distribution with increased APAC investments.',
    segments: [
      { id: 'na', label: 'North America', share: 39, delta: -1.8, color: '#2563eb' },
      { id: 'emea', label: 'EMEA', share: 28, delta: 2.4, color: '#0ea5e9' },
      { id: 'latam', label: 'LATAM', share: 14, delta: 0.9, color: '#22c55e' },
      { id: 'apac', label: 'APAC', share: 19, delta: 3.1, color: '#f97316' },
    ],
  },
};

const DEFAULT_TIMEFRAME = '90d';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return jsonError(res, 405, 'Method not allowed');
  }

  const timeframe = (req.query.timeframe || DEFAULT_TIMEFRAME).toString().toLowerCase();
  const data = REGIONAL_DATA[timeframe] || REGIONAL_DATA[DEFAULT_TIMEFRAME];

  return jsonSuccess(res, 200, 'Regional distribution ready', {
    timeframe,
    headline: data.headline,
    segments: data.segments,
  });
}


