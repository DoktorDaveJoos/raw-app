import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { RawInputBlock } from './RawInputBlock';
import { SetsTable, SetData } from './SetsTable';

export interface EventCardProps {
  exerciseName: string;
  rawText: string;
  sets: SetData[];
  onEdit?: () => void;
  onMore?: () => void;
  onSetPress?: (set: SetData, index: number) => void;
  readOnly?: boolean;
}

export function EventCard({
  exerciseName,
  rawText,
  sets,
  onEdit,
  onMore,
  onSetPress,
  readOnly = false,
}: EventCardProps) {
  return (
    <View className="bg-surface rounded-3xl border border-white/5 overflow-hidden">
      {/* Header section */}
      <View className="px-5 pt-5 pb-2">
        {/* Title row */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="h-6 w-1 bg-primary rounded-full" />
            <Text className="font-sans-bold text-white text-xl tracking-tight ml-3">
              {exerciseName}
            </Text>
          </View>

          {!readOnly && (
            <View className="flex-row items-center gap-2">
              <Pressable
                className="h-8 px-3 rounded-full bg-white/5 active:bg-white/10"
                onPress={onEdit}
              >
                <View className="flex-1 justify-center">
                  <Text className="font-sans-bold text-neutral-400 text-xs tracking-wide">
                    Edit
                  </Text>
                </View>
              </Pressable>
              <Pressable
                className="h-8 w-8 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
                onPress={onMore}
              >
                <MaterialIcons name="more-horiz" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Raw input block */}
        <View className="mb-2">
          <RawInputBlock rawText={rawText} />
        </View>
      </View>

      {/* Sets table */}
      <SetsTable sets={sets} onSetPress={onSetPress} />
    </View>
  );
}
