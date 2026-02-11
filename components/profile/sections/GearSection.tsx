import { useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { Profile, Compound } from '@/lib/api';
import { COMMON_SUPPLEMENTS } from '@/lib/constants/profile';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { OptionChip } from '@/components/onboarding/OptionChip';
import { SectionLabel } from '@/components/onboarding/SectionLabel';
import { ProfileTextInput } from '../ProfileTextInput';
import type { SectionHandle } from './BasicsSection';

interface GearSectionProps {
  profile: Profile;
}

export const GearSection = forwardRef<SectionHandle, GearSectionProps>(
  function GearSection({ profile }, ref) {
    const [isEnhanced, setIsEnhanced] = useState(profile.is_enhanced || false);
    const [compounds, setCompounds] = useState<Compound[]>(profile.compounds || []);
    const [supplements, setSupplements] = useState<string[]>(profile.supplements || []);

    useImperativeHandle(ref, () => ({
      getSaveData: () => ({
        is_enhanced: isEnhanced,
        compounds: isEnhanced ? compounds.filter((c) => c.name.trim()) : [],
        supplements,
      }),
    }));

    const toggleSupplement = (value: string) => {
      setSupplements((prev) =>
        prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
      );
    };

    const addCompound = () => {
      setCompounds((prev) => [...prev, { name: '', dose: '', frequency: '' }]);
    };

    const updateCompound = (index: number, field: keyof Compound, value: string) => {
      setCompounds((prev) =>
        prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
      );
    };

    const removeCompound = (index: number) => {
      setCompounds((prev) => prev.filter((_, i) => i !== index));
    };

    return (
      <View style={{ gap: 16 }}>
        <SectionLabel label="Status" />
        <View style={{ gap: 8 }}>
          <OptionCard
            label="Natural"
            value="natural"
            icon="eco"
            selected={!isEnhanced}
            onSelect={() => setIsEnhanced(false)}
          />
          <OptionCard
            label="Enhanced"
            value="enhanced"
            icon="science"
            selected={isEnhanced}
            onSelect={() => setIsEnhanced(true)}
          />
        </View>

        {isEnhanced && (
          <>
            <SectionLabel label="Compounds" />
            {compounds.map((compound, index) => (
              <View key={index} style={{ gap: 8, backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 13, color: '#9CA3AF' }}>
                    Compound {index + 1}
                  </Text>
                  <Pressable onPress={() => removeCompound(index)}>
                    <MaterialIcons name="close" size={18} color="#6B7280" />
                  </Pressable>
                </View>
                <ProfileTextInput
                  label="Name"
                  value={compound.name}
                  onChangeText={(v) => updateCompound(index, 'name', v)}
                  placeholder="e.g. Testosterone"
                />
                <ProfileTextInput
                  label="Dose"
                  value={compound.dose || ''}
                  onChangeText={(v) => updateCompound(index, 'dose', v)}
                  placeholder="e.g. 200mg"
                />
                <ProfileTextInput
                  label="Frequency"
                  value={compound.frequency || ''}
                  onChangeText={(v) => updateCompound(index, 'frequency', v)}
                  placeholder="e.g. Weekly"
                />
              </View>
            ))}
            <Pressable
              onPress={addCompound}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 10,
              }}
            >
              <MaterialIcons name="add-circle-outline" size={20} color="#9CA3AF" />
              <Text style={{ fontFamily: 'SpaceGrotesk_500Medium', fontSize: 14, color: '#9CA3AF' }}>
                Add Compound
              </Text>
            </Pressable>
          </>
        )}

        <SectionLabel label="Supplements" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COMMON_SUPPLEMENTS.map((supp) => (
            <OptionChip
              key={supp.value}
              label={supp.label}
              value={supp.value}
              selected={supplements.includes(supp.value)}
              onPress={toggleSupplement}
            />
          ))}
        </View>
      </View>
    );
  }
);
