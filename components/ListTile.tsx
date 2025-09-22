import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { GlobalStyles } from '@/constants/styles';
import Colors from '@/constants/colors';

interface ListTileProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  showArrow?: boolean;
  trailing?: React.ReactNode;
}

export default function ListTile({
  title,
  subtitle,
  onPress,
  icon,
  showArrow = true,
  trailing,
}: ListTileProps) {
  return (
    <TouchableOpacity
      style={GlobalStyles.listTile}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && icon}
      <View style={GlobalStyles.listTileContent}>
        <Text style={GlobalStyles.listTileTitle}>{title}</Text>
        {subtitle && (
          <Text style={GlobalStyles.listTileSubtitle}>{subtitle}</Text>
        )}
      </View>
      {trailing || (showArrow && (
        <ChevronRight size={20} color={Colors.textLight} />
      ))}
    </TouchableOpacity>
  );
}