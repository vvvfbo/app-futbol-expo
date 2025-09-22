import ContextualMatchTimer from '@/components/ContextualMatchTimer';
import Colors from '@/constants/colors';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { EventoPartido } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, Clock, Edit3, Plus, Target, Trophy, User, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PartidoDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { partidos, equipos, actualizarResultado, actualizarPartido, campos, torneos, agregarEvento } = useData();
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [goleadores, setGoleadores] = useState<{ equipoId: string; jugadorId: string; minuto: number }[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGoleadoresModal, setShowGoleadoresModal] = useState(false);
  const [editFecha, setEditFecha] = useState('');
  const [editHora, setEditHora] = useState('');
  const [selectedEquipo, setSelectedEquipo] = useState('');
  const [selectedJugador, setSelectedJugador] = useState('');
  const [minutoGol, setMinutoGol] = useState('');

  const partido = partidos.find(p => p.id === id);
  const equipoLocal = equipos.find(e => e.id === partido?.equipoLocalId);
  const equipoVisitante = equipos.find(e => e.id === partido?.equipoVisitanteId);
  const campo = campos.find(c => c.id === partido?.campoId);
  const torneo = torneos.find(t => t.id === partido?.torneoId);
  const isEntrenador = user?.rol === 'entrenador';

  useEffect(() => {
    if (partido) {
      setEditFecha(partido.fecha);
      setEditHora(partido.hora);
      setGoleadores(partido.goleadores || []);
      if (partido.golesLocal !== undefined) setGolesLocal(partido.golesLocal.toString());
      if (partido.golesVisitante !== undefined) setGolesVisitante(partido.golesVisitante.toString());
    }
  }, [partido]);

  if (!partido || !equipoLocal || !equipoVisitante) {
    return (
      <View style={styles.container}>
        <Text>Partido no encontrado</Text>
      </View>
    );
  }

  const handleGuardarResultado = async () => {
    if (!golesLocal || !golesVisitante) {
      Alert.alert('Error', 'Por favor ingresa el resultado completo');
      return;
    }

    const golesLocalNum = parseInt(golesLocal);
    const golesVisitanteNum = parseInt(golesVisitante);
    const totalGoles = golesLocalNum + golesVisitanteNum;

    if (goleadores.length !== totalGoles) {
      Alert.alert('Error', `El número de goleadores (${goleadores.length}) no coincide con el total de goles (${totalGoles})`);
      return;
    }

    await actualizarResultado(
      partido.id,
      golesLocalNum,
      golesVisitanteNum,
      goleadores
    );

    Alert.alert('Éxito', 'Resultado guardado correctamente');
    router.back();
  };

  const handleEditarPartido = async () => {
    if (!editFecha || !editHora) {
      Alert.alert('Error', 'Por favor completa fecha y hora');
      return;
    }

    await actualizarPartido(partido.id, {
      fecha: editFecha,
      hora: editHora
    });

    setShowEditModal(false);
    Alert.alert('Éxito', 'Partido actualizado correctamente');
  };

  const handleAgregarGoleador = () => {
    if (!selectedEquipo || !selectedJugador || !minutoGol) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const nuevoGoleador = {
      equipoId: selectedEquipo,
      jugadorId: selectedJugador,
      minuto: parseInt(minutoGol)
    };

    setGoleadores([...goleadores, nuevoGoleador]);
    setSelectedEquipo('');
    setSelectedJugador('');
    setMinutoGol('');
  };

  const handleEliminarGoleador = (index: number) => {
    const nuevosGoleadores = goleadores.filter((_, i) => i !== index);
    setGoleadores(nuevosGoleadores);
  };

  const getJugadoresEquipo = (equipoId: string) => {
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo?.jugadores || [];
  };

  const getNombreJugador = (equipoId: string, jugadorId: string) => {
    const equipo = equipos.find(e => e.id === equipoId);
    const jugador = equipo?.jugadores.find(j => j.id === jugadorId);
    return jugador?.nombre || 'Desconocido';
  };

  const getNombreEquipo = (equipoId: string) => {
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo?.nombre || 'Desconocido';
  };

  // Función para manejar eventos del cronómetro
  const handleEventoCreado = async (evento: EventoPartido) => {
    if (partido?.id) {
      await agregarEvento(partido.id, evento);
    }
  };

  // Función para manejar finalización del partido
  const handlePartidoFinalizado = async (golesLocal: number, golesVisitante: number) => {
    if (partido?.id) {
      await actualizarResultado(partido.id, golesLocal, golesVisitante);
      Alert.alert('Partido Finalizado', 'El resultado ha sido guardado correctamente');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.jornada}>Jornada {partido.jornada}</Text>
        <View style={styles.dateTime}>
          <View style={styles.dateItem}>
            <Calendar size={16} color={Colors.textLight} />
            <Text style={styles.dateText}>{partido.fecha}</Text>
          </View>
          <View style={styles.dateItem}>
            <Clock size={16} color={Colors.textLight} />
            <Text style={styles.dateText}>{partido.hora}</Text>
          </View>
        </View>
      </View>

      {/* Cronómetro contextual del partido */}
      {torneo && (
        <ContextualMatchTimer
          partido={partido}
          torneo={torneo}
          onEventoCreado={handleEventoCreado}
          onPartidoFinalizado={handlePartidoFinalizado}
        />
      )}

      <View style={styles.matchContent}>
        <View style={styles.team}>
          <View style={styles.teamColors}>
            <View style={[styles.colorBar, { backgroundColor: equipoLocal.colores.principal }]} />
            <View style={[styles.colorBar, { backgroundColor: equipoLocal.colores.secundario }]} />
          </View>
          <Text style={styles.teamName}>{equipoLocal.nombre}</Text>
          <Text style={styles.teamLabel}>Local</Text>
        </View>

        <View style={styles.scoreSection}>
          {partido.estado === 'Jugado' ? (
            <View style={styles.finalScore}>
              <Text style={styles.scoreNumber}>{partido.golesLocal}</Text>
              <Text style={styles.scoreSeparator}>-</Text>
              <Text style={styles.scoreNumber}>{partido.golesVisitante}</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.vsText}>VS</Text>
              {isEntrenador && (
                <View style={styles.scoreInputs}>
                  <TextInput
                    style={styles.scoreInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textLight}
                    value={golesLocal}
                    onChangeText={setGolesLocal}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  <Text style={styles.inputSeparator}>-</Text>
                  <TextInput
                    style={styles.scoreInput}
                    placeholder="0"
                    placeholderTextColor={Colors.textLight}
                    value={golesVisitante}
                    onChangeText={setGolesVisitante}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.team}>
          <View style={styles.teamColors}>
            <View style={[styles.colorBar, { backgroundColor: equipoVisitante.colores.principal }]} />
            <View style={[styles.colorBar, { backgroundColor: equipoVisitante.colores.secundario }]} />
          </View>
          <Text style={styles.teamName}>{equipoVisitante.nombre}</Text>
          <Text style={styles.teamLabel}>Visitante</Text>
        </View>
      </View>

      {isEntrenador && (
        <View style={styles.actions}>
          {partido.estado === 'Pendiente' && (
            <>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setShowEditModal(true)}
              >
                <Edit3 size={20} color={Colors.primary} />
                <Text style={styles.editButtonText}>Editar Partido</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.goleadoresButton}
                onPress={() => setShowGoleadoresModal(true)}
              >
                <Target size={20} color={Colors.primary} />
                <Text style={styles.goleadoresButtonText}>Goleadores ({goleadores.length})</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleGuardarResultado}
              >
                <Trophy size={20} color="white" />
                <Text style={styles.saveButtonText}>Guardar Resultado</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {partido.estado === 'Jugado' && (
        <View style={styles.finishedSection}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Partido Finalizado</Text>
          </View>

          {partido.goleadores && partido.goleadores.length > 0 && (
            <View style={styles.goleadoresSection}>
              <Text style={styles.goleadoresTitulo}>Goleadores</Text>
              {partido.goleadores.map((gol, index) => (
                <View key={index} style={styles.goleadorItem}>
                  <Target size={16} color={Colors.primary} />
                  <Text style={styles.goleadorNombre}>
                    {getNombreJugador(gol.equipoId, gol.jugadorId)}
                  </Text>
                  <Text style={styles.goleadorEquipo}>
                    ({getNombreEquipo(gol.equipoId)})
                  </Text>
                  <Text style={styles.goleadorMinuto}>{gol.minuto}'</Text>
                </View>
              ))}
            </View>
          )}

          {campo && (
            <View style={styles.campoInfo}>
              <Text style={styles.campoTitulo}>Campo</Text>
              <Text style={styles.campoNombre}>{campo.nombre}</Text>
              <Text style={styles.campoDireccion}>{campo.direccion}</Text>
            </View>
          )}
        </View>
      )}

      {/* Modal para editar partido */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Partido</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Fecha</Text>
              <TextInput
                style={styles.modalInput}
                value={editFecha}
                onChangeText={setEditFecha}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textLight}
              />

              <Text style={styles.modalLabel}>Hora</Text>
              <TextInput
                style={styles.modalInput}
                value={editHora}
                onChangeText={setEditHora}
                placeholder="HH:MM"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleEditarPartido}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para goleadores */}
      <Modal
        visible={showGoleadoresModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoleadoresModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Goleadores</Text>
              <TouchableOpacity onPress={() => setShowGoleadoresModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Lista de goleadores actuales */}
              {goleadores.map((gol, index) => (
                <View key={index} style={styles.goleadorCard}>
                  <View style={styles.goleadorInfo}>
                    <Target size={16} color={Colors.primary} />
                    <Text style={styles.goleadorCardNombre}>
                      {getNombreJugador(gol.equipoId, gol.jugadorId)}
                    </Text>
                    <Text style={styles.goleadorCardEquipo}>
                      ({getNombreEquipo(gol.equipoId)})
                    </Text>
                    <Text style={styles.goleadorCardMinuto}>{gol.minuto}'</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleEliminarGoleador(index)}
                    style={styles.deleteButton}
                  >
                    <X size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Formulario para agregar goleador */}
              <View style={styles.addGoleadorForm}>
                <Text style={styles.formTitle}>Agregar Goleador</Text>

                <Text style={styles.modalLabel}>Equipo</Text>
                <View style={styles.equipoButtons}>
                  <TouchableOpacity
                    style={[styles.equipoButton, selectedEquipo === equipoLocal?.id && styles.equipoButtonActive]}
                    onPress={() => setSelectedEquipo(equipoLocal?.id || '')}
                  >
                    <Text style={[styles.equipoButtonText, selectedEquipo === equipoLocal?.id && styles.equipoButtonTextActive]}>
                      {equipoLocal?.nombre}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.equipoButton, selectedEquipo === equipoVisitante?.id && styles.equipoButtonActive]}
                    onPress={() => setSelectedEquipo(equipoVisitante?.id || '')}
                  >
                    <Text style={[styles.equipoButtonText, selectedEquipo === equipoVisitante?.id && styles.equipoButtonTextActive]}>
                      {equipoVisitante?.nombre}
                    </Text>
                  </TouchableOpacity>
                </View>

                {selectedEquipo && (
                  <>
                    <Text style={styles.modalLabel}>Jugador</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.jugadoresScroll}>
                      {getJugadoresEquipo(selectedEquipo).map(jugador => (
                        <TouchableOpacity
                          key={jugador.id}
                          style={[styles.jugadorButton, selectedJugador === jugador.id && styles.jugadorButtonActive]}
                          onPress={() => setSelectedJugador(jugador.id)}
                        >
                          <User size={14} color={selectedJugador === jugador.id ? 'white' : Colors.textLight} />
                          <Text style={[styles.jugadorButtonText, selectedJugador === jugador.id && styles.jugadorButtonTextActive]}>
                            {jugador.nombre}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                <Text style={styles.modalLabel}>Minuto</Text>
                <TextInput
                  style={styles.modalInput}
                  value={minutoGol}
                  onChangeText={setMinutoGol}
                  placeholder="90"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAgregarGoleador}
                >
                  <Plus size={20} color="white" />
                  <Text style={styles.addButtonText}>Agregar Gol</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  jornada: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  dateTime: {
    flexDirection: 'row',
    gap: 20,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamColors: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  colorBar: {
    width: 30,
    height: 6,
    borderRadius: 3,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  teamLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  scoreSection: {
    paddingHorizontal: 20,
  },
  finalScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scoreSeparator: {
    fontSize: 24,
    color: Colors.textLight,
    marginHorizontal: 8,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInput: {
    width: 50,
    height: 50,
    backgroundColor: Colors.background,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputSeparator: {
    fontSize: 20,
    color: Colors.textLight,
    marginHorizontal: 12,
  },
  actions: {
    marginTop: 40,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingVertical: 12,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  goleadoresButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  goleadoresButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  finishedSection: {
    marginTop: 40,
  },
  goleadoresSection: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  goleadoresTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  goleadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  goleadorNombre: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  goleadorEquipo: {
    fontSize: 14,
    color: Colors.textLight,
  },
  goleadorMinuto: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  campoInfo: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  campoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  campoNombre: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  campoDireccion: {
    fontSize: 14,
    color: Colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  modalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  goleadorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  goleadorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  goleadorCardNombre: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  goleadorCardEquipo: {
    fontSize: 14,
    color: Colors.textLight,
  },
  goleadorCardMinuto: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  deleteButton: {
    padding: 8,
  },
  addGoleadorForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  equipoButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  equipoButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  equipoButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  equipoButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  equipoButtonTextActive: {
    color: 'white',
  },
  jugadoresScroll: {
    marginBottom: 16,
  },
  jugadorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  jugadorButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  jugadorButtonText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  jugadorButtonTextActive: {
    color: 'white',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});