import { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Profile, Injury } from '@/lib/api';
import { COMMON_MOVEMENTS_TO_AVOID } from '@/lib/constants/profile';
import { OptionChip } from '@/components/onboarding/OptionChip';
import { SectionLabel } from '@/components/onboarding/SectionLabel';
import { ProfileTextInput } from '../ProfileTextInput';
import type { SectionHandle } from './BasicsSection';

interface HealthSectionProps {
  profile: Profile;
}

export const HealthSection = forwardRef<SectionHandle, HealthSectionProps>(
  function HealthSection({ profile }, ref) {
    const [injuries, setInjuries] = useState<Injury[]>(profile.injuries || []);
    const [movementsToAvoid, setMovementsToAvoid] = useState<string[]>(profile.movements_to_avoid || []);

    useImperativeHandle(ref, () => ({
      getSaveData: () => ({
        injuries: injuries.filter((inj) => inj.body_part.trim()),
        movements_to_avoid: movementsToAvoid,
      }),
    }));

    const toggleMovement = (value: string) => {
      setMovementsToAvoid((prev) =>
        prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
      );
    };

    const addInjury = () => {
      setInjuries((prev) => [...prev, { body_part: '', side: '', description: '' }]);
    };

    const updateInjury = (index: number, field: keyof Injury, value: string) => {
      setInjuries((prev) =>
        prev.map((inj, i) => (i === index ? { ...inj, [field]: value } : inj))
      );
    };

    const removeInjury = (index: number) => {
      setInjuries((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <View style={{ gap: 16 }}>
        <SectionLabel label="Injuries" />
        {injuries.map((injury, index) => (
          <View key={index} style={{ gap: 8, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#9CA3AF' }}>
                Injury {index + 1}
              </Text>
              <Pressable onPress={() => removeInjury(index)}>
                <MaterialIcons name="close" size={18} color="#6B7280" />
              </Pressable>
            </View>
            <ProfileTextInput
              label="Body Part"
              value={injury.body_part}
              onChangeText={(v) => updateInjury(index, 'body_part', v)}
              placeholder="e.g. Left Shoulder"
            />
            <ProfileTextInput
              label="Side"
              value={injury.side || ''}
              onChangeText={(v) => updateInjury(index, 'side', v)}
              placeholder="e.g. Left, Right, Both"
            />
            <ProfileTextInput
              label="Description"
              value={injury.description || ''}
              onChangeText={(v) => updateInjury(index, 'description', v)}
              placeholder="Brief description"
            />
          </View>
        ))}
        <Pressable
          onPress={addInjury}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 10,
          }}
        >
          <MaterialIcons name="add-circle-outline" size={20} color="#9CA3AF" />
          <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#9CA3AF' }}>
            Add Injury
          </Text>
        </Pressable>

        <SectionLabel label="Movements to Avoid" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COMMON_MOVEMENTS_TO_AVOID.map((movement) => (
            <OptionChip
              key={movement.value}
              label={movement.label}
              value={movement.value}
              selected={movementsToAvoid.includes(movement.value)}
              onPress={toggleMovement}
            />
          ))}
        </View>
      </View>
    );
  }
);
