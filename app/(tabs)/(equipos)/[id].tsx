import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useData } from '@/hooks/data-context';
import { useAuth } from '@/hooks/auth-context';
import Colors from '@/constants/colors';
import { Plus, User, Hash, Edit3, Trash2, Settings, Tag } from 'lucide-react-native';
import { useState, useMemo, useEffect } from 'react';
import { POSICIONES, CATEGORIAS, TIPOS_FUTBOL } from '@/constants/categories';

export default function EquipoDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { equipos, agregarJugador, actualizarJugador, eliminarJugador, eliminarEquipo, partidos, actualizarEquipo, crearEquipo } = useData();
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showEditPlayer, setShowEditPlayer] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState<typeof POSICIONES[number]>('Mediocampista');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  console.log('🔍 Buscando equipo con ID:', id);
  console.log('🔍 Total equipos en lista:', equipos.length);
  console.log('🔍 IDs de equipos disponibles:', equipos.map(e => e.id));
  
  const equipo = equipos.find(e => e.id === id);
  console.log('🔍 Equipo encontrado:', equipo ? '✅ SÍ' : '❌ NO');
  const [selectedCategoria, setSelectedCategoria] = useState(equipo?.categoria || CATEGORIAS[0]);
  const [selectedTipoFutbol, setSelectedTipoFutbol] = useState(equipo?.tipoFutbol || TIPOS_FUTBOL[0].value);
  
  // Buscar equipos relacionados (mismo nombre base)
  const equiposRelacionados = useMemo(() => {
    if (!equipo) return [];
    const nombreBase = equipo.nombre.replace(/\s[A-Z]$/, ''); // Remover sufijo de categoría si existe
    return equipos.filter(e => 
      e.entrenadorId === equipo.entrenadorId && 
      (e.nombre === nombreBase || e.nombre.startsWith(nombreBase + ' '))
    ).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [equipos, equipo]);
  
  // Actualizar los valores seleccionados cuando cambie el equipo
  useEffect(() => {
    if (equipo) {
      setSelectedCategoria(equipo.categoria || CATEGORIAS[0]);
      setSelectedTipoFutbol(equipo.tipoFutbol || TIPOS_FUTBOL[0].value);
    }
  }, [equipo]);
  
  const isOwner = user?.id === equipo?.entrenadorId;
  
  const estadisticasEquipo = useMemo(() => {
    if (!equipo) return null;
    
    const partidosEquipo = partidos.filter(p => 
      p.equipoLocalId === equipo.id || p.equipoVisitanteId === equipo.id
    );
    const partidosJugados = partidosEquipo.filter(p => p.estado === 'Jugado');
    
    let victorias = 0;
    let empates = 0;
    let derrotas = 0;
    let golesFavor = 0;
    let golesContra = 0;
    
    partidosJugados.forEach(partido => {
      const esLocal = partido.equipoLocalId === equipo.id;
      const golesEquipo = esLocal ? partido.golesLocal : partido.golesVisitante;
      const golesRival = esLocal ? partido.golesVisitante : partido.golesLocal;
      
      if (golesEquipo !== undefined && golesRival !== undefined) {
        golesFavor += golesEquipo;
        golesContra += golesRival;
        
        if (golesEquipo > golesRival) victorias++;
        else if (golesEquipo < golesRival) derrotas++;
        else empates++;
      }
    });
    
    return {
      partidosJugados: partidosJugados.length,
      victorias,
      empates,
      derrotas,
      golesFavor,
      golesContra,
      diferenciaGoles: golesFavor - golesContra
    };
  }, [partidos, equipo]);

  if (!equipo) {
    return (
      <View style={styles.container}>
        <Text>Equipo no encontrado</Text>
      </View>
    );
  }

  const handleAddPlayer = async () => {
    if (!playerName || !playerNumber) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Verificar que el número no esté ocupado
    const numeroExiste = equipo.jugadores?.some(j => j.numero === parseInt(playerNumber) && j.id !== editingPlayer?.id);
    if (numeroExiste) {
      Alert.alert('Error', 'Este número ya está ocupado por otro jugador');
      return;
    }

    if (editingPlayer) {
      // Editar jugador existente
      await actualizarJugador(editingPlayer.id, {
        nombre: playerName,
        numero: parseInt(playerNumber),
        posicion: playerPosition,
      });
      setShowEditPlayer(false);
      setEditingPlayer(null);
    } else {
      // Agregar nuevo jugador
      await agregarJugador(id as string, {
        nombre: playerName,
        numero: parseInt(playerNumber),
        posicion: playerPosition,
      });
      setShowAddPlayer(false);
    }

    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('Mediocampista');
  };

  const handleEditPlayer = (jugador: any) => {
    setEditingPlayer(jugador);
    setPlayerName(jugador.nombre);
    setPlayerNumber(jugador.numero.toString());
    setPlayerPosition(jugador.posicion);
    setShowEditPlayer(true);
  };

  const handleCancelEdit = () => {
    setShowEditPlayer(false);
    setShowAddPlayer(false);
    setShowAddCategory(false);
    setEditingPlayer(null);
    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('Mediocampista');
    setNewCategoryName('');
  };

  const handleAddCategory = async () => {
    if (!equipo || !newCategoryName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la nueva categoría');
      return;
    }
    
    try {
      // Crear un nuevo equipo con la categoría especificada
      const nombreBase = equipo.nombre.replace(/\s[A-Z]$/, ''); // Remover sufijo si existe
      const nuevoNombre = `${nombreBase} ${newCategoryName.trim().toUpperCase()}`;
      
      // Verificar que no exista ya un equipo con ese nombre
      const equipoExistente = equipos.find(e => 
        e.nombre === nuevoNombre && e.entrenadorId === equipo.entrenadorId
      );
      
      if (equipoExistente) {
        Alert.alert('Error', 'Ya existe un equipo con ese nombre');
        return;
      }
      
      await crearEquipo({
        nombre: nuevoNombre,
        escudo: equipo.escudo,
        escudoLocal: equipo.escudoLocal,
        colores: equipo.colores,
        entrenadorId: equipo.entrenadorId,
        jugadores: [], // Nuevo equipo sin jugadores
        ciudad: equipo.ciudad,
        categoria: selectedCategoria,
        tipoFutbol: selectedTipoFutbol,
        clubId: equipo.clubId
      });
      
      setShowAddCategory(false);
      setNewCategoryName('');
      console.log('✅ Nueva categoría de equipo creada correctamente');
      Alert.alert('Éxito', `Equipo "${nuevoNombre}" creado correctamente`);
    } catch (error) {
      console.error('❌ Error creating team category:', error);
      Alert.alert('Error', 'No se pudo crear el equipo');
    }
  };


  
  const jugadoresPorPosicion = POSICIONES.map(pos => ({
    posicion: pos,
    jugadores: equipo.jugadores?.filter(j => j.posicion === pos) || []
  }));
  
  const handleEliminarEquipo = () => {
    Alert.alert(
      'Eliminar Equipo',
      `¿Estás seguro de que quieres eliminar el equipo "${equipo.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await eliminarEquipo(equipo.id);
            router.back();
          }
        }
      ]
    );
  };
  
  const handleEliminarJugador = (jugadorId: string, nombreJugador: string) => {
    Alert.alert(
      'Eliminar Jugador',
      `¿Estás seguro de que quieres eliminar a "${nombreJugador}" del equipo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await eliminarJugador(jugadorId);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {equipo.escudo && (
              <Image source={{ uri: equipo.escudo }} style={styles.escudoImage} />
            )}
            <View style={styles.equipoInfo}>
              <Text style={styles.equipoNombre}>{equipo.nombre}</Text>
              <Text style={styles.equipoDetails}>
                {equipo.ciudad}{equipo.categoria ? ` • ${equipo.categoria}` : ''}{equipo.tipoFutbol ? ` • ${equipo.tipoFutbol}` : ''}
              </Text>
              {estadisticasEquipo && (
                <Text style={styles.equipoStats}>
                  {estadisticasEquipo.partidosJugados} partidos • {estadisticasEquipo.victorias}V {estadisticasEquipo.empates}E {estadisticasEquipo.derrotas}D
                </Text>
              )}
            </View>
          </View>
          <View style={styles.coloresContainer}>
            <View style={styles.colorItem}>
              <Text style={styles.colorLabel}>Principal</Text>
              <View style={[styles.colorBox, { backgroundColor: equipo.colores.principal }]} />
            </View>
            <View style={styles.colorItem}>
              <Text style={styles.colorLabel}>Secundario</Text>
              <View style={[styles.colorBox, { backgroundColor: equipo.colores.secundario }]} />
            </View>
          </View>
        </View>

        {isOwner && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editEquipoButton}
              onPress={() => router.push(`/editar-equipo/${equipo.id}`)}
            >
              <Settings size={18} color={Colors.primary} />
              <Text style={styles.editEquipoButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => {
                setSelectedCategoria(CATEGORIAS[0]);
                setSelectedTipoFutbol(TIPOS_FUTBOL[0].value);
                setNewCategoryName('');
                setShowAddCategory(!showAddCategory);
              }}
            >
              <Tag size={18} color={Colors.secondary} />
              <Text style={styles.categoryButtonText}>+ Categoría</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddPlayer(!showAddPlayer)}
            >
              <Plus size={18} color="white" />
              <Text style={styles.addButtonText}>Jugador</Text>
            </TouchableOpacity>
          </View>
        )}

        {(showAddPlayer || showEditPlayer) && (
          <View style={styles.addPlayerForm}>
            <Text style={styles.formTitle}>
              {editingPlayer ? 'Editar Jugador' : 'Agregar Jugador'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del jugador"
              placeholderTextColor={Colors.textLight}
              value={playerName}
              onChangeText={setPlayerName}
            />
            <TextInput
              style={styles.input}
              placeholder="Número"
              placeholderTextColor={Colors.textLight}
              value={playerNumber}
              onChangeText={setPlayerNumber}
              keyboardType="numeric"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.positionScroll}>
              {POSICIONES.map(pos => (
                <TouchableOpacity
                  key={pos}
                  style={[
                    styles.positionChip,
                    playerPosition === pos && styles.positionChipActive
                  ]}
                  onPress={() => setPlayerPosition(pos)}
                >
                  <Text style={[
                    styles.positionChipText,
                    playerPosition === pos && styles.positionChipTextActive
                  ]}>
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]}
                onPress={handleAddPlayer}
              >
                <Text style={styles.saveButtonText}>
                  {editingPlayer ? 'Actualizar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showAddCategory && (
          <View style={styles.addPlayerForm}>
            <Text style={styles.formTitle}>
              Crear Nueva Categoría de Equipo
            </Text>
            
            <Text style={styles.sectionLabel}>Nombre de la Categoría (ej: A, B, C, Sub-21, etc.)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa la letra o nombre de la categoría"
              placeholderTextColor={Colors.textLight}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              maxLength={10}
            />
            
            <Text style={styles.sectionLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.positionScroll}>
              {CATEGORIAS.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.positionChip,
                    selectedCategoria === cat && styles.positionChipActive
                  ]}
                  onPress={() => setSelectedCategoria(cat)}
                >
                  <Text style={[
                    styles.positionChipText,
                    selectedCategoria === cat && styles.positionChipTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionLabel}>Tipo de Fútbol</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.positionScroll}>
              {TIPOS_FUTBOL.map(tipo => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[
                    styles.positionChip,
                    selectedTipoFutbol === tipo.value && styles.positionChipActive
                  ]}
                  onPress={() => setSelectedTipoFutbol(tipo.value)}
                >
                  <Text style={[
                    styles.positionChipText,
                    selectedTipoFutbol === tipo.value && styles.positionChipTextActive
                  ]}>
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {newCategoryName.trim() && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Vista previa del nombre:</Text>
                <Text style={styles.previewText}>
                  {equipo.nombre.replace(/\s[A-Z]$/, '')} {newCategoryName.trim().toUpperCase()}
                </Text>
              </View>
            )}
            
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.formButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.formButton, styles.saveButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.saveButtonText}>Crear Equipo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {equiposRelacionados.length > 1 && (
          <View style={styles.relatedTeamsSection}>
            <Text style={styles.sectionTitle}>Equipos Relacionados</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedTeamsScroll}>
              {equiposRelacionados.map(equipoRel => (
                <TouchableOpacity
                  key={equipoRel.id}
                  style={[
                    styles.relatedTeamCard,
                    equipoRel.id === equipo.id && styles.relatedTeamCardActive
                  ]}
                  onPress={() => {
                    if (equipoRel.id !== equipo.id) {
                      router.push(`/(tabs)/(equipos)/${equipoRel.id}`);
                    }
                  }}
                >
                  {equipoRel.escudo && (
                    <Image source={{ uri: equipoRel.escudo }} style={styles.relatedTeamEscudo} />
                  )}
                  <Text style={[
                    styles.relatedTeamName,
                    equipoRel.id === equipo.id && styles.relatedTeamNameActive
                  ]}>
                    {equipoRel.nombre}
                  </Text>
                  <Text style={styles.relatedTeamInfo}>
                    {equipoRel.categoria} • {equipoRel.tipoFutbol}
                  </Text>
                  <Text style={styles.relatedTeamPlayers}>
                    {equipoRel.jugadores?.length || 0} jugadores
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.playersSection}>
          <Text style={styles.sectionTitle}>Plantilla</Text>
          {jugadoresPorPosicion.map(({ posicion, jugadores }) => (
            jugadores.length > 0 && (
              <View key={posicion} style={styles.positionGroup}>
                <Text style={styles.positionTitle}>{posicion}s</Text>
                {jugadores.map(jugador => (
                  <View key={jugador.id} style={styles.playerCard}>
                    <View style={styles.playerNumber}>
                      <Hash size={14} color={Colors.textLight} />
                      <Text style={styles.numberText}>{jugador.numero}</Text>
                    </View>
                    <User size={20} color={Colors.textLight} />
                    <Text style={styles.playerName}>{jugador.nombre}</Text>
                    {isOwner && (
                      <View style={styles.playerActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleEditPlayer(jugador)}
                        >
                          <Edit3 size={16} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleEliminarJugador(jugador.id, jugador.nombre)}
                        >
                          <Trash2 size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )
          ))}
          {(!equipo.jugadores || equipo.jugadores.length === 0) && (
            <Text style={styles.emptyText}>No hay jugadores en el equipo</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  escudoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  equipoInfo: {
    flex: 1,
  },
  equipoNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  equipoDetails: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  equipoStats: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  coloresContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  colorBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    margin: 16,
    gap: 6,
  },
  editEquipoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editEquipoButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addPlayerForm: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: Colors.text,
  },
  positionScroll: {
    marginBottom: 16,
    maxHeight: 40,
  },
  positionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  positionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  positionChipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  positionChipTextActive: {
    color: 'white',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  playersSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  positionGroup: {
    marginBottom: 20,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 8,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  playerNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 2,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 14,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  playerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: Colors.background,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  categoryButtonText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  previewContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  relatedTeamsSection: {
    padding: 16,
    paddingTop: 0,
  },
  relatedTeamsScroll: {
    marginBottom: 8,
  },
  relatedTeamCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relatedTeamCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  relatedTeamEscudo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  relatedTeamName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  relatedTeamNameActive: {
    color: Colors.primary,
  },
  relatedTeamInfo: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 2,
  },
  relatedTeamPlayers: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
  },
});