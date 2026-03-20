import { Stack } from 'expo-router';

export default function LoginLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="register-lawyer" />
      <Stack.Screen name="pending-verification" />
    </Stack>
  );
}

