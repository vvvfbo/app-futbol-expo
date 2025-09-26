
/**
 * 💎 SUPER CARD COMPONENT
 */
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SuperLayoutStyles } from '@/constants/super-styles';

interface SuperCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  gradient?: boolean;
  elevated?: boolean;
}

const SuperCard: React.FC<SuperCardProps> = memo(({
  children,
  title,
  subtitle,
  onPress,
  gradient = false,
  elevated = false
}) => {
  const cardStyle = [
    SuperLayoutStyles.superCard,
    elevated && { elevation: 8, shadowOpacity: 0.2 }
  ];

  const renderContent = () => (
    <View style={cardStyle}>
      {title && (
        <View style={{ marginBottom: 12 }}>
          <Text style={SuperLayoutStyles.headerTitle}>{title}</Text>
          {subtitle && (
            <Text style={SuperLayoutStyles.sectionSubtitle}>{subtitle}</Text>
          )}
        </View>
      )}
      {children}
    </View>
  );

  if (gradient) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={SuperLayoutStyles.gradientCard}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      {renderContent()}
    </CardWrapper>
  );
});

export default SuperCard;
