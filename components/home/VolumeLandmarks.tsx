import { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { colors } from '@/lib/theme';
import type { VolumeLandmark } from '@/lib/api';

interface VolumeLandmarksProps {
  landmarks: VolumeLandmark[];
}

type Zone = VolumeLandmark['zone'];

const ZONE_COLORS: Record<Zone, string | null> = {
  below_mev: colors.red,
  in_mav: colors.green,
  above_mav: colors.amber,
  above_mrv: colors.red,
  none: null,
};

const UPPER_CATEGORIES = ['push', 'pull', 'arms'];
const LOWER_CATEGORIES = ['legs', 'core'];

function groupBySection(landmarks: VolumeLandmark[]) {
  const upper = landmarks.filter((l) => UPPER_CATEGORIES.includes(l.category));
  const lower = landmarks.filter((l) => LOWER_CATEGORIES.includes(l.category));
  return { upper, lower };
}

function MuscleRow({ landmark }: { landmark: VolumeLandmark }) {
  const [barWidth, setBarWidth] = useState(0);
  const isEmpty = landmark.current_sets === 0 && landmark.zone === 'none';
  const zoneColor = ZONE_COLORS[landmark.zone];

  const mrv = landmark.mrv_sets;
  const mev = landmark.mev_sets;
  const mavHigh = landmark.mav_high_sets;

  const fillPercent = mrv > 0 ? Math.min(landmark.current_sets / mrv, 1) : 0;
  const mevPercent = mrv > 0 ? mev / mrv : 0;
  const mavHighPercent = mrv > 0 ? Math.min(mavHigh / mrv, 1) : 0;

  const handleBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.muscleRow}>
      {/* Name + sets */}
      <View style={styles.muscleHeader}>
        <Text style={[styles.muscleName, isEmpty && styles.muscleNameEmpty]}>
          {landmark.muscle_group_name}
        </Text>
        <View style={styles.setsContainer}>
          <Text
            style={[
              styles.currentSets,
              isEmpty && styles.currentSetsEmpty,
              zoneColor ? { color: zoneColor } : undefined,
            ]}
          >
            {landmark.current_sets}
          </Text>
          <Text style={styles.mrvSets}>/{mrv}</Text>
        </View>
      </View>

      {/* Zone bar */}
      <View style={styles.barContainer} onLayout={handleBarLayout}>
        {barWidth > 0 && (
          <>
            {/* MAV zone overlay */}
            {mevPercent < mavHighPercent && (
              <View
                style={[
                  styles.zoneOverlay,
                  {
                    left: mevPercent * barWidth,
                    width: (mavHighPercent - mevPercent) * barWidth,
                    backgroundColor: 'rgba(74, 222, 128, 0.063)',
                  },
                ]}
              />
            )}

            {/* Above MAV overlay */}
            {mavHighPercent < 1 && (
              <View
                style={[
                  styles.zoneOverlay,
                  {
                    left: mavHighPercent * barWidth,
                    width: (1 - mavHighPercent) * barWidth,
                    backgroundColor: 'rgba(245, 158, 11, 0.063)',
                    borderTopRightRadius: 3,
                    borderBottomRightRadius: 3,
                  },
                ]}
              />
            )}

            {/* Fill bar */}
            {!isEmpty && zoneColor && (
              <View
                style={[
                  styles.fillBar,
                  {
                    width: fillPercent * barWidth,
                    backgroundColor: zoneColor,
                  },
                ]}
              />
            )}

            {/* MEV tick */}
            {mevPercent > 0 && mevPercent < 1 && (
              <View
                style={[
                  styles.tick,
                  { left: mevPercent * barWidth },
                ]}
              />
            )}

            {/* MAV high tick */}
            {mavHighPercent > 0 && mavHighPercent < 1 && (
              <View
                style={[
                  styles.tick,
                  { left: mavHighPercent * barWidth },
                ]}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

export function VolumeLandmarks({ landmarks }: VolumeLandmarksProps) {
  const { upper, lower } = groupBySection(landmarks);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VOLUME LANDMARKS</Text>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
            <Text style={styles.legendText}>&lt;MEV</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
            <Text style={styles.legendText}>MAV</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.amber }]} />
            <Text style={styles.legendText}>&gt;MAV</Text>
          </View>
        </View>
      </View>

      {/* Muscle list */}
      <View style={styles.muscleList}>
        {/* Upper body */}
        <Text style={styles.sectionLabel}>UPPER BODY</Text>
        {upper.map((l) => (
          <MuscleRow key={l.muscle_group_key} landmark={l} />
        ))}

        {/* Lower body & core */}
        {lower.length > 0 && (
          <>
            <View style={styles.sectionSpacer}>
              <Text style={styles.sectionLabel}>LOWER BODY & CORE</Text>
            </View>
            {lower.map((l) => (
              <MuscleRow key={l.muscle_group_key} landmark={l} />
            ))}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
    letterSpacing: 1,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
  legendText: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.textDim,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  muscleList: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textDarker,
    letterSpacing: 0.5,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  sectionSpacer: {
    paddingTop: 4,
  },
  muscleRow: {
    gap: 4,
  },
  muscleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  muscleName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  muscleNameEmpty: {
    color: '#D1D5DB',
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  currentSets: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.green,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  currentSetsEmpty: {
    color: colors.textDarker,
  },
  mrvSets: {
    fontSize: 10,
    color: colors.textDarker,
    fontFamily: 'SpaceGrotesk_400Regular',
  },
  barContainer: {
    height: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  zoneOverlay: {
    position: 'absolute',
    top: 0,
    height: 6,
  },
  fillBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 6,
    borderRadius: 3,
  },
  tick: {
    position: 'absolute',
    top: 0,
    width: 1,
    height: 6,
    backgroundColor: 'rgba(75, 85, 99, 0.376)',
  },
});
