
/**
 * 📏 SUPER SPACING SYSTEM
 */
import { StyleSheet } from 'react-native';
import Colors from './colors';

export const SuperSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const SuperLayoutStyles = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  contentContainer: {
    flex: 1,
    padding: SuperSpacing.md,
  },
  
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SuperSpacing.md,
  },

  // Cards
  superCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: SuperSpacing.lg,
    marginVertical: SuperSpacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  gradientCard: {
    borderRadius: 20,
    padding: SuperSpacing.xl,
    marginVertical: SuperSpacing.md,
  },

  // Sections
  section: {
    marginVertical: SuperSpacing.lg,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: SuperSpacing.md,
  },

  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: SuperSpacing.lg,
  },


  // Buttons
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: SuperSpacing.sm,
    paddingHorizontal: SuperSpacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 44,
    marginVertical: SuperSpacing.xs,
  },
  buttonText: {
  color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SuperSpacing.md,
    marginVertical: SuperSpacing.md,
  },
  buttonColumn: {
    gap: SuperSpacing.sm,
    marginVertical: SuperSpacing.md,
  },
  // ListTiles
  listTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: SuperSpacing.md,
    paddingHorizontal: SuperSpacing.lg,
    marginVertical: SuperSpacing.xs,
    minHeight: 56,
  },
  listTileContent: {
    flex: 1,
    marginLeft: SuperSpacing.md,
  },
  listTileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  listTileSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },

  // Lists
  superList: {
    gap: SuperSpacing.sm,
  },

  superListItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: SuperSpacing.md,
    marginVertical: SuperSpacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Form elements  
  formGroup: {
    marginVertical: SuperSpacing.sm,
  },

  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: SuperSpacing.xs,
  },

  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: SuperSpacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Headers
  superHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SuperSpacing.md,
    paddingVertical: SuperSpacing.lg,
    backgroundColor: Colors.surface,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: SuperSpacing.lg,
    marginVertical: SuperSpacing.md,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: SuperSpacing.xs,
  },
});
