import { View, Text } from 'react-native';

export interface ExerciseSummary {
  exercise_name: string;
  sets_count: number;
  reps_count: number;
  volume_kg: number;
}

export interface TopExercisesTableProps {
  exercises: ExerciseSummary[];
}

export function TopExercisesTable({ exercises }: TopExercisesTableProps) {
  return (
    <View className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <View className="flex-row px-4 py-2 bg-black/20 border-b border-white/5">
        <Text className="font-sans flex-1 text-neutral-500 text-xs uppercase tracking-wider">
          Exercise
        </Text>
        <Text className="font-sans w-12 text-neutral-500 text-xs uppercase tracking-wider text-center">
          Sets
        </Text>
        <Text className="font-sans w-12 text-neutral-500 text-xs uppercase tracking-wider text-center">
          Reps
        </Text>
        <Text className="font-sans w-16 text-neutral-500 text-xs uppercase tracking-wider text-right">
          Vol
        </Text>
      </View>

      {/* Rows */}
      {exercises.map((exercise, index) => (
        <View
          key={exercise.exercise_name}
          className={`flex-row items-center px-4 py-3 ${
            index < exercises.length - 1 ? 'border-b border-white/5' : ''
          }`}
        >
          <Text className="font-sans-medium flex-1 text-white" numberOfLines={1}>
            {exercise.exercise_name}
          </Text>
          <Text className="font-sans w-12 text-neutral-400 text-center">
            {exercise.sets_count}
          </Text>
          <Text className="font-sans w-12 text-neutral-400 text-center">
            {exercise.reps_count}
          </Text>
          <Text className="font-sans w-16 text-neutral-400 text-right">
            {exercise.volume_kg.toLocaleString()}
          </Text>
        </View>
      ))}

      {/* Empty state */}
      {exercises.length === 0 && (
        <View className="px-4 py-8 items-center">
          <Text className="font-sans text-neutral-500 text-sm">No exercises recorded</Text>
        </View>
      )}
    </View>
  );
}
