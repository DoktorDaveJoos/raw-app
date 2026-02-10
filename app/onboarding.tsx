import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useOnboardingStatus,
  useSubmitOnboardingStep,
  useSkipOnboardingStep,
  useCompleteOnboarding,
} from '@/hooks';
import { useAuth } from '@/lib/store/auth-context';
import {
  OnboardingHeader,
  ProgressBar,
  ChatBubble,
  OptionCard,
  OptionChip,
  SectionLabel,
  OnboardingInputBar,
  CompletionScreen,
} from '@/components/onboarding';
import { STEP_CONFIGS, STEP_ORDER, getStepNumber } from '@/lib/onboarding/step-config';
import type { OnboardingStepName } from '@/lib/api';

interface ChatMessage {
  id: string;
  type: 'ai' | 'user' | 'confirm';
  content: string;
  parsedData?: Record<string, unknown>;
  isWelcome?: boolean;
}

const TOTAL_STEPS = 7;

const WELCOME_MESSAGE =
  "I'm going to ask you a few questions to personalize your experience. This helps me understand your training and give better recommendations.";

export default function OnboardingScreen() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: status, isLoading: statusLoading } = useOnboardingStatus();
  const submitStep = useSubmitOnboardingStep();
  const skipStep = useSkipOnboardingStep();
  const completeOnboarding = useCompleteOnboarding();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<OnboardingStepName>('welcome');
  const [stepNumber, setStepNumber] = useState(1);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Selection state for current step
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedMultiSelect, setSelectedMultiSelect] = useState<string[]>([]);
  const [autofilledText, setAutofilledText] = useState('');

  // Profile summary for completion screen
  const [profileSummary, setProfileSummary] = useState<Record<string, string>>({});

  // Initialize from status
  useEffect(() => {
    if (!status || initialized) return;

    if (status.completed) {
      router.replace('/(tabs)');
      return;
    }

    const step = status.current_step ?? 'welcome';
    const stepNum = getStepNumber(step);
    setCurrentStep(step);
    setStepNumber(stepNum);

    const initialMessages: ChatMessage[] = [];

    if (step === 'welcome') {
      // First step: show welcome message
      initialMessages.push({
        id: 'welcome',
        type: 'ai',
        content: WELCOME_MESSAGE,
        isWelcome: true,
      });
    }

    if (status.current_prompt) {
      initialMessages.push({
        id: `prompt-${step}`,
        type: 'ai',
        content: status.current_prompt,
      });
    }

    setMessages(initialMessages);
    setInitialized(true);
  }, [status, initialized, router]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const resetStepSelections = useCallback(() => {
    setSelectedCard(null);
    setSelectedChips([]);
    setSelectedMultiSelect([]);
    setInputText('');
    setAutofilledText('');
  }, []);

  const advanceToNextStep = useCallback(
    (nextStep: OnboardingStepName | null, nextPrompt: string | null, parsedFromPrevious?: Record<string, unknown>) => {
      if (!nextStep || !nextPrompt) {
        // Onboarding done, call complete
        setIsSubmitting(true);
        completeOnboarding.mutate(undefined, {
          onSuccess: (data) => {
            const profile = data.profile as Record<string, unknown>;
            setProfileSummary({
              experience: (profile.experience_level as string) ?? '',
              goal: (profile.primary_goal as string) ?? '',
              split: profile.current_split
                ? `${String(profile.current_split).replace(/_/g, ' ')} ${profile.training_frequency ?? ''}x/week`.trim()
                : '',
              gym: (profile.gym_type as string) ?? '',
            });
            setIsComplete(true);
            setIsSubmitting(false);
          },
          onError: () => {
            setIsSubmitting(false);
          },
        });
        return;
      }

      resetStepSelections();
      setCurrentStep(nextStep);
      setStepNumber(getStepNumber(nextStep));

      const newMessages: ChatMessage[] = [];

      // Special case: transitioning to 'units' step
      // Show confirmation bubble with parsed data from 'welcome'
      if (nextStep === 'units' && parsedFromPrevious) {
        newMessages.push({
          id: 'confirm-welcome-for-units',
          type: 'confirm',
          content: "Got it! Here's what I noted:",
          parsedData: parsedFromPrevious,
        });
      }

      // Add the new prompt
      newMessages.push({
        id: `prompt-${nextStep}`,
        type: 'ai' as const,
        content: nextPrompt,
      });

      setMessages((prev) => [...prev, ...newMessages]);
    },
    [completeOnboarding, resetStepSelections],
  );

  const handleSubmit = useCallback(
    (text: string) => {
      if (!text.trim() || isSubmitting) return;

      const userText = text.trim();
      setInputText('');
      setIsSubmitting(true);

      // Add user bubble
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          type: 'user',
          content: userText,
        },
      ]);

      submitStep.mutate(
        { step: currentStep, rawText: userText },
        {
          onSuccess: (data) => {
            // For steps other than 'welcome', show confirmation immediately
            if (currentStep !== 'welcome') {
              setMessages((prev) => [
                ...prev,
                {
                  id: `confirm-${currentStep}`,
                  type: 'confirm',
                  content: `Got it! ${'\u2713'}`,
                  parsedData: data.parsed,
                },
              ]);
            }

            // Track profile data for summary
            setProfileSummary((prev) => {
              const updated = { ...prev };
              const parsed = data.parsed;
              if (parsed.experience_level) updated.experience = String(parsed.experience_level);
              if (parsed.primary_goal) updated.goal = String(parsed.primary_goal);
              if (parsed.current_split) {
                updated.split = `${String(parsed.current_split).replace(/_/g, ' ')} ${parsed.training_frequency ?? ''}x/week`.trim();
              }
              if (parsed.gym_type) updated.gym = String(parsed.gym_type);
              return updated;
            });

            setIsSubmitting(false);

            // Pass parsed data if advancing to 'units' from 'welcome'
            const parsedToPass = currentStep === 'welcome' ? data.parsed : undefined;
            advanceToNextStep(data.next_step, data.next_prompt, parsedToPass);
          },
          onError: () => {
            setIsSubmitting(false);
            setMessages((prev) => [
              ...prev,
              {
                id: `error-${Date.now()}`,
                type: 'ai',
                content: 'Something went wrong. Please try again.',
              },
            ]);
          },
        },
      );
    },
    [currentStep, isSubmitting, submitStep, advanceToNextStep],
  );

  const handleSkip = useCallback(() => {
    if (isSubmitting) return;

    const isLastStep = currentStep === STEP_ORDER[STEP_ORDER.length - 1];

    if (isLastStep) {
      // Last step - finish setup directly
      advanceToNextStep(null, null);
      return;
    }

    setIsSubmitting(true);

    skipStep.mutate(currentStep, {
      onSuccess: (data) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `skip-${currentStep}`,
            type: 'user',
            content: '[Skipped]',
          },
        ]);
        setIsSubmitting(false);
        advanceToNextStep(data.next_step, data.next_prompt);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  }, [currentStep, isSubmitting, skipStep, advanceToNextStep]);

  const handleCardSelect = useCallback(
    (value: string) => {
      setSelectedCard(value);
      const config = STEP_CONFIGS[currentStep];
      const text = config.buildText({ cards: [value] });
      if (text) {
        setInputText(text);
        setAutofilledText(text);
      }
    },
    [currentStep],
  );

  const handleChipSelect = useCallback((value: string) => {
    setSelectedChips([value]);
    const config = STEP_CONFIGS[currentStep];
    const text = config.buildText({ chips: [value] });
    if (text) {
      setInputText(text);
      setAutofilledText(text);
    }
  }, [currentStep]);

  const handleMultiSelectToggle = useCallback((value: string) => {
    setSelectedMultiSelect((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  const handleSend = useCallback(() => {
    const config = STEP_CONFIGS[currentStep];
    let text = inputText.trim();

    // Case 1: No selections at all - use user input as-is
    if (!selectedCard && selectedMultiSelect.length === 0) {
      if (text) handleSubmit(text);
      return;
    }

    // Case 2: Has selections - merge intelligently
    const hasMultiSelect = selectedMultiSelect.length > 0;

    // Detect if user edited the autofilled text
    const userEdited = autofilledText && text && text !== autofilledText;

    if (userEdited && hasMultiSelect) {
      // User edited + has multi-select: keep edits, append multi-select
      const multiSelectText = config.buildText({
        multiSelect: selectedMultiSelect
      });

      if (multiSelectText) {
        text = text.trim().endsWith('.')
          ? `${text} ${multiSelectText}`
          : `${text}. ${multiSelectText}`;
      }
    } else if (userEdited && !hasMultiSelect) {
      // User edited but no multi-select: use edited text as-is
      // (text already set, no changes needed)
    } else {
      // User didn't edit: use full buildText()
      text = config.buildText({
        cards: selectedCard ? [selectedCard] : undefined,
        multiSelect: hasMultiSelect ? selectedMultiSelect : undefined,
      });
    }

    if (text) handleSubmit(text);
  }, [currentStep, inputText, selectedCard, selectedMultiSelect, autofilledText, handleSubmit]);

  // Loading state
  if (statusLoading || !initialized) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </SafeAreaView>
    );
  }

  // Completion screen
  if (isComplete) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }} edges={['top']}>
        <CompletionScreen
          profileSummary={profileSummary}
          onStartWorkout={async () => {
            await checkAuth();
            router.replace('/(tabs)');
          }}
        />
      </SafeAreaView>
    );
  }

  const stepConfig = STEP_CONFIGS[currentStep];
  const isLastStep = currentStep === STEP_ORDER[STEP_ORDER.length - 1];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }} edges={['top']}>
      <OnboardingHeader stepNumber={stepNumber} totalSteps={TOTAL_STEPS} />
      <ProgressBar current={stepNumber} total={TOTAL_STEPS} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingTop: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Chat messages */}
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              type={msg.type}
              content={msg.content}
              parsedData={msg.parsedData}
              isWelcome={msg.isWelcome}
            />
          ))}

          {/* Loading indicator */}
          {isSubmitting && (
            <View style={{ paddingVertical: 8 }}>
              <ActivityIndicator size="small" color="#9CA3AF" />
            </View>
          )}

          {/* Step-specific options (only for current step, not submitting) */}
          {!isSubmitting && (
            <>
              {/* Section label for cards */}
              {stepConfig.sectionLabels?.[0] && (
                <SectionLabel label={stepConfig.sectionLabels[0]} />
              )}

              {/* Card options */}
              {stepConfig.cardOptions && (
                <View style={{ gap: 8 }}>
                  {stepConfig.cardOptions.map((card) => (
                    <OptionCard
                      key={card.value}
                      label={card.label}
                      value={card.value}
                      icon={card.icon}
                      selected={selectedCard === card.value}
                      onSelect={handleCardSelect}
                    />
                  ))}
                </View>
              )}

              {/* Section label for multi-select */}
              {stepConfig.sectionLabels?.[1] && (
                <SectionLabel label={stepConfig.sectionLabels[1]} />
              )}

              {/* Multi-select chips */}
              {stepConfig.multiSelectChips && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {stepConfig.multiSelectChips.map((chip) => (
                    <OptionChip
                      key={chip.value}
                      label={chip.label}
                      value={chip.value}
                      selected={selectedMultiSelect.includes(chip.value)}
                      onPress={handleMultiSelectToggle}
                    />
                  ))}
                </View>
              )}

              {/* Single-select chips (basics, training) */}
              {stepConfig.chipOptions && !stepConfig.cardOptions && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {stepConfig.chipOptions.map((chip) => (
                    <OptionChip
                      key={chip.value}
                      label={chip.label}
                      value={chip.value}
                      selected={selectedChips.includes(chip.value)}
                      onPress={handleChipSelect}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        <OnboardingInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onSkip={handleSkip}
          disabled={isSubmitting}
          placeholder={stepConfig.placeholder}
          isLastStep={isLastStep}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
