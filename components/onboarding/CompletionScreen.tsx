import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ProfileSummary {
  experience?: string;
  goal?: string;
  split?: string;
  gym?: string;
}

interface CompletionScreenProps {
  profileSummary: ProfileSummary;
  onStartWorkout: () => void;
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 12,
          color: '#6B7280',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_600SemiBold',
          fontSize: 14,
          color: '#FFFFFF',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export function CompletionScreen({ profileSummary, onStartWorkout }: CompletionScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      {/* Header */}
      <View
        style={{
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
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
      </View>

      {/* Content Area */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 60,
          paddingHorizontal: 24,
          gap: 32,
        }}
      >
        {/* Success Icon */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="check" size={40} color="#121212" />
        </View>

        {/* Success Content */}
        <View style={{ alignItems: 'center', gap: 12, width: '100%' }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 28,
              color: '#FFFFFF',
            }}
          >
            You're all set! {'\u{1F389}'}
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              fontSize: 15,
              color: '#9CA3AF',
              textAlign: 'center',
              lineHeight: 15 * 1.5,
            }}
          >
            Your profile is ready. RAW will now personalize exercise suggestions and volume recommendations based on your info.
          </Text>
        </View>

        {/* Profile Summary */}
        <View
          style={{
            backgroundColor: '#1E1E1E',
            borderRadius: 16,
            padding: 20,
            gap: 16,
            width: '100%',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 11,
              color: '#6B7280',
              letterSpacing: 1,
            }}
          >
            YOUR PROFILE
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, gap: 12 }}>
              {profileSummary.experience && (
                <SummaryItem label="Experience" value={profileSummary.experience} />
              )}
              {profileSummary.split && (
                <SummaryItem label="Split" value={profileSummary.split} />
              )}
            </View>
            <View style={{ flex: 1, gap: 12 }}>
              {profileSummary.goal && (
                <SummaryItem label="Goal" value={profileSummary.goal} />
              )}
              {profileSummary.gym && (
                <SummaryItem label="Gym" value={profileSummary.gym} />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Area */}
      <View
        style={{
          paddingTop: 16,
          paddingHorizontal: 20,
          paddingBottom: 34,
          gap: 12,
        }}
      >
        <Pressable
          onPress={onStartWorkout}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            height: 56,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_700Bold',
              fontSize: 16,
              color: '#121212',
            }}
          >
            Start Your First Workout
          </Text>
        </Pressable>
        <Pressable style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 13,
              color: '#6B7280',
            }}
          >
            Edit profile later in Settings
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
