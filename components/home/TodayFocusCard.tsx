import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';

export interface ExercisePreview {
  name: string;
  sets: number;
  reps: number;
}

export interface TodayFocusCardProps {
  title: string;
  category?: string;
  duration?: string;
  intensity?: string;
  exercises: ExercisePreview[];
  totalExercises: number;
  onStartWorkout: () => void;
  onStartFreeWorkout: () => void;
  onEdit?: () => void;
  isResuming?: boolean;
}

export function TodayFocusCard({
  title,
  category = 'Strength',
  duration = '45 min',
  intensity = 'High Intensity',
  exercises,
  totalExercises,
  onStartWorkout,
  onStartFreeWorkout,
  onEdit,
  isResuming = false,
}: TodayFocusCardProps) {
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.4, { duration: 1000 }),
      -1,
      true
    );

    return () => {
      cancelAnimation(pulseOpacity);
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const remainingExercises = totalExercises - exercises.length;

  return (
    <View className="bg-surface border border-white/5 rounded-3xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <View
        className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
        style={{ backgroundColor: colors.primary + '0D' }} // 5% opacity
      />

      {/* Header */}
      <View className="flex-row justify-between items-start mb-6 z-10">
        <View className="flex-1">
          {/* Category pill */}
          <View className="flex-row items-center px-2.5 py-1 rounded-full bg-white/5 border border-white/5 self-start mb-3">
            <Animated.View
              className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"
              style={pulseStyle}
            />
            <Text className="font-sans-bold text-[10px] uppercase tracking-wide text-primary">
              {category}
            </Text>
          </View>

          {/* Title */}
          <Text className="font-sans-bold text-2xl text-white leading-tight">
            {title}
          </Text>

          {/* Duration & Intensity */}
          <Text className="font-sans text-sm text-neutral-400 mt-1">
            {duration} • {intensity}
          </Text>
        </View>

        {/* Fitness icon */}
        <View className="h-12 w-12 rounded-full bg-white/5 border border-white/5 items-center justify-center">
          <MaterialIcons name="fitness-center" size={24} color="white" />
        </View>
      </View>

      {/* Exercise list */}
      <View className="mb-8 z-10 gap-3">
        {exercises.slice(0, 3).map((exercise, index) => (
          <ExerciseRow
            key={exercise.name}
            number={index + 1}
            name={exercise.name}
            sets={exercise.sets}
            reps={exercise.reps}
          />
        ))}

        {remainingExercises > 0 && (
          <View className="items-center pt-1">
            <Text className="font-sans-bold text-[10px] uppercase tracking-widest text-neutral-600">
              + {remainingExercises} more exercises
            </Text>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View className="z-10 gap-3">
        <Pressable
          className="w-full bg-primary py-4 rounded-xl flex-row items-center justify-center"
          style={{
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 5 },
          }}
          onPress={onStartWorkout}
        >
          <MaterialIcons name="play-arrow" size={24} color="white" />
          <Text className="font-sans-bold text-white ml-2">
            {isResuming ? 'Resume Workout' : 'Start Workout'}
          </Text>
        </Pressable>

        <Pressable
          className="w-full bg-transparent border border-white/10 py-4 rounded-xl flex-row items-center justify-center"
          onPress={onStartFreeWorkout}
        >
          <MaterialIcons name="directions-run" size={20} color={colors.textMuted} />
          <Text className="font-sans-bold text-neutral-400 ml-2">
            Start Free Workout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

interface ExerciseRowProps {
  number: number;
  name: string;
  sets: number;
  reps: number;
}

function ExerciseRow({ number, name, sets, reps }: ExerciseRowProps) {
  return (
    <View className="flex-row items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
      <View className="flex-row items-center">
        <View className="h-6 w-6 rounded bg-white/10 items-center justify-center mr-3">
          <Text className="font-sans-bold text-[10px] text-neutral-400">
            {number}
          </Text>
        </View>
        <Text className="font-sans-medium text-sm text-white">{name}</Text>
      </View>
      <Text className="text-xs font-mono text-neutral-400">
        {sets} x {reps}
      </Text>
    </View>
  );
}
