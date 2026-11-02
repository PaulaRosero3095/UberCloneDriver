// src/components/FormScroll.js
// AI-assisted: see docs/AI_LOG.md #3
// Scrollable container for the forms. Taps keep working while the keyboard is open.

import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors, fontSize, spacing } from '../theme';

export default function FormScroll({ title, subtitle, children }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {!!title && <Text style={styles.title}>{title}</Text>}
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  title: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textSoft, marginTop: spacing.xs, marginBottom: spacing.md },
});
