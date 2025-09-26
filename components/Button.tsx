import React, { memo } from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { SuperLayoutStyles } from '@/constants/super-styles';


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

function Button({
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

  // Fallback styles (puedes personalizar o importar los correctos)
  const buttonStyles = [
    SuperLayoutStyles.button,
  fullWidth && { width: '100%' as const },
    disabled && { opacity: 0.5 },
    style,
  ];

  const textStyles = [
    SuperLayoutStyles.buttonText,
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

export default memo(Button);