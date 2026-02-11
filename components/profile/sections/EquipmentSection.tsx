import { useState, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import type { Profile } from '@/lib/api';
import { GYM_TYPE_OPTIONS, COMMON_EQUIPMENT } from '@/lib/constants/profile';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { OptionChip } from '@/components/onboarding/OptionChip';
import { SectionLabel } from '@/components/onboarding/SectionLabel';
import type { SectionHandle } from './BasicsSection';

interface EquipmentSectionProps {
  profile: Profile;
}

export const EquipmentSection = forwardRef<SectionHandle, EquipmentSectionProps>(
  function EquipmentSection({ profile }, ref) {
    const [gymType, setGymType] = useState(profile.gym_type || '');
    const [equipment, setEquipment] = useState<string[]>(profile.available_equipment || []);

    useImperativeHandle(ref, () => ({
      getSaveData: () => ({
        gym_type: gymType || undefined,
        available_equipment: equipment,
      }),
    }));

    const toggleEquipment = (value: string) => {
      setEquipment((prev) =>
        prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
      );
    };

    return (
      <View style={{ gap: 16 }}>
        <SectionLabel label="Gym Type" />
        <View style={{ gap: 8 }}>
          {GYM_TYPE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              value={option.value}
              icon={option.icon}
              selected={gymType === option.value}
              onSelect={setGymType}
            />
          ))}
        </View>

        <SectionLabel label="Available Equipment" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COMMON_EQUIPMENT.map((equip) => (
            <OptionChip
              key={equip.value}
              label={equip.label}
              value={equip.value}
              selected={equipment.includes(equip.value)}
              onPress={toggleEquipment}
            />
          ))}
        </View>
      </View>
    );
  }
);
