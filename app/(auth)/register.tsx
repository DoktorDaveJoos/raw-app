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
import { colors } from '@/lib/theme';
import { register, getErrorMessage, getValidationErrors } from '@/lib/api';
import { useAuth } from '@/lib/store';

export default function RegisterScreen() {
  const { checkAuth } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      // Refresh auth state and go to app
      await checkAuth();
      router.replace('/(tabs)');
    } catch (err) {
      const validation = getValidationErrors(err);
      if (validation) {
        setFieldErrors(validation);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]?.[0];
  };

  const hasFieldError = (field: string): boolean => {
    return !!fieldErrors[field]?.length;
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
          {/* Header */}
          <View className="mb-10 items-center">
            <View className="h-16 w-16 bg-primary/20 rounded-2xl items-center justify-center mb-4">
              <MaterialIcons name="person-add" size={32} color={colors.primary} />
            </View>
            <Text className="font-sans-bold text-3xl text-white">Create Account</Text>
            <Text className="font-sans text-neutral-400 text-center mt-2">
              Start tracking your workouts with AI
            </Text>
          </View>

          {/* Form */}
          <View>
            {/* Name Input */}
            <View className="mb-4">
              <Text className="font-sans text-neutral-400 text-sm mb-2 ml-1">Name</Text>
              <View
                className={`flex-row items-center bg-surface border rounded-xl overflow-hidden ${
                  hasFieldError('name') ? 'border-red-500/50' : 'border-white/10'
                }`}
              >
                <View className="pl-4">
                  <MaterialIcons name="person" size={20} color={colors.textDim} />
                </View>
                <TextInput
                  className="font-sans flex-1 px-3 py-4 text-white"
                  placeholder="Your name"
                  placeholderTextColor={colors.textDim}
                  autoCapitalize="words"
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              {getFieldError('name') && (
                <Text className="font-sans text-red-400 text-xs mt-1 ml-1">{getFieldError('name')}</Text>
              )}
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="font-sans text-neutral-400 text-sm mb-2 ml-1">Email</Text>
              <View
                className={`flex-row items-center bg-surface border rounded-xl overflow-hidden ${
                  hasFieldError('email') ? 'border-red-500/50' : 'border-white/10'
                }`}
              >
                <View className="pl-4">
                  <MaterialIcons name="email" size={20} color={colors.textDim} />
                </View>
                <TextInput
                  className="font-sans flex-1 px-3 py-4 text-white"
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
              {getFieldError('email') && (
                <Text className="font-sans text-red-400 text-xs mt-1 ml-1">{getFieldError('email')}</Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="font-sans text-neutral-400 text-sm mb-2 ml-1">Password</Text>
              <View
                className={`flex-row items-center bg-surface border rounded-xl overflow-hidden ${
                  hasFieldError('password') ? 'border-red-500/50' : 'border-white/10'
                }`}
              >
                <View className="pl-4">
                  <MaterialIcons name="lock" size={20} color={colors.textDim} />
                </View>
                <TextInput
                  className="font-sans flex-1 px-3 py-4 text-white"
                  placeholder="At least 8 characters"
                  placeholderTextColor={colors.textDim}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
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
              {getFieldError('password') && (
                <Text className="font-sans text-red-400 text-xs mt-1 ml-1">{getFieldError('password')}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-4">
              <Text className="font-sans text-neutral-400 text-sm mb-2 ml-1">Confirm Password</Text>
              <View className="flex-row items-center bg-surface border border-white/10 rounded-xl overflow-hidden">
                <View className="pl-4">
                  <MaterialIcons name="lock-outline" size={20} color={colors.textDim} />
                </View>
                <TextInput
                  className="font-sans flex-1 px-3 py-4 text-white"
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textDim}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View className="flex-row items-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                <MaterialIcons name="error-outline" size={18} color="#ef4444" />
                <Text className="font-sans text-red-400 text-sm ml-2 flex-1">{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <Pressable
              className={`bg-primary rounded-xl py-4 items-center mt-2 ${isLoading ? 'opacity-70' : 'active:opacity-80'}`}
              style={{
                shadowColor: colors.primary,
                shadowOpacity: 0.3,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
              }}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="font-sans-semibold text-white text-base">Create Account</Text>
              )}
            </Pressable>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8">
              <Text className="font-sans text-neutral-400">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="font-sans-medium text-primary">Log In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
