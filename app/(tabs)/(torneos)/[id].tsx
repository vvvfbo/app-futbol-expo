import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useData } from '@/hooks/data-context';
import { useAuth } from '@/hooks/auth-context';
import Colors from '@/constants/colors';
import { GlobalStyles, createButtonStyle, createButtonTextStyle } from '@/constants/styles';
import { Trophy, Users, Calendar, Edit3, Trash2, Target, Crown, Medal, Award, Grid3x3, Zap, Settings, X, Shuffle } from 'lucide-react-native';
import { useState } from 'react';
import TorneoManagementModal from '@/components/TorneoManagementModal';

type TabType = 'clasificacion' | 'partidos' | 'equipos' | 'goleadores' | 'grupos' | 'eliminatorias';

export default function TorneoDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { torneos, equipos, partidos, obtenerClasificacion, obtenerClasificacionPorGrupo, obtenerGoleadoresTorneo, eliminarTorneo, finalizarTorneo, generarEliminatorias, editarPartido } = useData();
  
  const torneo = torneos.find(t => t.id === id);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (torneo?.tipo === 'eliminatorias') {
      return 'eliminatorias';
    }
    return 'clasificacion';
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [editingPartido, setEditingPartido] = useState<any>(null);
  const [editForm, setEditForm] = useState({ fecha: '', hora: '' });
  const partidosTorneo = partidos.filter(p => p.torneoId === id);
  const clasificacion = obtenerClasificacion(id as string);
  const clasificacionPorGrupo = obtenerClasificacionPorGrupo(id as string);
  const equiposTorneo = equipos.filter(e => torneo?.equiposIds.includes(e.id));
  const goleadores = obtenerGoleadoresTorneo(id as string);
  const isCreador = user?.id === torneo?.creadorId;

  if (!torneo) {
    return (
      <View style={styles.container}>
        <Text>Torneo no encontrado</Text>
      </View>
    );
  }

  const handleFinalizarTorneo = () => {
    if (!torneo) return;
    
    const equiposOrdenados = clasificacion.slice(0, 3);
    
    Alert.alert(
      'Finalizar Torneo',
      `¿Estás seguro de que quieres finalizar el torneo "${torneo.nombre}"?\n\nSe asignarán automáticamente:\n🥇 Campeón: ${equipos.find(e => e.id === equiposOrdenados[0]?.equipoId)?.nombre || 'N/A'}\n🥈 Subcampeón: ${equipos.find(e => e.id === equiposOrdenados[1]?.equipoId)?.nombre || 'N/A'}\n🥉 3er Puesto: ${equipos.find(e => e.id === equiposOrdenados[2]?.equipoId)?.nombre || 'N/A'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Finalizar', 
          style: 'default',
          onPress: async () => {
            await finalizarTorneo(torneo.id, {
              campeon: equiposOrdenados[0]?.equipoId,
              subcampeon: equiposOrdenados[1]?.equipoId,
              tercerPuesto: equiposOrdenados[2]?.equipoId,
              fechaFinalizacion: new Date().toISOString()
            });
          }
        }
      ]
    );
  };

  const handleEditPartido = (partido: any) => {
    setEditingPartido(partido);
    setEditForm({ fecha: partido.fecha, hora: partido.hora });
    setShowEditModal(true);
  };

  const handleSavePartido = async () => {
    if (!editingPartido) return;
    
    try {
      await editarPartido(editingPartido.id, {
        fecha: editForm.fecha,
        hora: editForm.hora
      });
      setShowEditModal(false);
      setEditingPartido(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el partido');
    }
  };

  const handleGenerarEliminatorias = async () => {
    if (!torneo) return;
    
    Alert.alert(
      'Generar Eliminatorias',
      '¿Estás seguro de que quieres generar la fase de eliminatorias? Se tomarán los mejores equipos de cada grupo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Generar', 
          onPress: async () => {
            try {
              await generarEliminatorias(torneo.id);
              Alert.alert('Éxito', 'Fase de eliminatorias generada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo generar la fase de eliminatorias');
            }
          }
        }
      ]
    );
  };

  const renderEliminatorias = () => {
    const partidosEliminatorias = partidosTorneo.filter(p => p.fase && p.fase !== 'grupos');
    const fases = ['octavos', 'cuartos', 'semifinal', 'final'];
    
    if (partidosEliminatorias.length === 0) {
      return (
        <View style={styles.emptyEliminatorias}>
          <Text style={styles.emptyText}>No hay eliminatorias generadas</Text>
          {torneo.tipo === 'grupos-eliminatorias' && torneo.faseActual === 'grupos' && (
            <TouchableOpacity 
              style={[...createButtonStyle('medium', 'primary'), GlobalStyles.buttonWithIcon]}
              onPress={handleGenerarEliminatorias}
            >
              <Zap size={18} color="white" />
              <Text style={createButtonTextStyle('primary')}>Generar Eliminatorias</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.bracketContainer}>
          {fases.map(fase => {
            const partidosFase = partidosEliminatorias.filter(p => p.fase === fase);
            if (partidosFase.length === 0) return null;
            
            return (
              <View key={fase} style={styles.faseColumn}>
                <Text style={styles.faseTitle}>{fase.charAt(0).toUpperCase() + fase.slice(1)}</Text>
                {partidosFase.map(partido => {
                  const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
                  const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);
                  return (
                    <TouchableOpacity 
                      key={partido.id}
                      style={styles.bracketMatch}
                      onPress={() => router.push(`/partido/${partido.id}`)}
                    >
                      <View style={styles.bracketTeam}>
                        <Text style={styles.bracketTeamName} numberOfLines={1}>
                          {equipoLocal?.nombre || 'TBD'}
                        </Text>
                        {partido.estado === 'Jugado' && (
                          <Text style={styles.bracketScore}>{partido.golesLocal}</Text>
                        )}
                      </View>
                      <View style={styles.bracketTeam}>
                        <Text style={styles.bracketTeamName} numberOfLines={1}>
                          {equipoVisitante?.nombre || 'TBD'}
                        </Text>
                        {partido.estado === 'Jugado' && (
                          <Text style={styles.bracketScore}>{partido.golesVisitante}</Text>
                        )}
                      </View>
                      {partido.estado !== 'Jugado' && (
                        <Text style={styles.bracketDate}>{partido.fecha}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const handleEliminarTorneo = () => {
    if (!torneo) return;
    
    Alert.alert(
      'Eliminar Torneo',
      `¿Estás seguro de que quieres eliminar el torneo "${torneo.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await eliminarTorneo(torneo.id);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.torneoInfo}>
            <Text style={styles.torneoName}>{torneo.nombre}</Text>
            <Text style={styles.torneoDetails}>
              {torneo.ciudad} • {torneo.categoria} • {torneo.tipoFutbol}
            </Text>
            <Text style={styles.torneoEstado}>
              Estado: {torneo.estado} {torneo.faseActual && `• Fase: ${torneo.faseActual}`}
            </Text>
          </View>
          {isCreador && (
            <View style={styles.headerActions}>
              {torneo.estado === 'En curso' && (
                <TouchableOpacity 
                  style={[...createButtonStyle('compact', 'primary'), GlobalStyles.buttonWithIcon]}
                  onPress={() => handleFinalizarTorneo()}
                >
                  <Crown size={14} color="white" />
                </TouchableOpacity>
              )}
              {torneo.tipo === 'grupos-eliminatorias' && torneo.faseActual === 'grupos' && (
                <TouchableOpacity 
                  style={[...createButtonStyle('compact', 'secondary'), GlobalStyles.buttonWithIcon]}
                  onPress={() => handleGenerarEliminatorias()}
                >
                  <Zap size={14} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[...createButtonStyle('compact', 'ghost'), GlobalStyles.buttonWithIcon]}
                onPress={() => setShowManagementModal(true)}
              >
                <Shuffle size={14} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[...createButtonStyle('compact', 'outline'), GlobalStyles.buttonWithIcon]}
                onPress={() => router.push(`/editar-torneo/${torneo.id}`)}
              >
                <Edit3 size={14} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[...createButtonStyle('compact', 'danger'), GlobalStyles.buttonWithIcon]}
                onPress={() => handleEliminarTorneo()}
              >
                <Trash2 size={14} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <ScrollView horizontal style={styles.tabsContainer} showsHorizontalScrollIndicator={false}>
        <View style={styles.tabs}>
          {torneo.tipo !== 'eliminatorias' && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'clasificacion' && styles.tabActive]}
              onPress={() => setActiveTab('clasificacion')}
            >
              <Trophy size={12} color={activeTab === 'clasificacion' ? Colors.primary : Colors.textLight} />
              <Text style={[styles.tabText, activeTab === 'clasificacion' && styles.tabTextActive]}>
                Tabla
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.tab, activeTab === 'partidos' && styles.tabActive]}
            onPress={() => setActiveTab('partidos')}
          >
            <Calendar size={12} color={activeTab === 'partidos' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'partidos' && styles.tabTextActive]}>
              Partidos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'equipos' && styles.tabActive]}
            onPress={() => setActiveTab('equipos')}
          >
            <Users size={12} color={activeTab === 'equipos' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'equipos' && styles.tabTextActive]}>
              Equipos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'goleadores' && styles.tabActive]}
            onPress={() => setActiveTab('goleadores')}
          >
            <Target size={12} color={activeTab === 'goleadores' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'goleadores' && styles.tabTextActive]}>
              Goles
            </Text>
          </TouchableOpacity>
          {(torneo.tipo === 'grupos' || torneo.tipo === 'grupos-eliminatorias') && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'grupos' && styles.tabActive]}
              onPress={() => setActiveTab('grupos')}
            >
              <Grid3x3 size={12} color={activeTab === 'grupos' ? Colors.primary : Colors.textLight} />
              <Text style={[styles.tabText, activeTab === 'grupos' && styles.tabTextActive]}>
                Grupos
              </Text>
            </TouchableOpacity>
          )}
          {(torneo.tipo === 'eliminatorias' || torneo.tipo === 'grupos-eliminatorias') && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'eliminatorias' && styles.tabActive]}
              onPress={() => setActiveTab('eliminatorias')}
            >
              <Zap size={12} color={activeTab === 'eliminatorias' ? Colors.primary : Colors.textLight} />
              <Text style={[styles.tabText, activeTab === 'eliminatorias' && styles.tabTextActive]}>
                Eliminatorias
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {torneo.resultadoFinal && (
          <View style={styles.resultadoFinalContainer}>
            <Text style={styles.resultadoFinalTitle}>🏆 Torneo Finalizado</Text>
            <View style={styles.podium}>
              {torneo.resultadoFinal.campeon && (
                <View style={styles.podiumItem}>
                  <Crown size={24} color="#FFD700" />
                  <Text style={styles.podiumLabel}>Campeón</Text>
                  <Text style={styles.podiumTeam}>
                    {equipos.find(e => e.id === torneo.resultadoFinal?.campeon)?.nombre}
                  </Text>
                </View>
              )}
              {torneo.resultadoFinal.subcampeon && (
                <View style={styles.podiumItem}>
                  <Medal size={24} color="#C0C0C0" />
                  <Text style={styles.podiumLabel}>Subcampeón</Text>
                  <Text style={styles.podiumTeam}>
                    {equipos.find(e => e.id === torneo.resultadoFinal?.subcampeon)?.nombre}
                  </Text>
                </View>
              )}
              {torneo.resultadoFinal.tercerPuesto && (
                <View style={styles.podiumItem}>
                  <Award size={24} color="#CD7F32" />
                  <Text style={styles.podiumLabel}>3er Puesto</Text>
                  <Text style={styles.podiumTeam}>
                    {equipos.find(e => e.id === torneo.resultadoFinal?.tercerPuesto)?.nombre}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {activeTab === 'clasificacion' && torneo.tipo !== 'eliminatorias' && (
          <View style={styles.tabContent}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.posCol]}>#</Text>
              <Text style={[styles.tableHeaderText, styles.teamCol]}>Equipo</Text>
              <Text style={styles.tableHeaderText}>PJ</Text>
              <Text style={styles.tableHeaderText}>PG</Text>
              <Text style={styles.tableHeaderText}>PE</Text>
              <Text style={styles.tableHeaderText}>PP</Text>
              <Text style={styles.tableHeaderText}>GF</Text>
              <Text style={styles.tableHeaderText}>GC</Text>
              <Text style={styles.tableHeaderText}>DG</Text>
              <Text style={[styles.tableHeaderText, styles.ptsCol]}>Pts</Text>
            </View>
            {clasificacion.map((item, index) => {
              const equipo = equipos.find(e => e.id === item.equipoId);
              return (
                <View key={item.equipoId} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.posCol, index < 3 && styles.topPosition]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, styles.teamCol]} numberOfLines={1}>
                    {equipo?.nombre}
                  </Text>
                  <Text style={styles.tableCell}>{item.partidosJugados}</Text>
                  <Text style={styles.tableCell}>{item.partidosGanados}</Text>
                  <Text style={styles.tableCell}>{item.partidosEmpatados}</Text>
                  <Text style={styles.tableCell}>{item.partidosPerdidos}</Text>
                  <Text style={styles.tableCell}>{item.golesFavor}</Text>
                  <Text style={styles.tableCell}>{item.golesContra}</Text>
                  <Text style={styles.tableCell}>{item.diferenciaGoles}</Text>
                  <Text style={[styles.tableCell, styles.ptsCol, styles.points]}>
                    {item.puntos}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'partidos' && (
          <View style={styles.tabContent}>
            {partidosTorneo.map(partido => {
              const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
              const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);
              return (
                <View key={partido.id} style={styles.partidoCard}>
                  <View style={styles.partidoHeader}>
                    <Text style={styles.jornada}>
                      {partido.fase ? `${partido.fase.charAt(0).toUpperCase() + partido.fase.slice(1)}` : `Jornada ${partido.jornada}`}
                      {partido.grupo && ` - Grupo ${partido.grupo}`}
                    </Text>
                    {isCreador && (
                      <TouchableOpacity 
                        style={styles.editPartidoButton}
                        onPress={() => handleEditPartido(partido)}
                      >
                        <Settings size={14} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.partidoContent}
                    onPress={() => router.push(`/partido/${partido.id}`)}
                  >
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
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'equipos' && (
          <View style={styles.tabContent}>
            {equiposTorneo.map(equipo => (
              <View key={equipo.id} style={styles.equipoCard}>
                <View style={styles.equipoHeader}>
                  <Text style={styles.equipoNombre}>{equipo.nombre}</Text>
                  <View style={styles.colores}>
                    <View style={[styles.color, { backgroundColor: equipo.colores.principal }]} />
                    <View style={[styles.color, { backgroundColor: equipo.colores.secundario }]} />
                  </View>
                </View>
                <Text style={styles.jugadoresCount}>
                  {equipo.jugadores?.length || 0} jugadores
                </Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'goleadores' && (
          <View style={styles.tabContent}>
            {goleadores.length > 0 ? (
              goleadores.map((goleador, index) => {
                const equipo = equipos.find(e => e.id === goleador.equipoId);
                return (
                  <View key={`${goleador.jugadorId}-${goleador.equipoId}`} style={styles.goleadorCard}>
                    <View style={styles.goleadorPosition}>
                      <Text style={styles.positionNumber}>{index + 1}</Text>
                    </View>
                    <View style={styles.goleadorInfo}>
                      <Text style={styles.goleadorNombre}>{goleador.nombre}</Text>
                      <Text style={styles.goleadorEquipo}>{equipo?.nombre}</Text>
                    </View>
                    <View style={styles.goleadorStats}>
                      <Text style={styles.golesCount}>{goleador.goles}</Text>
                      <Text style={styles.golesLabel}>goles</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No hay goleadores registrados</Text>
            )}
          </View>
        )}

        {activeTab === 'grupos' && (
          <View style={styles.tabContent}>
            {Object.keys(clasificacionPorGrupo).length > 0 ? (
              Object.entries(clasificacionPorGrupo).map(([grupo, clasificacionGrupo]) => (
                <View key={grupo} style={styles.grupoContainer}>
                  <Text style={styles.grupoTitle}>Grupo {grupo}</Text>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.posCol]}>#</Text>
                    <Text style={[styles.tableHeaderText, styles.teamCol]}>Equipo</Text>
                    <Text style={styles.tableHeaderText}>PJ</Text>
                    <Text style={styles.tableHeaderText}>PG</Text>
                    <Text style={styles.tableHeaderText}>PE</Text>
                    <Text style={styles.tableHeaderText}>PP</Text>
                    <Text style={styles.tableHeaderText}>GF</Text>
                    <Text style={styles.tableHeaderText}>GC</Text>
                    <Text style={styles.tableHeaderText}>DG</Text>
                    <Text style={[styles.tableHeaderText, styles.ptsCol]}>Pts</Text>
                  </View>
                  {clasificacionGrupo.map((item, index) => {
                    const equipo = equipos.find(e => e.id === item.equipoId);
                    const isClasificado = index < (torneo.configuracion.clasificadosPorGrupo || 2);
                    return (
                      <View key={item.equipoId} style={[styles.tableRow, isClasificado && styles.clasificadoRow]}>
                        <Text style={[styles.tableCell, styles.posCol, index < 3 && styles.topPosition]}>
                          {index + 1}
                        </Text>
                        <Text style={[styles.tableCell, styles.teamCol]} numberOfLines={1}>
                          {equipo?.nombre}
                        </Text>
                        <Text style={styles.tableCell}>{item.partidosJugados}</Text>
                        <Text style={styles.tableCell}>{item.partidosGanados}</Text>
                        <Text style={styles.tableCell}>{item.partidosEmpatados}</Text>
                        <Text style={styles.tableCell}>{item.partidosPerdidos}</Text>
                        <Text style={styles.tableCell}>{item.golesFavor}</Text>
                        <Text style={styles.tableCell}>{item.golesContra}</Text>
                        <Text style={styles.tableCell}>{item.diferenciaGoles}</Text>
                        <Text style={[styles.tableCell, styles.ptsCol, styles.points]}>
                          {item.puntos}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No hay grupos configurados</Text>
            )}
          </View>
        )}

        {activeTab === 'eliminatorias' && (
          <View style={styles.tabContent}>
            {renderEliminatorias()}
          </View>
        )}
      </ScrollView>
      
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
            
            <View style={styles.modalForm}>
              <Text style={styles.modalLabel}>Fecha</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.fecha}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, fecha: text }))}
                placeholder="YYYY-MM-DD"
              />
              
              <Text style={styles.modalLabel}>Hora</Text>
              <TextInput
                style={styles.modalInput}
                value={editForm.hora}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, hora: text }))}
                placeholder="HH:MM"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSavePartido}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {torneo && (
        <TorneoManagementModal
          visible={showManagementModal}
          onClose={() => setShowManagementModal(false)}
          torneo={torneo}
          equipos={equipos}
          partidos={partidosTorneo}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  torneoInfo: {
    flex: 1,
  },
  torneoName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  torneoDetails: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  torneoEstado: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  manageTorneoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
  },
  editTorneoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
  },
  deleteTorneoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.error + '20',
  },
  finalizarTorneoButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFD700',
  },
  generarEliminatoriasButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  tabsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    gap: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 5,
    gap: 2,
    borderRadius: 6,
    minWidth: 'auto',
    minHeight: 24,
  },
  tabActive: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  tabText: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderRadius: 2,
    marginBottom: 1,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textLight,
    width: 26,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 3,
    paddingHorizontal: 3,
    borderRadius: 2,
    marginBottom: 1,
  },
  tableCell: {
    fontSize: 11,
    color: Colors.text,
    width: 26,
    textAlign: 'center',
  },
  posCol: {
    width: 20,
  },
  teamCol: {
    flex: 1,
    textAlign: 'left',
    paddingHorizontal: 6,
  },
  ptsCol: {
    width: 30,
  },
  topPosition: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  points: {
    fontWeight: 'bold',
  },
  partidoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
  },
  partidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editPartidoButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: Colors.primary + '20',
  },
  jornada: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '500',
  },
  partidoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipoName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  equipoVisitante: {
    textAlign: 'right',
  },
  resultado: {
    paddingHorizontal: 16,
  },
  resultadoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  horaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  fechaText: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
  },
  equipoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  equipoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipoNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  colores: {
    flexDirection: 'row',
    gap: 4,
  },
  color: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jugadoresCount: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 6,
  },
  goleadorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 10,
    marginBottom: 4,
  },
  goleadorPosition: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  positionNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goleadorInfo: {
    flex: 1,
  },
  goleadorNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  goleadorEquipo: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 1,
  },
  goleadorStats: {
    alignItems: 'center',
  },
  golesCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  golesLabel: {
    fontSize: 11,
    color: Colors.textLight,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 16,
    marginTop: 40,
  },
  resultadoFinalContainer: {
    backgroundColor: Colors.surface,
    margin: 6,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  resultadoFinalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  podiumLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 4,
    marginBottom: 2,
  },
  podiumTeam: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  grupoContainer: {
    marginBottom: 2,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    padding: 4,
  },
  grupoTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 1,
    textAlign: 'center',
    paddingVertical: 1,
    backgroundColor: Colors.primary + '08',
    borderRadius: 2,
    paddingHorizontal: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  clasificadoRow: {
    backgroundColor: Colors.primary + '10',
  },
  emptyEliminatorias: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bracketContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  faseColumn: {
    marginRight: 20,
    minWidth: 150,
  },
  faseTitle: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
    backgroundColor: Colors.primary + '08',
    paddingVertical: 1,
    paddingHorizontal: 3,
    borderRadius: 2,
  },
  bracketMatch: {
    backgroundColor: Colors.surface,
    borderRadius: 4,
    padding: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  bracketTeam: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bracketTeamName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  bracketScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 8,
  },
  bracketDate: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalForm: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});