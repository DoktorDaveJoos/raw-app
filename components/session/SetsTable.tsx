import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';

export interface SetData {
  set_number: number;
  weight_kg: number | null;
  reps: number;
  rpe: number | null;
  rir: number | null;
  unit?: string;
  completed?: boolean;
}

export interface SetsTableProps {
  sets: SetData[];
  onSetPress?: (set: SetData, index: number) => void;
  showHeader?: boolean;
}

export function SetsTable({ sets, onSetPress, showHeader = true }: SetsTableProps) {
  const weightLabel = (sets[0]?.unit ?? 'kg').toUpperCase();

  return (
    <View className="rounded-xl overflow-hidden">
      {/* Header */}
      {showHeader && (
        <View className="flex-row px-5 py-2 bg-black/20 border-b border-white/5">
          <Text className="font-sans-bold w-8 text-center text-[10px] text-neutral-600 uppercase tracking-widest">
            #
          </Text>
          <Text className="font-sans-bold flex-1 text-center text-[10px] text-neutral-600 uppercase tracking-widest">
            {weightLabel}
          </Text>
          <Text className="font-sans-bold flex-1 text-center text-[10px] text-neutral-600 uppercase tracking-widest">
            Reps
          </Text>
          <Text className="font-sans-bold flex-1 text-center text-[10px] text-neutral-600 uppercase tracking-widest">
            RIR
          </Text>
          <View className="w-8" />
        </View>
      )}

      {/* Rows */}
      <View>
        {sets.map((set, index) => (
          <SetRow
            key={set.set_number}
            set={set}
            isLast={index === sets.length - 1}
            onPress={onSetPress ? () => onSetPress(set, index) : undefined}
          />
        ))}
      </View>
    </View>
  );
}

interface SetRowProps {
  set: SetData;
  isLast: boolean;
  onPress?: () => void;
}

function SetRow({ set, isLast, onPress }: SetRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      className={`flex-row items-center py-3.5 px-5 ${!isLast ? 'border-b border-white/5' : ''}`}
      onPress={onPress}
      style={({ pressed }: { pressed?: boolean }) => [
        pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
      ]}
    >
      <Text className="font-sans-bold w-8 text-center text-neutral-500 text-sm">
        {set.set_number}
      </Text>
      <Text className="font-sans-medium flex-1 text-center text-white text-base">
        {set.weight_kg ?? '-'}
      </Text>
      <Text className="font-sans-medium flex-1 text-center text-white text-base">
        {set.reps}
      </Text>
      <Text className="font-sans-medium flex-1 text-center text-neutral-400 text-sm">
        {set.rir ?? (set.rpe !== null ? 10 - set.rpe : null) ?? '-'}
      </Text>
      <View className="w-8 items-end">
        {(set.completed !== false) && (
          <MaterialIcons name="check-circle" size={20} color={colors.primary} />
        )}
      </View>
    </Container>
  );
}
