// src/navigation/DrawerNavigator.js
// AI-assisted: see docs/AI_LOG.md #2
// DRAWER: profile, history, earnings and settings.



import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import InicioScreen from '../screens/InicioScreen';
import HistorialScreen from '../screens/HistorialScreen';
import GananciasScreen from '../screens/GananciasScreen';
import PerfilScreen from '../screens/PerfilScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import CustomDrawerContent from './CustomDrawerContent';
import { colors } from '../theme';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        drawerStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen 
        name="Inicio" 
        component={InicioScreen} 
        options={{ 
          title: 'Inicio',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> 
        }} 
      />
      <Drawer.Screen 
        name="Perfil" 
        component={PerfilScreen} 
        options={{ 
          title: 'Perfil',
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> 
        }} 
      />
      <Drawer.Screen 
        name="Historial" 
        component={HistorialScreen} 
        options={{ 
          title: 'Historial de carreras',
          drawerIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} /> 
        }} 
      />
      <Drawer.Screen 
        name="Ganancias" 
        component={GananciasScreen} 
        options={{ 
          title: 'Ganancias',
          drawerIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> 
        }} 
      />
      <Drawer.Screen 
        name="Configuracion" 
        component={ConfiguracionScreen} 
        options={{ 
          title: 'Configuración',
          drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> 
        }} 
      />
    </Drawer.Navigator>
  );
}