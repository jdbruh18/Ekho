import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="landing" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="parent-signup" />
      <Stack.Screen name="slp-register" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
