import { View, Text, Pressable, SectionList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { formatCardDate, formatDurationMinutes, groupSessionsByWeek } from '@/lib/utils';
import { useSessions, useCurrentSession } from '@/hooks';
import { Skeleton } from '@/components/ui';
import type { WorkoutSessionSummary } from '@/lib/api';
import type { WeekGroup } from '@/lib/utils';

export default function LogScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: sessionsResponse, isLoading, isError, refetch } = useSessions();
  const { refetch: refetchCurrent } = useCurrentSession();

  const sessions = sessionsResponse?.data ?? [];
  const finishedSessions = sessions.filter((s) => s.status === 'finished');

  const sections = useMemo(() => groupSessionsByWeek(finishedSessions), [finishedSessions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchCurrent()]);
    setRefreshing(false);
  }, [refetch, refetchCurrent]);

  const handleSessionPress = (session: WorkoutSessionSummary) => {
    if (session.status === 'in_progress') {
      router.push(`/logging/${session.id}`);
    } else {
      router.push(`/(tabs)/log/${session.id}`);
    }
  };

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <View style={{ width: '100%' }}>
          <Skeleton width="100%" height={76} borderRadius={12} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={76} borderRadius={12} style={{ marginBottom: 8 }} />
          <Skeleton width="100%" height={76} borderRadius={12} />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load workouts</Text>
          <Text style={styles.errorSubtitle}>Check your connection and try again</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <MaterialIcons name="fitness-center" size={48} color={colors.textDim} />
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySubtitle}>Start your first workout to see it here</Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialIcons name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Workout History</Text>
        </View>
        <Pressable hitSlop={8}>
          <MaterialIcons name="tune" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Sessions List */}
      <SectionList<WorkoutSessionSummary, WeekGroup>
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <WorkoutCard session={item} onPress={() => handleSessionPress(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <WeekSectionHeader
            title={section.title}
            stats={section.stats}
            isFirst={sections[0]?.weekKey === section.weekKey}
          />
        )}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

function WeekSectionHeader({ title, stats, isFirst }: { title: string; stats: string; isFirst: boolean }) {
  return (
    <View style={[styles.sectionHeader, !isFirst && { marginTop: 24 }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionStats}>{stats}</Text>
    </View>
  );
}

function WorkoutCard({ session, onPress }: { session: WorkoutSessionSummary; onPress: () => void }) {
  const dateDisplay = formatCardDate(session.finished_at ?? session.started_at);
  const durationDisplay = formatDurationMinutes(session.duration_seconds);
  const volumeKg = session.volume_kg ?? 0;
  const volumeDisplay = volumeKg >= 1000
    ? `${(volumeKg / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : volumeKg.toString();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardInner}>
        {/* Left: title + meta */}
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {session.title || 'Untitled Workout'}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>{dateDisplay}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.cardMetaText}>{durationDisplay}</Text>
          </View>
        </View>

        {/* Right: stats + chevron */}
        <View style={styles.cardRight}>
          <View style={styles.statsGroup}>
            <StatColumn value={session.exercises_count.toString()} label="ex" />
            <StatColumn value={session.sets_count.toString()} label="sets" />
            <StatColumn value={volumeDisplay} label="kg" accent />
          </View>
          <MaterialIcons name="chevron-right" size={18} color={colors.textDim} />
        </View>
      </View>
    </Pressable>
  );
}

function StatColumn({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={styles.statColumn}>
      <Text style={[styles.statValue, accent && { color: colors.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textPrimary,
  },
  sectionStats: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.textDim,
  },
  card: {
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  cardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    gap: 6,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textPrimary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textDim,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statColumn: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.textDim,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.textDim,
    fontSize: 14,
    marginTop: 4,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 16,
  },
  errorSubtitle: {
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.textDim,
    fontSize: 14,
    marginTop: 4,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  retryText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.textPrimary,
  },
});
