// src/components/Boton.js
// AI-assisted: see docs/AI_LOG.md #3
// Main button. Disabled look when `disabled`; shows a spinner when `loading`.

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

export default function Boton({ title, onPress, disabled = false, loading = false }) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.button, inactive && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { backgroundColor: '#9CA3AF' },
  pressed: { opacity: 0.85 },
  text: { color: '#FFFFFF', fontSize: fontSize.md, fontWeight: '700' },
});
