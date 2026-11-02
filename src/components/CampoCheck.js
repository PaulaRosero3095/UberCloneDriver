// src/components/CampoCheck.js
// AI-assisted: see docs/AI_LOG.md #3
// Checkbox with a text and the error message below.

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

export default function CampoCheck({ label, checked, onToggle, error }) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.row} onPress={() => onToggle(!checked)}>
        <View style={[styles.box, checked && styles.boxChecked, !!error && styles.boxError]}>
          {checked && <Text style={styles.tick}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxError: { borderColor: colors.error },
  tick: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  label: { flex: 1, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  error: { marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.error },
});
