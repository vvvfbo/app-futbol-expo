
/**
 * 🔘 SUPER BUTTON SYSTEM
 */
import React, { memo } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

interface SuperButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large' | 'xl';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  elevated?: boolean;
  style?: ViewStyle;
}

const SuperButton: React.FC<SuperButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  elevated = false,
  style
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: size === 'small' ? 8 : size === 'medium' ? 12 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    };

    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 52 },
      xl: { paddingHorizontal: 32, paddingVertical: 20, minHeight: 60 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: Colors.primary },
      secondary: { backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border },
      success: { backgroundColor: '#10B981' },
      danger: { backgroundColor: '#EF4444' },
      ghost: { backgroundColor: 'transparent' },
      gradient: { backgroundColor: 'transparent' },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
      elevation: elevated ? 4 : 0,
      shadowColor: elevated ? '#000' : 'transparent',
      shadowOffset: elevated ? { width: 0, height: 2 } : { width: 0, height: 0 },
      shadowOpacity: elevated ? 0.25 : 0,
      shadowRadius: elevated ? 3.84 : 0,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: 14, fontWeight: '600' },
      medium: { fontSize: 16, fontWeight: '600' },
      large: { fontSize: 18, fontWeight: '700' },
      xl: { fontSize: 20, fontWeight: '700' },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: Colors.text },
      success: { color: '#FFFFFF' },
      danger: { color: '#FFFFFF' },
      ghost: { color: Colors.primary },
      gradient: { color: '#FFFFFF' },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const renderContent = () => (
    <>
      {loading && <Text style={{ color: getTextStyle().color }}>⏳</Text>}
      {icon && !loading && icon}
      <Text style={getTextStyle()}>{title}</Text>
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={getButtonStyle()}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getButtonStyle()}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

export default SuperButton;
