// src/services/preferencesService.js
// AI-assisted: see docs/AI_LOG.md #6
// AsyncStorage for PREFERENCES only (language, last availability). Never sensitive data.

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'pref:';

export async function loadPreference(name, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + name);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export async function savePreference(name, value) {
  try {
    await AsyncStorage.setItem(PREFIX + name, JSON.stringify(value));
  } catch (error) {
    // A preference that fails to save must not break the app
  }
}
