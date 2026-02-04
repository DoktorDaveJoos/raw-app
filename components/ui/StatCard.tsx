import { View, Text, ViewProps } from 'react-native';
import { colors } from '@/lib/theme';

export interface StatCardProps extends ViewProps {
  label: string;
  value: string | number;
  suffix?: string;
  progress?: number; // 0-1
  progressColor?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function StatCard({
  label,
  value,
  suffix,
  progress,
  progressColor = colors.primary,
  icon,
  size = 'md',
  style,
  ...props
}: StatCardProps) {
  const sizeStyles = {
    sm: {
      minWidth: 100,
      padding: 12,
      valueSize: 'text-xl',
      suffixSize: 'text-sm',
    },
    md: {
      minWidth: 120,
      padding: 16,
      valueSize: 'text-2xl',
      suffixSize: 'text-base',
    },
    lg: {
      minWidth: 140,
      padding: 16,
      valueSize: 'text-3xl',
      suffixSize: 'text-lg',
    },
  }[size];

  return (
    <View
      className="bg-surface rounded-2xl border border-white/5 relative overflow-hidden"
      style={[{ minWidth: sizeStyles.minWidth, padding: sizeStyles.padding }, style]}
      {...props}
    >
      {/* Background icon */}
      {icon && (
        <View className="absolute top-3 right-3 opacity-10">
          {icon}
        </View>
      )}

      {/* Label */}
      <Text className="font-sans text-neutral-500 text-xs uppercase tracking-wider mb-1">
        {label}
      </Text>

      {/* Value */}
      <View className="flex-row items-baseline mb-2">
        <Text className={`text-white ${sizeStyles.valueSize} font-bold`}>
          {value}
        </Text>
        {suffix && (
          <Text className={`text-neutral-500 ${sizeStyles.suffixSize} ml-0.5`}>
            {suffix}
          </Text>
        )}
      </View>

      {/* Progress bar */}
      {progress !== undefined && (
        <View className="h-1 bg-white/10 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
              backgroundColor: progressColor,
            }}
          />
        </View>
      )}
    </View>
  );
}
