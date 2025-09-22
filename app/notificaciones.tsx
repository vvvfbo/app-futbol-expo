import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { 
  Bell, 
  Settings, 
  Smartphone, 
  Volume2, 
  Clock, 
  Users, 
  Trophy, 
  Calendar,
  MessageCircle,
  Check,
  X,
  Send,
  Phone,
  Mail,
  MapPin
} from 'lucide-react-native';
import { useNotifications } from '@/hooks/notifications-context';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import Colors from '@/constants/colors';

export default function NotificationsScreen() {
  const {
    isEnabled,
    preferences,
    scheduledNotifications,
    requestPermissions,
    updatePreferences,
    sendLocalNotification,
    cancelAllNotifications,
    clearBadge,
  } = useNotifications();

  const { user } = useAuth();
  const { 
    amistosos, 
    equipos, 
    aceptarAmistoso, 
    rechazarAmistoso,
    obtenerEquiposPorEntrenador 
  } = useData();

  const [isLoading, setIsLoading] = useState(false);
  const [mostrarModalContacto, setMostrarModalContacto] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<{
    nombre: string;
    telefono?: string;
    email?: string;
    equipoNombre: string;
  } | null>(null);
  const [mensaje, setMensaje] = useState('');

  // Obtener propuestas de amistosos recibidas
  const propuestasRecibidas = useMemo(() => {
    if (!user) return [];
    
    return amistosos.filter(amistoso => {
      return amistoso.estado === 'Propuesto' && amistoso.propuestaA === user.id;
    });
  }, [amistosos, user]);

  // Obtener propuestas enviadas
  const propuestasEnviadas = useMemo(() => {
    if (!user) return [];
    
    return amistosos.filter(amistoso => {
      return amistoso.estado === 'Propuesto' && amistoso.propuestaPor === user.id;
    });
  }, [amistosos, user]);

  // Obtener amistosos confirmados
  const amistosConfirmados = useMemo(() => {
    if (!user) return [];
    
    const misEquipos = obtenerEquiposPorEntrenador(user.id);
    const misEquiposIds = misEquipos.map(e => e.id);
    
    return amistosos.filter(amistoso => {
      return amistoso.estado === 'Confirmado' && 
             (misEquiposIds.includes(amistoso.equipoLocalId) || 
              (amistoso.equipoVisitanteId && misEquiposIds.includes(amistoso.equipoVisitanteId)));
    });
  }, [amistosos, user, obtenerEquiposPorEntrenador]);

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermissions();
      if (granted) {
        Alert.alert(
          '✅ Permisos concedidos',
          'Las notificaciones están ahora habilitadas. Recibirás alertas sobre partidos, resultados y más.',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert(
          '❌ Permisos denegados',
          'Para recibir notificaciones, ve a Configuración > Notificaciones y habilita los permisos para esta app.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron solicitar los permisos de notificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = async (key: keyof typeof preferences, value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la preferencia');
    }
  };

  const handleTestNotification = async () => {
    if (!isEnabled) {
      Alert.alert('Notificaciones deshabilitadas', 'Primero habilita las notificaciones');
      return;
    }

    try {
      await sendLocalNotification(
        '🧪 Notificación de prueba',
        'Esta es una notificación de prueba para verificar que todo funciona correctamente.',
        { type: 'test' }
      );
      
      if (Platform.OS !== 'web') {
        Alert.alert('✅ Enviada', 'Notificación de prueba enviada correctamente');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la notificación de prueba');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Cancelar todas las notificaciones',
      '¿Estás seguro de que quieres cancelar todas las notificaciones programadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllNotifications();
              Alert.alert('✅ Completado', 'Todas las notificaciones han sido canceladas');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron cancelar las notificaciones');
            }
          },
        },
      ]
    );
  };

  const handleClearBadge = async () => {
    try {
      await clearBadge();
      Alert.alert('✅ Completado', 'Badge de notificaciones limpiado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo limpiar el badge');
    }
  };

  const handleAceptarPropuesta = async (amistosoId: string) => {
    try {
      await aceptarAmistoso(amistosoId);
      Alert.alert('✅ Propuesta aceptada', 'El amistoso ha sido confirmado. Puedes contactar al otro entrenador para coordinar detalles.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo aceptar la propuesta');
    }
  };

  const handleRechazarPropuesta = async (amistosoId: string) => {
    Alert.alert(
      'Rechazar propuesta',
      '¿Estás seguro de que quieres rechazar esta propuesta de amistoso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await rechazarAmistoso(amistosoId);
              Alert.alert('Propuesta rechazada', 'La propuesta ha sido rechazada.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar la propuesta');
            }
          }
        }
      ]
    );
  };

  const abrirModalContacto = (entrenadorId: string, equipoNombre: string) => {
    // En una app real, aquí buscarías los datos del entrenador
    // Por ahora usamos datos de ejemplo
    setContactoSeleccionado({
      nombre: `Entrenador de ${equipoNombre}`,
      telefono: '+34 600 123 456',
      email: 'entrenador@club.com',
      equipoNombre
    });
    setMensaje(`Hola, soy el entrenador de [tu equipo]. Me gustaría coordinar los detalles del amistoso confirmado.`);
    setMostrarModalContacto(true);
  };

  const handleLlamar = () => {
    if (!contactoSeleccionado?.telefono) return;
    
    if (Platform.OS === 'web') {
      window.open(`tel:${contactoSeleccionado.telefono}`);
    } else {
      // En móvil usaría Linking.openURL
      Alert.alert('Llamar', `Llamando a ${contactoSeleccionado.telefono}`);
    }
  };

  const handleEnviarEmail = () => {
    if (!contactoSeleccionado?.email) return;
    
    const subject = `Amistoso - ${contactoSeleccionado.equipoNombre}`;
    const body = mensaje;
    
    if (Platform.OS === 'web') {
      window.open(`mailto:${contactoSeleccionado.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      // En móvil usaría Linking.openURL
      Alert.alert('Email', `Enviando email a ${contactoSeleccionado.email}`);
    }
  };

  const handleCompartirContacto = async () => {
    if (!contactoSeleccionado) return;
    
    const textoCompartir = `Contacto del entrenador:\n${contactoSeleccionado.nombre}\n${contactoSeleccionado.telefono}\n${contactoSeleccionado.email}\n\nMensaje:\n${mensaje}`;
    
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(textoCompartir);
        Alert.alert('Copiado', 'Información copiada al portapapeles');
      } else {
        await Share.share({
          message: textoCompartir,
          title: 'Contacto del entrenador'
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la información');
    }
  };

  const renderPropuestaRecibida = (amistoso: any) => {
    const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
    const equipoVisitante = equipos.find(e => e.id === amistoso.equipoVisitanteId);
    
    return (
      <View key={amistoso.id} style={styles.propuestaCard}>
        <View style={styles.propuestaHeader}>
          <MessageCircle size={20} color={Colors.primary} />
          <Text style={styles.propuestaTitulo}>Nueva propuesta de amistoso</Text>
        </View>
        
        <View style={styles.propuestaInfo}>
          <Text style={styles.propuestaEquipos}>
            {equipoLocal?.nombre} vs {equipoVisitante?.nombre}
          </Text>
          <View style={styles.propuestaDetalles}>
            <View style={styles.propuestaDetalle}>
              <Calendar size={16} color={Colors.textLight} />
              <Text style={styles.propuestaTexto}>{amistoso.fecha}</Text>
            </View>
            <View style={styles.propuestaDetalle}>
              <Clock size={16} color={Colors.textLight} />
              <Text style={styles.propuestaTexto}>{amistoso.hora}</Text>
            </View>
            <View style={styles.propuestaDetalle}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.propuestaTexto} numberOfLines={1}>
                {amistoso.ubicacion.direccion}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.propuestaAcciones}>
          <TouchableOpacity
            style={[styles.propuestaBoton, styles.rechazarBoton]}
            onPress={() => handleRechazarPropuesta(amistoso.id)}
          >
            <X size={16} color="#FFFFFF" />
            <Text style={styles.propuestaBotonTexto}>Rechazar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.propuestaBoton, styles.aceptarBoton]}
            onPress={() => handleAceptarPropuesta(amistoso.id)}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.propuestaBotonTexto}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAmistosoConfirmado = (amistoso: any) => {
    const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
    const equipoVisitante = equipos.find(e => e.id === amistoso.equipoVisitanteId);
    const otroEntrenadorId = amistoso.propuestaPor === user?.id ? amistoso.propuestaA : amistoso.propuestaPor;
    const otroEquipo = amistoso.propuestaPor === user?.id ? equipoVisitante : equipoLocal;
    
    return (
      <View key={amistoso.id} style={styles.confirmadoCard}>
        <View style={styles.confirmadoHeader}>
          <Trophy size={20} color={Colors.success} />
          <Text style={styles.confirmadoTitulo}>Amistoso confirmado</Text>
        </View>
        
        <View style={styles.confirmadoInfo}>
          <Text style={styles.confirmadoEquipos}>
            {equipoLocal?.nombre} vs {equipoVisitante?.nombre}
          </Text>
          <View style={styles.confirmadoDetalles}>
            <View style={styles.confirmadoDetalle}>
              <Calendar size={16} color={Colors.textLight} />
              <Text style={styles.confirmadoTexto}>{amistoso.fecha}</Text>
            </View>
            <View style={styles.confirmadoDetalle}>
              <Clock size={16} color={Colors.textLight} />
              <Text style={styles.confirmadoTexto}>{amistoso.hora}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.confirmadoAcciones}>
          <TouchableOpacity
            style={styles.contactoBoton}
            onPress={() => abrirModalContacto(otroEntrenadorId!, otroEquipo?.nombre || 'Equipo')}
          >
            <MessageCircle size={16} color="#FFFFFF" />
            <Text style={styles.contactoBotonTexto}>Contactar Entrenador</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.verDetallesBoton}
            onPress={() => router.push(`/(tabs)/(amistosos)/${amistoso.id}`)}
          >
            <Text style={styles.verDetallesTexto}>Ver detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const preferenceItems = [
    {
      key: 'partidosProximos' as const,
      title: 'Partidos próximos',
      description: 'Recibe alertas 30 minutos antes de cada partido',
      icon: Clock,
      color: '#3B82F6',
    },
    {
      key: 'resultadosPartidos' as const,
      title: 'Resultados de partidos',
      description: 'Notificaciones inmediatas cuando se registren resultados',
      icon: Trophy,
      color: '#10B981',
    },
    {
      key: 'nuevosEquiposEnTorneo' as const,
      title: 'Nuevos equipos',
      description: 'Cuando un equipo se inscriba en tus torneos',
      icon: Users,
      color: '#8B5CF6',
    },
    {
      key: 'cambiosEnTorneo' as const,
      title: 'Cambios en torneos',
      description: 'Modificaciones en fechas, horarios o configuración',
      icon: Calendar,
      color: '#F59E0B',
    },
    {
      key: 'recordatoriosPartidos' as const,
      title: 'Recordatorios',
      description: 'Recordatorios personalizados de eventos importantes',
      icon: Bell,
      color: '#EF4444',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notificaciones',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#FFFFFF',
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Estado de permisos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Smartphone size={24} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Estado de Notificaciones</Text>
          </View>
          
          <View style={[styles.statusCard, isEnabled ? styles.statusEnabled : styles.statusDisabled]}>
            <View style={styles.statusContent}>
              <Text style={[styles.statusTitle, isEnabled ? styles.statusTitleEnabled : styles.statusTitleDisabled]}>
                {isEnabled ? '✅ Habilitadas' : '❌ Deshabilitadas'}
              </Text>
              <Text style={[styles.statusDescription, isEnabled ? styles.statusDescriptionEnabled : styles.statusDescriptionDisabled]}>
                {isEnabled 
                  ? 'Las notificaciones están funcionando correctamente'
                  : Platform.OS === 'web' 
                    ? 'Las notificaciones no están disponibles en web'
                    : 'Toca para habilitar las notificaciones'
                }
              </Text>
            </View>
            
            {!isEnabled && Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={handlePermissionRequest}
                disabled={isLoading}
              >
                <Text style={styles.enableButtonText}>
                  {isLoading ? 'Solicitando...' : 'Habilitar'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Preferencias de notificación */}
        {isEnabled && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Preferencias</Text>
            </View>
            
            {preferenceItems.map((item) => (
              <View key={item.key} style={styles.preferenceItem}>
                <View style={styles.preferenceContent}>
                  <View style={[styles.preferenceIcon, { backgroundColor: `${item.color}20` }]}>
                    <item.icon size={20} color={item.color} />
                  </View>
                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>{item.title}</Text>
                    <Text style={styles.preferenceDescription}>{item.description}</Text>
                  </View>
                </View>
                <Switch
                  value={preferences[item.key]}
                  onValueChange={(value) => handlePreferenceChange(item.key, value)}
                  trackColor={{ false: '#374151', true: '#3B82F6' }}
                  thumbColor={preferences[item.key] ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            ))}
          </View>
        )}

        {/* Información de notificaciones programadas */}
        {isEnabled && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Notificaciones Programadas</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                {scheduledNotifications.length} notificaciones programadas
              </Text>
              <Text style={styles.infoDescription}>
                Estas notificaciones se enviarán automáticamente en las fechas programadas
              </Text>
            </View>
          </View>
        )}

        {/* Acciones */}
        {isEnabled && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Volume2 size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Acciones</Text>
            </View>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleTestNotification}>
              <Text style={styles.actionButtonText}>🧪 Enviar notificación de prueba</Text>
            </TouchableOpacity>
            
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.actionButton} onPress={handleClearBadge}>
                <Text style={styles.actionButtonText}>🔢 Limpiar badge de notificaciones</Text>
              </TouchableOpacity>
            )}
            
            {scheduledNotifications.length > 0 && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.dangerButton]} 
                onPress={handleClearAll}
              >
                <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                  🗑️ Cancelar todas las notificaciones
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Propuestas de amistosos recibidas */}
        {propuestasRecibidas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MessageCircle size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Propuestas Recibidas ({propuestasRecibidas.length})</Text>
            </View>
            
            {propuestasRecibidas.map(renderPropuestaRecibida)}
          </View>
        )}

        {/* Amistosos confirmados */}
        {amistosConfirmados.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Trophy size={24} color={Colors.success} />
              <Text style={styles.sectionTitle}>Amistosos Confirmados ({amistosConfirmados.length})</Text>
            </View>
            
            {amistosConfirmados.map(renderAmistosoConfirmado)}
          </View>
        )}

        {/* Propuestas enviadas */}
        {propuestasEnviadas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Send size={24} color={Colors.warning} />
              <Text style={styles.sectionTitle}>Propuestas Enviadas ({propuestasEnviadas.length})</Text>
            </View>
            
            {propuestasEnviadas.map((amistoso) => {
              const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
              const equipoVisitante = equipos.find(e => e.id === amistoso.equipoVisitanteId);
              
              return (
                <View key={amistoso.id} style={styles.enviadaCard}>
                  <View style={styles.enviadaHeader}>
                    <Send size={20} color={Colors.warning} />
                    <Text style={styles.enviadaTitulo}>Propuesta enviada</Text>
                  </View>
                  
                  <Text style={styles.enviadaEquipos}>
                    {equipoLocal?.nombre} vs {equipoVisitante?.nombre}
                  </Text>
                  <Text style={styles.enviadaFecha}>{amistoso.fecha} - {amistoso.hora}</Text>
                  <Text style={styles.enviadaEstado}>Esperando respuesta...</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.section}>
          <Text style={styles.infoText}>
            💡 Las notificaciones te ayudan a mantenerte al día con tus torneos y partidos. 
            Puedes personalizar qué tipos de notificaciones quieres recibir.
          </Text>
          
          {Platform.OS !== 'web' && (
            <Text style={styles.infoText}>
              📱 Si no recibes notificaciones, verifica que estén habilitadas en la configuración 
              de tu dispositivo para esta aplicación.
            </Text>
          )}
        </View>
      </ScrollView>

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

            {contactoSeleccionado && (
              <>
                <View style={styles.contactoInfo}>
                  <Text style={styles.contactoNombre}>{contactoSeleccionado.nombre}</Text>
                  <Text style={styles.contactoEquipo}>{contactoSeleccionado.equipoNombre}</Text>
                  
                  <View style={styles.contactoDetalles}>
                    {contactoSeleccionado.telefono && (
                      <View style={styles.contactoDetalle}>
                        <Phone size={16} color={Colors.primary} />
                        <Text style={styles.contactoTexto}>{contactoSeleccionado.telefono}</Text>
                      </View>
                    )}
                    {contactoSeleccionado.email && (
                      <View style={styles.contactoDetalle}>
                        <Mail size={16} color={Colors.primary} />
                        <Text style={styles.contactoTexto}>{contactoSeleccionado.email}</Text>
                      </View>
                    )}
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
                  {contactoSeleccionado.telefono && (
                    <TouchableOpacity
                      style={[styles.contactoAccion, styles.llamarAccion]}
                      onPress={handleLlamar}
                    >
                      <Phone size={16} color="#FFFFFF" />
                      <Text style={styles.contactoAccionTexto}>Llamar</Text>
                    </TouchableOpacity>
                  )}
                  
                  {contactoSeleccionado.email && (
                    <TouchableOpacity
                      style={[styles.contactoAccion, styles.emailAccion]}
                      onPress={handleEnviarEmail}
                    >
                      <Mail size={16} color="#FFFFFF" />
                      <Text style={styles.contactoAccionTexto}>Email</Text>
                    </TouchableOpacity>
                  )}
                  
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusEnabled: {
    backgroundColor: '#065F4620',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusDisabled: {
    backgroundColor: '#7F1D1D20',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusTitleEnabled: {
    color: '#10B981',
  },
  statusTitleDisabled: {
    color: '#EF4444',
  },
  statusDescription: {
    fontSize: 14,
  },
  statusDescriptionEnabled: {
    color: '#6EE7B7',
  },
  statusDescriptionDisabled: {
    color: '#FCA5A5',
  },
  enableButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  preferenceText: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  infoCard: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actionButton: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  dangerButton: {
    backgroundColor: '#7F1D1D20',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerButtonText: {
    color: '#EF4444',
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  // Estilos para propuestas
  propuestaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  propuestaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  propuestaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  propuestaInfo: {
    marginBottom: 16,
  },
  propuestaEquipos: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  propuestaDetalles: {
    gap: 4,
  },
  propuestaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  propuestaTexto: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  propuestaAcciones: {
    flexDirection: 'row',
    gap: 12,
  },
  propuestaBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rechazarBoton: {
    backgroundColor: Colors.error,
  },
  aceptarBoton: {
    backgroundColor: Colors.success,
  },
  propuestaBotonTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para amistosos confirmados
  confirmadoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },
  confirmadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  confirmadoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  confirmadoInfo: {
    marginBottom: 16,
  },
  confirmadoEquipos: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  confirmadoDetalles: {
    flexDirection: 'row',
    gap: 16,
  },
  confirmadoDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmadoTexto: {
    fontSize: 14,
    color: Colors.textLight,
  },
  confirmadoAcciones: {
    flexDirection: 'row',
    gap: 12,
  },
  contactoBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  contactoBotonTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  verDetallesBoton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verDetallesTexto: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos para propuestas enviadas
  enviadaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  enviadaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  enviadaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.warning,
  },
  enviadaEquipos: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  enviadaFecha: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  enviadaEstado: {
    fontSize: 14,
    color: Colors.warning,
    fontStyle: 'italic',
  },
  // Estilos para modal de contacto
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
    maxHeight: '80%',
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