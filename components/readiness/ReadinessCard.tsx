import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Moon, Zap, HeartPulse, Brain } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export type SignalType = 'sleep' | 'energy' | 'soreness' | 'stress';

interface ScaleOption {
  value: number;
  label: string;
}

interface SignalConfig {
  type: SignalType;
  label: string;
  icon: LucideIcon;
  options: ScaleOption[];
}

export const SIGNAL_CONFIGS: SignalConfig[] = [
  {
    type: 'sleep',
    label: 'Sleep quality',
    icon: Moon,
    options: [
      { value: 1, label: 'Terrible' },
      { value: 2, label: 'Poor' },
      { value: 3, label: 'OK' },
      { value: 4, label: 'Good' },
      { value: 5, label: 'Great' },
    ],
  },
  {
    type: 'energy',
    label: 'Energy level',
    icon: Zap,
    options: [
      { value: 1, label: 'Exhausted' },
      { value: 2, label: 'Low' },
      { value: 3, label: 'Normal' },
      { value: 4, label: 'Good' },
      { value: 5, label: 'Fired up' },
    ],
  },
  {
    type: 'soreness',
    label: 'Muscle soreness',
    icon: HeartPulse,
    options: [
      { value: 1, label: 'Very sore' },
      { value: 2, label: 'Sore' },
      { value: 3, label: 'Moderate' },
      { value: 4, label: 'Mild' },
      { value: 5, label: 'None' },
    ],
  },
  {
    type: 'stress',
    label: 'Stress level',
    icon: Brain,
    options: [
      { value: 1, label: 'Very high' },
      { value: 2, label: 'High' },
      { value: 3, label: 'Normal' },
      { value: 4, label: 'Low' },
      { value: 5, label: 'Calm' },
    ],
  },
];

interface ReadinessCardProps {
  config: SignalConfig;
  value: number | null;
  onSelect: (value: number | null) => void;
}

export function ReadinessCard({ config, value, onSelect }: ReadinessCardProps) {
  const Icon = config.icon;
  const selectedLabel = value != null
    ? config.options.find((o) => o.value === value)?.label ?? null
    : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Icon size={18} color="#9CA3AF" />
        <Text style={styles.label}>{config.label}</Text>
        <View style={styles.spacer} />
        {selectedLabel && <Text style={styles.valueText}>{selectedLabel}</Text>}
      </View>

      {/* Scale Row */}
      <View style={styles.scaleRow}>
        {config.options.map((option) => {
          const isSelected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={styles.scalePoint}
              onPress={() => onSelect(isSelected ? null : option.value)}
              hitSlop={4}
            >
              <View style={styles.dotContainer}>
                <View style={[styles.dot, isSelected && styles.dotSelected]} />
              </View>
              <Text style={[styles.dotLabel, isSelected && styles.dotLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  spacer: {
    flex: 1,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scalePoint: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dotContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  dotLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4B5563',
    fontFamily: 'SpaceGrotesk_500Medium',
  },
  dotLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
});
