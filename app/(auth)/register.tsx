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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      style={{ flex: 1, backgroundColor: '#121212' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingHorizontal: 24, paddingBottom: 34 }}>
          {/* Logo Section */}
          <View style={{ alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 28,
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
                fontSize: 26,
                fontWeight: '700',
                color: '#FFFFFF',
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: '#6B7280',
              }}
            >
              Start tracking your progress today
            </Text>
          </View>

          {/* Form Section */}
          <View style={{ gap: 14, marginBottom: 28 }}>
            {/* Name Field */}
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#6B7280',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                NAME
              </Text>
              <View
                style={{
                  height: 48,
                  backgroundColor: '#1E1E1E',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: hasFieldError('name') ? 'rgba(239, 68, 68, 0.5)' : '#2A2A2A',
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#FFFFFF',
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="#4B5563"
                  autoCapitalize="words"
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              {getFieldError('name') && (
                <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                  {getFieldError('name')}
                </Text>
              )}
            </View>

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
                  borderColor: hasFieldError('email') ? 'rgba(239, 68, 68, 0.5)' : '#2A2A2A',
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#FFFFFF',
                  }}
                  placeholder="your@email.com"
                  placeholderTextColor="#4B5563"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              {getFieldError('email') && (
                <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                  {getFieldError('email')}
                </Text>
              )}
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
                  borderColor: hasFieldError('password') ? 'rgba(239, 68, 68, 0.5)' : '#2A2A2A',
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
                  }}
                  placeholder="Create a password"
                  placeholderTextColor="#4B5563"
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#6B7280"
                  />
                </Pressable>
              </View>
              {getFieldError('password') && (
                <Text style={{ color: '#f87171', fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                  {getFieldError('password')}
                </Text>
              )}
            </View>

            {/* Confirm Password Field */}
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: '#6B7280',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                CONFIRM PASSWORD
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
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor="#4B5563"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#6B7280"
                  />
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
              <MaterialIcons name="error-outline" size={18} color="#ef4444" />
              <Text
                style={{
                  color: '#f87171',
                  fontSize: 14,
                  marginLeft: 8,
                  flex: 1,
                }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Button Section */}
          <View style={{ gap: 16 }}>
            {/* Sign Up Button */}
            <Pressable
              style={{
                height: 56,
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 0.7 : 1,
              }}
              onPress={handleRegister}
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
                  }}
                >
                  Sign Up
                </Text>
              )}
            </Pressable>

            {/* Footer */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#6B7280',
                }}
              >
                Already have an account?
              </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                >
                  Log In
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
