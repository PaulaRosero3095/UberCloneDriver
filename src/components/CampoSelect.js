import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, fontSize, radius, spacing } from '../theme';

export default function CampoSelect({ label, value, onValueChange, options, error, placeholder = 'Selecciona...' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, !!error && styles.boxError]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={colors.textSoft}
        >
          <Picker.Item label={placeholder} value="" color={colors.textSoft} />
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} color={colors.text} />
          ))}
        </Picker>
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  box: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  boxError: { borderColor: colors.error },
  picker: { color: colors.text },
  error: { marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.error },
});