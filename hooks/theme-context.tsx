import { OptimizedStorage } from '../utils/supercomputer-optimization';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDarkMode: boolean;
    colors: ThemeColors;
}

interface ThemeColors {
    // Colores de fondo
    background: string;
    surface: string;
    card: string;

    // Colores de texto
    text: string;
    textSecondary: string;

    // Colores de UI
    primary: string;
    secondary: string;
    accent: string;
    border: string;

    // Estados
    success: string;
    warning: string;
    error: string;

    // Gradientes
    gradientStart: string;
    gradientEnd: string;

    // Específicos de la app
    tabBarBackground: string;
    tabBarActive: string;
    tabBarInactive: string;
}

const lightTheme: ThemeColors = {
    background: '#ffffff',
    surface: '#f8f9fa',
    card: '#ffffff',

    text: '#1a1a1a',
    textSecondary: '#6b7280',

    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    border: '#e5e7eb',

    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',

    gradientStart: '#3b82f6',
    gradientEnd: '#8b5cf6',

    tabBarBackground: '#ffffff',
    tabBarActive: '#3b82f6',
    tabBarInactive: '#6b7280',
};

const darkTheme: ThemeColors = {
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',

    text: '#f1f5f9',
    textSecondary: '#94a3b8',

    primary: '#60a5fa',
    secondary: '#a78bfa',
    accent: '#34d399',
    border: '#475569',

    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',

    gradientStart: '#1e40af',
    gradientEnd: '#7c3aed',

    tabBarBackground: '#1e293b',
    tabBarActive: '#60a5fa',
    tabBarInactive: '#64748b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Forzar siempre tema claro y desactivar dark mode
    const theme: Theme = 'light';
    const toggleTheme = () => {};
    const isDarkMode = false;
    const colors = lightTheme;

    return (
        <ThemeContext.Provider value={{
            theme,
            toggleTheme,
            isDarkMode,
            colors,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export type { Theme, ThemeColors };
