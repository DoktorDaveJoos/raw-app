import { View, Text } from 'react-native';
import { colors } from '@/lib/theme';

export interface WeeklyStats {
  volume: number;
  workouts: number;
  workoutsTarget: number;
  avgIntensity: number;
  totalTimeHours: number;
}

export interface WeeklyStatsCarouselProps {
  stats: WeeklyStats;
}

export function WeeklyStatsCarousel({ stats }: WeeklyStatsCarouselProps) {
  const volumeKg = Math.round(stats.volume);
  const volumeProgress = Math.min(stats.volume / 35000, 1);
  const workoutsProgress = Math.min(stats.workouts / stats.workoutsTarget, 1);
  const timeProgress = Math.min(stats.totalTimeHours / 10, 1); // 10h weekly target

  return (
    <View style={{ paddingHorizontal: 24, gap: 8 }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: colors.textDim,
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom: 4,
          fontFamily: 'SpaceGrotesk_600SemiBold',
        }}
      >
        Weekly Stats
      </Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <MiniStatCard
          label="VOLUME"
          value={volumeKg.toString()}
          unit="kg"
          progress={volumeProgress}
          dotColor="#FFFFFF"
          progressColor="#CCCCCC"
        />
        <MiniStatCard
          label="WORKOUTS"
          value={stats.workouts.toString()}
          unit=""
          progress={workoutsProgress}
          dotColor="#999999"
          progressColor="#999999"
        />
        <MiniStatCard
          label="TIME"
          value={stats.totalTimeHours.toFixed(1)}
          unit="h"
          progress={timeProgress}
          dotColor="#666666"
          progressColor="#666666"
        />
      </View>
    </View>
  );
}

interface MiniStatCardProps {
  label: string;
  value: string;
  unit: string;
  progress: number;
  dotColor: string;
  progressColor: string;
}

function MiniStatCard({ label, value, unit, progress, dotColor, progressColor }: MiniStatCardProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        gap: 8,
      }}
    >
      {/* Row 1: dot + label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: dotColor,
          }}
        />
        <Text
          style={{
            fontSize: 10,
            fontWeight: '600',
            color: colors.textDim,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontFamily: 'SpaceGrotesk_600SemiBold',
          }}
        >
          {label}
        </Text>
      </View>

      {/* Row 2: value + unit */}
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#FFFFFF',
            fontFamily: 'SpaceGrotesk_700Bold',
          }}
        >
          {value}
        </Text>
        {unit ? (
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: colors.textMuted,
              marginLeft: 2,
              fontFamily: 'SpaceGrotesk_500Medium',
            }}
          >
            {unit}
          </Text>
        ) : null}
      </View>

      {/* Row 3: progress bar */}
      <View
        style={{
          width: '100%',
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.cardElevated,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            borderRadius: 2,
            backgroundColor: progressColor,
            width: `${Math.min(progress, 1) * 100}%`,
          }}
        />
      </View>
    </View>
  );
}
