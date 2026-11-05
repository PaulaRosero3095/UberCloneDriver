// src/components/ScreenPlaceholder.js
// AI-assisted: see docs/AI_LOG.md #2
// Temporary empty screen. Each one is replaced by the real screen later.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

export default function ScreenPlaceholder({ title, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: spacing.sm, fontSize: fontSize.md, color: colors.textSoft },
});
