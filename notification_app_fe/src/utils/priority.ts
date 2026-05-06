import { parse } from 'date-fns';

export interface Notification {
  ID: string;
  Timestamp: string;
  Type: 'Placement' | 'Result' | 'Event';
  Message: string;
}

const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export const getPriorityNotifications = (notifications: Notification[], limit: number = 10) => {
  if (notifications.length === 0) return [];

  const parsed = notifications.map(item => ({
    ...item,
    ts: parse(item.Timestamp, 'yyyy-MM-dd HH:mm:ss', new Date())
  }));

  const oldest = Math.min(...parsed.map(p => p.ts.getTime()));
  const newest = Math.max(...parsed.map(p => p.ts.getTime()));
  const span = newest - oldest;

  const scored = parsed.map(item => {
    const weight = TYPE_WEIGHTS[item.Type] || 0;
    const recency = span > 0 ? (item.ts.getTime() - oldest) / span : 1.0;
    const score = Number((weight + recency).toFixed(6));
    return { ...item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};
