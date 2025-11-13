import { jsonError, jsonSuccess } from '../../../lib/response';

const FUNNEL_DATA = {
  '30d': {
    steps: [
      { id: 'sourced', label: 'Sourced', value: 210, conversionRate: 100, dropOff: 0, color: '#2563eb' },
      { id: 'screened', label: 'Screened', value: 168, conversionRate: 80, dropOff: 20, color: '#1e40af' },
      { id: 'interview', label: 'Hiring manager interview', value: 112, conversionRate: 53, dropOff: 33, color: '#0ea5e9' },
      { id: 'offer', label: 'Offer extended', value: 44, conversionRate: 21, dropOff: 61, color: '#22c55e' },
      { id: 'hired', label: 'Hires', value: 36, conversionRate: 17, dropOff: 83, color: '#16a34a' },
    ],
    totals: { start: 210, hires: 36 },
  },
  '90d': {
    steps: [
      { id: 'sourced', label: 'Sourced', value: 620, conversionRate: 100, dropOff: 0, color: '#2563eb' },
      { id: 'screened', label: 'Screened', value: 484, conversionRate: 78, dropOff: 22, color: '#1d4ed8' },
      { id: 'panel', label: 'Panel interview', value: 298, conversionRate: 48, dropOff: 52, color: '#0ea5e9' },
      { id: 'offer', label: 'Offer extended', value: 124, conversionRate: 20, dropOff: 80, color: '#22c55e' },
      { id: 'hired', label: 'Hires', value: 92, conversionRate: 15, dropOff: 85, color: '#16a34a' },
    ],
    totals: { start: 620, hires: 92 },
  },
  '365d': {
    steps: [
      { id: 'sourced', label: 'Sourced', value: 2340, conversionRate: 100, dropOff: 0, color: '#2563eb' },
      { id: 'screened', label: 'Screened', value: 1825, conversionRate: 78, dropOff: 22, color: '#1e3a8a' },
      { id: 'assessment', label: 'Assessment passed', value: 1260, conversionRate: 54, dropOff: 46, color: '#0ea5e9' },
      { id: 'offer', label: 'Offer extended', value: 476, conversionRate: 20, dropOff: 80, color: '#22c55e' },
      { id: 'hired', label: 'Hires', value: 364, conversionRate: 16, dropOff: 84, color: '#16a34a' },
    ],
    totals: { start: 2340, hires: 364 },
  },
};

const DEFAULT_TIMEFRAME = '90d';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return jsonError(res, 405, 'Method not allowed');
  }

  const timeframe = (req.query.timeframe || DEFAULT_TIMEFRAME).toString().toLowerCase();
  const data = FUNNEL_DATA[timeframe] || FUNNEL_DATA[DEFAULT_TIMEFRAME];

  return jsonSuccess(res, 200, 'Funnel metrics ready', {
    timeframe,
    steps: data.steps,
    totals: data.totals,
  });
}



