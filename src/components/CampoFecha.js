import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

  // A date was chosen: close the picker and pass the date up
  const handleValueChange = (event, selected) => {
    setOpen(false);
    if (selected) onChange(selected);
  };

  // The user cancelled: just close the picker
  const handleDismiss = () => setOpen(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.field, !!error && styles.fieldError]}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={value || initialDate || new Date()}
          mode="date"
          display="default"
          onValueChange={handleValueChange}
          onDismiss={handleDismiss}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
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
});