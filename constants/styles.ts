import { StyleSheet } from 'react-native';
import Colors from './colors';

// Sistema de diseño global para botones y componentes
export const GlobalStyles = StyleSheet.create({
  // Botones compactos
  buttonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  
  buttonMedium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  
  buttonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  // Variantes de botones
  buttonPrimary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.secondary,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  
  buttonGhost: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  
  buttonDanger: {
    backgroundColor: Colors.error,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Textos de botones
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  buttonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  buttonTextOutline: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  buttonTextGhost: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  buttonTextDanger: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Botones con iconos
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  // Chips y filtros
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  chipText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Cards compactas
  cardCompact: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  cardMedium: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Contenedores de botones
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  
  // ListTiles para navegación
  listTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  
  listTileContent: {
    flex: 1,
    marginLeft: 12,
  },
  
  listTileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  
  listTileSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  
  // Secciones
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  
  // Espaciado consistente
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  // Contenedores flexibles
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  flexColumn: {
    flexDirection: 'column',
  },
  
  flexWrap: {
    flexWrap: 'wrap',
  },
});

// Utilidades para crear botones dinámicamente
export const createButtonStyle = (size: 'compact' | 'medium' | 'large', variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger') => {
  const sizeStyle = size === 'compact' ? GlobalStyles.buttonCompact : 
                   size === 'medium' ? GlobalStyles.buttonMedium : 
                   GlobalStyles.buttonLarge;
  
  const variantStyle = variant === 'primary' ? GlobalStyles.buttonPrimary :
                      variant === 'secondary' ? GlobalStyles.buttonSecondary :
                      variant === 'outline' ? GlobalStyles.buttonOutline :
                      variant === 'ghost' ? GlobalStyles.buttonGhost :
                      GlobalStyles.buttonDanger;
  
  return [sizeStyle, variantStyle];
};

export const createButtonTextStyle = (variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger') => {
  return variant === 'primary' ? GlobalStyles.buttonTextPrimary :
         variant === 'secondary' ? GlobalStyles.buttonTextSecondary :
         variant === 'outline' ? GlobalStyles.buttonTextOutline :
         variant === 'ghost' ? GlobalStyles.buttonTextGhost :
         GlobalStyles.buttonTextDanger;
};