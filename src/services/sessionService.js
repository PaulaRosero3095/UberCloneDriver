import AsyncStorage from '@react-native-async-storage/async-storage';

const DRIVER_ID_KEY = 'session:driverId';

export async function loadDriverId() {
  try {
    return await AsyncStorage.getItem(DRIVER_ID_KEY);
  } catch (error) {
    return null;
  }
}

export async function saveDriverId(driverId) {
  try {
    await AsyncStorage.setItem(DRIVER_ID_KEY, driverId);
  } catch (error) {
    // The session is a convenience: failing to save it must not break the app
  }
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(DRIVER_ID_KEY);
  } catch (error) {
    // ignore
  }
}