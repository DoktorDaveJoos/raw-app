import { View, ViewProps } from 'react-native';
import { colors } from '@/lib/theme';

export type CardVariant = 'default' | 'processing' | 'highlight';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  rounded?: 'lg' | 'xl' | '2xl' | '3xl';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  rounded = '3xl',
  style,
  children,
  ...props
}: CardProps) {
  const roundedClass = {
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  }[rounded];

  const variantStyles = {
    default: {
      borderColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
    },
    processing: {
      borderColor: colors.primary + '4D', // 30% opacity
      borderWidth: 1,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 0 },
    },
    highlight: {
      borderColor: colors.primary + '33', // 20% opacity
      borderWidth: 1,
      shadowColor: colors.primary,
      shadowOpacity: 0.1,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 4 },
    },
  }[variant];

  return (
    <View
      className={`bg-surface ${roundedClass}`}
      style={[variantStyles, style]}
      {...props}
    >
      {children}
    </View>
  );
}
