import { useState } from 'react';
import { View } from 'react-native';
import { MuscleMappingPrompt } from './MuscleMappingPrompt';
import { MuscleMappingPicker } from './MuscleMappingPicker';
import { MuscleMappingConfirmed } from './MuscleMappingConfirmed';
import { useMuscleGroups, useSubmitMuscleMapping, useSkipMuscleMapping } from '@/hooks';
import type { SessionEvent } from '@/lib/api';

interface MuscleMappingBubbleProps {
  event: SessionEvent;
  sessionId: number;
}

type FlowState = 'prompt' | 'picking' | 'confirmed';

export function MuscleMappingBubble({ event, sessionId }: MuscleMappingBubbleProps) {
  const [flowState, setFlowState] = useState<FlowState>('prompt');

  const { data: muscleGroups = [], isLoading } = useMuscleGroups();
  const submitMapping = useSubmitMuscleMapping(sessionId);
  const skipMapping = useSkipMuscleMapping(sessionId);

  const clarification = event.clarification;
  const exerciseId = clarification?.exercise_id;
  const exerciseName = clarification?.exercise_name || 'Exercise';

  // Determine current state based on clarification presence
  // If clarification is null, it means the mapping was already submitted/skipped
  const currentState: FlowState = !clarification ? 'confirmed' : flowState;

  const handleTagMuscles = () => {
    setFlowState('picking');
  };

  const handleSkip = () => {
    if (exerciseId) {
      skipMapping.mutate(event.id);
    }
  };

  const handleSubmit = (mappings: any[]) => {
    if (exerciseId) {
      submitMapping.mutate({
        eventId: event.id,
        exerciseId,
        mappings,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return null;
  }

  // Show prompt
  if (currentState === 'prompt') {
    return (
      <MuscleMappingPrompt
        exerciseName={exerciseName}
        onTagMuscles={handleTagMuscles}
        onSkip={handleSkip}
      />
    );
  }

  // Show picker
  if (currentState === 'picking') {
    return (
      <MuscleMappingPicker
        muscleGroups={muscleGroups}
        exerciseName={exerciseName}
        onSubmit={handleSubmit}
        onSkip={handleSkip}
      />
    );
  }

  // Show confirmed state (placeholder for now since we need mapping data from backend)
  // TODO: Extract muscle mappings from event data once backend includes it in response
  return (
    <MuscleMappingConfirmed
      exerciseName={exerciseName}
      primaryMuscles={[]}
      secondaryMuscles={[]}
    />
  );
}
