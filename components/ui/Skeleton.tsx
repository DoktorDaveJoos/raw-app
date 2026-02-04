import { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const shimmerPosition = useSharedValue(0);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmerPosition.value,
            [0, 1],
            [-200, 200]
          ),
        },
      ],
    };
  });

  return (
    <View
      style={[
        {
          width: typeof width === 'number' ? width : undefined,
          height,
          borderRadius,
          backgroundColor: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
        },
        typeof width === 'string' ? { width: width as any } : {},
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: 200,
            height: '100%',
            position: 'absolute',
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.08)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// Preset skeleton variants for common use cases
export function SkeletonText({ lines = 1, lastLineWidth = '60%' }: { lines?: number; lastLineWidth?: string }) {
  return (
    <View className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={14}
          borderRadius={4}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-surface rounded-3xl p-4 border border-white/5">
      <View className="flex-row items-center mb-4">
        <Skeleton width={40} height={40} borderRadius={20} />
        <View className="ml-3 flex-1">
          <Skeleton width="60%" height={16} borderRadius={4} />
          <View className="h-2" />
          <Skeleton width="40%" height={12} borderRadius={4} />
        </View>
      </View>
      <SkeletonText lines={3} />
    </View>
  );
}

export function SkeletonEventCard() {
  return (
    <View className="bg-surface rounded-3xl p-4 border border-white/5">
      <View className="flex-row items-center mb-3">
        <Skeleton width={4} height={24} borderRadius={2} />
        <View className="ml-3">
          <Skeleton width={120} height={18} borderRadius={4} />
        </View>
      </View>
      <View className="bg-black/40 rounded-xl p-3 mb-3">
        <Skeleton width="80%" height={14} borderRadius={4} />
      </View>
      <View className="bg-black/20 rounded-xl p-3 space-y-2">
        <Skeleton width="100%" height={32} borderRadius={4} />
        <Skeleton width="100%" height={28} borderRadius={4} />
        <Skeleton width="100%" height={28} borderRadius={4} />
      </View>
    </View>
  );
}
