// src/components/CampoFecha.js
// AI-assisted: see docs/AI_LOG.md #3
// Date selector (opens the native date picker) with the error message below.

import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, fontSize, radius, spacing } from '../theme';
import { formatDate } from '../utils/format';

export default function CampoFecha({
  label,
  value,
  onChange,
  error,
  placeholder = 'Selecciona una fecha',
  initialDate,
  minimumDate,
  maximumDate,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || initialDate || new Date());

  const openPicker = () => {
    setDraft(value || initialDate || new Date());
    setOpen(true);
  };

  // Official API: onChange(event, selectedDate)
  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      // Android closes itself; we only need to clear `open`
      setOpen(false);
      if (event.type === 'set' && selectedDate) onChange(selectedDate);
      return;
    }

    // iOS: keep the picker open and hold the draft until "Aceptar"
    if (selectedDate) setDraft(selectedDate);
  };

  const confirmIOS = () => {
    setOpen(false);
    onChange(draft);
  };

  const cancelIOS = () => setOpen(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={openPicker}
        style={[styles.field, !!error && styles.fieldError]}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>

      {open && Platform.OS === 'android' && (
        <DateTimePicker
          value={draft}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {open && Platform.OS === 'ios' && (
        <View style={styles.iosBox}>
          <DateTimePicker
            value={draft}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
          <View style={styles.iosButtons}>
            <Pressable style={styles.iosButton} onPress={cancelIOS}>
              <Text style={styles.iosButtonCancel}>Cancelar</Text>
            </Pressable>
            <Pressable style={styles.iosButton} onPress={confirmIOS}>
              <Text style={styles.iosButtonConfirm}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
  },
  fieldError: { borderColor: colors.error },
  value: { fontSize: fontSize.md, color: colors.text },
  placeholder: { fontSize: fontSize.md, color: colors.textSoft },
  error: { marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.error },
  iosBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  iosButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  iosButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  iosButtonCancel: { fontSize: fontSize.md, color: colors.textSoft, fontWeight: '600' },
  iosButtonConfirm: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
});