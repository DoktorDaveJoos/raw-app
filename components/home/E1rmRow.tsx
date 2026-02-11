import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';
import type { StartPageE1rm } from '@/lib/api';

interface E1rmRowProps {
  items: StartPageE1rm[];
}

function getLabelFromKey(key: string): string {
  switch (key) {
    case 'bench_press': return 'BENCH e1RM';
    case 'squat': return 'SQUAT e1RM';
    case 'deadlift': return 'DEAD e1RM';
    default: return `${key.toUpperCase()} e1RM`;
  }
}

function formatChange(change: number | null): string {
  if (change === null) return '';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}`;
}

export function E1rmRow({ items }: E1rmRowProps) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.key} style={styles.card}>
          <Text style={styles.label}>{getLabelFromKey(item.key)}</Text>
          <Text style={[styles.value, !item.has_data && styles.emptyValue]}>
            {item.has_data && item.estimated_1rm !== null
              ? item.estimated_1rm.toFixed(1)
              : '\u2014'}
          </Text>
          {item.has_data ? (
            <View style={styles.trendRow}>
              <Text style={styles.unit}>{item.unit ?? 'kg'}</Text>
              {item.change !== null && (
                <Text style={styles.change}>{formatChange(item.change)}</Text>
              )}
            </View>
          ) : (
            <Text style={styles.hint}>Log 3+ sets</Text>
          )}
        </View>
      ))}
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
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unit: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDim,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  change: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.green,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  hint: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textDarker,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
});
