import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';

interface GreetingHeaderProps {
  firstName: string;
  dateLabel: string;
  windowLabel: string;
}

export function GreetingHeader({ firstName, dateLabel, windowLabel }: GreetingHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hey {firstName}</Text>
      <View style={styles.row}>
        <Text style={styles.date}>{dateLabel}</Text>
        <View style={styles.dot} />
        <Text style={styles.window}>{windowLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textDarker,
  },
  window: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textDim,
    fontFamily: 'SpaceGrotesk_500Medium',
  },
});
