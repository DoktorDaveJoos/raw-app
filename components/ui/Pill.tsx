import { View, Text, Pressable, PressableProps } from 'react-native';
import { colors } from '@/lib/theme';

export type PillVariant = 'primary' | 'muted' | 'success' | 'warning' | 'error';
export type PillSize = 'sm' | 'md';

export interface PillProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: PillVariant;
  size?: PillSize;
  icon?: React.ReactNode;
  showDot?: boolean;
  onPress?: () => void;
}

export function Pill({
  label,
  variant = 'muted',
  size = 'sm',
  icon,
  showDot = false,
  onPress,
  ...props
}: PillProps) {
  const sizeStyles = {
    sm: { paddingVertical: 4, paddingHorizontal: 10 },
    md: { paddingVertical: 6, paddingHorizontal: 14 },
  }[size];

  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
  }[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary + '33', // 20% opacity
          textColor: colors.primary,
          dotColor: colors.primary,
        };
      case 'success':
        return {
          backgroundColor: '#059669' + '33',
          textColor: '#10b981',
          dotColor: '#10b981',
        };
      case 'warning':
        return {
          backgroundColor: colors.primary + '33',
          textColor: colors.primary,
          dotColor: colors.primary,
        };
      case 'error':
        return {
          backgroundColor: '#dc2626' + '33',
          textColor: '#ef4444',
          dotColor: '#ef4444',
        };
      case 'muted':
      default:
        return {
          backgroundColor: colors.chipBg,
          textColor: colors.textMuted,
          dotColor: colors.textMuted,
        };
    }
  };

  const { backgroundColor, textColor, dotColor } = getVariantStyles();

  const Container = onPress ? Pressable : View;

  return (
    <Container
      className="flex-row items-center rounded-full"
      style={[sizeStyles, { backgroundColor }]}
      onPress={onPress}
      {...props}
    >
      {showDot && (
        <View
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: dotColor }}
        />
      )}
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text className={`${textSizeClass} font-medium`} style={{ color: textColor }}>
        {label}
      </Text>
    </Container>
  );
}
