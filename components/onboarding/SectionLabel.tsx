import { Text } from 'react-native';

interface SectionLabelProps {
  label: string;
}

export function SectionLabel({ label }: SectionLabelProps) {
  if (!label) return null;

  return (
    <Text
      style={{
        fontFamily: 'SpaceGrotesk_600SemiBold',
        fontSize: 11,
        color: '#6B7280',
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Text>
  );
}
