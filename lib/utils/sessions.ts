import type { WorkoutSessionSummary } from '@/lib/api';

export type WeekGroup = {
  weekKey: string;
  title: string;
  stats: string;
  data: WorkoutSessionSummary[];
};

/**
 * Group sessions by ISO week (Monday start) for SectionList
 */
export function groupSessionsByWeek(sessions: WorkoutSessionSummary[]): WeekGroup[] {
  const groups = new Map<string, { weekStart: Date; sessions: WorkoutSessionSummary[] }>();

  for (const session of sessions) {
    const dateStr = session.finished_at ?? session.started_at;
    if (!dateStr) continue;

    const date = new Date(dateStr);
    const weekStart = getISOWeekStart(date);
    const weekKey = toISOWeekKey(weekStart);

    if (!groups.has(weekKey)) {
      groups.set(weekKey, { weekStart, sessions: [] });
    }
    groups.get(weekKey)!.sessions.push(session);
  }

  // Sort weeks descending (most recent first)
  const sortedKeys = [...groups.keys()].sort().reverse();

  return sortedKeys.map((weekKey) => {
    const group = groups.get(weekKey)!;
    const totalVolume = group.sessions.reduce((sum, s) => sum + (s.volume_kg ?? 0), 0);
    const count = group.sessions.length;

    return {
      weekKey,
      title: formatWeekTitle(group.weekStart),
      stats: `${count} workout${count !== 1 ? 's' : ''} · ${formatVolume(totalVolume)}`,
      data: group.sessions,
    };
  });
}

/**
 * Get the Monday (start) of the ISO week containing the given date
 */
function getISOWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // Shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format as ISO week key: "2025-W06"
 */
function toISOWeekKey(weekStart: Date): string {
  const year = weekStart.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay() || 7; // Convert Sunday=0 to 7
  const firstMonday = new Date(year, 0, 1 + (jan1Day <= 4 ? 1 - jan1Day : 8 - jan1Day));
  const weekNum = Math.ceil(((weekStart.getTime() - firstMonday.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(Math.max(1, weekNum)).padStart(2, '0')}`;
}

/**
 * "This Week" / "Last Week" / "Jan 27 - Feb 2"
 */
function formatWeekTitle(weekStart: Date): string {
  const now = new Date();
  const currentWeekStart = getISOWeekStart(now);
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  if (weekStart.getTime() === currentWeekStart.getTime()) return 'This Week';
  if (weekStart.getTime() === lastWeekStart.getTime()) return 'Last Week';

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${startStr} - ${endStr}`;
}

/**
 * Format volume compactly: "12,450 kg" or "4.2k kg"
 */
export function formatVolume(volumeKg: number | null): string {
  if (volumeKg === null || volumeKg === 0) return '0 kg';
  if (volumeKg >= 10000) {
    const k = volumeKg / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k kg`;
  }
  return `${volumeKg.toLocaleString('en-US')} kg`;
}
