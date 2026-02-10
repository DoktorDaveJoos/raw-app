import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function BarChartIllustration() {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, styles.bar1]} />
      <View style={[styles.bar, styles.bar2]} />
      <View style={[styles.bar, styles.bar3]} />
      <View style={[styles.bar, styles.bar4]} />
      <View style={[styles.bar, styles.bar5]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    height: 80,
  },
  bar: {
    width: 24,
    borderRadius: 4,
  },
  bar1: {
    height: 20,
    backgroundColor: '#2A2A2A',
  },
  bar2: {
    height: 40,
    backgroundColor: '#2A2A2A',
  },
  bar3: {
    height: 60,
    backgroundColor: '#3A3A3A',
  },
  bar4: {
    height: 35,
    backgroundColor: '#2A2A2A',
  },
  bar5: {
    height: 50,
    backgroundColor: '#2A2A2A',
  },
});
