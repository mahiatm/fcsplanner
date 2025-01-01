import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../styles/theme';

interface Props {
  rating: number; // 1-10
  showLabel?: boolean;
}

export function DifficultyIndicator({ rating, showLabel = true }: Props) {
  const fill = rating / 10;

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>Difficulty {rating}/10</Text>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${fill * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.full,
  },
});
