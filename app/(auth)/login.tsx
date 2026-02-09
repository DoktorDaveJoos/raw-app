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
import { router } from 'expo-router';
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/lib/store';
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
        router.push({
          pathname: '/(auth)/two-factor',
          params: { two_factor_token: result.twoFactorToken },
        });
        return;
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#121212' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 24, paddingBottom: 34 }}>
          {/* Logo Section */}
          <View style={{ alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '700',
                  color: '#121212',
                  fontFamily: 'SpaceGrotesk_700Bold',
                }}
              >
                R
              </Text>
            </View>
            <Text
              style={{
                fontSize: 32,
                fontWeight: '700',
                color: '#FFFFFF',
                letterSpacing: 4,
                fontFamily: 'SpaceGrotesk_700Bold',
              }}
            >
              RAW
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#6B7280',
                fontFamily: 'SpaceGrotesk_500Medium',
              }}
            >
              Track your lifts. Own your progress.
            </Text>
          </View>

          {/* Form Section */}
          <View
            role={Platform.OS === 'web' ? 'form' : undefined}
            style={{ gap: 16, marginBottom: 32 }}
          >
            {/* Email Field */}
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#6B7280',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                }}
              >
                EMAIL
              </Text>
              <View
                style={{
                  height: 48,
                  backgroundColor: '#1E1E1E',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#FFFFFF',
                    fontFamily: 'SpaceGrotesk_500Medium',
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#4B5563"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Field */}
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#6B7280',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                }}
              >
                PASSWORD
              </Text>
              <View
                style={{
                  height: 48,
                  backgroundColor: '#1E1E1E',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#FFFFFF',
                    fontFamily: 'SpaceGrotesk_500Medium',
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#4B5563"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.2)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={18} color="#ef4444" />
              <Text
                style={{
                  color: '#f87171',
                  fontSize: 14,
                  marginLeft: 8,
                  flex: 1,
                  fontFamily: 'SpaceGrotesk_400Regular',
                }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Button Section */}
          <View style={{ gap: 16 }}>
            {/* Log In Button */}
            <Pressable
              style={{
                height: 56,
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 0.7 : 1,
              }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#000000',
                    fontFamily: 'SpaceGrotesk_700Bold',
                  }}
                >
                  Log In
                </Text>
              )}
            </Pressable>

            {/* OR Divider */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#6B7280',
                  letterSpacing: 1,
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                }}
              >
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#2A2A2A' }} />
            </View>

            {/* Create Account Button */}
            <Pressable
              style={{
                height: 56,
                backgroundColor: '#1E1E1E',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2A2A2A',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                }}
              >
                Create Account
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
