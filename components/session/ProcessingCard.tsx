import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { Skeleton } from '../ui/Skeleton';

export interface ProcessingCardProps {
  rawText: string;
  expectedSets?: number;
}

export function ProcessingCard({ rawText, expectedSets = 3 }: ProcessingCardProps) {
  const rotation = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.75);

  useEffect(() => {
    // Spinning animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse animation
    pulseOpacity.value = withRepeat(
      withTiming(0.3, { duration: 1000 }),
      -1,
      true
    );

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(pulseOpacity);
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View
      className="bg-surface rounded-3xl border border-primary/30 overflow-hidden relative"
      style={{
        shadowColor: colors.primary,
        shadowOpacity: 0.2,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      {/* Top gradient line */}
      <View className="absolute top-0 left-0 right-0 h-px bg-primary/80" />

      {/* Header section */}
      <View className="px-5 pt-5 pb-3">
        {/* Title row */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <Animated.View style={spinStyle}>
                <MaterialIcons name="sync" size={18} color={colors.primary} />
              </Animated.View>
            </View>
            <Text className="font-sans-bold text-white/90 text-lg tracking-tight ml-3">
              Processing...
            </Text>
          </View>

          {/* AI Parsing badge */}
          <View className="flex-row items-center px-2.5 py-1 rounded-full bg-primary/10 border border-primary/10">
            <View className="relative h-2 w-2 mr-2">
              <Animated.View
                className="absolute inset-0 rounded-full bg-primary"
                style={pulseStyle}
              />
              <View className="relative rounded-full h-2 w-2 bg-primary" />
            </View>
            <Text className="font-sans-bold text-[10px] uppercase tracking-wider text-primary">
              AI Parsing
            </Text>
          </View>
        </View>

        {/* Raw input display */}
        <View className="flex-row items-center p-4 rounded-xl bg-white/5 border border-white/5 mb-2 overflow-hidden">
          <MaterialIcons name="short-text" size={20} color={colors.textMuted} />
          <Text className="font-sans-medium text-xl text-white leading-snug tracking-tight ml-4">
            {rawText}
          </Text>
        </View>
      </View>

      {/* Skeleton header */}
      <View className="px-5 py-2 border-b border-white/5 bg-black/20">
        <View className="opacity-50 items-center">
          <Skeleton width={100} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Skeleton rows */}
      <View className="px-5 py-5 gap-3">
        {Array.from({ length: expectedSets }).map((_, index) => (
          <Skeleton
            key={index}
            width="100%"
            height={48}
            borderRadius={12}
            style={{ opacity: 1 - index * 0.15 }}
          />
        ))}
      </View>
    </View>
  );
}
