import { useState } from 'react';
import type { Equipo, Partido, EstadoPartido } from '@/types';
import {
  generarBracketEliminacion,
  generarPartidosEliminacion,
  generarPartidosLiga,
  generarPartidosTriangular,
  dividirEnGrupos,
  generarPartidosGrupos
} from './utils';

export type FormatoTorneo = 'eliminacion' | 'doble-eliminacion' | 'triangular' | 'grupos' | 'liga';

export interface TorneoManagerState {
  equipos: Equipo[];
  partidos: Partido[];
  formato: FormatoTorneo;
  grupos?: Record<string, Equipo[]>;
  clasificacion?: any;
  bracket?: any;
  estado: 'configuracion' | 'en-curso' | 'finalizado';
}

export interface TorneoConfig {
  formato: FormatoTorneo;
  equipos: Equipo[];
  clasifican_por_grupo?: number;
  mejores_terceros?: boolean;
  byes_permitidos?: boolean;
  partido_tercer_puesto?: boolean;
  playoff_final?: boolean;
}

export interface PartidoResultado {
  equipoA: string;
  equipoB: string;
  puntosA: number;
  puntosB: number;
}

export interface TorneoState {
  equipos: Equipo[];
  partidos: Partido[];
  formato: FormatoTorneo;
  grupos?: Record<string, Equipo[]>;
  clasificacion?: any;
  bracket?: any;
  estado: 'configuracion' | 'en-curso' | 'finalizado';
  estado_equipo: Record<string, 'activo' | 'clasificado' | 'eliminado'>;
  siguientes_partidos: Partido[];
  historial_resultados: PartidoResultado[];
}

