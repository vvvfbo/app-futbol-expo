import SuperButton from '@/components/SuperButton';
import SuperCard from '@/components/SuperCard';
import SuperHeader from '@/components/SuperHeader';
import Colors from '@/constants/colors';
import { SuperLayoutStyles } from '@/constants/super-styles';
import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import type { EstadoPartido } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Activity,
  Calendar,
  Clock,
  Edit2,
  MapPin,
  Medal,
  Play,
  Plus,
  Settings,
  Target,
  Trophy,
  Users,
  X
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Utilidad para generar partidos todos contra todos
function generarPartidosTodosContraTodos(equiposIds: string[], torneoId: string): Omit<import('@/types').Partido, 'id'>[] {
  const partidos: Omit<import('@/types').Partido, 'id'>[] = [];
  let jornada = 1;
  for (let i = 0; i < equiposIds.length; i++) {
    for (let j = i + 1; j < equiposIds.length; j++) {
      partidos.push({
        torneoId,
        equipoLocalId: equiposIds[i],
        equipoVisitanteId: equiposIds[j],
        fecha: '',
        hora: '',
        estado: 'Pendiente' as EstadoPartido,
        jornada,
      });
      jornada++;
    }
  }
  return partidos;
}
// import CuadroEliminatorias from '@/components/CuadroEliminatorias';
// import TorneoManagementModal from '@/components/TorneoManagementModal';
// import FinalizarTorneoModal from '@/components/FinalizarTorneoModal';

