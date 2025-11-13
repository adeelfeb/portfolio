import { jsonError, jsonSuccess } from '../../../lib/response';

const TREND_DATA = {
  '30d': {
    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    series: [
      {
        id: 'qualified',
        label: 'Qualified pipeline',
        color: '#2563eb',
        points: [
          { label: 'Week 1', value: 34 },
          { label: 'Week 2', value: 42 },
          { label: 'Week 3', value: 39 },
          { label: 'Week 4', value: 45 },
        ],
      },
      {
        id: 'interviews',
        label: 'Onsite interviews',
        color: '#0ea5e9',
        points: [
          { label: 'Week 1', value: 18 },
          { label: 'Week 2', value: 21 },
          { label: 'Week 3', value: 19 },
          { label: 'Week 4', value: 23 },
        ],
      },
    ],
    benchmark: { label: 'Goal', value: 38 },
    summary: [
      { id: 'winRate', label: 'Win rate', value: '29%', delta: { direction: 'up', value: 3.2, label: 'vs goal' } },
      {
        id: 'slas',
        label: 'SLA compliance',
        value: '94%',
        delta: { direction: 'down', value: 2.1, label: 'follow-ups needed' },
      },
      {
        id: 'interviewSatisfaction',
        label: 'Interview score',
        value: '4.5 / 5',
        delta: { direction: 'up', value: 5.4, label: 'candidate NPS' },
      },
    ],
  },
  '90d': {
    categories: ['Jan', 'Feb', 'Mar', 'Apr'],
    series: [
      {
        id: 'qualified',
        label: 'Qualified pipeline',
        color: '#2563eb',
        points: [
          { label: 'Jan', value: 112 },
          { label: 'Feb', value: 128 },
          { label: 'Mar', value: 136 },
          { label: 'Apr', value: 148 },
        ],
      },
      {
        id: 'onsite',
        label: 'Onsite interviews',
        color: '#0ea5e9',
        points: [
          { label: 'Jan', value: 58 },
          { label: 'Feb', value: 61 },
          { label: 'Mar', value: 64 },
          { label: 'Apr', value: 69 },
        ],
      },
      {
        id: 'offers',
        label: 'Offers extended',
        color: '#22c55e',
        points: [
          { label: 'Jan', value: 21 },
          { label: 'Feb', value: 24 },
          { label: 'Mar', value: 28 },
          { label: 'Apr', value: 32 },
        ],
      },
    ],
    benchmark: { label: 'Target', value: 130 },
    summary: [
      {
        id: 'winRate',
        label: 'Win rate',
        value: '32%',
        delta: { direction: 'up', value: 4.1, label: 'highest in 12 months' },
      },
      {
        id: 'poolGrowth',
        label: 'Talent pool growth',
        value: '+18%',
        delta: { direction: 'up', value: 18, label: 'quarter over quarter' },
      },
      {
        id: 'cycle',
        label: 'Cycle time',
        value: '24 days',
        delta: { direction: 'down', value: 8.5, label: 'faster vs goal' },
      },
    ],
  },
  '365d': {
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      {
        id: 'qualified',
        label: 'Qualified pipeline',
        color: '#2563eb',
        points: [
          { label: 'Q1', value: 320 },
          { label: 'Q2', value: 358 },
          { label: 'Q3', value: 402 },
          { label: 'Q4', value: 438 },
        ],
      },
      {
        id: 'onsite',
        label: 'Onsite interviews',
        color: '#0ea5e9',
        points: [
          { label: 'Q1', value: 172 },
          { label: 'Q2', value: 188 },
          { label: 'Q3', value: 196 },
          { label: 'Q4', value: 210 },
        ],
      },
      {
        id: 'offers',
        label: 'Offers extended',
        color: '#22c55e',
        points: [
          { label: 'Q1', value: 69 },
          { label: 'Q2', value: 74 },
          { label: 'Q3', value: 81 },
          { label: 'Q4', value: 88 },
        ],
      },
    ],
    benchmark: { label: 'Yearly goal', value: 380 },
    summary: [
      { id: 'winRate', label: 'Win rate', value: '31%', delta: { direction: 'up', value: 2.9, label: 'vs last year' } },
      {
        id: 'pipelineGrowth',
        label: 'Pipeline growth',
        value: '+22%',
        delta: { direction: 'up', value: 22, label: 'year over year' },
      },
      {
        id: 'attrition',
        label: 'New hire retention',
        value: '92%',
        delta: { direction: 'down', value: 1.7, label: 'vs target' },
      },
    ],
  },
};

const DEFAULT_TIMEFRAME = '90d';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return jsonError(res, 405, 'Method not allowed');
  }

  const timeframe = (req.query.timeframe || DEFAULT_TIMEFRAME).toString().toLowerCase();
  const data = TREND_DATA[timeframe] || TREND_DATA[DEFAULT_TIMEFRAME];

  return jsonSuccess(res, 200, 'Trend data ready', {
    timeframe,
    categories: data.categories,
    series: data.series,
    benchmark: data.benchmark,
    summary: data.summary,
  });
}



