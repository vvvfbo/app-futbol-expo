import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Edit,
  Trash2,
  Share2,
  Download,
  Check,
  X,
  Trophy,
  MessageCircle,
  Phone,
  Mail,
  Send
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';

export default function DetalleAmistosoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { 
    amistosos, 
    equipos, 
    actualizarAmistoso,
    eliminarAmistoso,
    finalizarAmistoso,
    exportarResultadoAmistoso
  } = useData();
  
  const [mostrarModalResultado, setMostrarModalResultado] = useState(false);
  const [golesLocal, setGolesLocal] = useState<string>('');
  const [golesVisitante, setGolesVisitante] = useState<string>('');
  const [guardando, setGuardando] = useState(false);
  const [mostrarModalContacto, setMostrarModalContacto] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const amistoso = useMemo(() => {
    return amistosos.find(a => a.id === id);
  }, [amistosos, id]);

  const equipoLocal = useMemo(() => {
    return amistoso ? equipos.find(e => e.id === amistoso.equipoLocalId) : null;
  }, [equipos, amistoso]);

  const equipoVisitante = useMemo(() => {
    return amistoso?.equipoVisitanteId ? 
      equipos.find(e => e.id === amistoso.equipoVisitanteId) : null;
  }, [equipos, amistoso]);

  const esMiAmistoso = useMemo(() => {
    if (!user || !amistoso) return false;
    return equipoLocal?.entrenadorId === user.id || 
           equipoVisitante?.entrenadorId === user.id;
  }, [user, amistoso, equipoLocal, equipoVisitante]);

  const puedeEditar = useMemo(() => {
    if (!user || !amistoso) return false;
    return equipoLocal?.entrenadorId === user.id && 
           (amistoso.estado === 'Disponible' || amistoso.estado === 'Confirmado');
  }, [user, amistoso, equipoLocal]);

  const puedeRegistrarResultado = useMemo(() => {
    if (!user || !amistoso) return false;
    return (equipoLocal?.entrenadorId === user.id || equipoVisitante?.entrenadorId === user.id) &&
           amistoso.estado === 'Confirmado';
  }, [user, amistoso, equipoLocal, equipoVisitante]);

  const otroEntrenador = useMemo(() => {
    if (!user || !amistoso) return null;
    
    // Si soy el entrenador local, el otro es el visitante
    if (equipoLocal?.entrenadorId === user.id) {
      return {
        id: equipoVisitante?.entrenadorId,
        equipo: equipoVisitante?.nombre,
        esLocal: false
      };
    }
    
    // Si soy el entrenador visitante, el otro es el local
    if (equipoVisitante?.entrenadorId === user.id) {
      return {
        id: equipoLocal?.entrenadorId,
        equipo: equipoLocal?.nombre,
        esLocal: true
      };
    }
    
    return null;
  }, [user, amistoso, equipoLocal, equipoVisitante]);

  const puedeContactar = useMemo(() => {
    return amistoso?.estado === 'Confirmado' && otroEntrenador && esMiAmistoso;
  }, [amistoso, otroEntrenador, esMiAmistoso]);

  const handleEliminar = async () => {
    if (!amistoso) return;
    
    const confirmar = confirm('¿Estás seguro de que quieres eliminar este amistoso?');
    if (!confirmar) return;

    try {
      await eliminarAmistoso(amistoso.id);
      alert('Amistoso eliminado correctamente');
      router.back();
    } catch (error) {
      alert('Error al eliminar el amistoso');
    }
  };

  const handleRegistrarResultado = async () => {
    if (!amistoso) return;

    const golesL = parseInt(golesLocal);
    const golesV = parseInt(golesVisitante);

    if (isNaN(golesL) || isNaN(golesV) || golesL < 0 || golesV < 0) {
      alert('Ingresa goles válidos (números enteros positivos)');
      return;
    }

    setGuardando(true);
    try {
      await finalizarAmistoso(amistoso.id, golesL, golesV);
      setMostrarModalResultado(false);
      alert('Resultado registrado correctamente');
    } catch (error) {
      alert('Error al registrar el resultado');
    } finally {
      setGuardando(false);
    }
  };

  const handleCompartirResultado = async () => {
    if (!amistoso || amistoso.estado !== 'Finalizado') return;

    try {
      const resultado = await exportarResultadoAmistoso(amistoso.id);
      
      if (Platform.OS === 'web') {
        // En web, copiar al portapapeles
        navigator.clipboard.writeText(resultado);
        alert('Resultado copiado al portapapeles');
      } else {
        // En móvil, usar Share API
        await Share.share({
          message: resultado,
          title: 'Resultado del Amistoso'
        });
      }
    } catch (error) {
      alert('Error al compartir el resultado');
    }
  };

  const abrirModalContacto = () => {
    if (!otroEntrenador) return;
    
    setMensaje(`Hola, soy el entrenador de ${esMiAmistoso ? (equipoLocal?.entrenadorId === user?.id ? equipoLocal?.nombre : equipoVisitante?.nombre) : 'mi equipo'}. Me gustaría coordinar los detalles de nuestro amistoso del ${amistoso?.fecha} a las ${amistoso?.hora}.`);
    setMostrarModalContacto(true);
  };

  const handleLlamar = () => {
    const telefono = '+34 600 123 456'; // En una app real, esto vendría de la base de datos
    
    if (Platform.OS === 'web') {
      window.open(`tel:${telefono}`);
    } else {
      Alert.alert('Llamar', `Llamando a ${telefono}`);
    }
  };

  const handleEnviarEmail = () => {
    const email = 'entrenador@club.com'; // En una app real, esto vendría de la base de datos
    const subject = `Amistoso - ${equipoLocal?.nombre} vs ${equipoVisitante?.nombre}`;
    const body = mensaje;
    
    if (Platform.OS === 'web') {
      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      Alert.alert('Email', `Enviando email a ${email}`);
    }
  };

  const handleCompartirContacto = async () => {
    const textoCompartir = `Contacto para amistoso:\n${equipoLocal?.nombre} vs ${equipoVisitante?.nombre}\n${amistoso?.fecha} - ${amistoso?.hora}\n\nMensaje:\n${mensaje}`;
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(textoCompartir);
        Alert.alert('Copiado', 'Información copiada al portapapeles');
      } else {
        await Share.share({
          message: textoCompartir,
          title: 'Contacto para amistoso'
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la información');
    }
  };

  const abrirEnMaps = () => {
    if (!amistoso?.ubicacion.coordenadas) return;

    const { latitud, longitud } = amistoso.ubicacion.coordenadas;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitud},${longitud}`,
      android: `geo:0,0?q=${latitud},${longitud}`,
      web: `https://www.google.com/maps?q=${latitud},${longitud}`
    });

    if (url) {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        // En móvil usaría Linking.openURL(url)
        console.log('Abrir en mapas:', url);
      }
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Disponible': return Colors.primary;
      case 'Propuesto': return Colors.warning;
      case 'Confirmado': return Colors.secondary;
      case 'Finalizado': return Colors.success;
      case 'Cancelado': return Colors.error;
      default: return Colors.textLight;
    }
  };

  if (!amistoso) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Amistoso no encontrado</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.equiposContainer}>
            {amistoso.esDisponibilidad ? (
              <Text style={styles.equiposText}>
                {equipoLocal?.nombre} - Disponible
              </Text>
            ) : (
              <Text style={styles.equiposText}>
                {equipoLocal?.nombre} vs {equipoVisitante?.nombre || 'Por confirmar'}
              </Text>
            )}
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(amistoso.estado) }]}>
            <Text style={styles.estadoText}>{amistoso.estado}</Text>
          </View>
        </View>

        {/* Resultado (si está finalizado) */}
        {amistoso.estado === 'Finalizado' && (
          <View style={styles.resultadoContainer}>
            <Trophy size={24} color="#FFFFFF" />
            <Text style={styles.resultadoText}>
              {amistoso.golesLocal} - {amistoso.golesVisitante}
            </Text>
          </View>
        )}

        {/* Información del amistoso */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información del Amistoso</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Fecha:</Text>
              <Text style={styles.infoValue}>{amistoso.fecha}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Hora:</Text>
              <Text style={styles.infoValue}>
                {amistoso.hora} {amistoso.franjaHoraria && `(${amistoso.franjaHoraria})`}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Categoría:</Text>
              <Text style={styles.infoValue}>
                {amistoso.categoria} - {amistoso.tipoFutbol}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={abrirEnMaps}
              disabled={!amistoso.ubicacion.coordenadas}
            >
              <MapPin size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Ubicación:</Text>
              <Text style={[
                styles.infoValue, 
                amistoso.ubicacion.coordenadas && styles.linkText
              ]}>
                {amistoso.ubicacion.direccion}
              </Text>
            </TouchableOpacity>

            {amistoso.rangoKm && (
              <View style={styles.infoRow}>
                <MapPin size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Rango:</Text>
                <Text style={styles.infoValue}>
                  Hasta {amistoso.rangoKm} km
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Observaciones */}
        {amistoso.observaciones && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <View style={styles.infoCard}>
              <Text style={styles.observacionesText}>
                {amistoso.observaciones}
              </Text>
            </View>
          </View>
        )}

        {/* Goleadores (si está finalizado) */}
        {amistoso.estado === 'Finalizado' && amistoso.goleadores && amistoso.goleadores.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Goleadores</Text>
            <View style={styles.infoCard}>
              {amistoso.goleadores.map((gol, index) => {
                const equipo = equipos.find(e => e.id === gol.equipoId);
                const jugador = equipo?.jugadores.find(j => j.id === gol.jugadorId);
                return (
                  <View key={index} style={styles.goleadorRow}>
                    <Text style={styles.goleadorNombre}>
                      {jugador?.nombre || 'Desconocido'}
                    </Text>
                    <Text style={styles.goleadorEquipo}>
                      ({equipo?.nombre || 'Desconocido'})
                    </Text>
                    <Text style={styles.goleadorMinuto}>
                      Min {gol.minuto}'
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botones de acción */}
      {esMiAmistoso && (
        <View style={styles.actionsContainer}>
          {puedeContactar && (
            <TouchableOpacity
              style={[styles.actionButton, styles.contactarButton]}
              onPress={abrirModalContacto}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Contactar Entrenador</Text>
            </TouchableOpacity>
          )}

          {puedeRegistrarResultado && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resultadoButton]}
              onPress={() => setMostrarModalResultado(true)}
            >
              <Trophy size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Registrar Resultado</Text>
            </TouchableOpacity>
          )}

          {amistoso.estado === 'Finalizado' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.compartirButton]}
              onPress={handleCompartirResultado}
            >
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Compartir</Text>
            </TouchableOpacity>
          )}

          {puedeEditar && (
            <TouchableOpacity
              style={[styles.actionButton, styles.eliminarButton]}
              onPress={handleEliminar}
            >
              <Trash2 size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal para registrar resultado */}
      <Modal
        visible={mostrarModalResultado}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalResultado(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Resultado</Text>
              <TouchableOpacity onPress={() => setMostrarModalResultado(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.resultadoForm}>
              <View style={styles.equipoResultado}>
                <Text style={styles.equipoNombre}>{equipoLocal?.nombre}</Text>
                <TextInput
                  style={styles.golesInput}
                  placeholder="0"
                  value={golesLocal}
                  onChangeText={setGolesLocal}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.vs}>VS</Text>

              <View style={styles.equipoResultado}>
                <Text style={styles.equipoNombre}>{equipoVisitante?.nombre}</Text>
                <TextInput
                  style={styles.golesInput}
                  placeholder="0"
                  value={golesVisitante}
                  onChangeText={setGolesVisitante}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelarBtn}
                onPress={() => setMostrarModalResultado(false)}
              >
                <Text style={styles.cancelarBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}
                onPress={handleRegistrarResultado}
                disabled={guardando}
              >
                <Text style={styles.guardarBtnText}>
                  {guardando ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de contacto */}
      <Modal
        visible={mostrarModalContacto}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarModalContacto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contactar Entrenador</Text>
              <TouchableOpacity onPress={() => setMostrarModalContacto(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {otroEntrenador && (
              <>
                <View style={styles.contactoInfo}>
                  <Text style={styles.contactoNombre}>
                    Entrenador de {otroEntrenador.equipo}
                  </Text>
                  <Text style={styles.contactoEquipo}>{otroEntrenador.equipo}</Text>
                  
                  <View style={styles.contactoDetalles}>
                    <View style={styles.contactoDetalle}>
                      <Phone size={16} color={Colors.primary} />
                      <Text style={styles.contactoTexto}>+34 600 123 456</Text>
                    </View>
                    <View style={styles.contactoDetalle}>
                      <Mail size={16} color={Colors.primary} />
                      <Text style={styles.contactoTexto}>entrenador@club.com</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.mensajeContainer}>
                  <Text style={styles.mensajeLabel}>Mensaje:</Text>
                  <TextInput
                    style={styles.mensajeInput}
                    value={mensaje}
                    onChangeText={setMensaje}
                    placeholder="Escribe tu mensaje aquí..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.contactoAcciones}>
                  <TouchableOpacity
                    style={[styles.contactoAccion, styles.llamarAccion]}
                    onPress={handleLlamar}
                  >
                    <Phone size={16} color="#FFFFFF" />
                    <Text style={styles.contactoAccionTexto}>Llamar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.contactoAccion, styles.emailAccion]}
                    onPress={handleEnviarEmail}
                  >
                    <Mail size={16} color="#FFFFFF" />
                    <Text style={styles.contactoAccionTexto}>Email</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.contactoAccion, styles.compartirAccion]}
                    onPress={handleCompartirContacto}
                  >
                    <Send size={16} color="#FFFFFF" />
                    <Text style={styles.contactoAccionTexto}>Compartir</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  equiposContainer: {
    marginBottom: 12,
  },
  equiposText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  estadoBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultadoContainer: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  resultadoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textLight,
    flex: 1,
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  observacionesText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  goleadorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  goleadorNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  goleadorEquipo: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  goleadorMinuto: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactarButton: {
    backgroundColor: Colors.primary,
  },
  resultadoButton: {
    backgroundColor: Colors.success,
  },
  compartirButton: {
    backgroundColor: Colors.secondary,
  },
  eliminarButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
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
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  resultadoForm: {
    alignItems: 'center',
    marginBottom: 20,
  },
  equipoResultado: {
    alignItems: 'center',
    marginBottom: 16,
  },
  equipoNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  golesInput: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 80,
  },
  vs: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginVertical: 8,
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
  guardarBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  guardarBtnDisabled: {
    backgroundColor: Colors.textLight,
  },
  guardarBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para modal de contacto
  contactoInfo: {
    marginBottom: 20,
  },
  contactoNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  contactoEquipo: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
  },
  contactoDetalles: {
    gap: 8,
  },
  contactoDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactoTexto: {
    fontSize: 14,
    color: Colors.text,
  },
  mensajeContainer: {
    marginBottom: 20,
  },
  mensajeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  mensajeInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  contactoAcciones: {
    flexDirection: 'row',
    gap: 12,
  },
  contactoAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  llamarAccion: {
    backgroundColor: Colors.success,
  },
  emailAccion: {
    backgroundColor: Colors.primary,
  },
  compartirAccion: {
    backgroundColor: Colors.secondary,
  },
  contactoAccionTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});