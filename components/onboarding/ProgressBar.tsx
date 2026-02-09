import { View } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <View style={{ height: 3, backgroundColor: '#2A2A2A', width: '100%' }}>
      <View
        style={{
          height: 3,
          backgroundColor: '#FFFFFF',
          width: `${percentage}%`,
        }}
      />
    </View>
  );
}
