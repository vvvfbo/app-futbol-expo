import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="home" 
        options={{ 
          title: "FutbolApp Torneos",
          headerShown: true,
        }} 
      />
    </Stack>
  );
}