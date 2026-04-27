import { Stack } from 'expo-router';
import React from 'react';

export default function CheckInLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="location" />
      <Stack.Screen name="face" />
      <Stack.Screen name="success" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
