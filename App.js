import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DriverProvider } from './src/context/DriverContext';
import { RegistroProvider } from './src/context/RegistroContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DriverProvider>
        <RegistroProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </RegistroProvider>
      </DriverProvider>
    </SafeAreaProvider>
  );
}