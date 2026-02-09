import "../global.css";
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  SpaceGrotesk_300Light,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import 'react-native-reanimated';

import { AuthProvider, QueryProvider, useAuth } from '@/lib/store';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

// Custom dark theme matching our design system
const RawDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    border: colors.borderSubtle,
    text: colors.textPrimary,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const isOnboarded = user?.profile?.onboarding_completed_at != null;

    // Guard: only navigate when needed to prevent loops
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (!isOnboarded) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } else if (isAuthenticated && !isOnboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (isAuthenticated && isOnboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, user?.profile?.onboarding_completed_at]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="logging/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_300Light,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider value={RawDarkTheme}>
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
