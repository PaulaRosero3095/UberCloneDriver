import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Boton from '../components/Boton';
import CampoSelect from '../components/CampoSelect';
import { LANGUAGE_OPTIONS } from '../config/options';
import { useDriver } from '../context/DriverContext';
import { loadPreference, savePreference } from '../services/preferencesService';
import { colors, spacing } from '../theme';

export default function ConfiguracionScreen() {
  const navigation = useNavigation();
  const { signOut } = useDriver();
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    loadPreference('language', 'es').then(setLanguage);
  }, []);

  const handleLanguage = (value) => {
    if (!value) return;
    setLanguage(value);
    savePreference('language', value);
  };

  const handleSignOut = async () => {
    await signOut();
    // Back to the registration screen with a clean stack
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Registro' }] });
  };

  return (
    <View style={styles.container}>
      <CampoSelect label="Idioma" value={language} onValueChange={handleLanguage} options={LANGUAGE_OPTIONS} />
      <View style={styles.spacer} />
      <Boton title="Cerrar sesión" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  spacer: { height: spacing.lg },
});