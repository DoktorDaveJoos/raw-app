import { View, Text } from 'react-native';

interface OnboardingHeaderProps {
  stepNumber: number;
  totalSteps: number;
  showStepIndicator?: boolean;
}

export function OnboardingHeader({ stepNumber, totalSteps, showStepIndicator = true }: OnboardingHeaderProps) {
  return (
    <View
      style={{
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: showStepIndicator ? 'space-between' : 'center',
        paddingHorizontal: 20,
        borderBottomWidth: showStepIndicator ? 1 : 0,
        borderBottomColor: '#2A2A2A',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 18,
              color: '#121212',
            }}
          >
            R
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 18,
            color: '#FFFFFF',
            letterSpacing: 2,
          }}
        >
          RAW
        </Text>
      </View>
      {showStepIndicator && (
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            fontSize: 13,
            color: '#6B7280',
          }}
        >
          {stepNumber} of {totalSteps}
        </Text>
      )}
    </View>
  );
}
