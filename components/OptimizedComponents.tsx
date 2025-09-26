/**
 * 🚀 OPTIMIZED COMPONENTS - Componentes con mejoras automáticas
 */

import React, { memo, useMemo, Suspense } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useOptimizedDataContext, usePerformanceMonitor, useErrorHandler } from '../hooks/optimized-hooks';

// 1. ENHANCED ERROR BOUNDARY
const OptimizedErrorBoundary: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const { error, hasError, captureError, resetError } = useErrorHandler();

  React.useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError(...args);
      if (args[0] instanceof Error) {
        captureError(args[0]);
      }
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [captureError]);

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>🚨 Error Detectado</Text>
        <Text style={styles.errorMessage}>
          {error?.message || 'Error desconocido'}
        </Text>
        <Text style={styles.errorAction} onPress={resetError}>
          🔄 Reintentar
        </Text>
      </View>
    );
  }

  return (
    <Suspense fallback={<OptimizedLoadingSpinner message="Cargando..." />}>
      {children}
    </Suspense>
  );
});

// 2. OPTIMIZED LOADING SPINNER
const OptimizedLoadingSpinner: React.FC<{ 
  message?: string; 
  size?: 'small' | 'large' 
}> = memo(({ message = 'Cargando...', size = 'large' }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={size} color="#007AFF" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
});

// 3. PERFORMANCE MONITOR COMPONENT
const PerformanceMonitorComponent: React.FC = memo(() => {
  const { metrics } = usePerformanceMonitor();
  
  const sortedMetrics = useMemo(() => {
    return Object.entries(metrics)
      .sort(([, a], [, b]) => (b as any).avg - (a as any).avg)
      .slice(0, 5); // Top 5 slowest operations
  }, [metrics]);

  if (!__DEV__ || sortedMetrics.length === 0) {
    return null;
  }

  return (
    <View style={styles.performanceContainer}>
      <Text style={styles.performanceTitle}>📊 Performance Monitor</Text>
      {sortedMetrics.map(([operation, stats]) => {
        const { avg, max } = stats as any;
        const isProblematic = avg > 1000; // > 1 second
        
        return (
          <View key={operation} style={styles.metricRow}>
            <Text style={[styles.operationName, isProblematic && styles.problematic]}>
              {operation}
            </Text>
            <Text style={styles.metricValue}>
              {avg.toFixed(0)}ms (max: {max.toFixed(0)}ms)
            </Text>
          </View>
        );
      })}
    </View>
  );
});

// 4. OPTIMIZED DATA SAFE COMPONENT
const DataSafeWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = memo(({ children, fallback }) => {
  const { error, isLoading } = useOptimizedDataContext();

  if (isLoading) {
    return <OptimizedLoadingSpinner message="Sincronizando datos..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Error de Datos</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        {fallback || null}
      </View>
    );
  }

  return <>{children}</>;
});

// 5. MEMOIZED LIST ITEM
const OptimizedListItem: React.FC<{
  item: any;
  onPress?: (item: any) => void;
  renderContent: (item: any) => React.ReactNode;
}> = memo(({ item, onPress, renderContent }) => {
  const handlePress = React.useCallback(() => {
    onPress?.(item);
  }, [item, onPress]);

  const ItemComponent = onPress ? TouchableOpacity : View;

  return (
    <ItemComponent style={styles.listItem} onPress={onPress ? handlePress : undefined}>
      {renderContent(item)}
    </ItemComponent>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.updatedAt === nextProps.item.updatedAt
  );
});

// 6. SMART FORM FIELD
const SmartFormField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}> = memo(({ label, value, onChangeText, error, placeholder, required }) => {
  const hasError = Boolean(error);
  
  return (
    <View style={styles.formFieldContainer}>
      <Text style={[styles.fieldLabel, required && styles.requiredLabel]}>
        {label} {required && '*'}
      </Text>
      <View style={[styles.inputContainer, hasError && styles.inputError]}>
        {/* Aquí iría el TextInput real */}
        <Text style={styles.placeholder}>{placeholder}</Text>
      </View>
      {hasError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

// 7. OPTIMIZED TOURNAMENT CARD
const OptimizedTorneoCard: React.FC<{
  torneo: any;
  onPress: (torneo: any) => void;
}> = memo(({ torneo, onPress }) => {
  const handlePress = React.useCallback(() => {
    onPress(torneo);
  }, [torneo, onPress]);

  const torneoInfo = useMemo(() => ({
    equiposCount: torneo.equipos?.length || 0,
    partidosCount: torneo.partidos?.length || 0,
    status: torneo.iniciado ? (torneo.finalizado ? 'Finalizado' : 'En curso') : 'Pendiente'
  }), [torneo]);

  return (
    <View style={styles.torneoCard} onTouchEnd={handlePress}>
      <Text style={styles.torneoNombre}>{torneo.nombre}</Text>
      <Text style={styles.torneoTipo}>{torneo.tipoTorneo}</Text>
      <View style={styles.torneoStats}>
        <Text style={styles.statText}>⚽ {torneoInfo.equiposCount} equipos</Text>
        <Text style={styles.statText}>🏆 {torneoInfo.partidosCount} partidos</Text>
        <Text style={[styles.statusText, getStatusStyle(torneoInfo.status)]}>
          {torneoInfo.status}
        </Text>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.torneo.id === nextProps.torneo.id &&
    prevProps.torneo.updatedAt === nextProps.torneo.updatedAt
  );
});

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pendiente':
      return styles.pendiente;
    case 'en curso':
      return styles.enCurso;
    case 'finalizado':
      return styles.finalizado;
    default:
      return {};
  }
};

// 8. MATCH LIVE UPDATES
const LiveMatchUpdates: React.FC<{
  partidoId: string;
}> = memo(({ partidoId }) => {
  const [updates, setUpdates] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Simular actualizaciones en vivo
    const interval = setInterval(() => {
      // Aquí se conectaría con el sistema de eventos en tiempo real
    }, 1000);

    return () => clearInterval(interval);
  }, [partidoId]);

  return (
    <View style={styles.liveUpdatesContainer}>
      <Text style={styles.liveTitle}>🔴 En Vivo</Text>
      {updates.map((update, index) => (
        <Text key={index} style={styles.liveUpdate}>
          {update.message}
        </Text>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorAction: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  performanceContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    minWidth: 200,
  },
  performanceTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  operationName: {
    color: 'white',
    fontSize: 10,
    flex: 1,
  },
  metricValue: {
    color: '#aaa',
    fontSize: 10,
  },
  problematic: {
    color: '#ff6b6b',
  },
  listItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  formFieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  requiredLabel: {
    color: '#d32f2f',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  placeholder: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 5,
  },
  torneoCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  torneoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  torneoTipo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  torneoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pendiente: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  enCurso: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  finalizado: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  liveUpdatesContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  liveTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  liveUpdate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export {
  OptimizedErrorBoundary,
  OptimizedLoadingSpinner,
  PerformanceMonitorComponent as PerformanceMonitor,
  DataSafeWrapper,
  OptimizedListItem,
  SmartFormField,
  OptimizedTorneoCard,
  LiveMatchUpdates
};