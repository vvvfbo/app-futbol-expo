import Colors from '@/constants/colors';
import { useData } from '@/hooks/data-context';
import { Equipo, Partido, Torneo } from '@/types';
import { ArrowLeftRight, Calendar, Save, Shuffle, Users, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface TorneoManagementModalProps {
  visible: boolean;
  onClose: () => void;
  torneo: Torneo;
  equipos: Equipo[];
  partidos: Partido[];
}

type TabType = 'equipos' | 'partidos' | 'sorteo';

export default function TorneoManagementModal({
  visible,
  onClose,
  torneo,
  equipos,
  partidos
}: TorneoManagementModalProps) {
  const { actualizarTorneo, editarPartido, crearPartidos } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('equipos');
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([]);
  const [equiposSeleccionados, setEquiposSeleccionados] = useState<string[]>([]);
  const [partidosEditables, setPartidosEditables] = useState<Partido[]>([]);
  const [editingPartido, setEditingPartido] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ fecha: '', hora: '', equipoLocalId: '', equipoVisitanteId: '' });

  useEffect(() => {
    if (visible) {
      // Filtrar equipos disponibles por categoría y tipo
      const disponibles = equipos.filter(e =>
        e.categoria === torneo.categoria &&
        e.tipoFutbol === torneo.tipoFutbol
      );
      setEquiposDisponibles(disponibles);
      setEquiposSeleccionados([...torneo.equiposIds]);
      setPartidosEditables([...partidos]);
    }
  }, [visible, equipos, torneo, partidos]);

  const mezclarEquipos = (equiposIds: string[]): string[] => {
    const equiposMezclados = [...equiposIds];
    for (let i = equiposMezclados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [equiposMezclados[i], equiposMezclados[j]] = [equiposMezclados[j], equiposMezclados[i]];
    }
    return equiposMezclados;
  };

  const handleSorteoEquipos = async () => {
    Alert.alert(
      'Sorteo de Equipos',
      '¿Estás seguro de que quieres realizar un nuevo sorteo? Esto reorganizará todos los grupos y partidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sortear',
          onPress: async () => {
            const equiposSorteados = mezclarEquipos(equiposSeleccionados);
            setEquiposSeleccionados(equiposSorteados);
            await actualizarTorneo(torneo.id, { equiposIds: equiposSorteados });
            Alert.alert('Éxito', 'Sorteo realizado correctamente. Los equipos han sido reorganizados.');
          }
        }
      ]
    );
  };

  const toggleEquipo = (equipoId: string) => {
    setEquiposSeleccionados(prev => {
      if (prev.includes(equipoId)) {
        return prev.filter(id => id !== equipoId);
      } else {
        return [...prev, equipoId];
      }
    });
  };

  const handleSaveEquipos = async () => {
    if (equiposSeleccionados.length < 2) {
      Alert.alert('Error', 'Selecciona al menos 2 equipos');
      return;
    }

    try {
      await actualizarTorneo(torneo.id, { equiposIds: equiposSeleccionados });
      Alert.alert('Éxito', 'Equipos actualizados correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar los equipos');
    }
  };

  const handleEditPartido = (partido: Partido) => {
    setEditingPartido(partido.id);
    setEditForm({
      fecha: partido.fecha,
      hora: partido.hora,
      equipoLocalId: partido.equipoLocalId,
      equipoVisitanteId: partido.equipoVisitanteId
    });
  };

  const handleSavePartido = async () => {
    if (!editingPartido) return;

    try {
      await editarPartido(editingPartido, {
        fecha: editForm.fecha,
        hora: editForm.hora,
        equipoLocalId: editForm.equipoLocalId,
        equipoVisitanteId: editForm.equipoVisitanteId
      });
      setEditingPartido(null);
      Alert.alert('Éxito', 'Partido actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el partido');
    }
  };

  const renderEquiposTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Equipos Participantes</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEquipos}>
          <Save size={16} color="white" />
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.equiposList}>
        {equiposDisponibles.map(equipo => (
          <TouchableOpacity
            key={equipo.id}
            style={[
              styles.equipoItem,
              equiposSeleccionados.includes(equipo.id) && styles.equipoItemSelected
            ]}
            onPress={() => toggleEquipo(equipo.id)}
          >
            <View style={styles.equipoInfo}>
              <Text style={styles.equipoName}>{equipo.nombre}</Text>
              <View style={styles.equipoColors}>
                <View style={[styles.colorDot, { backgroundColor: equipo.colores.principal }]} />
                <View style={[styles.colorDot, { backgroundColor: equipo.colores.secundario }]} />
              </View>
            </View>
            {equiposSeleccionados.includes(equipo.id) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.selectedCount}>
        <Users size={20} color={Colors.primary} />
        <Text style={styles.selectedCountText}>
          {equiposSeleccionados.length} equipos seleccionados
        </Text>
      </View>
    </View>
  );

  const renderPartidosTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Gestión de Partidos</Text>

      <ScrollView style={styles.partidosList}>
        {partidosEditables.map(partido => {
          const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
          const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);
          const isEditing = editingPartido === partido.id;

          return (
            <View key={partido.id} style={styles.partidoCard}>
              <View style={styles.partidoHeader}>
                <Text style={styles.jornada}>
                  {partido.fase ? `${partido.fase.charAt(0).toUpperCase() + partido.fase.slice(1)}` : `Jornada ${partido.jornada}`}
                  {partido.grupo && ` - Grupo ${partido.grupo}`}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => isEditing ? handleSavePartido() : handleEditPartido(partido)}
                >
                  {isEditing ? (
                    <Save size={14} color={Colors.primary} />
                  ) : (
                    <ArrowLeftRight size={14} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {isEditing ? (
                <View style={styles.editForm}>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Fecha:</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editForm.fecha}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, fecha: text }))}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View style={styles.formRow}>
                    <Text style={styles.formLabel}>Hora:</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editForm.hora}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, hora: text }))}
                      placeholder="HH:MM"
                    />
                  </View>

                  <Text style={styles.equiposEditTitle}>Cambiar Equipos:</Text>
                  <View style={styles.equiposEditRow}>
                    <View style={styles.equipoSelector}>
                      <Text style={styles.selectorLabel}>Local:</Text>
                      <ScrollView style={styles.equipoSelectorScroll}>
                        {equiposSeleccionados.map(equipoId => {
                          const equipo = equipos.find(e => e.id === equipoId);
                          return (
                            <TouchableOpacity
                              key={equipoId}
                              style={[
                                styles.equipoSelectorItem,
                                editForm.equipoLocalId === equipoId && styles.equipoSelectorItemSelected
                              ]}
                              onPress={() => setEditForm(prev => ({ ...prev, equipoLocalId: equipoId }))}
                            >
                              <Text style={[
                                styles.equipoSelectorText,
                                editForm.equipoLocalId === equipoId && styles.equipoSelectorTextSelected
                              ]}>
                                {equipo?.nombre}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>

                    <View style={styles.equipoSelector}>
                      <Text style={styles.selectorLabel}>Visitante:</Text>
                      <ScrollView style={styles.equipoSelectorScroll}>
                        {equiposSeleccionados.map(equipoId => {
                          const equipo = equipos.find(e => e.id === equipoId);
                          return (
                            <TouchableOpacity
                              key={equipoId}
                              style={[
                                styles.equipoSelectorItem,
                                editForm.equipoVisitanteId === equipoId && styles.equipoSelectorItemSelected
                              ]}
                              onPress={() => setEditForm(prev => ({ ...prev, equipoVisitanteId: equipoId }))}
                            >
                              <Text style={[
                                styles.equipoSelectorText,
                                editForm.equipoVisitanteId === equipoId && styles.equipoSelectorTextSelected
                              ]}>
                                {equipo?.nombre}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.partidoContent}>
                  <Text style={styles.equipoName} numberOfLines={1}>
                    {equipoLocal?.nombre}
                  </Text>
                  <View style={styles.resultado}>
                    {partido.estado === 'Jugado' ? (
                      <Text style={styles.resultadoText}>
                        {partido.golesLocal} - {partido.golesVisitante}
                      </Text>
                    ) : (
                      <View>
                        <Text style={styles.horaText}>{partido.hora}</Text>
                        <Text style={styles.fechaText}>{partido.fecha}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.equipoName, styles.equipoVisitante]} numberOfLines={1}>
                    {equipoVisitante?.nombre}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderSorteoTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Sorteo de Equipos</Text>
      <Text style={styles.sectionDescription}>
        Realiza un nuevo sorteo aleatorio para reorganizar los equipos en el torneo.
      </Text>

      <View style={styles.sorteoContainer}>
        <TouchableOpacity style={styles.sorteoButton} onPress={handleSorteoEquipos}>
          <Shuffle size={24} color="white" />
          <Text style={styles.sorteoButtonText}>Realizar Sorteo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.equiposPreview}>
        <Text style={styles.previewTitle}>Orden Actual:</Text>
        {equiposSeleccionados.map((equipoId, index) => {
          const equipo = equipos.find(e => e.id === equipoId);
          return (
            <View key={equipoId} style={styles.equipoPreviewItem}>
              <Text style={styles.equipoPosition}>{index + 1}.</Text>
              <Text style={styles.equipoPreviewName}>{equipo?.nombre}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestionar Torneo</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.torneoInfo}>
          <Text style={styles.torneoName}>{torneo.nombre}</Text>
          <Text style={styles.torneoDetails}>
            {torneo.ciudad} • {torneo.categoria} • {torneo.tipoFutbol}
          </Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'equipos' && styles.tabActive]}
            onPress={() => setActiveTab('equipos')}
          >
            <Users size={18} color={activeTab === 'equipos' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'equipos' && styles.tabTextActive]}>
              Equipos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'partidos' && styles.tabActive]}
            onPress={() => setActiveTab('partidos')}
          >
            <Calendar size={18} color={activeTab === 'partidos' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'partidos' && styles.tabTextActive]}>
              Partidos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'sorteo' && styles.tabActive]}
            onPress={() => setActiveTab('sorteo')}
          >
            <Shuffle size={18} color={activeTab === 'sorteo' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'sorteo' && styles.tabTextActive]}>
              Sorteo
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'equipos' && renderEquiposTab()}
        {activeTab === 'partidos' && renderPartidosTab()}
        {activeTab === 'sorteo' && renderSorteoTab()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  torneoInfo: {
    padding: 20,
    backgroundColor: Colors.surface,
  },
  torneoName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  torneoDetails: {
    fontSize: 14,
    color: Colors.textLight,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  equiposList: {
    flex: 1,
    marginBottom: 16,
  },
  equipoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  equipoItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  equipoInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipoName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  equipoColors: {
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedCount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
  },
  selectedCountText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  partidosList: {
    flex: 1,
  },
  partidoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  partidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jornada: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: Colors.primary + '20',
  },
  partidoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipoVisitante: {
    textAlign: 'right',
  },
  resultado: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  resultadoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  horaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  fechaText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  vs: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  editForm: {
    gap: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  formLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    width: 60,
  },
  formInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equiposRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sorteoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sorteoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  sorteoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  equiposPreview: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  equipoPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  equipoPosition: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    width: 24,
  },
  equipoPreviewName: {
    fontSize: 14,
    color: Colors.text,
  },
  equiposEditTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  equiposEditRow: {
    flexDirection: 'row',
    gap: 12,
  },
  equipoSelector: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  equipoSelectorScroll: {
    maxHeight: 120,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipoSelectorItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  equipoSelectorItemSelected: {
    backgroundColor: Colors.primary + '20',
  },
  equipoSelectorText: {
    fontSize: 12,
    color: Colors.text,
  },
  equipoSelectorTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});