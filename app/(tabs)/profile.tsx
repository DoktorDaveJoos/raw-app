import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4">
        <Text className="font-sans-bold text-xl text-white">Profile</Text>
      </View>

      <View className="flex-1 px-6">
        {/* User Info Card */}
        <View className="bg-surface rounded-3xl p-6 border border-white/5 items-center">
          <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-4">
            <MaterialIcons name="person" size={40} color={colors.primary} />
          </View>
          <Text className="font-sans-semibold text-white text-xl">
            {user?.name || 'User'}
          </Text>
          <Text className="font-sans text-neutral-500 mt-1">
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Logout Button */}
        <Pressable
          className="bg-surface rounded-xl py-4 mt-6 items-center border border-white/5"
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <View className="flex-row items-center">
              <MaterialIcons name="logout" size={20} color={colors.error} />
              <Text className="font-sans-medium text-red-500 ml-2">Log Out</Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
