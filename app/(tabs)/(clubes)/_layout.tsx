import { Stack } from 'expo-router';
import React from 'react';
import Colors from '@/constants/colors';

export default function ClubesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="clubes"
        options={{
          title: "Mis Clubes",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Detalle del Club",
        }}
      />
    </Stack>
  );
}