export default function TorneoDetalleScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const {
    torneos,
    equipos,
    partidos,
    crearPartidos,
    actualizarTorneo,
    inscribirEquipoEnTorneo,
    desinscribirEquipoDelTorneo
  } = useData();

  const [activeTab, setActiveTab] = useState('resumen');
  const [managementModalVisible, setManagementModalVisible] = useState(false);
  const [finalizarModalVisible, setFinalizarModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const torneo = useMemo(() => {
    return torneos.find(t => t.id === id);
  }, [torneos, id]);

  const equiposTorneo = useMemo(() => {
    if (!torneo) return [];
    return equipos.filter(e => torneo.equiposIds.includes(e.id));
  }, [equipos, torneo]);

  const partidosTorneo = useMemo(() => {
    if (!torneo) return [];
    return partidos.filter(p => p.torneoId === torneo.id);
  }, [partidos, torneo]);

  const partidosAgrupados = useMemo(() => {
    const grupos: { [key: string]: any[] } = {};

    partidosTorneo.forEach(partido => {
      const grupoKey = partido.grupo || partido.fase || 'General';
      if (!grupos[grupoKey]) {
        grupos[grupoKey] = [];
      }
      grupos[grupoKey].push(partido);
    });

    return grupos;
  }, [partidosTorneo]);

  // Calcular clasificación por grupos
  const clasificacionPorGrupos = useMemo(() => {
    const clasificaciones: { [key: string]: any[] } = {};

    Object.entries(partidosAgrupados).forEach(([grupo, partidos]) => {
      if (grupo === 'General') return;

      const equiposStats: { [key: string]: any } = {};

      // Inicializar stats para todos los equipos del grupo
      partidos.forEach(partido => {
        if (!equiposStats[partido.equipoLocalId]) {
          const equipo = equipos.find(e => e.id === partido.equipoLocalId);
          equiposStats[partido.equipoLocalId] = {
            id: partido.equipoLocalId,
            nombre: equipo?.nombre || 'Desconocido',
            partidosJugados: 0,
            ganados: 0,
            empatados: 0,
            perdidos: 0,
            golesFavor: 0,
            golesContra: 0,
            diferencia: 0,
            puntos: 0
          };
        }
        if (!equiposStats[partido.equipoVisitanteId]) {
          const equipo = equipos.find(e => e.id === partido.equipoVisitanteId);
          equiposStats[partido.equipoVisitanteId] = {
            id: partido.equipoVisitanteId,
            nombre: equipo?.nombre || 'Desconocido',
            partidosJugados: 0,
            ganados: 0,
            empatados: 0,
            perdidos: 0,
            golesFavor: 0,
            golesContra: 0,
            diferencia: 0,
            puntos: 0
          };
        }
      });

      // Procesar partidos jugados
      partidos.forEach(partido => {
        if (partido.estado === 'Jugado' && partido.golesLocal !== undefined && partido.golesVisitante !== undefined) {
          const local = equiposStats[partido.equipoLocalId];
          const visitante = equiposStats[partido.equipoVisitanteId];

          local.partidosJugados++;
          visitante.partidosJugados++;

          local.golesFavor += partido.golesLocal;
          local.golesContra += partido.golesVisitante;
          visitante.golesFavor += partido.golesVisitante;
          visitante.golesContra += partido.golesLocal;

          if (partido.golesLocal > partido.golesVisitante) {
            // Victoria local
            local.ganados++;
            local.puntos += torneo?.configuracion?.puntosVictoria || 3;
            visitante.perdidos++;
          } else if (partido.golesLocal < partido.golesVisitante) {
            // Victoria visitante
            visitante.ganados++;
            visitante.puntos += torneo?.configuracion?.puntosVictoria || 3;
            local.perdidos++;
          } else {
            // Empate
            local.empatados++;
            visitante.empatados++;
            local.puntos += torneo?.configuracion?.puntosEmpate || 1;
            visitante.puntos += torneo?.configuracion?.puntosEmpate || 1;
          }
        }
      });

      // Calcular diferencia de goles y ordenar
      const equiposOrdenados = Object.values(equiposStats).map(equipo => ({
        ...equipo,
        diferencia: equipo.golesFavor - equipo.golesContra
      })).sort((a, b) => {
        // Criterios de ordenación: puntos, diferencia de goles, goles a favor
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
        return b.golesFavor - a.golesFavor;
      });

      clasificaciones[grupo] = equiposOrdenados;
    });

    return clasificaciones;
  }, [partidosAgrupados, equipos, torneo]);

  // Calcular si el torneo está listo para eliminatorias
  const listoParaEliminatorias = useMemo(() => {
    if (torneo?.tipo !== 'grupos-eliminatorias') return false;

    // Verificar que todos los partidos de grupos estén jugados
    const partidosGrupos = partidosTorneo.filter(p => p.grupo && p.grupo !== 'General');
    if (partidosGrupos.length === 0) return false;

    return partidosGrupos.every(p => p.estado === 'Jugado');
  }, [torneo, partidosTorneo]);

  const isOrganizador = torneo?.creadorId === user?.id;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  if (!torneo) {
    return (
      <View style={[SuperLayoutStyles.screenContainer, { paddingTop: insets.top }]}>
        <SuperCard elevated>
          <View style={styles.emptyState}>
            <Trophy size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Torneo no encontrado</Text>
            <Text style={styles.emptyText}>
              El torneo que buscas no existe o fue eliminado
            </Text>
            <SuperButton
              title="Volver"
              variant="primary"
              size="medium"
              onPress={() => router.back()}
            />
          </View>
        </SuperCard>
      </View>
    );
  }

  const renderResumen = () => (
    <ScrollView style={SuperLayoutStyles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Información del Torneo */}
      <SuperCard elevated>
        <SuperHeader title={torneo.nombre} />

        <View style={styles.torneoInfo}>
          <View style={styles.infoRow}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              {torneo.fechaInicio} - {torneo.fechaFin}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{torneo.ciudad}</Text>
          </View>

          <View style={styles.infoRow}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              {equiposTorneo.length} equipos participantes
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Activity size={20} color={Colors.primary} />
            <Text style={[styles.infoText, {
              color: torneo.estado === 'En curso' ? Colors.success :
                torneo.estado === 'Finalizado' ? Colors.error : Colors.warning
            }]}>
              Estado: {torneo.estado}
            </Text>
          </View>
        </View>
      </SuperCard>

      {/* Acciones del Organizador */}
      {isOrganizador && (
        <SuperCard elevated>
          <SuperHeader title="Gestión del Torneo" />

          <View style={styles.buttonRow}>
            <SuperButton
              title="Editar"
              variant="secondary"
              size="medium"
              icon={<Edit2 size={18} color={Colors.primary} />}
              onPress={() => router.push(`/editar-torneo/${torneo.id}`)}
              style={styles.buttonFlex}
            />

            <SuperButton
              title="Gestionar"
              variant="primary"
              size="medium"
              icon={<Settings size={18} color="white" />}
              onPress={() => setManagementModalVisible(true)}
              style={styles.buttonFlex}
            />
          </View>

          {torneo.estado === 'En curso' && (
            <SuperButton
              title="Finalizar Torneo"
              variant="danger"
              size="medium"
              icon={<Target size={18} color="white" />}
              onPress={() => setFinalizarModalVisible(true)}
              fullWidth
            />
          )}
        </SuperCard>
      )}

      {/* Estadísticas Rápidas */}
      <SuperCard elevated>
        <SuperHeader title="Estadísticas" />

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Trophy size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{equiposTorneo.length}</Text>
            <Text style={styles.statLabel}>Equipos</Text>
          </View>

          <View style={styles.statItem}>
            <Play size={24} color={Colors.success} />
            <Text style={styles.statNumber}>
              {partidosTorneo.filter(p => p.estado === 'Jugado').length}
            </Text>
            <Text style={styles.statLabel}>Jugados</Text>
          </View>

          <View style={styles.statItem}>
            <Clock size={24} color={Colors.warning} />
            <Text style={styles.statNumber}>
              {partidosTorneo.filter(p => p.estado === 'Pendiente').length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>

          <View style={styles.statItem}>
            <Medal size={24} color={Colors.accent} />
            <Text style={styles.statNumber}>
              {torneo.estado === 'Finalizado' ? '1' : '-'}
            </Text>
            <Text style={styles.statLabel}>Campeón</Text>
          </View>
        </View>
      </SuperCard>
    </ScrollView>
  );

  const renderEquipos = () => (
    <ScrollView style={SuperLayoutStyles.contentContainer} showsVerticalScrollIndicator={false}>
      <SuperCard elevated>
        <SuperHeader title="Equipos Participantes" />

        {equiposTorneo.map((equipo, index) => (
          <TouchableOpacity
            key={equipo.id}
            style={styles.equipoItem}
            onPress={() => router.push(`/(tabs)/(equipos)/${equipo.id}`)}
          >
            <View style={styles.equipoInfo}>
              <Text style={styles.equipoNombre}>{equipo.nombre}</Text>
              <Text style={styles.equipoCategoria}>{equipo.categoria}</Text>
            </View>
            <Text style={styles.equipoNumero}>#{index + 1}</Text>
          </TouchableOpacity>
        ))}
      </SuperCard>
    </ScrollView>
  );

  const renderPartidos = () => {
    // Usar partidosAgrupados que ya está calculado al nivel del componente

    return (
      <ScrollView style={SuperLayoutStyles.contentContainer} showsVerticalScrollIndicator={false}>
        {torneo.tipo === 'eliminatorias' ? (
          <SuperCard elevated>
            <SuperHeader title="Cuadro de Eliminatorias" />
            <View style={styles.emptyState}>
              <Trophy size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Cuadro de Eliminatorias</Text>
              <Text style={styles.emptyText}>
                El cuadro de eliminatorias se mostrará aquí
              </Text>
            </View>
          </SuperCard>
        ) : (
          <>
            {partidosTorneo.length === 0 ? (
              <SuperCard elevated>
                <SuperHeader title="Fixture de Partidos" />
                <View style={styles.emptyState}>
                  <Play size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyTitle}>Sin partidos</Text>
                  <Text style={styles.emptyText}>
                    {isOrganizador
                      ? 'Usa el botón "Gestionar" para generar el fixture'
                      : 'Los partidos aparecerán aquí cuando se genere el fixture'
                    }
                  </Text>
                </View>
              </SuperCard>
            ) : (
              // Mostrar partidos agrupados
              Object.entries(partidosAgrupados).map(([grupoNombre, partidosGrupo]) => (
                <SuperCard key={grupoNombre} elevated>
                  <SuperHeader
                    title={grupoNombre.startsWith('A') || grupoNombre.startsWith('B') || grupoNombre.startsWith('C')
                      ? `Grupo ${grupoNombre}`
                      : grupoNombre === 'General'
                        ? 'Fixture de Partidos'
                        : grupoNombre
                    }
                  />

                  {partidosGrupo.map(partido => {
                    const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
                    const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);

                    return (
                      <TouchableOpacity
                        key={partido.id}
                        style={styles.partidoItem}
                        onPress={() => router.push(`/partido/${partido.id}`)}
                      >
                        <View style={styles.partidoHeader}>
                          <Text style={styles.partidoFecha}>
                            {partido.fecha || 'Por programar'}
                            {partido.hora ? ` ${partido.hora}` : ''}
                          </Text>
                          <Text style={[styles.partidoEstado, {
                            color: partido.estado === 'Jugado' ? Colors.success :
                              partido.estado === 'En curso' ? Colors.warning : Colors.textSecondary
                          }]}>
                            {partido.estado}
                          </Text>
                        </View>

                        <View style={styles.partidoEquipos}>
                          <Text style={styles.equipoPartido}>{equipoLocal?.nombre || 'TBD'}</Text>
                          <View style={styles.marcador}>
                            {partido.estado === 'Jugado' ? (
                              <>
                                <Text style={styles.goles}>{partido.golesLocal || 0}</Text>
                                <Text style={styles.vs}>-</Text>
                                <Text style={styles.goles}>{partido.golesVisitante || 0}</Text>
                              </>
                            ) : (
                              <Text style={styles.vs}>vs</Text>
                            )}
                          </View>
                          <Text style={styles.equipoPartido}>{equipoVisitante?.nombre || 'TBD'}</Text>
                        </View>

                        {partido.jornada && (
                          <Text style={styles.jornadaText}>Jornada {partido.jornada}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </SuperCard>
              ))
            )}
          </>
        )}
      </ScrollView>
    );
  };

  const renderClasificacion = () => (
    <ScrollView style={SuperLayoutStyles.contentContainer} showsVerticalScrollIndicator={false}>
      {Object.keys(clasificacionPorGrupos).length === 0 ? (
        <SuperCard elevated>
          <SuperHeader title="Clasificación" />
          <View style={styles.emptyState}>
            <Trophy size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin datos de clasificación</Text>
            <Text style={styles.emptyText}>
              Los datos de clasificación aparecerán cuando se jueguen los partidos
            </Text>
          </View>
        </SuperCard>
      ) : (
        Object.entries(clasificacionPorGrupos).map(([grupo, equipos]) => (
          <SuperCard key={grupo} elevated>
            <SuperHeader title={`Grupo ${grupo}`} />

            {/* Cabecera de la tabla */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.positionColumn]}>#</Text>
              <Text style={[styles.tableHeaderText, styles.teamColumn]}>Equipo</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>PJ</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>G</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>E</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>P</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>GF</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>GC</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>DG</Text>
              <Text style={[styles.tableHeaderText, styles.statColumn]}>Pts</Text>
            </View>

            {/* Filas de equipos */}
            {equipos.map((equipo, index) => (
              <View key={equipo.id} style={[
                styles.tableRow,
                index < 2 && styles.qualifiedRow // Primeros 2 clasificados
              ]}>
                <Text style={[styles.tableText, styles.positionColumn, index < 2 && styles.qualifiedText]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableText, styles.teamColumn, index < 2 && styles.qualifiedText]} numberOfLines={1}>
                  {equipo.nombre}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, index < 2 && styles.qualifiedText]}>
                  {equipo.partidosJugados}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, index < 2 && styles.qualifiedText]}>
                  {equipo.ganados}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, index < 2 && styles.qualifiedText]}>
                  {equipo.empatados}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, index < 2 && styles.qualifiedText]}>
                  {equipo.perdidos}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, index < 2 && styles.qualifiedText]}>
                  {equipo.golesFavor}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, index < 2 && styles.qualifiedText]}>
                  {equipo.golesContra}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, index < 2 && styles.qualifiedText]}>
                  {equipo.diferencia > 0 ? `+${equipo.diferencia}` : equipo.diferencia}
                </Text>
                <Text style={[styles.tableText, styles.statColumn, styles.pointsText, index < 2 && styles.qualifiedText]}>
                  {equipo.puntos}
                </Text>
              </View>
            ))}

            {/* Leyenda de clasificación */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: Colors.success + '20' }]} />
                <Text style={styles.legendText}>Clasificados a eliminatorias</Text>
              </View>
            </View>
          </SuperCard>
        ))
      )}
    </ScrollView>
  );

  const renderEliminatorias = () => (
    <ScrollView style={SuperLayoutStyles.contentContainer} showsVerticalScrollIndicator={false}>
      {!listoParaEliminatorias ? (
        <SuperCard elevated>
          <SuperHeader title="Eliminatorias" />
          <View style={styles.emptyState}>
            <Trophy size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Esperando fase de grupos</Text>
            <Text style={styles.emptyText}>
              Las eliminatorias comenzarán cuando termine la fase de grupos
            </Text>
          </View>
        </SuperCard>
      ) : (
        <SuperCard elevated>
          <SuperHeader title="Cuadro de Eliminatorias" />

          {/* Generar cruces automáticamente basados en clasificación */}
          {(() => {
            const clasificados = [];
            Object.values(clasificacionPorGrupos).forEach(grupo => {
              // Tomar los primeros 2 de cada grupo
              clasificados.push(...grupo.slice(0, 2));
            });

            if (clasificados.length < 4) {
              return (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Insuficientes equipos clasificados</Text>
                  <Text style={styles.emptyText}>
                    Se necesitan al menos 4 equipos para las eliminatorias
                  </Text>
                </View>
              );
            }

            // Organizar cruces (1A vs 2B, 1B vs 2A, etc.)
            const cruces = [];
            const grupos = Object.keys(clasificacionPorGrupos);

            if (grupos.length >= 2) {
              const grupoA = clasificacionPorGrupos[grupos[0]];
              const grupoB = clasificacionPorGrupos[grupos[1]];

              if (grupoA.length >= 2 && grupoB.length >= 2) {
                cruces.push({
                  id: 'semi-1',
                  titulo: 'Semifinal 1',
                  equipo1: grupoA[0],
                  equipo2: grupoB[1]
                });
                cruces.push({
                  id: 'semi-2',
                  titulo: 'Semifinal 2',
                  equipo1: grupoB[0],
                  equipo2: grupoA[1]
                });
              }
            }

            return (
              <View style={styles.eliminatorias}>
                <Text style={styles.eliminatoriasTitle}>🏆 Semifinales</Text>

                {cruces.map(cruce => (
                  <View key={cruce.id} style={styles.cruceContainer}>
                    <Text style={styles.cruceTitle}>{cruce.titulo}</Text>
                    <View style={styles.cruce}>
                      <View style={styles.equipoCruce}>
                        <Text style={styles.equipoCruceNombre}>{cruce.equipo1.nombre}</Text>
                        <Text style={styles.equipoCruceInfo}>1° Grupo {Object.keys(clasificacionPorGrupos)[0]}</Text>
                      </View>

                      <Text style={styles.vs}>VS</Text>

                      <View style={styles.equipoCruce}>
                        <Text style={styles.equipoCruceNombre}>{cruce.equipo2.nombre}</Text>
                        <Text style={styles.equipoCruceInfo}>2° Grupo {Object.keys(clasificacionPorGrupos)[1]}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View style={styles.finalContainer}>
                  <Text style={styles.eliminatoriasTitle}>🥇 Final</Text>
                  <Text style={styles.finalText}>
                    Ganador Semifinal 1 vs Ganador Semifinal 2
                  </Text>
                </View>

                {isOrganizador && (
                  <SuperButton
                    title="Generar Partidos de Eliminatorias"
                    variant="primary"
                    size="medium"
                    icon={<Plus size={18} color="white" />}
                    onPress={() => {
                      // TODO: Implementar generación de partidos eliminatorios
                      Alert.alert('Próximamente', 'Función en desarrollo');
                    }}
                  />
                )}
              </View>
            );
          })()}
        </SuperCard>
      )}
    </ScrollView>
  );

  return (
    <View style={[SuperLayoutStyles.screenContainer, { paddingTop: insets.top }]}>
      {/* Tabs */}
      <SuperCard elevated>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'resumen', title: 'Resumen' },
            { key: 'equipos', title: 'Equipos' },
            { key: 'partidos', title: 'Partidos' },
            { key: 'clasificacion', title: 'Clasificación' },
            ...(torneo?.tipo === 'grupos-eliminatorias' ? [{ key: 'eliminatorias', title: 'Eliminatorias' }] : [])
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SuperCard>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'resumen' && renderResumen()}
        {activeTab === 'equipos' && renderEquipos()}
        {activeTab === 'partidos' && renderPartidos()}
        {activeTab === 'clasificacion' && renderClasificacion()}
        {activeTab === 'eliminatorias' && renderEliminatorias()}
      </ScrollView>

      {/* Tournament Management Modal */}
      {managementModalVisible && (
        <Modal visible={managementModalVisible} transparent animationType="slide">
          <View style={modalStyles.overlay}>
            <View style={modalStyles.container}>
              <View style={modalStyles.header}>
                <Text style={modalStyles.title}>Gestionar Torneo</Text>
                <TouchableOpacity
                  style={modalStyles.closeButton}
                  onPress={() => setManagementModalVisible(false)}
                >
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={modalStyles.content}>
                <SuperCard>
                  <Text style={modalStyles.sectionTitle}>Participantes</Text>

                  <SuperButton
                    title="Agregar Equipos"
                    variant="secondary"
                    size="medium"
                    icon={<Users size={18} color={Colors.primary} />}
                    onPress={async () => {
                      setManagementModalVisible(false);

                      // Mostrar lista de equipos disponibles para agregar
                      const equiposDisponibles = equipos.filter(e =>
                        e.entrenadorId === user?.id &&
                        !torneo.equiposIds.includes(e.id) &&
                        e.categoria === torneo.categoria
                      );

                      if (equiposDisponibles.length === 0) {
                        Alert.alert(
                          'Sin equipos disponibles',
                          'No tienes equipos de la categoría ' + torneo.categoria + ' disponibles para agregar.'
                        );
                        return;
                      }

                      // Crear lista de opciones con equipos disponibles
                      const opcionesEquiposDisponibles = equiposDisponibles.map(equipo => ({
                        text: `${equipo.nombre} (${equipo.categoria})`,
                        onPress: async () => {
                          try {
                            console.log('➕ Agregando equipo:', equipo.nombre, 'ID:', equipo.id);
                            await inscribirEquipoEnTorneo(torneo.id, equipo.id);
                            Alert.alert('✅ Éxito', `${equipo.nombre} ha sido agregado al torneo exitosamente.`);
                          } catch (error) {
                            console.error('❌ Error agregando equipo:', error);
                            Alert.alert('Error', 'No se pudo agregar el equipo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                          }
                        }
                      }));

                      // Agregar opción de cancelar
                      opcionesEquiposDisponibles.push({
                        text: 'Cancelar',
                        onPress: async () => { } // No hacer nada al cancelar
                      });

                      // Mostrar lista de equipos disponibles
                      Alert.alert(
                        'Seleccionar Equipo a Agregar',
                        `Tienes ${equiposDisponibles.length} equipos disponibles de la categoría ${torneo.categoria}:\n\nSelecciona el equipo que deseas agregar:`,
                        opcionesEquiposDisponibles
                      );
                    }}
                    fullWidth
                  />

                  <SuperButton
                    title="Gestionar Equipos"
                    variant="ghost"
                    size="medium"
                    icon={<Edit2 size={18} color={Colors.text} />}
                    onPress={() => {
                      setManagementModalVisible(false);

                      if (equiposTorneo.length === 0) {
                        Alert.alert('Sin equipos', 'No hay equipos inscritos en este torneo.');
                        return;
                      }

                      // Crear una lista de opciones con todos los equipos
                      const opcionesEquipos = equiposTorneo.map((equipo, index) => {
                        const partidosJugados = partidosTorneo.filter(p =>
                          (p.equipoLocalId === equipo.id || p.equipoVisitanteId === equipo.id) &&
                          p.estado !== 'Pendiente'
                        ).length;

                        return {
                          text: `${equipo.nombre}${partidosJugados > 0 ? ` (${partidosJugados} partidos jugados)` : ''}`,
                          onPress: () => {
                            // Confirmar la eliminación del equipo específico
                            let mensaje = `¿Estás seguro de que deseas remover "${equipo.nombre}" del torneo?`;
                            if (partidosJugados > 0) {
                              mensaje += `\n\n⚠️ ADVERTENCIA: Este equipo ya jugó ${partidosJugados} partido(s). Removerlo puede afectar las estadísticas del torneo.`;
                            }

                            Alert.alert(
                              'Confirmar Eliminación',
                              mensaje,
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                  text: partidosJugados > 0 ? 'Remover de todas formas' : 'Sí, remover',
                                  style: 'destructive',
                                  onPress: async () => {
                                    try {
                                      console.log('🗑️ Eliminando equipo:', equipo.nombre, 'ID:', equipo.id);
                                      await desinscribirEquipoDelTorneo(torneo.id, equipo.id);
                                      Alert.alert('✅ Equipo removido', `${equipo.nombre} ha sido removido del torneo exitosamente.`);
                                    } catch (error) {
                                      console.error('❌ Error eliminando equipo:', error);
                                      Alert.alert('Error', 'No se pudo remover el equipo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                                    }
                                  }
                                }
                              ]
                            );
                          }
                        };
                      });

                      // Agregar opción de cancelar
                      opcionesEquipos.push({
                        text: 'Cancelar',
                        onPress: async () => { } // No hacer nada al cancelar
                      });

                      // Mostrar lista de equipos para seleccionar cuál eliminar
                      Alert.alert(
                        'Seleccionar Equipo a Remover',
                        `Equipos inscritos en el torneo (${equiposTorneo.length}):\n\nSelecciona el equipo que deseas remover:`,
                        opcionesEquipos
                      );
                    }}
                    fullWidth
                  />
                </SuperCard>

                <SuperCard>
                  <Text style={modalStyles.sectionTitle}>🎲 Sorteos</Text>

                  <SuperButton
                    title="Realizar Sorteo"
                    variant="primary"
                    size="medium"
                    icon={<Users size={18} color="white" />}
                    onPress={async () => {
                      setManagementModalVisible(false);

                      console.log('🎯 === INICIANDO SORTEO INTELIGENTE ===');
                      console.log('🏆 Torneo:', torneo.nombre);
                      console.log('🔍 Tipo:', torneo.tipo);
                      console.log('� Equipos:', equiposTorneo.length);

                      if (equiposTorneo.length < 2) {
                        Alert.alert('Pocos equipos', 'Necesitas al menos 2 equipos para hacer un sorteo.');
                        return;
                      }

                      // Determinar qué tipo de sorteo hacer automáticamente
                      let tipoSorteo = '';
                      let accion = null;

                      if ((torneo.tipo === 'grupos' || torneo.tipo === 'grupos-eliminatorias') &&
                        (!torneo.grupos || Object.keys(torneo.grupos).length === 0)) {
                        tipoSorteo = 'Crear y Sortear Grupos';
                        accion = async () => {
                          // Crear grupos automáticamente y sortear
                          const numGrupos = equiposTorneo.length <= 8 ? 2 : equiposTorneo.length <= 12 ? 3 : 4;
                          const gruposCreados: any = {};
                          const letrasGrupos = ['A', 'B', 'C', 'D'];

                          for (let i = 0; i < numGrupos; i++) {
                            gruposCreados[letrasGrupos[i]] = {
                              nombre: `Grupo ${letrasGrupos[i]}`,
                              equiposIds: []
                            };
                          }

                          await actualizarTorneo(torneo.id, { grupos: gruposCreados });

                          // Ahora sortear equipos en grupos
                          const equiposParaSorteo = [...equiposTorneo];
                          const equiposPorGrupo = Math.ceil(equiposParaSorteo.length / numGrupos);

                          // Mezclar equipos
                          for (let i = equiposParaSorteo.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [equiposParaSorteo[i], equiposParaSorteo[j]] = [equiposParaSorteo[j], equiposParaSorteo[i]];
                          }

                          const nuevosGrupos: any = {};
                          let resultado = '🎲 SORTEO COMPLETADO 🎲\n\n';

                          Object.keys(gruposCreados).forEach((grupoId, index) => {
                            const equiposDelGrupo = equiposParaSorteo.slice(
                              index * equiposPorGrupo,
                              (index + 1) * equiposPorGrupo
                            );

                            nuevosGrupos[grupoId] = {
                              ...gruposCreados[grupoId],
                              equiposIds: equiposDelGrupo.map(e => e.id)
                            };

                            resultado += `📋 GRUPO ${grupoId}\n`;
                            equiposDelGrupo.forEach((equipo, i) => {
                              resultado += `${i + 1}. ${equipo.nombre}\n`;
                            });
                            resultado += '\n';
                          });

                          await actualizarTorneo(torneo.id, { grupos: nuevosGrupos });
                          return resultado;
                        };
                      } else if (torneo.grupos && Object.keys(torneo.grupos).length > 0) {
                        tipoSorteo = 'Re-sortear Grupos Existentes';
                        accion = async () => {
                          // Re-sortear equipos en grupos existentes
                          const equiposParaSorteo = [...equiposTorneo];
                          const grupos = torneo.grupos || {};
                          const gruposIds = Object.keys(grupos);
                          const equiposPorGrupo = Math.ceil(equiposParaSorteo.length / gruposIds.length);

                          // Mezclar equipos
                          for (let i = equiposParaSorteo.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [equiposParaSorteo[i], equiposParaSorteo[j]] = [equiposParaSorteo[j], equiposParaSorteo[i]];
                          }

                          const nuevosGrupos: any = {};
                          let resultado = '🔄 RE-SORTEO COMPLETADO 🔄\n\n';

                          gruposIds.forEach((grupoId, index) => {
                            const equiposDelGrupo = equiposParaSorteo.slice(
                              index * equiposPorGrupo,
                              (index + 1) * equiposPorGrupo
                            );

                            nuevosGrupos[grupoId] = {
                              ...grupos[grupoId],
                              equiposIds: equiposDelGrupo.map(e => e.id)
                            };

                            resultado += `📋 GRUPO ${grupoId}\n`;
                            equiposDelGrupo.forEach((equipo, i) => {
                              resultado += `${i + 1}. ${equipo.nombre}\n`;
                            });
                            resultado += '\n';
                          });

                          await actualizarTorneo(torneo.id, { grupos: nuevosGrupos });
                          return resultado;
                        };
                      } else {
                        tipoSorteo = 'Sorteo General de Equipos';
                        accion = async () => {
                          // Sorteo simple de equipos
                          const equiposMezclados = [...equiposTorneo];

                          for (let i = equiposMezclados.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [equiposMezclados[i], equiposMezclados[j]] = [equiposMezclados[j], equiposMezclados[i]];
                          }

                          let resultado = '🎲 ORDEN ALEATORIO 🎲\n\n';
                          equiposMezclados.forEach((equipo, index) => {
                            const posicion = index + 1;
                            let emoji = posicion === 1 ? '🥇' : posicion === 2 ? '🥈' : posicion === 3 ? '🥉' : `${posicion}.`;
                            resultado += `${emoji} ${equipo.nombre}\n`;
                          });

                          return resultado + '\n💡 Este orden puede usarse para definir cabezas de serie, local/visitante, etc.';
                        };
                      }

                      Alert.alert(
                        '🎲 Confirmar Sorteo',
                        `Se realizará: ${tipoSorteo}\n\n¿Continuar con el sorteo?`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: '🎲 Sortear',
                            onPress: async () => {
                              try {
                                const resultado = await accion();
                                Alert.alert('✅ Sorteo Completado', resultado);
                              } catch (error) {
                                console.error('❌ Error en sorteo:', error);
                                Alert.alert('Error', 'No se pudo completar el sorteo: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                              }
                            }
                          }
                        ]
                      );
                    }}
                    fullWidth
                  />
                </SuperCard>

                <SuperCard>
                  <Text style={modalStyles.sectionTitle}>Partidos</Text>

                  <SuperButton
                    title="Generar Fixture"
                    variant="primary"
                    size="medium"
                    icon={<Calendar size={18} color="white" />}
                    onPress={async () => {
                      try {
                        console.log('⚽ Iniciando generación de fixture...');
                        console.log('🏆 Torneo:', torneo?.nombre);
                        console.log('👥 Equipos IDs:', torneo?.equiposIds);
                        console.log('🎯 Tipo de torneo:', torneo?.tipo);

                        if (!torneo) {
                          console.log('❌ No hay torneo seleccionado');
                          return;
                        }

                        if (!torneo.equiposIds || torneo.equiposIds.length < 2) {
                          Alert.alert('Error', 'Debes tener al menos 2 equipos para generar el fixture.');
                          return;
                        }

                        // Verificar si ya hay partidos
                        if (partidosTorneo.length > 0) {
                          Alert.alert(
                            'Fixture ya existe',
                            'Ya hay partidos generados para este torneo. ¿Deseas regenerar todos los partidos?',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              {
                                text: 'Regenerar',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    console.log('🔄 Regenerando fixture...');
                                    const nuevosPartidos = generarFixtureCompleto();
                                    console.log('📅 Partidos generados:', nuevosPartidos.length);
                                    await crearPartidos(nuevosPartidos);
                                    setManagementModalVisible(false);
                                    Alert.alert('✅ Fixture regenerado', 'Todos los partidos han sido creados correctamente.');
                                  } catch (error) {
                                    console.error('❌ Error regenerando fixture:', error);
                                    Alert.alert('Error', 'No se pudo regenerar el fixture: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                                  }
                                }
                              }
                            ]
                          );
                          return;
                        }

                        const generarFixtureCompleto = () => {
                          console.log('🏗️ Generando fixture completo...');

                          if (torneo.tipo === 'grupos' && torneo.grupos) {
                            console.log('📋 Generando partidos por grupos');
                            console.log('🔢 Grupos disponibles:', Object.keys(torneo.grupos));

                            // Generar partidos por grupos
                            const partidos: any[] = [];
                            let jornada = 1;

                            Object.entries(torneo.grupos).forEach(([grupoId, grupo]) => {
                              console.log(`📊 Procesando ${grupoId}:`, grupo.equiposIds);

                              // Generar partidos dentro del grupo (todos contra todos dentro del grupo)
                              const equiposGrupo = grupo.equiposIds;
                              for (let i = 0; i < equiposGrupo.length; i++) {
                                for (let j = i + 1; j < equiposGrupo.length; j++) {
                                  partidos.push({
                                    torneoId: torneo.id,
                                    equipoLocalId: equiposGrupo[i],
                                    equipoVisitanteId: equiposGrupo[j],
                                    fecha: '',
                                    hora: '',
                                    estado: 'Pendiente' as EstadoPartido,
                                    jornada,
                                    fase: torneo.tipo === 'grupos' ? 'grupos' : undefined,
                                    grupo: grupoId
                                  });
                                  jornada++;
                                }
                              }
                            });

                            console.log('✅ Partidos de grupos generados:', partidos.length);
                            return partidos;
                          } else {
                            console.log('� Generando partidos todos contra todos');
                            // Generar partidos todos contra todos (eliminatorias o liga)
                            return generarPartidosTodosContraTodos(torneo.equiposIds, torneo.id);
                          }
                        };

                        const nuevosPartidos = generarFixtureCompleto();
                        console.log('📤 Creando partidos en storage...');
                        await crearPartidos(nuevosPartidos);
                        console.log('✅ Fixture creado exitosamente');

                        setManagementModalVisible(false);
                        Alert.alert('✅ Fixture generado', `Se han creado ${nuevosPartidos.length} partidos correctamente.`);
                      } catch (error) {
                        console.error('❌ Error generando fixture:', error);
                        Alert.alert('Error', 'No se pudo generar el fixture: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                      }
                    }}
                    fullWidth
                  />

                  <SuperButton
                    title="Programar Partidos"
                    variant="secondary"
                    size="medium"
                    icon={<Clock size={18} color={Colors.primary} />}
                    onPress={() => {
                      setManagementModalVisible(false);

                      if (partidosTorneo.length === 0) {
                        Alert.alert(
                          'Sin partidos',
                          'Primero debes generar el fixture para poder programar los partidos.'
                        );
                        return;
                      }

                      const partidosSinFecha = partidosTorneo.filter(p => !p.fecha || p.fecha === '');

                      if (partidosSinFecha.length === 0) {
                        Alert.alert(
                          'Partidos programados',
                          'Todos los partidos ya tienen fecha y hora asignada.'
                        );
                        return;
                      }

                      Alert.alert(
                        'Programar Partidos',
                        `Hay ${partidosSinFecha.length} partidos sin programar de ${partidosTorneo.length} totales.`,
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Auto-programar',
                            onPress: () => {
                              // Programar automáticamente los partidos
                              Alert.alert(
                                '⏰ Programación automática',
                                'Los partidos se programarán automáticamente cada fin de semana.\n\n' +
                                '• Sábados: 10:00, 12:00, 16:00, 18:00\n' +
                                '• Domingos: 10:00, 12:00, 16:00\n\n' +
                                'Función en desarrollo...'
                              );
                            }
                          }
                        ]
                      );
                    }}
                    fullWidth
                  />
                </SuperCard>

                <SuperCard>
                  <Text style={modalStyles.sectionTitle}>Configuración</Text>

                  <SuperButton
                    title="Reglas del Torneo"
                    variant="ghost"
                    size="medium"
                    icon={<Settings size={18} color={Colors.text} />}
                    onPress={() => {
                      setManagementModalVisible(false);

                      const config = torneo.configuracion;
                      const reglas = [
                        `⚽ Puntos por victoria: ${config.puntosVictoria}`,
                        `🤝 Puntos por empate: ${config.puntosEmpate}`,
                        `❌ Puntos por derrota: ${config.puntosDerrota}`,
                        `⏰ Duración del partido: ${config.tiempoPartido} minutos`,
                        `☕ Tiempo de descanso: ${config.descanso} minutos`,
                        `🏆 Empates permitidos: ${config.permitirEmpates ? 'Sí' : 'No (penales)'}`,
                        config.equiposPorGrupo ? `👥 Equipos por grupo: ${config.equiposPorGrupo}` : '',
                        config.clasificadosPorGrupo ? `🎯 Clasificados por grupo: ${config.clasificadosPorGrupo}` : ''
                      ].filter(Boolean).join('\n');

                      Alert.alert(
                        '📋 Reglas del Torneo',
                        reglas,
                        [
                          { text: 'Cerrar', style: 'cancel' },
                          {
                            text: 'Editar Reglas',
                            onPress: () => {
                              Alert.alert(
                                'Edición de Reglas',
                                'La edición de reglas estará disponible próximamente.\n\n' +
                                'Podrás modificar:\n' +
                                '• Sistema de puntuación\n' +
                                '• Duración de partidos\n' +
                                '• Reglas de empates\n' +
                                '• Configuración de grupos'
                              );
                            }
                          }
                        ]
                      );
                    }}
                    fullWidth
                  />
                </SuperCard>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Finalize Tournament Modal */}
      {finalizarModalVisible && (
        <Modal visible={finalizarModalVisible} transparent animationType="fade">
          <View style={modalStyles.overlay}>
            <View style={modalStyles.container}>
              <View style={modalStyles.header}>
                <Text style={modalStyles.title}>Finalizar Torneo</Text>
                <TouchableOpacity
                  style={modalStyles.closeButton}
                  onPress={() => setFinalizarModalVisible(false)}
                >
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={modalStyles.content}>

                let resultado = '⚡ SORTEO EXPRESS ⚡\n\n';
                resultado += '📝 Orden aleatorio de equipos:\n\n';

                              equiposMezclados.forEach((equipo, index) => {
                                const posicion = index + 1;
                let emoji = '';
                if (posicion === 1) emoji = '🥇';
                else if (posicion === 2) emoji = '🥈';
                else if (posicion === 3) emoji = '🥉';
                else emoji = `${posicion}.`;

                resultado += `${emoji} ${equipo.nombre}\n`;
                              });

                resultado += '\n💡 Este orden puede usarse para:\n';
                resultado += '• Determinar local/visitante\n';
                resultado += '• Orden de sorteo de bombos\n';
                resultado += '• Prioridad de selección\n';
                resultado += '• Cabezas de serie';

                Alert.alert('⚡ Resultado Express', resultado);
                            }
                          }
                ]
                );
                    }}
                fullWidth
                  />

                <SuperButton
                  title="Sorteo Personalizado"
                  variant="ghost"
                  size="medium"
                  icon={<Settings size={18} color={Colors.text} />}
                  onPress={() => {
                    setManagementModalVisible(false);

                    if (equiposTorneo.length < 2) {
                      Alert.alert('Pocos equipos', 'Necesitas al menos 2 equipos para hacer sorteos.');
                      return;
                    }

                    // Mostrar opciones de sorteo personalizado
                    Alert.alert(
                      '🎲 Sorteo Personalizado',
                      'Selecciona el tipo de sorteo que deseas realizar:',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: '🏠 Local/Visitante',
                          onPress: () => {
                            // Sortear local y visitante para cada partido
                            if (partidosTorneo.length === 0) {
                              Alert.alert('Sin partidos', 'Primero debes generar el fixture.');
                              return;
                            }

                            let resultado = '🏠 SORTEO LOCAL/VISITANTE 🏠\n\n';
                            partidosTorneo.forEach((partido, index) => {
                              const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
                              const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);

                              // Intercambiar aleatoriamente
                              const intercambiar = Math.random() < 0.5;
                              if (intercambiar) {
                                resultado += `J${partido.jornada}: ${equipoVisitante?.nombre} (L) vs ${equipoLocal?.nombre} (V)\n`;
                              } else {
                                resultado += `J${partido.jornada}: ${equipoLocal?.nombre} (L) vs ${equipoVisitante?.nombre} (V)\n`;
                              }
                            });

                            Alert.alert('🏠 Resultado Sorteo Local/Visitante', resultado);
                          }
                        },
                        {
                          text: '� Por Bombos',
                          onPress: () => {
                            // Sortear equipos divididos en bombos
                            const mitad = Math.ceil(equiposTorneo.length / 2);
                            const bombo1 = [...equiposTorneo].slice(0, mitad);
                            const bombo2 = [...equiposTorneo].slice(mitad);

                            // Mezclar cada bombo
                            [bombo1, bombo2].forEach(bombo => {
                              for (let i = bombo.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [bombo[i], bombo[j]] = [bombo[j], bombo[i]];
                              }
                            });

                            let resultado = '🎯 SORTEO POR BOMBOS 🎯\n\n';
                            resultado += '🔴 BOMBO 1 (Cabezas de serie):\n';
                            bombo1.forEach((equipo, i) => {
                              resultado += `${i + 1}. ${equipo.nombre}\n`;
                            });
                            resultado += '\n🔵 BOMBO 2:\n';
                            bombo2.forEach((equipo, i) => {
                              resultado += `${i + 1}. ${equipo.nombre}\n`;
                            });

                            Alert.alert('🎯 Resultado Sorteo por Bombos', resultado);
                          }
                        }
                      ]
                    );
                  }}
                  fullWidth
                />
              </SuperCard>

              <SuperCard>
                <Text style={modalStyles.sectionTitle}>Partidos</Text>

                <SuperButton
                  title="Generar Fixture"
                  variant="primary"
                  size="medium"
                  icon={<Calendar size={18} color="white" />}
                  onPress={async () => {
                    try {
                      console.log('⚽ Iniciando generación de fixture...');
                      console.log('🏆 Torneo:', torneo?.nombre);
                      console.log('👥 Equipos IDs:', torneo?.equiposIds);
                      console.log('🎯 Tipo de torneo:', torneo?.tipo);

                      if (!torneo) {
                        console.log('❌ No hay torneo seleccionado');
                        return;
                      }

                      if (!torneo.equiposIds || torneo.equiposIds.length < 2) {
                        Alert.alert('Error', 'Debes tener al menos 2 equipos para generar el fixture.');
                        return;
                      }

                      // Verificar si ya hay partidos
                      if (partidosTorneo.length > 0) {
                        Alert.alert(
                          'Fixture ya existe',
                          'Ya hay partidos generados para este torneo. ¿Deseas regenerar todos los partidos?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Regenerar',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  console.log('🔄 Regenerando fixture...');
                                  const nuevosPartidos = generarFixtureCompleto();
                                  console.log('📅 Partidos generados:', nuevosPartidos.length);
                                  await crearPartidos(nuevosPartidos);
                                  setManagementModalVisible(false);
                                  Alert.alert('✅ Fixture regenerado', 'Todos los partidos han sido creados correctamente.');
                                } catch (error) {
                                  console.error('❌ Error regenerando fixture:', error);
                                  Alert.alert('Error', 'No se pudo regenerar el fixture: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                                }
                              }
                            }
                          ]
                        );
                        return;
                      }

                      const generarFixtureCompleto = () => {
                        console.log('🏗️ Generando fixture completo...');

                        if (torneo.tipo === 'grupos' && torneo.grupos) {
                          console.log('📋 Generando partidos por grupos');
                          console.log('🔢 Grupos disponibles:', Object.keys(torneo.grupos));

                          // Generar partidos por grupos
                          const partidos: any[] = [];
                          let jornada = 1;

                          Object.entries(torneo.grupos).forEach(([grupoId, grupo]) => {
                            console.log(`📊 Procesando ${grupoId}:`, grupo.equiposIds);

                            // Generar partidos dentro del grupo (todos contra todos dentro del grupo)
                            const equiposGrupo = grupo.equiposIds;
                            for (let i = 0; i < equiposGrupo.length; i++) {
                              for (let j = i + 1; j < equiposGrupo.length; j++) {
                                partidos.push({
                                  torneoId: torneo.id,
                                  equipoLocalId: equiposGrupo[i],
                                  equipoVisitanteId: equiposGrupo[j],
                                  fecha: '',
                                  hora: '',
                                  estado: 'Pendiente' as EstadoPartido,
                                  jornada,
                                  fase: torneo.tipo === 'grupos' ? 'grupos' : undefined,
                                  grupo: grupoId
                                });
                                jornada++;
                              }
                            }
                          });

                          console.log('✅ Partidos de grupos generados:', partidos.length);
                          return partidos;
                        } else {
                          console.log('🔄 Generando partidos todos contra todos');
                          // Generar partidos todos contra todos (eliminatorias o liga)
                          return generarPartidosTodosContraTodos(torneo.equiposIds, torneo.id);
                        }
                      };

                      const nuevosPartidos = generarFixtureCompleto();
                      console.log('📤 Creando partidos en storage...');
                      await crearPartidos(nuevosPartidos);
                      console.log('✅ Fixture creado exitosamente');

                      setManagementModalVisible(false);
                      Alert.alert('✅ Fixture generado', `Se han creado ${nuevosPartidos.length} partidos correctamente.`);
                    } catch (error) {
                      console.error('❌ Error generando fixture:', error);
                      Alert.alert('Error', 'No se pudo generar el fixture: ' + (error instanceof Error ? error.message : 'Error desconocido'));
                    }
                  }}
                  fullWidth
                />

                <SuperButton
                  title="Programar Partidos"
                  variant="secondary"
                  size="medium"
                  icon={<Clock size={18} color={Colors.primary} />}
                  onPress={() => {
                    setManagementModalVisible(false);

                    if (partidosTorneo.length === 0) {
                      Alert.alert(
                        'Sin partidos',
                        'Primero debes generar el fixture para poder programar los partidos.'
                      );
                      return;
                    }

                    const partidosSinFecha = partidosTorneo.filter(p => !p.fecha || p.fecha === '');

                    if (partidosSinFecha.length === 0) {
                      Alert.alert(
                        'Partidos programados',
                        'Todos los partidos ya tienen fecha y hora asignada.'
                      );
                      return;
                    }

                    Alert.alert(
                      'Programar Partidos',
                      `Hay ${partidosSinFecha.length} partidos sin programar de ${partidosTorneo.length} totales.`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Auto-programar',
                          onPress: () => {
                            // Programar automáticamente los partidos
                            Alert.alert(
                              '⏰ Programación automática',
                              'Los partidos se programarán automáticamente cada fin de semana.\n\n' +
                              '• Sábados: 10:00, 12:00, 16:00, 18:00\n' +
                              '• Domingos: 10:00, 12:00, 16:00\n\n' +
                              'Función en desarrollo...'
                            );
                          }
                        }
                      ]
                    );
                  }}
                  fullWidth
                />
              </SuperCard>

              <SuperCard>
                <Text style={modalStyles.sectionTitle}>Configuración</Text>

                <SuperButton
                  title="Reglas del Torneo"
                  variant="ghost"
                  size="medium"
                  icon={<Settings size={18} color={Colors.text} />}
                  onPress={() => {
                    setManagementModalVisible(false);

                    const config = torneo.configuracion;
                    const reglas = [
                      `⚽ Puntos por victoria: ${config.puntosVictoria}`,
                      `🤝 Puntos por empate: ${config.puntosEmpate}`,
                      `❌ Puntos por derrota: ${config.puntosDerrota}`,
                      `⏰ Duración del partido: ${config.tiempoPartido} minutos`,
                      `☕ Tiempo de descanso: ${config.descanso} minutos`,
                      `🏆 Empates permitidos: ${config.permitirEmpates ? 'Sí' : 'No (penales)'}`,
                      config.equiposPorGrupo ? `👥 Equipos por grupo: ${config.equiposPorGrupo}` : '',
                      config.clasificadosPorGrupo ? `🎯 Clasificados por grupo: ${config.clasificadosPorGrupo}` : ''
                    ].filter(Boolean).join('\n');

                    Alert.alert(
                      '📋 Reglas del Torneo',
                      reglas,
                      [
                        { text: 'Cerrar', style: 'cancel' },
                        {
                          text: 'Editar Reglas',
                          onPress: () => {
                            Alert.alert(
                              'Edición de Reglas',
                              'La edición de reglas estará disponible próximamente.\n\n' +
                              'Podrás modificar:\n' +
                              '• Sistema de puntuación\n' +
                              '• Duración de partidos\n' +
                              '• Reglas de empates\n' +
                              '• Configuración de grupos'
                            );
                          }
                        }
                      ]
                    );
                  }}
                  fullWidth
                />
              </SuperCard>
            </ScrollView>
          </View>
        </View>
        </Modal>
  )
}

