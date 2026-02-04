import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';

export interface RawInputBlockProps {
  rawText: string;
}

export function RawInputBlock({ rawText }: RawInputBlockProps) {
  return (
    <View className="flex-row items-start p-3 rounded-xl bg-black/40 border border-white/5">
      <MaterialIcons
        name="terminal"
        size={18}
        color={colors.primary}
        style={{ marginTop: 2 }}
      />
      <View className="flex-1 ml-3">
        <Text className="font-sans-bold text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">
          Raw Input
        </Text>
        <Text className="text-sm font-mono text-neutral-300">
          {rawText}
        </Text>
      </View>
    </View>
  );
}
