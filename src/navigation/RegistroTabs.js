// src/navigation/RegistroTabs.js
// AI-assisted: see docs/AI_LOG.md #3
// TABS: the 3 steps of the driver registration.
// A "!" badge appears on a tab that has errors the user can already see.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DatosPersonalesScreen from '../screens/registro/DatosPersonalesScreen';
import VehiculoScreen from '../screens/registro/VehiculoScreen';
import DocumentosScreen from '../screens/registro/DocumentosScreen';
import { useRegistro } from '../context/RegistroContext';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  DatosPersonales: 'person-outline',
  Vehiculo: 'car-outline',
  Documentos: 'document-text-outline',
};

const SECTION_BY_ROUTE = {
  DatosPersonales: 'personal',
  Vehiculo: 'vehicle',
  Documentos: 'documents',
};

export default function RegistroTabs() {
  const { sectionHasVisibleErrors } = useRegistro();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
        tabBarBadge: sectionHasVisibleErrors(SECTION_BY_ROUTE[route.name]) ? '!' : undefined,
        tabBarBadgeStyle: { backgroundColor: colors.error },
      })}
    >
      <Tab.Screen name="DatosPersonales" component={DatosPersonalesScreen} options={{ title: 'Datos personales' }} />
      <Tab.Screen name="Vehiculo" component={VehiculoScreen} options={{ title: 'Vehículo' }} />
      <Tab.Screen name="Documentos" component={DocumentosScreen} options={{ title: 'Documentos' }} />
    </Tab.Navigator>
  );
}
