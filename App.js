// App.js
// AI-assisted: see docs/AI_LOG.md #2
// Root of the app: navigation container + the registration context.

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RegistroProvider } from './src/context/RegistroContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <RegistroProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </RegistroProvider>
    </SafeAreaProvider>
  );
}