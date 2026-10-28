import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../lib/auth-context';
import { Palette } from '../../constants/theme';

export default function SlpLayout() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  // If a parent tries to access the clinical portal, redirect to parent home
  if (session && session.role !== 'slp' && session.role !== 'admin') {
    return <Redirect href="/(parent)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="clients" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="verification" />
    </Stack>
  );
}
