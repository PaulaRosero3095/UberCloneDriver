import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DriverProvider } from './src/context/DriverContext';
import { TripProvider } from './src/context/TripContext';
import { navigationRef } from './src/navigation/navigationRef';
import { RegistroProvider } from './src/context/RegistroContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DriverProvider>
        <RegistroProvider>
          <TripProvider>
            <NavigationContainer ref={navigationRef}>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </TripProvider>
        </RegistroProvider>
      </DriverProvider>
    </SafeAreaProvider>
  );
}
