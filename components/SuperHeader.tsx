
/**
 * 🎯 SUPER HEADER COMPONENT
 */
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Settings } from 'lucide-react-native';
import { SuperLayoutStyles } from '@/constants/super-styles';
import Colors from '@/constants/colors';

interface SuperHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
  onBack?: () => void;
  onNotifications?: () => void;
  onSettings?: () => void;
  gradient?: boolean;
}

const SuperHeader: React.FC<SuperHeaderProps> = memo(({
  title,
  subtitle,
  showBack = false,
  showNotifications = false,
  showSettings = false,
  onBack,
  onNotifications,
  onSettings,
  gradient = false
}) => {
  const renderContent = () => (
    <View style={SuperLayoutStyles.superHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={gradient ? '#FFFFFF' : Colors.text} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[SuperLayoutStyles.headerTitle, { color: gradient ? '#FFFFFF' : Colors.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 14, color: gradient ? '#FFFFFF90' : Colors.textLight }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {showNotifications && (
          <TouchableOpacity onPress={onNotifications}>
            <Bell size={24} color={gradient ? '#FFFFFF' : Colors.text} />
          </TouchableOpacity>
        )}
        {showSettings && (
          <TouchableOpacity onPress={onSettings}>
            <Settings size={24} color={gradient ? '#FFFFFF' : Colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {renderContent()}
      </LinearGradient>
    );
  }

  return renderContent();
});

export default SuperHeader;
