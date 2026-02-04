import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';

export default function StatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="font-sans-bold text-xl text-white">Stats</Text>
      </View>

      <View className="flex-1 px-6 justify-center items-center">
        <View className="bg-surface rounded-3xl p-8 border border-white/5 items-center max-w-xs">
          <MaterialIcons name="bar-chart" size={48} color={colors.textMuted} />
          <Text className="font-sans-semibold text-white text-lg mt-4">Coming Soon</Text>
          <Text className="font-sans text-neutral-500 text-center mt-2">
            Detailed workout analytics and progress tracking will be available here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
