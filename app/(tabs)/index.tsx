import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { WeeklyStatsCarousel } from '@/components/home';
import { useWeeklyStats, useCurrentSession, useCreateAndStartSession } from '@/hooks';
import { Skeleton } from '@/components/ui';

export default function HomeScreen() {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Fetch data
  const { data: weeklyStats, isLoading: isLoadingStats, isError: isStatsError, refetch: refetchStats } = useWeeklyStats();
  const { data: currentSession, isLoading: isLoadingCurrent } = useCurrentSession();
  const createAndStart = useCreateAndStartSession();

  // Default stats while loading
  const stats = weeklyStats ?? {
    volume: 0,
    workouts: 0,
    workoutsTarget: 5,
    avgIntensity: 0,
    totalTimeHours: 0,
  };

  const handleStartWorkout = async () => {
    if (createAndStart.isPending) return;
    if (currentSession) {
      router.push(`/logging/${currentSession.id}`);
    } else {
      try {
        const session = await createAndStart.mutateAsync('Upper Body Power');
        router.push(`/logging/${session.id}`);
      } catch (error) {
        Alert.alert('Unable to Start Workout', 'Please check your connection and try again.');
      }
    }
  };

  const isStarting = createAndStart.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingTop: 48, paddingHorizontal: 24, paddingBottom: 8 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: '#FFFFFF',
            fontFamily: 'SpaceGrotesk_700Bold',
          }}
        >
          Today
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 4,
            fontFamily: 'SpaceGrotesk_400Regular',
          }}
        >
          {dateString}
        </Text>
      </View>

      {/* Weekly Stats */}
      <View style={{ marginTop: 24 }}>
        {isLoadingStats ? (
          <View style={{ paddingHorizontal: 24, gap: 8 }}>
            <Skeleton width={100} height={16} borderRadius={4} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Skeleton style={{ flex: 1 }} height={110} borderRadius={16} />
              <Skeleton style={{ flex: 1 }} height={110} borderRadius={16} />
              <Skeleton style={{ flex: 1 }} height={110} borderRadius={16} />
            </View>
          </View>
        ) : isStatsError ? (
          <View style={{ paddingHorizontal: 24 }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.2)',
                padding: 16,
                alignItems: 'center',
              }}
            >
              <MaterialIcons name="error-outline" size={24} color="#ef4444" />
              <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 8, fontFamily: 'SpaceGrotesk_400Regular' }}>
                Failed to load stats
              </Text>
              <Pressable
                onPress={() => refetchStats()}
                style={{
                  marginTop: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '500', fontFamily: 'SpaceGrotesk_500Medium' }}>Retry</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <WeeklyStatsCarousel stats={stats} />
        )}
      </View>

      {/* Start / Resume Workout Button */}
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
        <Pressable
          onPress={handleStartWorkout}
          disabled={isStarting || isLoadingCurrent}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.neutral[200] : colors.white,
            height: 56,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            opacity: isStarting || isLoadingCurrent ? 0.6 : 1,
          })}
        >
          <MaterialIcons name="play-arrow" size={20} color="#000000" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#000000', fontFamily: 'SpaceGrotesk_700Bold' }}>
            {currentSession ? 'Resume Workout' : 'Start Workout'}
          </Text>
        </Pressable>
      </View>

      {/* Loading overlay when starting */}
      {isStarting && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: '#FFFFFF', marginTop: 16, fontFamily: 'SpaceGrotesk_400Regular' }}>Starting workout...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
