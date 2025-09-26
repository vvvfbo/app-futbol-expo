import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useTheme } from '../hooks/theme-context';

interface ThemeToggleProps {
    size?: 'small' | 'medium' | 'large';
    showLabel?: boolean;
}

export default function ThemeToggle({ size = 'medium', showLabel = true }: ThemeToggleProps) {
    const { theme, toggleTheme, isDarkMode, colors } = useTheme();
    const [scaleValue] = React.useState(new Animated.Value(1));

    const getSize = () => {
        switch (size) {
            case 'small': return { container: 40, icon: 20, text: 12 };
            case 'medium': return { container: 50, icon: 24, text: 14 };
            case 'large': return { container: 60, icon: 28, text: 16 };
        }
    };

    const sizes = getSize();

    const handlePress = () => {
        // Animación de presión
        Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        toggleTheme();
    };

    return (
        <View style={{ alignItems: 'center', gap: 8 }}>
            <Animated.View
                style={{
                    transform: [{ scale: scaleValue }],
                }}
            >
                <Pressable
                    onPress={handlePress}
                    style={({ pressed }) => ({
                        width: sizes.container,
                        height: sizes.container,
                        borderRadius: sizes.container / 2,
                        backgroundColor: colors.card,
                        borderWidth: 2,
                        borderColor: colors.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                        opacity: pressed ? 0.8 : 1,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: isDarkMode ? 0.3 : 0.1,
                        shadowRadius: 3.84,
                        elevation: 5,
                    })}
                >
                    <Ionicons
                        name={isDarkMode ? 'moon' : 'sunny'}
                        size={sizes.icon}
                        color={isDarkMode ? '#fbbf24' : '#f59e0b'}
                    />
                </Pressable>
            </Animated.View>

            {showLabel && (
                <Text
                    style={{
                        fontSize: sizes.text,
                        fontWeight: '500',
                        color: colors.textSecondary,
                    }}
                >
                    {isDarkMode ? 'Oscuro' : 'Claro'}
                </Text>
            )}
        </View>
    );
}