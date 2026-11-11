// src/navigation/RootNavigator.js
// AI-assisted: see docs/AI_LOG.md #4
// STACK: registration -> main (drawer) -> trip flow screens.
// The first screen depends on the saved session: with a session it opens Main directly.

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useDriver } from '../context/DriverContext';
import { colors } from '../theme';
import RegistroTabs from './RegistroTabs';
import DrawerNavigator from './DrawerNavigator';
import SolicitudScreen from '../screens/SolicitudScreen';
import ViajeEnCursoScreen from '../screens/ViajeEnCursoScreen';
import CobroScreen from '../screens/CobroScreen';
import DetalleViajeScreen from '../screens/DetalleViajeScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { restoring, driverId } = useDriver();

  // Wait until the saved session is read, otherwise the wrong screen flashes
  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={driverId ? 'Main' : 'Registro'}>
      <Stack.Screen name="Registro" component={RegistroTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Solicitud" component={SolicitudScreen} options={{ title: 'Solicitud entrante' }} />
      <Stack.Screen name="ViajeEnCurso" component={ViajeEnCursoScreen} options={{ title: 'Viaje en curso', headerBackVisible: false }} />
      <Stack.Screen name="Cobro" component={CobroScreen} options={{ title: 'Cobro y resumen', headerBackVisible: false }} />
      <Stack.Screen name="DetalleViaje" component={DetalleViajeScreen} options={{ title: 'Detalle del viaje' }} />
    </Stack.Navigator>
  );
}
