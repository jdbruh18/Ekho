import { Stack } from 'expo-router';

export default function ParentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="children" />
      <Stack.Screen name="find-slp" />
      <Stack.Screen name="progress" />
      <Stack.Screen name="clinics" />
      <Stack.Screen name="slp/[id]" />
      <Stack.Screen name="book-session" />
      <Stack.Screen name="appointments" />
      <Stack.Screen name="home-practice" />
    </Stack>
  );
}
