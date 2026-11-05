// src/components/CampoFoto.js
// AI-assisted: see docs/AI_LOG.md #3
// Photo field: take a picture with the camera or choose one from the gallery.

import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, fontSize, radius, spacing } from '../theme';

export default function CampoFoto({ label, uri, onChange, error, hint }) {
  const [localError, setLocalError] = useState('');

  const choose = async (source) => {
    setLocalError('');
    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setLocalError('Necesitamos permiso para usar la cámara.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      }
      if (!result.canceled && result.assets && result.assets.length > 0) {
        onChange(result.assets[0].uri);
      }
    } catch (e) {
      setLocalError('No pudimos abrir la imagen. Inténtalo de nuevo.');
    }
  };

  const shownError = localError || error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
      <View style={[styles.box, !!shownError && styles.boxError]}>
        {uri ? (
          <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Sin imagen</Text>
          </View>
        )}
        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={() => choose('camera')}>
            <Text style={styles.buttonText}>Cámara</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => choose('gallery')}>
            <Text style={styles.buttonText}>Galería</Text>
          </Pressable>
        </View>
      </View>
      {!!shownError && <Text style={styles.error}>{shownError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  hint: { fontSize: fontSize.sm, color: colors.textSoft, marginBottom: spacing.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  boxError: { borderColor: colors.error },
  preview: { width: 84, height: 84, borderRadius: radius.sm },
  empty: {
    width: 84,
    height: 84,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: fontSize.sm, color: colors.textSoft },
  buttons: { flex: 1, gap: spacing.sm },
  button: {
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  buttonText: { color: colors.primary, fontWeight: '600', fontSize: fontSize.sm },
  error: { marginTop: spacing.xs, fontSize: fontSize.sm, color: colors.error },
});
