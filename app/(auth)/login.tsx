import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/lib/store';
import { colors } from '@/lib/theme';
import { getErrorMessage } from '@/lib/api';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError(null);
    try {
      const result = await signIn(email, password);

      if (!result.success && result.twoFactorRequired) {
        // 2FA required - navigate to 2FA screen with token
        router.push({
          pathname: '/(auth)/two-factor',
          params: { two_factor_token: result.twoFactorToken },
        });
        return;
      }

      // Successful login
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-12">
          {/* Logo/Brand */}
          <View className="mb-12 items-center">
            <View className="h-20 w-20 bg-primary/20 rounded-2xl items-center justify-center mb-4">
              <MaterialIcons name="fitness-center" size={40} color={colors.primary} />
            </View>
            <Text className="text-4xl font-bold text-white">Raw</Text>
            <Text className="text-neutral-400 text-center mt-2">
              AI-Powered Workout Logging
            </Text>
          </View>

          {/* Form */}
          <View>
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-neutral-400 text-sm mb-2 ml-1">Email</Text>
              <View className="flex-row items-center bg-surface border border-white/10 rounded-xl overflow-hidden">
                <View className="pl-4">
                  <MaterialIcons name="email" size={20} color={colors.textDim} />
                </View>
                <TextInput
                  className="flex-1 px-3 py-4 text-white"
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textDim}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-neutral-400 text-sm mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-surface border border-white/10 rounded-xl overflow-hidden">
                <View className="pl-4">
                  <MaterialIcons name="lock" size={20} color={colors.textDim} />
                </View>
                <TextInput
                  className="flex-1 px-3 py-4 text-white"
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textDim}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  className="pr-4"
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color={colors.textDim}
                  />
                </Pressable>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View className="flex-row items-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <MaterialIcons name="error-outline" size={18} color="#ef4444" />
                <Text className="text-red-400 text-sm ml-2 flex-1">{error}</Text>
              </View>
            )}

            {/* Login Button */}
            <Pressable
              className={`bg-primary rounded-xl py-4 items-center mt-2 ${isLoading ? 'opacity-70' : 'active:opacity-80'}`}
              style={{
                shadowColor: colors.primary,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Log In</Text>
              )}
            </Pressable>

            {/* Register Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-neutral-400">Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text className="text-primary font-medium">Register</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
