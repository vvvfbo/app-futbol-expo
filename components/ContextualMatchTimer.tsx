import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../hooks/theme-context';
import { EventoPartido, Partido, Torneo } from '../types';

interface ContextualMatchTimerProps {
  partido: Partido;
  torneo: Torneo;
  onEventoCreado: (evento: EventoPartido) => void;
  onPartidoFinalizado: (golesLocal: number, golesVisitante: number) => void;
}

export default function ContextualMatchTimer({
  partido,
  torneo,
  onEventoCreado,
  onPartidoFinalizado
}: ContextualMatchTimerProps) {
  const { colors, isDarkMode } = useTheme();

  // Estados del cronómetro
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0); // en segundos
  const [estado, setEstado] = useState<'esperando' | 'activo' | 'pausado' | 'finalizado'>('esperando');
  const [golesLocal, setGolesLocal] = useState(partido.golesLocal || 0);
  const [golesVisitante, setGolesVisitante] = useState(partido.golesVisitante || 0);

  // Modal para eventos
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoEvento, setTipoEvento] = useState<'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio'>('gol');
  const [equipoEvento, setEquipoEvento] = useState<'local' | 'visitante'>('local');
  const [descripcionEvento, setDescripcionEvento] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | number | null>(null);
  const duracionPartido = torneo.configuracion.tiempoPartido * 60; // convertir a segundos

  // Verificar si es hora de empezar el partido
  useEffect(() => {
    const verificarHoraInicio = () => {
      const ahora = new Date();
      const fechaPartido = new Date(`${partido.fecha}T${partido.hora}`);

      // Si es la hora del partido (con margen de 5 minutos)
      const diferencia = ahora.getTime() - fechaPartido.getTime();
      if (diferencia >= 0 && diferencia <= 5 * 60 * 1000 && estado === 'esperando') {
        Alert.alert(
          '⚽ ¡Hora del Partido!',
          `${partido.equipoLocalId} vs ${partido.equipoVisitanteId}\n¿Iniciar cronómetro?`,
          [
            { text: 'Después', style: 'cancel' },
            { text: 'Iniciar', onPress: iniciarCronometro }
          ]
        );
      }
    };

    const intervalVerificacion = setInterval(verificarHoraInicio, 30000); // cada 30 segundos
    return () => clearInterval(intervalVerificacion);
  }, [estado, partido]);

  // Cronómetro activo
  useEffect(() => {
    if (estado === 'activo') {
      intervalRef.current = setInterval(() => {
        setTiempoTranscurrido(prev => {
          const nuevoTiempo = prev + 1;

          // Auto finalizar cuando se acaba el tiempo
          if (nuevoTiempo >= duracionPartido) {
            finalizarPartido();
            return duracionPartido;
          }

          return nuevoTiempo;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [estado, duracionPartido]);

  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const obtenerMinutoPartido = (): number => {
    return Math.floor(tiempoTranscurrido / 60);
  };

  const iniciarCronometro = () => {
    setEstado('activo');
    crearEvento('inicio', 'local', '⚽ Inicio del partido');
  };

  const pausarCronometro = () => {
    setEstado('pausado');
    crearEvento('pausa', 'local', '⏸️ Partido pausado');
  };

  const reanudarCronometro = () => {
    setEstado('activo');
    crearEvento('reanudacion', 'local', '▶️ Partido reanudado');
  };

  const finalizarPartido = () => {
    setEstado('finalizado');
    crearEvento('final', 'local', '🏁 Final del partido');

    Alert.alert(
      '🏁 Partido Finalizado',
      `Resultado: ${golesLocal} - ${golesVisitante}\n¿Confirmar resultado?`,
      [
        { text: 'Editar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => onPartidoFinalizado(golesLocal, golesVisitante)
        }
      ]
    );
  };

  const crearEvento = (tipo: string, equipo: 'local' | 'visitante', descripcion: string) => {
    let tipoEvento: EventoPartido['tipo'];

    switch (tipo) {
      case 'gol':
        tipoEvento = 'gol';
        break;
      case 'tarjeta_amarilla':
        tipoEvento = 'tarjeta_amarilla';
        break;
      case 'tarjeta_roja':
        tipoEvento = 'tarjeta_roja';
        break;
      case 'cambio':
        tipoEvento = 'sustitucion';
        break;
      case 'inicio':
        tipoEvento = 'inicio';
        break;
      case 'final':
        tipoEvento = 'fin';
        break;
      default:
        tipoEvento = 'inicio';
    }

    const evento: EventoPartido = {
      id: Date.now().toString(),
      partidoId: partido.id,
      tipo: tipoEvento,
      minuto: obtenerMinutoPartido(),
      equipoId: equipo === 'local' ? partido.equipoLocalId : partido.equipoVisitanteId,
      descripcion
    };

    onEventoCreado(evento);
  };

  const agregarGol = (equipo: 'local' | 'visitante') => {
    if (equipo === 'local') {
      setGolesLocal(prev => prev + 1);
    } else {
      setGolesVisitante(prev => prev + 1);
    }

    crearEvento('gol', equipo, `⚽ Gol - Minuto ${obtenerMinutoPartido()}'`);
  };

  const abrirModalEvento = (tipo: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio') => {
    setTipoEvento(tipo);
    setDescripcionEvento('');
    setModalVisible(true);
  };

  const confirmarEvento = () => {
    let icono = '⚽';
    switch (tipoEvento) {
      case 'gol':
        icono = '⚽';
        agregarGol(equipoEvento);
        break;
      case 'tarjeta_amarilla':
        icono = '🟨';
        break;
      case 'tarjeta_roja':
        icono = '🟥';
        break;
      case 'cambio':
        icono = '🔄';
        break;
    }

    crearEvento(tipoEvento, equipoEvento, `${icono} ${descripcionEvento} - Min ${obtenerMinutoPartido()}'`);
    setModalVisible(false);
  };

  const obtenerColorTiempo = (): string => {
    const progreso = tiempoTranscurrido / duracionPartido;
    if (progreso >= 0.9) return '#ef4444'; // Rojo - últimos minutos
    if (progreso >= 0.75) return '#f59e0b'; // Amarillo - cuarto final
    return colors.primary; // Color normal
  };

  const puedeIniciar = estado === 'esperando';
  const puedeControllar = estado === 'activo' || estado === 'pausado';
  const partidoTerminado = estado === 'finalizado';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header del partido */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>⚽ {torneo.nombre}</Text>
        <Text style={styles.versus}>
          {partido.equipoLocalId} VS {partido.equipoVisitanteId}
        </Text>
        <Text style={styles.fechaHora}>
          📅 {partido.fecha} | 🕐 {partido.hora}
        </Text>
      </LinearGradient>

      {/* Marcador */}
      <View style={[styles.marcador, { backgroundColor: colors.card }]}>
        <View style={styles.equipoScore}>
          <Text style={[styles.equipoNombre, { color: colors.text }]}>
            {partido.equipoLocalId}
          </Text>
          <Text style={[styles.goles, { color: obtenerColorTiempo() }]}>
            {golesLocal}
          </Text>
        </View>

        <View style={styles.separador}>
          <Text style={[styles.tiempo, { color: obtenerColorTiempo() }]}>
            {formatearTiempo(tiempoTranscurrido)}
          </Text>
          <Text style={[styles.minutos, { color: colors.textSecondary }]}>
            {obtenerMinutoPartido()}' min
          </Text>
        </View>

        <View style={styles.equipoScore}>
          <Text style={[styles.equipoNombre, { color: colors.text }]}>
            {partido.equipoVisitanteId}
          </Text>
          <Text style={[styles.goles, { color: obtenerColorTiempo() }]}>
            {golesVisitante}
          </Text>
        </View>
      </View>

      {/* Controles principales */}
      {puedeIniciar && (
        <Pressable
          style={[styles.botonPrincipal, { backgroundColor: colors.success }]}
          onPress={iniciarCronometro}
        >
          <Ionicons name="play" size={32} color="white" />
          <Text style={styles.textoBotonPrincipal}>Iniciar Partido</Text>
        </Pressable>
      )}

      {puedeControllar && !partidoTerminado && (
        <View style={styles.controles}>
          <Pressable
            style={[styles.botonControl, { backgroundColor: estado === 'activo' ? colors.warning : colors.success }]}
            onPress={estado === 'activo' ? pausarCronometro : reanudarCronometro}
          >
            <Ionicons name={estado === 'activo' ? 'pause' : 'play'} size={24} color="white" />
            <Text style={styles.textoControl}>
              {estado === 'activo' ? 'Pausar' : 'Reanudar'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.botonControl, { backgroundColor: colors.error }]}
            onPress={finalizarPartido}
          >
            <Ionicons name="stop" size={24} color="white" />
            <Text style={styles.textoControl}>Finalizar</Text>
          </Pressable>
        </View>
      )}

      {/* Eventos rápidos */}
      {(estado === 'activo' || estado === 'pausado') && !partidoTerminado && (
        <View style={[styles.eventosRapidos, { backgroundColor: colors.surface }]}>
          <Text style={[styles.tituloSeccion, { color: colors.text }]}>Eventos Rápidos</Text>

          <View style={styles.botonesEventos}>
            <Pressable
              style={[styles.botonEvento, { backgroundColor: colors.accent }]}
              onPress={() => abrirModalEvento('gol')}
            >
              <Text style={styles.textoEvento}>⚽ Gol</Text>
            </Pressable>

            <Pressable
              style={[styles.botonEvento, { backgroundColor: '#FFD93D' }]}
              onPress={() => abrirModalEvento('tarjeta_amarilla')}
            >
              <Text style={styles.textoEvento}>🟨 T.A.</Text>
            </Pressable>

            <Pressable
              style={[styles.botonEvento, { backgroundColor: '#FF6B6B' }]}
              onPress={() => abrirModalEvento('tarjeta_roja')}
            >
              <Text style={styles.textoEvento}>🟥 T.R.</Text>
            </Pressable>

            <Pressable
              style={[styles.botonEvento, { backgroundColor: colors.secondary }]}
              onPress={() => abrirModalEvento('cambio')}
            >
              <Text style={styles.textoEvento}>🔄 Cambio</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Modal para crear eventos */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Agregar {tipoEvento.replace('_', ' ')}
            </Text>

            {/* Selector de equipo */}
            <View style={styles.selectorEquipo}>
              <Pressable
                style={[
                  styles.opcionEquipo,
                  {
                    backgroundColor: equipoEvento === 'local' ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setEquipoEvento('local')}
              >
                <Text style={[styles.textoOpcion, { color: equipoEvento === 'local' ? 'white' : colors.text }]}>
                  {partido.equipoLocalId}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.opcionEquipo,
                  {
                    backgroundColor: equipoEvento === 'visitante' ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setEquipoEvento('visitante')}
              >
                <Text style={[styles.textoOpcion, { color: equipoEvento === 'visitante' ? 'white' : colors.text }]}>
                  {partido.equipoVisitanteId}
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={[styles.inputDescripcion, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="Descripción del evento (ej: Jugador #10)"
              placeholderTextColor={colors.textSecondary}
              value={descripcionEvento}
              onChangeText={setDescripcionEvento}
            />

            <View style={styles.botonesModal}>
              <Pressable
                style={[styles.botonModal, { backgroundColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.textoBotonModal, { color: colors.text }]}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.botonModal, { backgroundColor: colors.primary }]}
                onPress={confirmarEvento}
              >
                <Text style={styles.textoBotonModal}>Confirmar</Text>
              </Pressable>
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
    padding: 16,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  versus: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  fechaHora: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  marcador: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipoScore: {
    alignItems: 'center',
    flex: 1,
  },
  equipoNombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  goles: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  separador: {
    alignItems: 'center',
    flex: 1,
  },
  tiempo: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  minutos: {
    fontSize: 14,
    marginTop: 4,
  },
  botonPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  textoBotonPrincipal: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  controles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  botonControl: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    flex: 0.45,
  },
  textoControl: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  eventosRapidos: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  botonesEventos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  botonEvento: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 50,
    borderRadius: 12,
    marginBottom: 8,
  },
  textoEvento: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectorEquipo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  opcionEquipo: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  textoOpcion: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputDescripcion: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
  botonesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botonModal: {
    flex: 0.45,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotonModal: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});