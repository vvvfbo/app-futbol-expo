import { Stack } from 'expo-router';

export default function TorneosLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="torneos" 
        options={{ 
          title: "Torneos",
          headerLargeTitle: true,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: "Detalles del Torneo",
        }} 
      />
    </Stack>
  );
}