import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Sparkles, Play } from 'lucide-react-native';
import { colors } from '@/lib/theme';
import type { StartPageInsight } from '@/lib/api';

interface InsightCardProps {
  insight: StartPageInsight;
  onStartWorkout?: () => void;
  onDismiss?: () => void;
}

export function InsightCard({ insight, onStartWorkout, onDismiss }: InsightCardProps) {
  if (insight.state === 'none') return null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={14} color={colors.white} />
          <Text style={styles.headerLabel}>AI INSIGHT</Text>
        </View>
        <Text style={styles.timestamp}>
          {insight.state === 'active' ? 'Updated now' : 'Waiting for data'}
        </Text>
      </View>

      {/* Body */}
      <Text style={[styles.body, insight.state === 'empty' && styles.bodyEmpty]}>
        {insight.text}
      </Text>

      {/* Actions */}
      {insight.state === 'active' && onDismiss && (
        <View style={styles.actions}>
          <Pressable style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        </View>
      )}

      {insight.state === 'empty' && onStartWorkout && (
        <View style={styles.actions}>
          <Pressable style={styles.startBtn} onPress={onStartWorkout}>
            <Play size={12} color={colors.white} fill={colors.white} />
            <Text style={styles.startText}>Start Workout</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  timestamp: {
    fontSize: 10,
    color: colors.textDarker,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  body: {
    fontSize: 13,
    color: '#D1D5DB',
    lineHeight: 13 * 1.5,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  bodyEmpty: {
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dismissText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDim,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  startBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  startText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
});
