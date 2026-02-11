import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';
import type { StartPageStats } from '@/lib/api';

interface StatsRowProps {
  stats: StartPageStats;
}

function formatVolume(kg: number): string {
  return `${(kg / 1000).toFixed(1)}t`;
}

function formatTime(seconds: number): string {
  return `${(seconds / 3600).toFixed(1)}h`;
}

function formatVolumeChange(percent: number | null): string {
  if (percent === null) return '';
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${Math.round(percent)}%`;
}

function formatWorkoutsChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change}`;
}

function formatTimeChange(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  const sign = minutes >= 0 ? '+' : '';
  return `${sign}${minutes}m`;
}

export function StatsRow({ stats }: StatsRowProps) {
  const isEmpty = stats.current.workouts_count === 0;

  return (
    <View style={styles.row}>
      {/* Volume */}
      <View style={styles.card}>
        <Text style={styles.label}>VOLUME</Text>
        <Text style={[styles.value, isEmpty && styles.emptyValue]}>
          {isEmpty ? '\u2014' : formatVolume(stats.current.volume_kg)}
        </Text>
        {isEmpty ? (
          <Text style={styles.hint}>No data yet</Text>
        ) : (
          <Text style={styles.change}>
            {formatVolumeChange(stats.changes.volume_change_percent)}
          </Text>
        )}
      </View>

      {/* Workouts */}
      <View style={styles.card}>
        <Text style={styles.label}>WORKOUTS</Text>
        <Text style={[styles.value, isEmpty && styles.emptyValue]}>
          {isEmpty ? '0' : stats.current.workouts_count}
        </Text>
        {isEmpty ? (
          <Text style={styles.hint}>This week</Text>
        ) : (
          <Text style={styles.change}>
            {formatWorkoutsChange(stats.changes.workouts_change)}
          </Text>
        )}
      </View>

      {/* Time */}
      <View style={styles.card}>
        <Text style={styles.label}>TIME</Text>
        <Text style={[styles.value, isEmpty && styles.emptyValue]}>
          {isEmpty ? '\u2014' : formatTime(stats.current.duration_seconds)}
        </Text>
        {isEmpty ? (
          <Text style={styles.hint}>No data yet</Text>
        ) : (
          <Text style={styles.change}>
            {formatTimeChange(stats.changes.duration_change_seconds)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDim,
    letterSpacing: 0.5,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  emptyValue: {
    color: colors.textDarker,
  },
  change: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.green,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  hint: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDarkest,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
});