export function useTorneoManager() {
  const [state, setState] = useState<TorneoState>({
    equipos: [],
    partidos: [],
    formato: 'eliminacion',
    estado: 'configuracion',
    estado_equipo: {},
    siguientes_partidos: [],
    historial_resultados: [],
  });

  // Configuración inicial
  // --- CONFIGURAR TORNEO (TODOS LOS FORMATOS) ---
  function configurarTorneo(equipos: Equipo[], formato: FormatoTorneo, opciones?: TorneoConfig) {
    let partidos: Partido[] = [];
    let grupos: Record<string, Equipo[]> | undefined = undefined;
    let bracket: any = undefined;
    let estado_equipo: Record<string, 'activo' | 'clasificado' | 'eliminado'> = {};
    equipos.forEach(eq => (estado_equipo[eq.id] = 'activo'));
    if (formato === 'eliminacion') {
      partidos = generarPartidosEliminacion(equipos, 'TORNEO-1').map((p, idx) => ({ ...p, id: `P${idx + 1}` }));
      bracket = generarBracketEliminacion(equipos);
    } else if (formato === 'liga') {
      partidos = generarPartidosLiga(equipos, 'TORNEO-1').map((p, idx) => ({ ...p, id: `P${idx + 1}` }));
    } else if (formato === 'triangular') {
      partidos = generarPartidosTriangular(equipos, 'TORNEO-1').map((p, idx) => ({ ...p, id: `P${idx + 1}` }));
    } else if (formato === 'grupos') {
      const numGrupos = opciones?.clasifican_por_grupo ? Math.ceil(equipos.length / opciones.clasifican_por_grupo) : 2;
      grupos = dividirEnGrupos(equipos, numGrupos);
      partidos = generarPartidosGrupos(grupos, 'TORNEO-1').map((p, idx) => ({ ...p, id: `P${idx + 1}` }));
    } else if (formato === 'doble-eliminacion') {
      // TODO: lógica de doble eliminación (estructura inicial)
      partidos = generarPartidosEliminacion(equipos, 'TORNEO-1').map((p, idx) => ({ ...p, id: `P${idx + 1}` }));
      bracket = generarBracketEliminacion(equipos); // Se puede extender para doble bracket
    }
    setState(s => ({
      ...s,
      equipos,
      formato,
      partidos,
      grupos,
      bracket,
      estado: 'en-curso',
      estado_equipo,
      siguientes_partidos: partidos,
      historial_resultados: [],
    }));
  }

  // Ingresar resultado de partido
  // --- INGRESAR RESULTADO Y AVANZAR RONDA (TODOS LOS FORMATOS) ---
  function ingresarResultado(partidoId: string, golesLocal: number, golesVisitante: number) {
    setState(s => {
      // Actualizar partido
      const partidos = s.partidos.map(p =>
        p.id === partidoId ? { ...p, golesLocal, golesVisitante, estado: 'Jugado' as EstadoPartido } : p
      );
      const partido = partidos.find(p => p.id === partidoId);
      const historial_resultados = [
        ...s.historial_resultados,
        {
          equipoA: partido?.equipoLocalId || '',
          equipoB: partido?.equipoVisitanteId || '',
          puntosA: golesLocal,
          puntosB: golesVisitante,
        },
      ];
      let estado_equipo = { ...s.estado_equipo };
      let siguientes_partidos = partidos.filter(p => p.estado === 'Pendiente');
      let estado = s.estado;

      // --- Eliminación directa ---
      if (s.formato === 'eliminacion') {
        if (partido) {
          const ganador = golesLocal > golesVisitante ? partido.equipoLocalId : partido.equipoVisitanteId;
          const perdedor = golesLocal > golesVisitante ? partido.equipoVisitanteId : partido.equipoLocalId;
          estado_equipo[ganador] = 'clasificado';
          estado_equipo[perdedor] = 'eliminado';
        }
        if (siguientes_partidos.length === 0) estado = 'finalizado';
      }

      // --- Liga completa ---
      if (s.formato === 'liga') {
        // Todos juegan contra todos, tabla por puntos
        // Se puede calcular tabla_posiciones aquí
        if (siguientes_partidos.length === 0) estado = 'finalizado';
      }

      // --- Triangular ---
      if (s.formato === 'triangular') {
        // Todos juegan contra todos, tabla por puntos, desempates
        if (siguientes_partidos.length === 0) estado = 'finalizado';
      }

      // --- Fase de grupos ---
      if (s.formato === 'grupos') {
        // Actualizar tabla de cada grupo, clasificar top N, mejores terceros si aplica
        // Cuando todos los partidos de grupos terminan, generar bracket eliminatorio
        if (siguientes_partidos.length === 0) estado = 'finalizado';
      }

      // --- Doble eliminación (estructura base) ---
      if (s.formato === 'doble-eliminacion') {
        // TODO: lógica de doble bracket, eliminación tras 2 derrotas, partido extra si aplica
        if (siguientes_partidos.length === 0) estado = 'finalizado';
      }

      return {
        ...s,
        partidos,
        estado_equipo,
        siguientes_partidos,
        historial_resultados,
        estado,
      };
    });
  }

  // Generar partidos según formato
  function generarPartidos() {
    // Ya se generan en configurarTorneo
    return state.partidos;
  }

  // Calcular clasificaciones
  function calcularClasificacion() {
    // TODO: lógica de tablas y desempates para cada formato
    // Se puede implementar para liga, grupos y triangular
    return null;
  }

  // Avanzar rondas/brackets
  function avanzarRonda() {
    // TODO: lógica de avance automático para knockout y doble eliminación
  }

  // --- Generación automática de calendario ---
  function getCalendario() {
    // Devuelve todos los partidos ordenados por jornada y fecha
    return state.partidos.slice().sort((a, b) => (a.jornada || 0) - (b.jornada || 0));
  }

  // --- Tabla de posiciones en tiempo real ---
  function getTablaPosiciones() {
    // Para liga, grupos, triangular
    // Reutiliza la lógica de TablaPosiciones/calcularTabla
    // Aquí solo para liga global
    if (!state.equipos.length) return [];
    const equipos = state.equipos;
    const partidos = state.partidos;
    const tabla = equipos.map(eq => {
      let pts = 0, gf = 0, gc = 0, jugados = 0, ganados = 0, empatados = 0, perdidos = 0;
      partidos.forEach(p => {
        if (p.estado !== 'Jugado') return;
        if (p.equipoLocalId === eq.id || p.equipoVisitanteId === eq.id) {
          jugados++;
          const esLocal = p.equipoLocalId === eq.id;
          const golesFavor = esLocal ? p.golesLocal ?? 0 : p.golesVisitante ?? 0;
          const golesContra = esLocal ? p.golesVisitante ?? 0 : p.golesLocal ?? 0;
          gf += golesFavor;
          gc += golesContra;
          if (golesFavor > golesContra) ganados++, pts += 3;
          else if (golesFavor === golesContra) empatados++, pts += 1;
          else perdidos++;
        }
      });
      return { equipo: eq.nombre, pts, jugados, ganados, empatados, perdidos, gf, gc, dg: gf - gc };
    });
    return tabla.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
  }

  // --- Estadísticas básicas (goles, asistencias, tarjetas) ---
  function getEstadisticas() {
    // Por ahora solo goles por equipo y jugador
    const stats: Record<string, { goles: number; asistencias: number; tarjetas: number }> = {};
    state.equipos.forEach(eq => { stats[eq.id] = { goles: 0, asistencias: 0, tarjetas: 0 }; });
    state.partidos.forEach(p => {
      if (p.estado !== 'Jugado') return;
      if (typeof p.golesLocal === 'number') stats[p.equipoLocalId].goles += p.golesLocal;
      if (typeof p.golesVisitante === 'number') stats[p.equipoVisitanteId].goles += p.golesVisitante;
      // Aquí puedes sumar asistencias y tarjetas si los partidos tienen esos datos
    });
    return stats;
  }

  return {
    state,
    configurarTorneo,
    ingresarResultado,
    generarPartidos,
    calcularClasificacion,
    avanzarRonda,
    getCalendario,
    getTablaPosiciones,
    getEstadisticas,
    setState,
  };
}
