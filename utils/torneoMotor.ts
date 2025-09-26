

import { Torneo, Equipo, Partido, Categoria, TipoFutbol, EventoPartido, TipoTorneo } from '../types';
/**
 * 🧠 Especificación Técnica – Motor de Reglas de Torneos (v1.0)
 * Archivo: utils/torneoMotor.ts
 *
 * 🎯 Objetivo:
 * Generar el calendario inicial de partidos y gestionar la progresión de un torneo
 * en función del formato seleccionado y las reglas configuradas.
 * ...
 */

// Tipos extendidos para soportar todos los formatos
export type FormatoTorneo = 'eliminacion' | 'doble_eliminacion' | 'triangular' | 'grupos' | 'liga';

export interface InicializarTorneoConfig {
  clasifican_por_grupo?: number;
  mejores_terceros?: boolean;
  byes_permitidos?: boolean;
  partido_tercer_puesto?: boolean;
  playoff_final?: boolean;
  [key: string]: any;
}

export function inicializarTorneo(
  formato: FormatoTorneo,
  equipos: Equipo[],
  config: InicializarTorneoConfig = {},
  opciones?: Partial<Omit<Torneo, 'id' | 'fechaCreacion' | 'equiposIds' | 'configuracion'>>
): Torneo & { partidosIniciales: Partido[] } {
  const now = new Date().toISOString();
  // Configuración base mínima
  const configuracionBase = {
    puntosVictoria: 3,
    puntosEmpate: 1,
    puntosDerrota: 0,
    tiempoPartido: 50,
    descanso: 10,
    permitirEmpates: formato !== 'eliminacion',
    ...config
  };
  let partidosIniciales: Partido[] = [];
  switch (formato) {
    case 'eliminacion':
      partidosIniciales = generarPartidosEliminacion(equipos, opciones?.fechaInicio || now, config);
      break;
    case 'doble_eliminacion':
      partidosIniciales = generarPartidosDobleEliminacion(equipos, opciones?.fechaInicio || now, config);
      break;
    case 'triangular':
      partidosIniciales = generarPartidosTriangular(equipos, opciones?.fechaInicio || now, config);
      break;
    case 'grupos':
      partidosIniciales = generarPartidosGrupos(equipos, opciones?.fechaInicio || now, config);
      break;
    case 'liga':
  partidosIniciales = generarPartidosLiga(equipos);
      break;
    default:
      break;
  }
  return {
    id: `torneo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    nombre: opciones?.nombre || 'Torneo sin nombre',
    descripcion: opciones?.descripcion || '',
    ciudad: opciones?.ciudad || '',
  categoria: (opciones?.categoria as Categoria) || equipos[0]?.categoria || 'Alevin',
  tipoFutbol: (opciones?.tipoFutbol as TipoFutbol) || equipos[0]?.tipoFutbol || 'F7',
    fechaInicio: opciones?.fechaInicio || now,
    fechaFin: opciones?.fechaFin,
    equiposIds: equipos.map(e => e.id),
    maxEquipos: opciones?.maxEquipos || 16,
    minEquipos: opciones?.minEquipos || 4,
    estado: 'Próximo',
  tipo: formato === 'liga' ? 'grupos' :
    formato === 'eliminacion' ? 'eliminatorias' :
    formato === 'doble_eliminacion' ? 'eliminatorias' :
    formato === 'triangular' ? 'grupos' :
    formato as TipoTorneo,
    creadorId: opciones?.creadorId || '',
  configuracion: configuracionBase as Torneo['configuracion'],
    fechaCreacion: now,
    partidosIniciales,
  };
}

// Stubs de funciones auxiliares (deben implementarse)
function generarPartidosEliminacion(equipos: Equipo[], fechaInicio: string, config: InicializarTorneoConfig): Partido[] {
  return generarBracketEliminacion(equipos, fechaInicio);
}
function generarPartidosDobleEliminacion(equipos: Equipo[], fechaInicio: string, config: InicializarTorneoConfig): Partido[] {
  // TODO: Implementar lógica de doble eliminación
  return [];
}
function generarPartidosTriangular(equipos: Equipo[], fechaInicio: string, config: InicializarTorneoConfig): Partido[] {
  return generarPartidosRoundRobin(equipos.slice(0, 3), fechaInicio, false);
}
function generarPartidosGrupos(equipos: Equipo[], fechaInicio: string, config: InicializarTorneoConfig): Partido[] {
  // Dividir en grupos de 4 equipos (configurable)
  const equiposPorGrupo = config.equiposPorGrupo || 4;
  const grupos: Equipo[][] = [];
  for (let i = 0; i < equipos.length; i += equiposPorGrupo) {
    grupos.push(equipos.slice(i, i + equiposPorGrupo));
  }
  
  let partidos: Partido[] = [];
  grupos.forEach((grupo, idx) => {
    const partidosGrupo = generarPartidosRoundRobin(grupo, fechaInicio, false, `Grupo ${String.fromCharCode(65 + idx)}`);
    partidos = partidos.concat(partidosGrupo);
  });
  
  return partidos;
}

/**
 * Genera un calendario round-robin (todos contra todos) para una liga completa.
 * @param equipos Lista de equipos participantes
 * @returns Array de partidos
 */
function generarPartidosLiga(equipos: Equipo[]): Partido[] {
  const partidos: Partido[] = [];
  const numEquipos = equipos.length;

  // Si número de equipos es impar, agregamos un "bye" ficticio
  const equiposConBye = numEquipos % 2 === 0 ? [...equipos] : [...equipos, { ...equipos[0], id: "bye", nombre: "Descanso" }];

  const rondas = equiposConBye.length - 1; // Número de jornadas
  const mitad = equiposConBye.length / 2;

  // Generar calendario usando algoritmo de round-robin
  let lista = [...equiposConBye];
  for (let r = 0; r < rondas; r++) {
    for (let i = 0; i < mitad; i++) {
      const equipoA = lista[i];
      const equipoB = lista[lista.length - 1 - i];

      // Ignorar partidos contra "bye"
      if (equipoA.id !== "bye" && equipoB.id !== "bye") {
        partidos.push({
          id: `partido-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          torneoId: '', // Se asigna al guardar el torneo
          equipoLocalId: equipoA.id,
          equipoVisitanteId: equipoB.id,
          fecha: '', // Se puede asignar luego
          hora: '',
          golesLocal: 0,
          golesVisitante: 0,
          estado: 'Pendiente',
          jornada: r + 1,
          eventos: [],
          goleadores: [],
        });
      }
    }
    // Rotar lista (excepto el primer equipo)
    lista = [lista[0], ...lista.slice(-1), ...lista.slice(1, -1)];
  }
  return partidos;
}

