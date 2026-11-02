import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Boton from '../components/Boton';
import { useDriver } from '../context/DriverContext';
import { colors, spacing } from '../theme';

export default function ConfiguracionScreen() {
  const navigation = useNavigation();
  const { signOut } = useDriver();

  const handleSignOut = async () => {
    await signOut();
    // Back to the registration screen with a clean stack
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Registro' }] });
  };

  return (
    <View style={styles.container}>
      <Boton title="Cerrar sesión" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'flex-start' },
});
