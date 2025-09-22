import { useTheme } from "@/hooks/theme-context";
import { Tabs } from "expo-router";
import { Handshake, Home, Trophy, User, Users } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      initialRouteName="(home)"
      screenOptions={{
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="(torneos)"
        options={{
          title: "Torneos",
          tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(equipos)"
        options={{
          title: "Equipos",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(amistosos)"
        options={{
          title: "Amistosos",
          tabBarIcon: ({ color }) => <Handshake size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(perfil)"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(clubes)"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}