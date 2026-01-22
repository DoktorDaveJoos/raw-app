import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useRef } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { twoFactorChallenge, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/store';

export default function TwoFactorScreen() {
  const { checkAuth } = useAuth();
  const { two_factor_token } = useLocalSearchParams<{ two_factor_token: string }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    if (!two_factor_token) {
      setError('Missing authentication token. Please try logging in again.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await twoFactorChallenge({ two_factor_token, code });
      await checkAuth();
      router.replace('/(tabs)');
    } catch (err) {
      setError(getErrorMessage(err));
      setCode('');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow digits
    const digits = text.replace(/[^0-9]/g, '');
    setCode(digits);

    // Auto-submit when 6 digits entered
    if (digits.length === 6) {
      setError(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-6 justify-center">
        {/* Header */}
        <View className="mb-10 items-center">
          <View className="h-20 w-20 bg-primary/20 rounded-2xl items-center justify-center mb-4">
            <MaterialIcons name="security" size={40} color={colors.primary} />
          </View>
          <Text className="text-2xl font-bold text-white text-center">
            Two-Factor Authentication
          </Text>
          <Text className="text-neutral-400 text-center mt-2 px-4">
            Enter the 6-digit code from your authenticator app
          </Text>
        </View>

        {/* Form */}
        <View>
          {/* Code Input */}
          <View className="mb-4">
            <Text className="text-neutral-400 text-sm mb-2 ml-1 text-center">
              Verification Code
            </Text>
            <View className="flex-row items-center bg-surface border border-white/10 rounded-xl overflow-hidden">
              <View className="pl-4">
                <MaterialIcons name="pin" size={20} color={colors.textDim} />
              </View>
              <TextInput
                ref={inputRef}
                className="flex-1 px-3 py-4 text-white text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
                placeholderTextColor={colors.textDim}
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={handleCodeChange}
                autoFocus
              />
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="flex-row items-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <MaterialIcons name="error-outline" size={18} color="#ef4444" />
              <Text className="text-red-400 text-sm ml-2 flex-1 text-center">{error}</Text>
            </View>
          )}

          {/* Verify Button */}
          <Pressable
            className={`bg-primary rounded-xl py-4 items-center mt-2 ${
              isLoading || code.length !== 6 ? 'opacity-70' : 'active:opacity-80'
            }`}
            style={{
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
            }}
            onPress={handleVerify}
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Verify</Text>
            )}
          </Pressable>

          {/* Recovery Code Link */}
          <Pressable
            className="py-4 items-center mt-4"
            onPress={() => {
              // TODO: Implement recovery code flow
              console.log('Use recovery code');
            }}
          >
            <Text className="text-neutral-500 text-sm">Use a recovery code instead</Text>
          </Pressable>

          {/* Back to Login */}
          <Pressable
            className="py-3 items-center"
            onPress={() => router.replace('/(auth)/login')}
          >
            <View className="flex-row items-center">
              <MaterialIcons name="arrow-back" size={16} color={colors.textMuted} />
              <Text className="text-neutral-400 ml-1">Back to Login</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
