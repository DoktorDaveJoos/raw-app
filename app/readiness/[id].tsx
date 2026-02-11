import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Zap } from 'lucide-react-native';
import { ReadinessCard, SIGNAL_CONFIGS } from '@/components/readiness';
import { useSubmitReadiness, useSkipReadiness } from '@/hooks';
import { isAxiosError } from '@/lib/api';
import type { SignalType } from '@/components/readiness';
import type { ReadinessSignal } from '@/lib/api';

export default function ReadinessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(id);
  const insets = useSafeAreaInsets();

  const [signals, setSignals] = useState<Record<SignalType, number | null>>({
    sleep: null,
    energy: null,
    soreness: null,
    stress: null,
  });

  const submitMutation = useSubmitReadiness(sessionId);
  const skipMutation = useSkipReadiness(sessionId);

  const selectedSignals = Object.entries(signals).filter(
    ([, v]) => v != null,
  ) as [SignalType, number][];
  const hasSelection = selectedSignals.length > 0;
  const isSubmitting = submitMutation.isPending || skipMutation.isPending;

  const navigateToLogging = () => {
    router.replace(`/logging/${sessionId}`);
  };

  const handleSubmit = async () => {
    if (isSubmitting || !hasSelection) return;
    const payload: ReadinessSignal[] = selectedSignals.map(([type, value]) => ({
      type,
      value,
    }));
    try {
      await submitMutation.mutateAsync(payload);
    } catch (error) {
      // 409 = already checked in, proceed silently
      if (isAxiosError(error) && error.response?.status === 409) {
        // fall through to navigate
      } else {
        // Non-critical — proceed to logging anyway
      }
    }
    navigateToLogging();
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    try {
      await skipMutation.mutateAsync();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        // already checked in
      }
      // proceed regardless
    }
    navigateToLogging();
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelect = (type: SignalType, value: number | null) => {
    setSignals((prev) => ({ ...prev, [type]: value }));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
            <ChevronLeft size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Pre-Workout Check</Text>
          <Pressable onPress={handleSkip} disabled={isSubmitting} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>How are you feeling?</Text>
            <Text style={styles.greetingSub}>
              Tap to rate each one — it only takes a second.
            </Text>
          </View>

          {/* Readiness Cards */}
          <View style={styles.cardsContainer}>
            {SIGNAL_CONFIGS.map((config) => (
              <ReadinessCard
                key={config.type}
                config={config}
                value={signals[config.type]}
                onSelect={(v) => handleSelect(config.type, v)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Sticky Action Bar */}
      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={!hasSelection || isSubmitting}
          style={({ pressed }) => [
            styles.startButton,
            (!hasSelection || isSubmitting) && styles.startButtonDisabled,
            pressed && hasSelection && !isSubmitting && styles.startButtonPressed,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#121212" />
          ) : (
            <Zap size={18} color="#121212" />
          )}
          <Text style={styles.startButtonText}>Start Workout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  flex: {
    flex: 1,
  },
  // Header
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  skipButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  skipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  // Scroll content
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  // Greeting
  greeting: {
    alignItems: 'center',
    gap: 8,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  greetingSub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  // Cards
  cardsContainer: {
    marginTop: 16,
    gap: 10,
  },
  // Action Bar
  actionBar: {
    backgroundColor: '#1A1A1A',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonDisabled: {
    opacity: 0.4,
  },
  startButtonPressed: {
    opacity: 0.8,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121212',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
});
