// src/components/Boton.js
// AI-assisted: see docs/AI_LOG.md #3
// Main button. Disabled look when `disabled`; shows a spinner when `loading`.

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

export default function Boton({ title, onPress, disabled = false, loading = false, variant = 'solid' }) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        variant === 'outline' && styles.outline,
        inactive && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>{title}</Text>
      )}
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
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  outlineText: { color: colors.primary },
  disabled: { backgroundColor: '#9CA3AF', borderColor: '#9CA3AF' },
  pressed: { opacity: 0.85 },
  text: { color: '#FFFFFF', fontSize: fontSize.md, fontWeight: '700' },
});
