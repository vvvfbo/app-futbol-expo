import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { 
  MapPin, 
  Users, 
  Save,
  X,
  ChevronDown
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import LocationPicker from '@/components/LocationPicker';
import DatePicker, { TimePicker } from '@/components/DatePicker';
import { FranjaHoraria } from '@/types';

export default function CrearDisponibilidadScreen() {
  const { user } = useAuth();
  const { obtenerEquiposPorEntrenador, crearAmistoso } = useData();
  
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [franjaHoraria, setFranjaHoraria] = useState<FranjaHoraria>('tarde');
  const [ubicacion, setUbicacion] = useState<{
    direccion: string;
    coordenadas?: { latitud: number; longitud: number };
  }>({ direccion: '' });
  const [rangoKm, setRangoKm] = useState<string>('10');
  const [observaciones, setObservaciones] = useState<string>('');
  
  const [mostrarSelectorEquipo, setMostrarSelectorEquipo] = useState(false);
  const [mostrarSelectorFranja, setMostrarSelectorFranja] = useState(false);
  const [mostrarLocationPicker, setMostrarLocationPicker] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const misEquipos = useMemo(() => {
    if (!user) return [];
    return obtenerEquiposPorEntrenador(user.id);
  }, [user, obtenerEquiposPorEntrenador]);

  const equipoActual = useMemo(() => {
    return misEquipos.find(e => e.id === equipoSeleccionado);
  }, [misEquipos, equipoSeleccionado]);

  const franjasHorarias: { value: FranjaHoraria; label: string }[] = [
    { value: 'mañana', label: 'Mañana (8:00 - 12:00)' },
    { value: 'tarde', label: 'Tarde (12:00 - 18:00)' },
    { value: 'noche', label: 'Noche (18:00 - 22:00)' },
  ];

  const convertirFechaParaGuardar = (fechaDDMMYYYY: string): string => {
    const [day, month, year] = fechaDDMMYYYY.split('/');
    return `${year}-${month}-${day}`;
  };

  const validarFormulario = (): string | null => {
    if (!equipoSeleccionado) return 'Selecciona un equipo';
    if (!fecha) return 'Ingresa una fecha';
    if (!hora) return 'Ingresa una hora';
    if (!ubicacion.direccion) return 'Ingresa una ubicación';
    
    // Validar formato de fecha DD/MM/YYYY
    const fechaRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!fechaRegex.test(fecha)) return 'Formato de fecha inválido (DD/MM/YYYY)';
    
    // Validar que la fecha no sea en el pasado
    const [day, month, year] = fecha.split('/');
    const fechaSeleccionada = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaSeleccionada < hoy) return 'La fecha no puede ser en el pasado';
    
    // Validar formato de hora
    const horaRegex = /^\d{2}:\d{2}$/;
    if (!horaRegex.test(hora)) return 'Formato de hora inválido (HH:MM)';
    
    return null;
  };

  const handleGuardar = async () => {
    const error = validarFormulario();
    if (error) {
      alert(error);
      return;
    }

    if (!equipoActual) {
      alert('Error: No se encontró el equipo seleccionado');
      return;
    }

    setGuardando(true);
    try {
      console.log('🏗️ === CREANDO DISPONIBILIDAD ===');
      console.log('🏗️ Equipo seleccionado:', equipoActual.nombre);
      console.log('🏗️ Fecha:', fecha);
      console.log('🏗️ Hora:', hora);
      console.log('🏗️ Ubicación:', ubicacion);
      console.log('🏗️ Franja horaria:', franjaHoraria);
      console.log('🏗️ Rango km:', rangoKm);
      console.log('🏗️ Observaciones:', observaciones);
      
      // Validar que el equipo tenga categoría y tipo de fútbol
      if (!equipoActual.categoria) {
        throw new Error('El equipo seleccionado no tiene categoría definida');
      }
      if (!equipoActual.tipoFutbol) {
        throw new Error('El equipo seleccionado no tiene tipo de fútbol definido');
      }
      
      const disponibilidadData = {
        equipoLocalId: equipoSeleccionado,
        fecha: convertirFechaParaGuardar(fecha),
        hora,
        ubicacion,
        estado: 'Disponible' as const,
        tipoFutbol: equipoActual.tipoFutbol,
        categoria: equipoActual.categoria,
        esDisponibilidad: true,
        rangoKm: parseInt(rangoKm) || 10,
        franjaHoraria,
        observaciones: observaciones || undefined,
      };
      
      console.log('🏗️ Datos completos de disponibilidad:', JSON.stringify(disponibilidadData, null, 2));
      
      const amistosoId = await crearAmistoso(disponibilidadData);
      
      console.log('✅ Disponibilidad creada con ID:', amistosoId);
      console.log('🏗️ === PROCESO COMPLETADO ===');

      alert('Disponibilidad creada correctamente');
      router.back();
    } catch (error) {
      console.error('❌ Error creando disponibilidad:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al crear la disponibilidad: ${errorMessage}`);
    } finally {
      setGuardando(false);
    }
  };

  if (misEquipos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Users size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No tienes equipos</Text>
          <Text style={styles.emptyText}>
            Necesitas crear al menos un equipo para crear disponibilidades
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Selector de equipo */}
          <View style={styles.field}>
            <Text style={styles.label}>Equipo *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setMostrarSelectorEquipo(true)}
            >
              <Text style={[
                styles.selectorText,
                !equipoSeleccionado && styles.placeholder
              ]}>
                {equipoActual ? equipoActual.nombre : 'Selecciona un equipo'}
              </Text>
              <ChevronDown size={20} color={Colors.textLight} />
            </TouchableOpacity>
            {equipoActual && (
              <Text style={styles.equipoInfo}>
                {equipoActual.categoria} - {equipoActual.tipoFutbol}
              </Text>
            )}
          </View>

          {/* Fecha */}
          <DatePicker
            label="Fecha *"
            value={fecha}
            onDateChange={setFecha}
            placeholder="Seleccionar fecha"
            minimumDate={new Date()}
          />

          {/* Hora */}
          <TimePicker
            label="Hora *"
            value={hora}
            onTimeChange={setHora}
            placeholder="Seleccionar hora"
          />

          {/* Franja horaria */}
          <View style={styles.field}>
            <Text style={styles.label}>Franja Horaria</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setMostrarSelectorFranja(true)}
            >
              <Text style={styles.selectorText}>
                {franjasHorarias.find(f => f.value === franjaHoraria)?.label}
              </Text>
              <ChevronDown size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Ubicación */}
          <View style={styles.field}>
            <Text style={styles.label}>Ubicación *</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setMostrarLocationPicker(true)}
            >
              <MapPin size={16} color={Colors.textLight} />
              <Text style={[
                styles.selectorText,
                !ubicacion.direccion && styles.placeholder
              ]}>
                {ubicacion.direccion || 'Seleccionar ubicación'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Rango de kilómetros */}
          <View style={styles.field}>
            <Text style={styles.label}>Dispuesto a viajar (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              value={rangoKm}
              onChangeText={setRangoKm}
              keyboardType="numeric"
            />
          </View>

          {/* Observaciones */}
          <View style={styles.field}>
            <Text style={styles.label}>Observaciones</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Información adicional..."
              value={observaciones}
              onChangeText={setObservaciones}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      </ScrollView>

      {/* Botón guardar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}
          onPress={handleGuardar}
          disabled={guardando}
        >
          <Save size={20} color="#FFFFFF" />
          <Text style={styles.guardarBtnText}>
            {guardando ? 'Guardando...' : 'Crear Disponibilidad'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal selector de equipo */}
      <Modal
        visible={mostrarSelectorEquipo}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarSelectorEquipo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Equipo</Text>
              <TouchableOpacity onPress={() => setMostrarSelectorEquipo(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.equiposLista}>
              {misEquipos.map(equipo => (
                <TouchableOpacity
                  key={equipo.id}
                  style={[
                    styles.equipoItem,
                    equipoSeleccionado === equipo.id && styles.equipoSeleccionado
                  ]}
                  onPress={() => {
                    setEquipoSeleccionado(equipo.id);
                    setMostrarSelectorEquipo(false);
                  }}
                >
                  <Text style={styles.equipoItemText}>{equipo.nombre}</Text>
                  <Text style={styles.equipoItemSubtext}>
                    {equipo.categoria} - {equipo.tipoFutbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal selector de franja horaria */}
      <Modal
        visible={mostrarSelectorFranja}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarSelectorFranja(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Franja</Text>
              <TouchableOpacity onPress={() => setMostrarSelectorFranja(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.franjasLista}>
              {franjasHorarias.map(franja => (
                <TouchableOpacity
                  key={franja.value}
                  style={[
                    styles.franjaItem,
                    franjaHoraria === franja.value && styles.franjaSeleccionada
                  ]}
                  onPress={() => {
                    setFranjaHoraria(franja.value);
                    setMostrarSelectorFranja(false);
                  }}
                >
                  <Text style={styles.franjaItemText}>{franja.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal LocationPicker */}
      {mostrarLocationPicker && (
        <Modal
          visible={mostrarLocationPicker}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setMostrarLocationPicker(false)}
        >
          <LocationPicker
            onLocationSelect={(location: { address: string; coordinates?: { latitude: number; longitude: number } }) => {
              try {
                console.log('📍 Ubicación seleccionada en crear disponibilidad:', location);
                setUbicacion({
                  direccion: location.address,
                  coordenadas: location.coordinates ? {
                    latitud: location.coordinates.latitude,
                    longitud: location.coordinates.longitude
                  } : undefined
                });
                setMostrarLocationPicker(false);
                console.log('✅ Ubicación establecida correctamente');
              } catch (error) {
                console.error('❌ Error al establecer ubicación:', error);
                alert('Error al seleccionar la ubicación');
              }
            }}
            onClose={() => {
              console.log('🔄 Cerrando LocationPicker');
              setMostrarLocationPicker(false);
            }}
          />
        </Modal>
      )}
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
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  selectorText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  placeholder: {
    color: Colors.textLight,
  },
  equipoInfo: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  guardarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    minHeight: 50,
  },
  guardarBtnDisabled: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  guardarBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
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
    maxHeight: '70%',
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
  equiposLista: {
    maxHeight: 300,
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
  equipoItemSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  franjasLista: {
    gap: 8,
  },
  franjaItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  franjaSeleccionada: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  franjaItemText: {
    fontSize: 16,
    color: Colors.text,
  },
});