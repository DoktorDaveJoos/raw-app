import { Pressable, Text, ActivityIndicator, PressableProps, View, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 12 },
    md: { paddingVertical: 14, paddingHorizontal: 20 },
    lg: { paddingVertical: 18, paddingHorizontal: 24 },
  }[size];

  const textSizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? colors.primary + '80' : colors.primary,
            shadowColor: colors.primary,
            shadowOpacity: isDisabled ? 0 : 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
          },
          textClass: 'text-white font-semibold',
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.primary + '1A', // 10% opacity
            borderWidth: 1,
            borderColor: colors.primary + '4D', // 30% opacity
          },
          textClass: 'text-primary font-medium',
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
          },
          textClass: 'text-neutral-400 font-medium',
        };
      case 'text':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          textClass: 'text-primary font-medium',
        };
      default:
        return {
          container: {},
          textClass: 'text-white',
        };
    }
  };

  const { container: variantContainerStyle, textClass } = getVariantStyles();

  return (
    <Pressable
      className="rounded-xl items-center justify-center flex-row"
      style={[sizeStyles, variantContainerStyle, style]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? 'white' : colors.primary}
          size="small"
        />
      ) : (
        <View className="flex-row items-center">
          {icon && iconPosition === 'left' && (
            <View className="mr-2">{icon}</View>
          )}
          <Text className={`${textSizeClass} ${textClass}`}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View className="ml-2">{icon}</View>
          )}
        </View>
      )}
    </Pressable>
  );
}