// Genera partidos round-robin (todos contra todos, ida y vuelta opcional)
function generarPartidosRoundRobin(equipos: Equipo[], fechaInicio: string, idaYVuelta = false, grupo?: string): Partido[] {
  const partidos: Partido[] = [];
  const n = equipos.length;
  let jornada = 1;
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      partidos.push({
        id: `partido-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        torneoId: '',
        equipoLocalId: equipos[i].id,
        equipoVisitanteId: equipos[j].id,
        fecha: fechaInicio,
        hora: '16:00',
        golesLocal: 0,
        golesVisitante: 0,
        estado: 'Pendiente',
        jornada,
        grupo,
        eventos: [],
        goleadores: []
      });
      if (idaYVuelta) {
        partidos.push({
          id: `partido-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          torneoId: '',
          equipoLocalId: equipos[j].id,
          equipoVisitanteId: equipos[i].id,
          fecha: fechaInicio,
          hora: '16:00',
          golesLocal: 0,
          golesVisitante: 0,
          estado: 'Pendiente',
          jornada: jornada + 1,
          grupo,
          eventos: [],
          goleadores: []
        });
      }
    }
    jornada++;
  }
  return partidos;
}

// Genera un bracket de eliminación directa
function generarBracketEliminacion(equipos: Equipo[], fechaInicio: string, soloEstructura = false): Partido[] {
  const partidos: Partido[] = [];
  let ronda = 1;
  let equiposRestantes = [...equipos];
  while (equiposRestantes.length > 1) {
    for (let i = 0; i < equiposRestantes.length; i += 2) {
      partidos.push({
        id: `partido-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        torneoId: '',
        equipoLocalId: equiposRestantes[i]?.id || '',
        equipoVisitanteId: equiposRestantes[i + 1]?.id || '',
        fecha: fechaInicio,
        hora: '16:00',
        golesLocal: 0,
        golesVisitante: 0,
        estado: 'Pendiente',
        jornada: ronda,
        eventos: [],
        goleadores: []
      });
    }
    equiposRestantes = equiposRestantes.filter((_, idx) => idx % 2 === 0);
    ronda++;
    if (soloEstructura) break; // Para híbrido, solo crear la primera ronda
  }
  return partidos;
}

// Divide equipos en grupos de tamaño dado
function dividirEnGrupos(equipos: Equipo[], tamGrupo: number): Record<string, Equipo[]> {
  const grupos: Record<string, Equipo[]> = {};
  let idx = 0;
  let grupo = 0;
  while (idx < equipos.length) {
    const nombreGrupo = String.fromCharCode(65 + grupo); // A, B, C...
    grupos[nombreGrupo] = equipos.slice(idx, idx + tamGrupo);
    idx += tamGrupo;
    grupo++;
  }
  return grupos;
}

// Registra el resultado de un partido y actualiza el estado del torneo
export function registrarResultadoPartido(
  torneo: Torneo,
  partidoActualizado: Partido,
  // eventos: EventoPartido[] = []
): Torneo {
  // 1. Busca el partido en el torneo y actualízalo con el nuevo resultado y eventos
  // 2. Actualiza la tabla de posiciones si aplica (fase de grupos o liga)
  // 3. Marca el partido como 'Jugado'
  // 4. Si es eliminatoria, avanza el bracket si corresponde
  // 5. Devuelve el torneo actualizado
  // ...implementación pendiente...
  return torneo;
}
// Motor de reglas de torneos de fútbol
// Este módulo maneja la lógica de generación y actualización de torneos según el formato:
// formatos soportados: eliminacion, doble_eliminacion, triangular, grupos, liga
// Entradas:
//  - formato: string
//  - equipos: Equipo[]
//  - partido_resultado: ResultadoPartido
//  - config: parámetros como clasifican_por_grupo, mejores_terceros, partido_tercer_puesto
//
// Funciones a implementar:
// - inicializarTorneo(formato, equipos, config): retorna Torneo
// - registrarResultado(torneo, partido_resultado): actualiza el estado del torneo
// - generarSiguientesPartidos(torneo): crea partidos que siguen
// - actualizarTablaPosiciones(torneo): actualiza tabla según resultados
//
// Este motor será usado por el data-context y las pantallas de gestión de torneos.
// El objetivo es tener una lógica centralizada, desacoplada de la UI.

// Funciones adicionales necesarias para tests
export function generarCalendario(torneo: Torneo, equipos: Equipo[]): Partido[] {
  return generarPartidosLiga(equipos);
}

export function calcularTablaPosiciones(torneo: Torneo, equipos: Equipo[], resultados: any[]): any[] {
  // Implementación básica para tests
  return equipos.map(equipo => ({
    equipoId: equipo.id,
    puntos: 0,
    partidosJugados: 0,
    victorias: 0,
    empates: 0,
    derrotas: 0,
    golesAFavor: 0,
    golesEnContra: 0,
    diferenciaGoles: 0
  }));
}

// Función adicional para registro de resultados (para tests)
export function registrarResultado(
  torneo: any, // Usar any para evitar conflictos de tipos en tests
  partidoId: string,
  golesLocal: number,
  golesVisitante: number,
  eventos: any[] = []
): { partidoActualizado: Partido } | undefined {
  // Buscar el partido en los partidos iniciales
  const partidoIndex = torneo.partidosIniciales?.findIndex((p: any) => p.id === partidoId);
  
  if (partidoIndex === -1 || partidoIndex === undefined || !torneo.partidosIniciales) {
    return undefined;
  }

  const partido = torneo.partidosIniciales[partidoIndex];
  
  // Actualizar partido con resultado
  const partidoActualizado: Partido = {
    ...partido,
    golesLocal,
    golesVisitante,
    estado: 'Finalizado',
    eventos: eventos || []
  };

  return {
    partidoActualizado
  };
}

