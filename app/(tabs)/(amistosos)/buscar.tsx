import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, MapPin, Calendar, Clock, Users, Heart, Plus } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import Colors from '@/constants/colors';
import { SuperLayoutStyles } from '@/constants/super-styles';
import SuperButton from '@/components/SuperButton';
import SuperCard from '@/components/SuperCard';
import SuperHeader from '@/components/SuperHeader';

export default function BuscarAmistososScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { equipos } = useData();
  
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [refreshing, setRefreshing] = useState(false);

  // Filtrar mis equipos (donde soy entrenador)
  const misEquipos = useMemo(() => {
    return equipos.filter(equipo => 
      equipo.entrenadorId === user?.id
    );
  }, [equipos, user?.id]);

  // Mi disponibilidad actual (simulada)
  const miDisponibilidad = useMemo(() => {
    // Aquí iría la lógica para obtener mi disponibilidad actual
    return null; // Por ahora null, se implementará más adelante
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simular actualización de datos
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <View style={[SuperLayoutStyles.screenContainer, { paddingTop: insets.top }]}>
      <ScrollView 
        style={SuperLayoutStyles.contentContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        <SuperCard elevated>
          <SuperHeader title="Buscar Amistosos" />
          
          <Text style={styles.sectionDescription}>
            Encuentra equipos disponibles para partidos amistosos en tu área
          </Text>
        </SuperCard>

        {/* Mi disponibilidad */}
        <SuperCard elevated>
          <SuperHeader title="Mi Disponibilidad" />
          
          {miDisponibilidad ? (
            <View style={styles.miDisponibilidadActiva}>
              <Text style={styles.miDisponibilidadText}>
                Tienes una disponibilidad activa
              </Text>
              <SuperButton
                title="Ver Propuestas"
                variant="primary"
                size="medium"
                onPress={() => {/* Ver propuestas recibidas */}}
              />
            </View>
          ) : (
            <View style={styles.miDisponibilidadInfo}>
              <Text style={styles.miDisponibilidadText}>
                Crea una disponibilidad para que otros equipos puedan encontrarte
              </Text>
              <SuperButton
                title="Crear Disponibilidad"
                variant="success"
                size="medium"
                icon={<Plus size={18} color="white" />}
                onPress={() => router.push('/(tabs)/(amistosos)/crear-disponibilidad')}
                fullWidth
              />
            </View>
          )}
        </SuperCard>

        {/* Filtros */}
        <SuperCard elevated>
          <SuperHeader title="Filtros" />
          
          <View style={styles.filtrosContainer}>
            <View style={styles.filtroGroup}>
              <Text style={styles.filtroLabel}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['todas', 'Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Senior'].map((categoria) => (
                  <TouchableOpacity
                    key={categoria}
                    style={[
                      styles.chip,
                      filtroCategoria === categoria && styles.chipActive
                    ]}
                    onPress={() => setFiltroCategoria(categoria)}
                  >
                    <Text style={[
                      styles.chipText,
                      filtroCategoria === categoria && styles.chipTextActive
                    ]}>
                      {categoria}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </SuperCard>

        {/* Disponibilidades encontradas */}
        <SuperCard elevated>
          <SuperHeader title="Equipos Disponibles" />
          
          {misEquipos.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>No tienes equipos</Text>
              <Text style={styles.emptyText}>
                Necesitas crear al menos un equipo para buscar amistosos
              </Text>
              <SuperButton
                title="Crear Equipo"
                variant="primary"
                size="medium"
                icon={<Plus size={18} color="white" />}
                onPress={() => router.push('/crear-equipo')}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Search size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Buscando disponibilidades...</Text>
              <Text style={styles.emptyText}>
                Aquí aparecerán los equipos disponibles para amistosos
              </Text>
            </View>
          )}
        </SuperCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  miDisponibilidadActiva: {
    padding: 16,
    backgroundColor: Colors.success + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success,
    alignItems: 'center',
  },
  miDisponibilidadInfo: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  miDisponibilidadText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  filtrosContainer: {
    paddingVertical: 8,
  },
  filtroGroup: {
    marginBottom: 16,
  },
  filtroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
});