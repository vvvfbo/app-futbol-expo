import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Send,
  X
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { GlobalStyles, createButtonStyle, createButtonTextStyle } from '@/constants/styles';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { FiltroAmistosos, PartidoAmistoso, Categoria, TipoFutbol, FranjaHoraria } from '@/types';
import DatePicker from '@/components/DatePicker';

export default function BuscarAmistososScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { 
    amistosos, 
    equipos, 
    obtenerEquiposPorEntrenador,
    proponerAmistoso
  } = useData();
  
  const [filtros, setFiltros] = useState<FiltroAmistosos>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string>('');
  const [mostrarModalPropuesta, setMostrarModalPropuesta] = useState(false);
  const [amistosoSeleccionado, setAmistosoSeleccionado] = useState<string>('');

  const misEquipos = useMemo(() => {
    if (!user) return [];
    return obtenerEquiposPorEntrenador(user.id);
  }, [user, obtenerEquiposPorEntrenador]);

  const disponibilidades = useMemo(() => {
    console.log('🔍 === BUSCANDO DISPONIBILIDADES ===');
    console.log('🔍 Total amistosos en sistema:', amistosos.length);
    console.log('🔍 Mis equipos:', misEquipos.map(e => ({ id: e.id, nombre: e.nombre })));
    console.log('🔍 Todos los amistosos:', amistosos.map(a => ({
      id: a.id,
      esDisponibilidad: a.esDisponibilidad,
      estado: a.estado,
      equipoLocalId: a.equipoLocalId,
      equipoLocal: equipos.find(e => e.id === a.equipoLocalId)?.nombre
    })));
    
    // Obtener todas las disponibilidades (incluyendo las mías)
    const todasDisponibilidades = amistosos.filter(amistoso => {
      const esDisponibilidad = amistoso.esDisponibilidad === true;
      const estaDisponible = amistoso.estado === 'Disponible';
      const esMio = misEquipos.some(equipo => equipo.id === amistoso.equipoLocalId);
      
      console.log(`🔍 Amistoso ${amistoso.id}:`, {
        esDisponibilidad,
        estaDisponible,
        esMio,
        equipoLocalId: amistoso.equipoLocalId,
        estado: amistoso.estado,
        equipoLocal: equipos.find(e => e.id === amistoso.equipoLocalId)?.nombre
      });
      
      return esDisponibilidad && estaDisponible;
    });
    
    console.log('🔍 Disponibilidades encontradas (antes de filtros):', todasDisponibilidades.length);
    console.log('🔍 Disponibilidades:', todasDisponibilidades.map(d => ({
      id: d.id,
      equipoLocal: equipos.find(e => e.id === d.equipoLocalId)?.nombre,
      fecha: d.fecha,
      categoria: d.categoria,
      tipoFutbol: d.tipoFutbol
    })));

    // Aplicar filtros
    const disponibilidadesFiltradas = todasDisponibilidades.filter(amistoso => {
      if (filtros.categoria && amistoso.categoria !== filtros.categoria) return false;
      if (filtros.tipoFutbol && amistoso.tipoFutbol !== filtros.tipoFutbol) return false;
      
      // Filtro de fecha - convertir formato DD/MM/YYYY a YYYY-MM-DD para comparar
      if (filtros.fecha) {
        const [day, month, year] = filtros.fecha.split('/');
        const fechaFiltro = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        if (amistoso.fecha !== fechaFiltro) return false;
      }
      
      if (filtros.franjaHoraria && amistoso.franjaHoraria !== filtros.franjaHoraria) return false;
      return true;
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    console.log('🔍 Disponibilidades después de filtros:', disponibilidadesFiltradas.length);
    console.log('🔍 === FIN BÚSQUEDA ===');
    
    return disponibilidadesFiltradas;
  }, [amistosos, misEquipos, filtros, equipos]);

  const handleProponerAmistoso = async (amistosoId: string) => {
    if (!equipoSeleccionado) {
      alert('Selecciona un equipo para proponer el amistoso');
      return;
    }

    try {
      await proponerAmistoso(amistosoId, equipoSeleccionado, user!.id);
      setMostrarModalPropuesta(false);
      setAmistosoSeleccionado('');
      setEquipoSeleccionado('');
      alert('Propuesta enviada correctamente');
    } catch {
      alert('Error al enviar la propuesta');
    }
  };

  const abrirModalPropuesta = (amistosoId: string) => {
    setAmistosoSeleccionado(amistosoId);
    setMostrarModalPropuesta(true);
  };

  const renderDisponibilidad = (amistoso: PartidoAmistoso) => {
    const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
    const esMio = misEquipos.some(equipo => equipo.id === amistoso.equipoLocalId);
    
    return (
      <View key={amistoso.id} style={styles.disponibilidadCard}>
        <View style={styles.cardHeader}>
          <View style={styles.equipoHeaderContainer}>
            <Text style={styles.equipoNombre}>{equipoLocal?.nombre}</Text>
            {esMio && (
              <Text style={styles.miEquipoLabel}>Mi equipo</Text>
            )}
          </View>
          <View style={styles.categoriaContainer}>
            <Text style={styles.categoriaText}>
              {amistoso.categoria} - {amistoso.tipoFutbol}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>
              {(() => {
                // Convertir YYYY-MM-DD a DD/MM/YYYY para mostrar
                const [year, month, day] = amistoso.fecha.split('-');
                return `${day}/${month}/${year}`;
              })()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color={Colors.textLight} />
            <Text style={styles.infoText}>
              {amistoso.hora} {amistoso.franjaHoraria && `(${amistoso.franjaHoraria})`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color={Colors.textLight} />
            <Text style={styles.infoText} numberOfLines={2}>
              {amistoso.ubicacion.direccion}
            </Text>
          </View>
          {amistoso.rangoKm && (
            <View style={styles.infoRow}>
              <Users size={16} color={Colors.textLight} />
              <Text style={styles.infoText}>
                Dispuesto a viajar hasta {amistoso.rangoKm} km
              </Text>
            </View>
          )}
        </View>

        {!esMio ? (
          <TouchableOpacity
            style={[...createButtonStyle('medium', 'secondary'), GlobalStyles.buttonWithIcon]}
            onPress={() => abrirModalPropuesta(amistoso.id)}
          >
            <Send size={16} color="#FFFFFF" />
            <Text style={createButtonTextStyle('secondary')}>Proponer Amistoso</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.miDisponibilidadInfo}>
            <Text style={styles.miDisponibilidadText}>
              Esta es tu disponibilidad. Otros equipos pueden proponerte amistosos.
            </Text>
            <TouchableOpacity
              style={[...createButtonStyle('compact', 'outline')]}
              onPress={() => router.push('/notificaciones')}
            >
              <Text style={createButtonTextStyle('outline')}>Ver propuestas</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const categorias: Categoria[] = ['Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Senior'];
  const tiposFutbol: TipoFutbol[] = ['F11', 'F7', 'Sala'];
  const franjasHorarias: FranjaHoraria[] = ['mañana', 'tarde', 'noche'];

  if (misEquipos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Users size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No tienes equipos</Text>
          <Text style={styles.emptyText}>
            Necesitas crear al menos un equipo para buscar amistosos
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/crear-equipo')}
          >
            <Text style={styles.createButtonText}>Crear Equipo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con filtros */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.filtroButton}
          onPress={() => setMostrarFiltros(!mostrarFiltros)}
        >
          <Filter size={20} color={Colors.primary} />
          <Text style={styles.filtroButtonText}>Filtros</Text>
        </TouchableOpacity>
        
        <Text style={styles.resultadosText}>
          {disponibilidades.length} disponibilidades encontradas
        </Text>
      </View>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <View style={styles.filtrosPanel}>
          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  GlobalStyles.chip,
                  !filtros.categoria && GlobalStyles.chipActive,
                  { marginRight: 8 }
                ]}
                onPress={() => setFiltros(prev => ({ ...prev, categoria: undefined }))}
              >
                <Text style={[
                  GlobalStyles.chipText,
                  !filtros.categoria && GlobalStyles.chipTextActive
                ]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {categorias.map(categoria => (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    GlobalStyles.chip,
                    filtros.categoria === categoria && GlobalStyles.chipActive,
                    { marginRight: 8 }
                  ]}
                  onPress={() => setFiltros(prev => ({ 
                    ...prev, 
                    categoria: prev.categoria === categoria ? undefined : categoria 
                  }))}
                >
                  <Text style={[
                    GlobalStyles.chipText,
                    filtros.categoria === categoria && GlobalStyles.chipTextActive
                  ]}>
                    {categoria}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Tipo:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  GlobalStyles.chip,
                  !filtros.tipoFutbol && GlobalStyles.chipActive,
                  { marginRight: 8 }
                ]}
                onPress={() => setFiltros(prev => ({ ...prev, tipoFutbol: undefined }))}
              >
                <Text style={[
                  GlobalStyles.chipText,
                  !filtros.tipoFutbol && GlobalStyles.chipTextActive
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {tiposFutbol.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    GlobalStyles.chip,
                    filtros.tipoFutbol === tipo && GlobalStyles.chipActive,
                    { marginRight: 8 }
                  ]}
                  onPress={() => setFiltros(prev => ({ 
                    ...prev, 
                    tipoFutbol: prev.tipoFutbol === tipo ? undefined : tipo 
                  }))}
                >
                  <Text style={[
                    GlobalStyles.chipText,
                    filtros.tipoFutbol === tipo && GlobalStyles.chipTextActive
                  ]}>
                    {tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Fecha:</Text>
            <View style={styles.fechaContainer}>
              <View style={styles.fechaInputContainer}>
                <DatePicker
                  value={filtros.fecha || ''}
                  onDateChange={(fecha) => {
                    console.log('📅 Filtro fecha seleccionada:', fecha);
                    setFiltros(prev => ({ ...prev, fecha: fecha || undefined }));
                  }}
                  placeholder="Seleccionar fecha"
                  minimumDate={new Date()}
                />
              </View>
              {filtros.fecha && (
                <TouchableOpacity
                  style={styles.clearFechaBtn}
                  onPress={() => setFiltros(prev => ({ ...prev, fecha: undefined }))}
                >
                  <X size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.filtroRow}>
            <Text style={styles.filtroLabel}>Franja Horaria:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  GlobalStyles.chip,
                  !filtros.franjaHoraria && GlobalStyles.chipActive,
                  { marginRight: 8 }
                ]}
                onPress={() => setFiltros(prev => ({ ...prev, franjaHoraria: undefined }))}
              >
                <Text style={[
                  GlobalStyles.chipText,
                  !filtros.franjaHoraria && GlobalStyles.chipTextActive
                ]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {franjasHorarias.map(franja => (
                <TouchableOpacity
                  key={franja}
                  style={[
                    GlobalStyles.chip,
                    filtros.franjaHoraria === franja && GlobalStyles.chipActive,
                    { marginRight: 8 }
                  ]}
                  onPress={() => setFiltros(prev => ({ 
                    ...prev, 
                    franjaHoraria: prev.franjaHoraria === franja ? undefined : franja 
                  }))}
                >
                  <Text style={[
                    GlobalStyles.chipText,
                    filtros.franjaHoraria === franja && GlobalStyles.chipTextActive
                  ]}>
                    {franja.charAt(0).toUpperCase() + franja.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Lista de disponibilidades */}
      <ScrollView style={styles.scrollView}>
        {disponibilidades.length === 0 ? (
          <View style={styles.emptySection}>
            <Search size={48} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No hay disponibilidades</Text>
            <Text style={styles.emptyText}>
              No se encontraron amistosos disponibles con los filtros seleccionados
            </Text>
            {__DEV__ && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugText}>Debug Info:</Text>
                <Text style={styles.debugText}>Total amistosos: {amistosos.length}</Text>
                <Text style={styles.debugText}>Mis equipos: {misEquipos.length}</Text>
                <Text style={styles.debugText}>Filtros activos: {JSON.stringify(filtros)}</Text>
                {amistosos.length > 0 && (
                  <Text style={styles.debugText}>Amistosos en sistema: {amistosos.map(a => `${a.id}(${a.estado})`).join(', ')}</Text>
                )}
              </View>
            )}
          </View>
        ) : (
          disponibilidades.map(renderDisponibilidad)
        )}
      </ScrollView>

      {/* Modal para proponer amistoso */}
      <Modal
        visible={mostrarModalPropuesta}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalPropuesta(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Proponer Amistoso</Text>
              <TouchableOpacity
                onPress={() => setMostrarModalPropuesta(false)}
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Selecciona el equipo con el que quieres jugar:
            </Text>

            <ScrollView style={styles.equiposLista}>
              {misEquipos.map(equipo => (
                <TouchableOpacity
                  key={equipo.id}
                  style={[
                    styles.equipoItem,
                    equipoSeleccionado === equipo.id && styles.equipoSeleccionado
                  ]}
                  onPress={() => setEquipoSeleccionado(equipo.id)}
                >
                  <Text style={[
                    styles.equipoItemText,
                    equipoSeleccionado === equipo.id && styles.equipoItemTextSeleccionado
                  ]}>
                    {equipo.nombre}
                  </Text>
                  <Text style={styles.equipoItemSubtext}>
                    {equipo.categoria} - {equipo.tipoFutbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelarBtn}
                onPress={() => setMostrarModalPropuesta(false)}
              >
                <Text style={styles.cancelarBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.enviarBtn,
                  !equipoSeleccionado && styles.enviarBtnDisabled
                ]}
                onPress={() => handleProponerAmistoso(amistosoSeleccionado)}
                disabled={!equipoSeleccionado}
              >
                <Text style={styles.enviarBtnText}>Enviar Propuesta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtroButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  resultadosText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  filtrosPanel: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 20,
  },
  filtroRow: {
    marginBottom: 4,
  },
  filtroLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  filtroChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtroChipActivo: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filtroChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filtroChipTextActivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fechaInputContainer: {
    flex: 1,
    position: 'relative',
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  clearFechaBtn: {
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.error,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptySection: {
    alignItems: 'center',
    padding: 40,
  },
  disponibilidadCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  equipoHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  miEquipoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoriaContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoriaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  proponerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  proponerBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 16,
  },
  equiposLista: {
    maxHeight: 200,
    marginBottom: 20,
  },
  equipoItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  equipoSeleccionado: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  equipoItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  equipoItemTextSeleccionado: {
    color: Colors.primary,
  },
  equipoItemSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelarBtnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  enviarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  enviarBtnDisabled: {
    backgroundColor: Colors.textLight,
  },
  enviarBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  miDisponibilidadInfo: {
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  miDisponibilidadText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  verPropuestasBtn: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  verPropuestasText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});