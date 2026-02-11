import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { GreetingHeader, StatsRow, E1rmRow, InsightCard, VolumeLandmarks } from '@/components/home';
import { useStartPage, useCurrentSession, useCreateAndStartSession } from '@/hooks';
import { Skeleton } from '@/components/ui';

export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useStartPage();
  const { data: currentSession, isLoading: isLoadingCurrent } = useCurrentSession();
  const createAndStart = useCreateAndStartSession();

  const handleStartWorkout = async () => {
    if (createAndStart.isPending) return;
    if (currentSession) {
      router.push(`/logging/${currentSession.id}`);
    } else {
      try {
        const session = await createAndStart.mutateAsync('Upper Body Power');
        router.push(`/readiness/${session.id}`);
      } catch {
        Alert.alert('Unable to Start Workout', 'Please check your connection and try again.');
      }
    }
  };

  const isStarting = createAndStart.isPending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 24, paddingBottom: 24, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : data ? (
          <>
            <GreetingHeader
              firstName={data.greeting.first_name}
              dateLabel={data.greeting.date_label}
              windowLabel={data.greeting.window_label}
            />
            <StatsRow stats={data.stats} />
            <E1rmRow items={data.e1rm} />
            <InsightCard
              insight={data.insight}
              onStartWorkout={handleStartWorkout}
              onDismiss={() => {
                // TODO: implement dismiss
              }}
            />
            <VolumeLandmarks landmarks={data.volume_landmarks} />
          </>
        ) : null}
      </ScrollView>

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
          <Text style={{ color: '#FFFFFF', marginTop: 16, fontFamily: 'SpaceGrotesk_400Regular' }}>
            Starting workout...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ gap: 20 }}>
      {/* Greeting skeleton */}
      <View style={{ gap: 4 }}>
        <Skeleton width={180} height={28} borderRadius={6} />
        <Skeleton width={220} height={14} borderRadius={4} />
      </View>

      {/* Stats row skeleton */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton style={{ flex: 1 }} height={90} borderRadius={16} />
        <Skeleton style={{ flex: 1 }} height={90} borderRadius={16} />
        <Skeleton style={{ flex: 1 }} height={90} borderRadius={16} />
      </View>

      {/* E1RM row skeleton */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Skeleton style={{ flex: 1 }} height={90} borderRadius={16} />
        <Skeleton style={{ flex: 1 }} height={90} borderRadius={16} />
        <Skeleton style={{ flex: 1 }} height={90} borderRadius={16} />
      </View>

      {/* Insight skeleton */}
      <Skeleton height={120} borderRadius={16} />

      {/* Volume landmarks skeleton */}
      <View style={{ gap: 12 }}>
        <Skeleton width={160} height={12} borderRadius={4} />
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ gap: 4 }}>
            <Skeleton height={14} borderRadius={4} />
            <Skeleton height={6} borderRadius={3} />
          </View>
        ))}
      </View>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={{ paddingTop: 40 }}>
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
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 14,
            marginTop: 8,
            fontFamily: 'SpaceGrotesk_400Regular',
          }}
        >
          Failed to load data
        </Text>
        <Pressable
          onPress={onRetry}
          style={{
            marginTop: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: '500',
              fontFamily: 'SpaceGrotesk_500Medium',
            }}
          >
            Retry
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
