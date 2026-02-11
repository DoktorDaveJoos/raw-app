import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useCallback } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '@/lib/store';
import { useProfile, useUpdateProfile } from '@/hooks';
import { colors } from '@/lib/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { SectionLabel } from '@/components/onboarding/SectionLabel';
import { ProfileSection } from '@/components/profile/ProfileSection';
import { BasicsSection } from '@/components/profile/sections/BasicsSection';
import { TrainingSection } from '@/components/profile/sections/TrainingSection';
import { GoalsSection } from '@/components/profile/sections/GoalsSection';
import { GearSection } from '@/components/profile/sections/GearSection';
import { EquipmentSection } from '@/components/profile/sections/EquipmentSection';
import { HealthSection } from '@/components/profile/sections/HealthSection';
import type { SectionHandle } from '@/components/profile/sections/BasicsSection';
import type { Profile } from '@/lib/api';
import {
  getBasicsSummary,
  getTrainingSummary,
  getGoalsSummary,
  getGearSummary,
  getEquipmentSummary,
  getHealthSummary,
} from '@/lib/constants/profile';

type SectionKey = 'basics' | 'training' | 'goals' | 'gear' | 'equipment' | 'health';

const SECTIONS: {
  key: SectionKey;
  title: string;
  icon: string;
  getSummary: (p: Profile) => string;
}[] = [
  { key: 'basics', title: 'Basics & Units', icon: 'straighten', getSummary: getBasicsSummary },
  { key: 'training', title: 'Training Split', icon: 'fitness-center', getSummary: getTrainingSummary },
  { key: 'goals', title: 'Goals & Focus', icon: 'flag', getSummary: getGoalsSummary },
  { key: 'gear', title: 'Gear & Supplements', icon: 'medication', getSummary: getGearSummary },
  { key: 'equipment', title: 'Gym & Equipment', icon: 'warehouse', getSummary: getEquipmentSummary },
  { key: 'health', title: 'Health & Injuries', icon: 'healing', getSummary: getHealthSummary },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sectionRef = useRef<SectionHandle>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleToggle = useCallback((key: SectionKey) => {
    setExpandedSection((prev) => (prev === key ? null : key));
  }, []);

  const handleCancel = useCallback(() => {
    setExpandedSection(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!sectionRef.current) return;
    const data = sectionRef.current.getSaveData();
    updateProfile.mutate(data, {
      onSuccess: () => {
        setExpandedSection(null);
      },
    });
  }, [updateProfile]);

  const renderSectionForm = (key: SectionKey) => {
    if (!profile) return null;
    switch (key) {
      case 'basics':
        return <BasicsSection ref={sectionRef} profile={profile} />;
      case 'training':
        return <TrainingSection ref={sectionRef} profile={profile} />;
      case 'goals':
        return <GoalsSection ref={sectionRef} profile={profile} />;
      case 'gear':
        return <GearSection ref={sectionRef} profile={profile} />;
      case 'equipment':
        return <EquipmentSection ref={sectionRef} profile={profile} />;
      case 'health':
        return <HealthSection ref={sectionRef} profile={profile} />;
    }
  };

  const getInitial = (name: string | undefined) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View
        style={{
          height: 56,
          paddingHorizontal: 20,
          justifyContent: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#2A2A2A',
        }}
      >
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 20,
            color: '#FFFFFF',
          }}
        >
          Profile
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 20, gap: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Card */}
        <View
          style={{
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#1A1A1A',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.03)',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: '#2A2A2A',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 24,
                color: '#FFFFFF',
              }}
            >
              {getInitial(user?.name)}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 18,
              color: '#FFFFFF',
            }}
          >
            {user?.name || 'User'}
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              fontSize: 14,
              color: '#6B7280',
            }}
          >
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Training Profile Label */}
        <SectionLabel label="Training Profile" />

        {/* Sections */}
        {isLoading ? (
          <View style={{ gap: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height={68} borderRadius={16} />
            ))}
          </View>
        ) : error ? (
          <View
            style={{
              backgroundColor: '#1A1A1A',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.03)',
            }}
          >
            <MaterialIcons name="error-outline" size={32} color="#6B7280" />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                fontSize: 15,
                color: '#6B7280',
                marginTop: 12,
                textAlign: 'center',
              }}
            >
              Unable to load profile. Complete onboarding first.
            </Text>
          </View>
        ) : profile ? (
          <View style={{ gap: 8 }}>
            {SECTIONS.map((section) => (
              <ProfileSection
                key={section.key}
                icon={section.icon}
                title={section.title}
                summary={section.getSummary(profile)}
                expanded={expandedSection === section.key}
                onToggle={() => handleToggle(section.key)}
                saving={updateProfile.isPending}
                onCancel={handleCancel}
                onSave={handleSave}
              >
                {expandedSection === section.key && renderSectionForm(section.key)}
              </ProfileSection>
            ))}
          </View>
        ) : null}

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={{
            backgroundColor: '#1A1A1A',
            borderRadius: 16,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.03)',
          }}
        >
          {isLoggingOut ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialIcons name="logout" size={18} color={colors.error} />
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  fontSize: 14,
                  color: colors.error,
                }}
              >
                Log Out
              </Text>
            </View>
          )}
        </Pressable>

        {/* Bottom spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
