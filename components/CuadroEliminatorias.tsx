import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { Trophy, Calendar, Clock, Edit3 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Partido, Equipo } from '@/types';

interface CuadroEliminatoriasProps {
  partidos: Partido[];
  equipos: Equipo[];
  onEditPartido?: (partidoId: string) => void;
  isEditable?: boolean;
}

interface PartidoEliminatorias {
  id: string;
  equipoLocal?: Equipo;
  equipoVisitante?: Equipo;
  golesLocal?: number;
  golesVisitante?: number;
  fecha?: string;
  hora?: string;
  estado: string;
  fase: string;
  ganador?: Equipo;
}

const FASES_ORDER = ['octavos', 'cuartos', 'semifinal', 'final'];

const FASE_NAMES = {
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinales',
  final: 'Final'
};

export default function CuadroEliminatorias({
  partidos,
  equipos,
  onEditPartido,
  isEditable = false
}: CuadroEliminatoriasProps) {
  const getEquipoById = (id: string): Equipo | undefined => {
    return equipos.find(e => e.id === id);
  };

  const getGanador = (partido: Partido): Equipo | undefined => {
    if (partido.estado !== 'Jugado' || partido.golesLocal === undefined || partido.golesVisitante === undefined) {
      return undefined;
    }
    
    if (partido.golesLocal > partido.golesVisitante) {
      return getEquipoById(partido.equipoLocalId);
    } else if (partido.golesVisitante > partido.golesLocal) {
      return getEquipoById(partido.equipoVisitanteId);
    }
    
    return undefined; // Empate - en eliminatorias debería resolverse
  };

  const organizarPartidosPorFase = (): { [fase: string]: PartidoEliminatorias[] } => {
    const partidosPorFase: { [fase: string]: PartidoEliminatorias[] } = {};
    
    partidos.forEach(partido => {
      if (!partido.fase) return;
      
      const partidoEliminatorias: PartidoEliminatorias = {
        id: partido.id,
        equipoLocal: getEquipoById(partido.equipoLocalId),
        equipoVisitante: getEquipoById(partido.equipoVisitanteId),
        golesLocal: partido.golesLocal,
        golesVisitante: partido.golesVisitante,
        fecha: partido.fecha,
        hora: partido.hora,
        estado: partido.estado,
        fase: partido.fase,
        ganador: getGanador(partido)
      };
      
      if (!partidosPorFase[partido.fase]) {
        partidosPorFase[partido.fase] = [];
      }
      
      partidosPorFase[partido.fase].push(partidoEliminatorias);
    });
    
    return partidosPorFase;
  };

  const renderEquipo = (equipo?: Equipo, isGanador: boolean = false) => {
    if (!equipo) {
      return (
        <View style={[styles.equipoContainer, styles.equipoVacio]}>
          <Text style={styles.equipoVacioText}>Por definir</Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.equipoContainer,
        isGanador && styles.equipoGanador
      ]}>
        {equipo.escudo && (
          <Image source={{ uri: equipo.escudo }} style={styles.escudoSmall} />
        )}
        <Text style={[
          styles.equipoNombre,
          isGanador && styles.equipoNombreGanador
        ]} numberOfLines={1}>
          {equipo.nombre}
        </Text>
      </View>
    );
  };

  const renderPartido = (partido: PartidoEliminatorias) => {
    const localGanador = partido.ganador?.id === partido.equipoLocal?.id;
    const visitanteGanador = partido.ganador?.id === partido.equipoVisitante?.id;

    return (
      <View key={partido.id} style={styles.partidoContainer}>
        <View style={styles.partidoHeader}>
          {partido.fecha && partido.hora && (
            <View style={styles.fechaHora}>
              <Calendar size={12} color={Colors.textLight} />
              <Text style={styles.fechaText}>
                {new Date(partido.fecha).toLocaleDateString('es-ES', { 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </Text>
              <Clock size={12} color={Colors.textLight} />
              <Text style={styles.horaText}>{partido.hora}</Text>
            </View>
          )}
          {isEditable && onEditPartido && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEditPartido(partido.id)}
            >
              <Edit3 size={14} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.enfrentamiento}>
          {renderEquipo(partido.equipoLocal, localGanador)}
          
          <View style={styles.resultado}>
            {partido.estado === 'Jugado' && partido.golesLocal !== undefined && partido.golesVisitante !== undefined ? (
              <Text style={styles.marcador}>
                {partido.golesLocal} - {partido.golesVisitante}
              </Text>
            ) : (
              <Text style={styles.vs}>VS</Text>
            )}
          </View>
          
          {renderEquipo(partido.equipoVisitante, visitanteGanador)}
        </View>

        <View style={styles.estadoContainer}>
          <View style={[
            styles.estadoBadge,
            partido.estado === 'Jugado' && styles.estadoJugado,
            partido.estado === 'En curso' && styles.estadoEnCurso,
            partido.estado === 'Pendiente' && styles.estadoPendiente
          ]}>
            <Text style={[
              styles.estadoText,
              partido.estado === 'Jugado' && styles.estadoTextJugado
            ]}>
              {partido.estado}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const partidosPorFase = organizarPartidosPorFase();
  const fasesConPartidos = FASES_ORDER.filter(fase => partidosPorFase[fase]?.length > 0);

  if (fasesConPartidos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Trophy size={48} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>No hay eliminatorias</Text>
        <Text style={styles.emptySubtitle}>
          Las eliminatorias se generarán automáticamente cuando termine la fase de grupos
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Trophy size={24} color={Colors.primary} />
        <Text style={styles.title}>Cuadro de Eliminatorias</Text>
      </View>

      {fasesConPartidos.map(fase => (
        <View key={fase} style={styles.faseContainer}>
          <View style={styles.faseHeader}>
            <Text style={styles.faseTitle}>
              {FASE_NAMES[fase as keyof typeof FASE_NAMES] || fase}
            </Text>
            <View style={styles.faseBadge}>
              <Text style={styles.faseBadgeText}>
                {partidosPorFase[fase].length} {partidosPorFase[fase].length === 1 ? 'partido' : 'partidos'}
              </Text>
            </View>
          </View>

          <View style={styles.partidosGrid}>
            {partidosPorFase[fase].map(partido => renderPartido(partido))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Los ganadores avanzan automáticamente a la siguiente fase
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  faseContainer: {
    marginBottom: 16,
  },
  faseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  faseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  faseBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  faseBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  partidosGrid: {
    paddingHorizontal: 12,
    gap: 8,
  },
  partidoContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  partidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fechaHora: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fechaText: {
    fontSize: 11,
    color: Colors.textLight,
  },
  horaText: {
    fontSize: 11,
    color: Colors.textLight,
  },
  editButton: {
    padding: 4,
  },
  enfrentamiento: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 6,
    padding: 8,
    gap: 6,
  },
  equipoGanador: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  equipoVacio: {
    backgroundColor: Colors.border + '30',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipoVacioText: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  escudoSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  equipoNombre: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  equipoNombreGanador: {
    color: Colors.primary,
    fontWeight: '600',
  },
  resultado: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    minWidth: 35,
  },
  marcador: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  vs: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
  },
  estadoContainer: {
    alignItems: 'center',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.border + '30',
  },
  estadoJugado: {
    backgroundColor: Colors.success + '20',
  },
  estadoEnCurso: {
    backgroundColor: Colors.warning + '20',
  },
  estadoPendiente: {
    backgroundColor: Colors.textLight + '20',
  },
  estadoText: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '500',
  },
  estadoTextJugado: {
    color: Colors.success,
  },
  footer: {
    padding: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});