{/* Finalize Tournament Modal */ }
{
  finalizarModalVisible && (
    <Modal visible={finalizarModalVisible} transparent animationType="fade">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Finalizar Torneo</Text>
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => setFinalizarModalVisible(false)}
            >
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.content}>
            <Text style={modalStyles.warningText}>
              ¿Estás seguro de que deseas finalizar este torneo?
            </Text>
            <Text style={modalStyles.warningSubtext}>
              Esta acción no se puede deshacer. Se determinarán los ganadores automáticamente.
            </Text>

            <View style={modalStyles.buttonRow}>
              <SuperButton
                title="Cancelar"
                variant="secondary"
                size="medium"
                onPress={() => setFinalizarModalVisible(false)}
                style={modalStyles.buttonFlex}
              />

              <SuperButton
                title="Finalizar"
                variant="danger"
                size="medium"
                onPress={() => {
                  setFinalizarModalVisible(false);
                  Alert.alert('Torneo Finalizado', 'El torneo ha sido finalizado exitosamente.');
                }}
                style={modalStyles.buttonFlex}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
    </View >
  );
}

const styles = StyleSheet.create({
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
  torneoInfo: {
    paddingVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  buttonFlex: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  activeTabText: {
    color: 'white',
  },
  equipoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  equipoInfo: {
    flex: 1,
  },
  equipoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  equipoCategoria: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  equipoNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  partidoItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  partidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  partidoFecha: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  partidoEstado: {
    fontSize: 12,
    fontWeight: '600',
  },
  partidoEquipos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipoPartido: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  marcador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  goles: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  vs: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginHorizontal: 8,
  },
  jornadaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Estilos para tabla de clasificación
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border + '40',
    alignItems: 'center',
  },
  qualifiedRow: {
    backgroundColor: Colors.success + '10',
  },
  tableText: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  qualifiedText: {
    fontWeight: '600',
    color: Colors.success,
  },
  pointsText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  positionColumn: {
    flex: 0.5,
  },
  teamColumn: {
    flex: 2.5,
    textAlign: 'left',
    paddingLeft: 8,
  },
  statColumn: {
    flex: 0.6,
  },
  legend: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border + '40',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Estilos para eliminatorias
  eliminatorias: {
    padding: 16,
  },
  eliminatoriasTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  cruceContainer: {
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
  },
  cruceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  cruce: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipoCruce: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipoCruceNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  equipoCruceInfo: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  finalContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  finalText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  warningSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonFlex: {
    flex: 1,
  },
});