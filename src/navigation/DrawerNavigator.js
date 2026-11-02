import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import InicioScreen from '../screens/InicioScreen';
import HistorialScreen from '../screens/HistorialScreen';
import GananciasScreen from '../screens/GananciasScreen';
import PerfilScreen from '../screens/PerfilScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import { colors } from '../theme';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        headerTitleAlign: 'center',
      }}
    >
      <Drawer.Screen name="Inicio" component={InicioScreen} />
      <Drawer.Screen name="Perfil" component={PerfilScreen} />
      <Drawer.Screen name="Historial" component={HistorialScreen} options={{ title: 'Historial de carreras' }} />
      <Drawer.Screen name="Ganancias" component={GananciasScreen} />
      <Drawer.Screen name="Configuracion" component={ConfiguracionScreen} options={{ title: 'Configuración' }} />
    </Drawer.Navigator>
  );
}