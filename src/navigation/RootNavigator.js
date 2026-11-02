// src/navigation/RootNavigator.js
// AI-assisted: see docs/AI_LOG.md #2
// STACK: registration -> main (drawer) -> trip flow screens.
// Later, the initial screen will depend on the saved session (Context + AsyncStorage).

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegistroTabs from './RegistroTabs';
import DrawerNavigator from './DrawerNavigator';
import SolicitudScreen from '../screens/SolicitudScreen';
import ViajeEnCursoScreen from '../screens/ViajeEnCursoScreen';
import CobroScreen from '../screens/CobroScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Registro">
      <Stack.Screen name="Registro" component={RegistroTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={DrawerNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Solicitud" component={SolicitudScreen} options={{ title: 'Solicitud entrante' }} />
      <Stack.Screen name="ViajeEnCurso" component={ViajeEnCursoScreen} options={{ title: 'Viaje en curso', headerBackVisible: false }} />
      <Stack.Screen name="Cobro" component={CobroScreen} options={{ title: 'Cobro y resumen', headerBackVisible: false }} />
    </Stack.Navigator>
  );
}
