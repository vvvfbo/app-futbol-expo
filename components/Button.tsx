import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { GlobalStyles, createButtonStyle, createButtonTextStyle } from '@/constants/styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  size?: 'compact' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  size = 'medium',
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const buttonStyles = [
    ...createButtonStyle(size, variant),
    icon && GlobalStyles.buttonWithIcon,
    fullWidth && { width: '100%' },
    disabled && { opacity: 0.5 },
    style,
  ];

  const textStyles = [
    createButtonTextStyle(variant),
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && icon}
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}