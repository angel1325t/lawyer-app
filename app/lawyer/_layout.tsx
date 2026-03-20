import { Stack } from 'expo-router';

export default function LawyerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="cases" />
      <Stack.Screen name="offers" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="privacy-security" />
      <Stack.Screen name="about" />
      <Stack.Screen name="case-detail/[id]" />
    </Stack>
  );
}
