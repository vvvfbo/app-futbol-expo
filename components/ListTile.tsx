import React, { memo } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { SuperLayoutStyles } from '@/constants/super-styles';
import Colors from '@/constants/colors';

interface ListTileProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: React.ReactNode;
  showArrow?: boolean;
  trailing?: React.ReactNode;
}

function ListTile({
  title,
  subtitle,
  onPress,
  icon,
  showArrow = true,
  trailing,
}: ListTileProps) {
  return (
    <TouchableOpacity
      style={SuperLayoutStyles.listTile}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && icon}
      <View style={SuperLayoutStyles.listTileContent}>
        <Text style={SuperLayoutStyles.listTileTitle}>{title}</Text>
        {subtitle && (
          <Text style={SuperLayoutStyles.listTileSubtitle}>{subtitle}</Text>
        )}
      </View>
      {trailing || (showArrow && (
        <ChevronRight size={20} color={Colors.textLight} />
      ))}
    </TouchableOpacity>
  );
}

export default memo(ListTile);