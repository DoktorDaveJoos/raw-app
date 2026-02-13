import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, Share, Ellipsis, Timer, Trash2, CircleAlert } from 'lucide-react-native';
import { colors } from '@/lib/theme';
import { useSession, useDeleteSession } from '@/hooks';
import { formatLongDate, formatDurationMinutes, calculateDuration } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { DeleteConfirmationModal } from '@/components/session/DeleteConfirmationModal';
import type { Set } from '@/lib/api';

interface ExerciseGroup {
  exerciseName: string;
  sets: Set[];
}

export default function SessionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parsed = parseInt(id, 10);
  const sessionId = isNaN(parsed) ? undefined : parsed;

  const { data: session, isLoading, isError, refetch } = useSession(sessionId);
  const deleteSession = useDeleteSession();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    if (isDeleted) {
      const timer = setTimeout(() => {
        router.navigate('/(tabs)/log');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDeleted]);

  // Calculate stats from session data
  const stats = useMemo(() => {
    if (!session) {
      return { exercises: 0, sets: 0, volume: 0, duration: '0 min' };
    }

    const durationSeconds = session.duration_seconds ??
      calculateDuration(session.started_at, session.finished_at);

    return {
      exercises: session.exercises_count ?? 0,
      sets: session.sets_count ?? 0,
      volume: session.volume_kg ?? 0,
      duration: formatDurationMinutes(durationSeconds),
    };
  }, [session]);

  // Group sets by exercise from completed add_sets events,
  // falling back to session_exercises for seeded/imported sessions
  const exerciseGroups = useMemo((): ExerciseGroup[] => {
    if (!session) return [];

    // Primary path: build from session_events (logged workouts)
    if (session.session_events?.length) {
      const groupMap = new Map<string, Set[]>();

      for (const event of session.session_events) {
        if (event.status !== 'completed' || event.type !== 'add_sets') continue;
        if (!event.exercise_name || !event.sets) continue;

        const existing = groupMap.get(event.exercise_name) ?? [];
        existing.push(...event.sets);
        groupMap.set(event.exercise_name, existing);
      }

      const groups = Array.from(groupMap.entries()).map(([exerciseName, sets]) => ({
        exerciseName,
        sets: sets.map((s, i) => ({ ...s, set_number: i + 1 })),
      }));

      if (groups.length > 0) return groups;
    }

    // Fallback path: build from session_exercises (seeded/imported sessions)
    if (session.session_exercises?.length) {
      return session.session_exercises
        .filter((ex) => ex.sets && ex.sets.length > 0)
        .map((ex) => ({
          exerciseName: ex.exercise_name,
          sets: ex.sets!.map((s, i) => ({ ...s, set_number: i + 1 })),
        }));
    }

    return [];
  }, [session]);

  const longDate = useMemo(() => {
    return formatLongDate(session?.started_at);
  }, [session?.started_at]);

  const handleBack = () => {
    router.navigate('/(tabs)/log');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleMore = () => {
    // TODO: Implement more options
  };

  const handleDelete = () => {
    if (!sessionId) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!sessionId) return;
    deleteSession.mutate(sessionId, {
      onSuccess: () => setIsDeleted(true),
    });
  };

  const formatWeight = (set: Set): string => {
    if (set.weight_kg === null || set.weight_kg === undefined) return 'BW';
    return `${set.weight_kg} kg`;
  };

  const formatVolume = (kg: number): string => {
    return kg.toLocaleString();
  };

  if (!sessionId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.mutedText}>Invalid session</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.linkText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={{ width: 24 }} />
            <Skeleton width={140} height={18} borderRadius={4} />
          </View>
          <View style={styles.headerRight}>
            <Skeleton width={20} height={20} borderRadius={4} />
            <Skeleton width={20} height={20} borderRadius={4} />
          </View>
        </View>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Skeleton width="100%" height={180} borderRadius={16} />
          <View style={{ marginTop: 24 }}>
            <Skeleton width={80} height={18} borderRadius={4} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={140} borderRadius={12} />
            <View style={{ height: 12 }} />
            <Skeleton width="100%" height={140} borderRadius={12} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.headerLeft}>
            <ChevronLeft size={24} color="white" />
            <Text style={styles.headerTitle}>Workout Details</Text>
          </Pressable>
        </View>
        <View style={styles.centered}>
          <CircleAlert size={48} color="#ef4444" />
          <Text style={[styles.mutedText, { marginTop: 16 }]}>Failed to load session</Text>
          <Text style={[styles.dimText, { marginTop: 4, textAlign: 'center' }]}>
            Check your connection and try again
          </Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.headerLeft}>
            <ChevronLeft size={24} color="white" />
            <Text style={styles.headerTitle}>Workout Details</Text>
          </Pressable>
        </View>
        <View style={styles.centered}>
          <CircleAlert size={48} color={colors.textDim} />
          <Text style={[styles.mutedText, { marginTop: 16 }]}>Session not found</Text>
          <Pressable onPress={handleBack} style={styles.retryButton}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerLeft}>
          <ChevronLeft size={24} color="white" />
          <Text style={styles.headerTitle}>Workout Details</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable onPress={handleShare}>
            <Share size={20} color="white" />
          </Pressable>
          <Pressable onPress={handleMore}>
            <Ellipsis size={20} color={colors.textDim} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          {/* Title Row */}
          <View style={styles.summaryTitleRow}>
            <View style={styles.summaryTitleLeft}>
              <Text style={styles.workoutName}>{session.workout_name || 'Workout Session'}</Text>
              <Text style={styles.workoutDate}>{longDate}</Text>
            </View>
            <View style={styles.durationBadge}>
              <Timer size={14} color="#9CA3AF" />
              <Text style={styles.durationText}>{stats.duration}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{stats.exercises}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{stats.sets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{formatVolume(stats.volume)}</Text>
              <Text style={styles.statLabel}>kg lifted</Text>
            </View>
          </View>
        </View>

        {/* Exercises Section */}
        {exerciseGroups.length > 0 && (
          <View style={styles.exercisesSection}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            {exerciseGroups.map((group) => (
              <View key={group.exerciseName} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{group.exerciseName}</Text>
                </View>
                <View style={styles.setsContainer}>
                  {group.sets.map((set, index) => (
                    <View key={index} style={styles.setRow}>
                      <View style={styles.setLeft}>
                        <Text style={styles.setNumber}>{set.set_number}</Text>
                        <Text style={styles.setDetail}>
                          {set.reps} reps × {formatWeight(set)}
                        </Text>
                      </View>
                      {set.rir !== null && set.rir !== undefined && (
                        <Text style={styles.setRir}>@{set.rir} RIR</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Delete Section */}
        <View style={styles.deleteSection}>
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={18} color="#EF4444" />
            <Text style={styles.deleteText}>Delete Workout</Text>
          </Pressable>
        </View>
      </ScrollView>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        exerciseName="this workout"
        title="Delete Workout?"
        description="Are you sure you want to delete this workout? This action cannot be undone."
        isDeleting={deleteSession.isPending}
        isDeleted={isDeleted}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mutedText: {
    fontFamily: 'SpaceGrotesk',
    color: '#9CA3AF',
    fontSize: 14,
  },
  dimText: {
    fontFamily: 'SpaceGrotesk',
    color: '#6B7280',
    fontSize: 13,
  },
  linkText: {
    fontFamily: 'SpaceGrotesk',
    color: colors.primary,
    fontSize: 14,
    marginTop: 16,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    color: 'white',
    fontSize: 14,
  },

  // Header
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    color: 'white',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 20,
    gap: 20,
  },
  summaryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryTitleLeft: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  workoutName: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: 'white',
  },
  workoutDate: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    color: '#6B7280',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  durationText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: 'white',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: 'white',
  },
  statLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },

  // Exercises Section
  exercisesSection: {
    marginTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 16,
    color: 'white',
  },
  exerciseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: 16,
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  exerciseName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 15,
    color: 'white',
  },
  setsContainer: {
    gap: 8,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setNumber: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#6B7280',
  },
  setDetail: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 14,
    color: 'white',
  },
  setRir: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Delete Section
  deleteSection: {
    paddingTop: 8,
    paddingBottom: 24,
    marginTop: 24,
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF44441A',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  deleteText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
  },
});
