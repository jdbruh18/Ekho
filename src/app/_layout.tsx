import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth-context';
import { EngagementProvider } from '../lib/engagement-store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after initialization
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <EngagementProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F8FAFC' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(parent)" />
            <Stack.Screen name="(slp)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="session/[id]" />
            <Stack.Screen name="session/report-form" />
            <Stack.Screen name="messages/index" />
            <Stack.Screen name="messages/[id]" />
          </Stack>
        </EngagementProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
