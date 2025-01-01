import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './app/context/AppContext';
import { AppNavigator } from './app/AppNavigator';
import { ToastProvider } from './app/components/common/ToastProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ToastProvider>
          <AppNavigator />
        </ToastProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
