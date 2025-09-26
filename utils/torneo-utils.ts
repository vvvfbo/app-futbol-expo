/**
 * Utilidades para la gestión de torneos y configuraciones de grupos
 */

export interface ConfiguracionGrupos {
  tipoConfiguracion: 'grupos' | 'triangulares' | 'mixto' | 'eliminatorias_directas';
  descripcion: string;
  grupos: {
    [grupoId: string]: {
      nombre: string;
      equipos: number;
      configuracion: 'todos_contra_todos' | 'triangular' | 'simple';
    };
  };
  equiposRestantes?: {
    cantidad: number;
    manejo: 'bye' | 'triangular_extra' | 'grupo_extra';
  };
  recomendacion: string;
  viabilidad: 'optima' | 'buena' | 'aceptable' | 'no_recomendada';
}

/**
 * Genera todas las configuraciones posibles para un número dado de equipos
 */
export function generarConfiguracionesTorneo(numEquipos: number): ConfiguracionGrupos[] {
  const configuraciones: ConfiguracionGrupos[] = [];

  // Configuración 1: Eliminatorias directas (siempre posible)
  configuraciones.push({
    tipoConfiguracion: 'eliminatorias_directas',
    descripcion: 'Eliminatorias directas con bye para equipos impares',
    grupos: {},
    equiposRestantes: numEquipos % 2 === 1 ? {
      cantidad: 1,
      manejo: 'bye'
    } : undefined,
    recomendacion: 'Formato rápido y emocionante. Ideal para torneos cortos.',
    viabilidad: 'buena'
  });

  // Configuración 2: Todos en un solo grupo (liga)
  if (numEquipos >= 3 && numEquipos <= 10) {
    configuraciones.push({
      tipoConfiguracion: 'grupos',
      descripcion: `Liga única con ${numEquipos} equipos (todos contra todos)`,
      grupos: {
        'A': {
          nombre: 'Grupo Único',
          equipos: numEquipos,
          configuracion: 'todos_contra_todos'
        }
      },
      recomendacion: `${numEquipos * (numEquipos - 1) / 2} partidos total. Formato justo donde todos juegan contra todos.`,
      viabilidad: numEquipos <= 6 ? 'optima' : numEquipos <= 8 ? 'buena' : 'aceptable'
    });
  }

  // Configuración 3: Grupos de 4 equipos
  if (numEquipos >= 4) {
    const gruposDe4 = Math.floor(numEquipos / 4);
    const equiposRestantes = numEquipos % 4;

    if (gruposDe4 >= 1) {
      const grupos: any = {};
      
      // Crear grupos de 4
      for (let i = 0; i < gruposDe4; i++) {
        grupos[String.fromCharCode(65 + i)] = {
          nombre: `Grupo ${String.fromCharCode(65 + i)}`,
          equipos: 4,
          configuracion: 'todos_contra_todos'
        };
      }

      // Manejar equipos restantes
      let manejo: ConfiguracionGrupos['equiposRestantes'] = undefined;
      let descripcionExtra = '';
      let viabilidad: ConfiguracionGrupos['viabilidad'] = 'optima';

      if (equiposRestantes === 1) {
        manejo = { cantidad: 1, manejo: 'bye' };
        descripcionExtra = ' + 1 equipo con bye en primera ronda';
        viabilidad = 'buena';
      } else if (equiposRestantes === 2) {
        manejo = { cantidad: 2, manejo: 'grupo_extra' };
        descripcionExtra = ' + 1 playoff entre 2 equipos restantes';
        viabilidad = 'aceptable';
      } else if (equiposRestantes === 3) {
        grupos[String.fromCharCode(65 + gruposDe4)] = {
          nombre: `Grupo ${String.fromCharCode(65 + gruposDe4)}`,
          equipos: 3,
          configuracion: 'triangular'
        };
        descripcionExtra = ' + 1 grupo triangular';
        viabilidad = 'buena';
      }

      configuraciones.push({
        tipoConfiguracion: equiposRestantes === 3 ? 'mixto' : 'grupos',
        descripcion: `${gruposDe4} grupos de 4 equipos${descripcionExtra}`,
        grupos,
        equiposRestantes: manejo,
        recomendacion: `Configuración equilibrada. ${gruposDe4 * 6} partidos de grupo${equiposRestantes === 3 ? ' + 3 partidos triangular' : ''}.`,
        viabilidad
      });
    }
  }

  // Configuración 4: Grupos de 3 equipos (triangulares)
  if (numEquipos >= 3) {
    const gruposDe3 = Math.floor(numEquipos / 3);
    const equiposRestantes = numEquipos % 3;

    if (gruposDe3 >= 1) {
      const grupos: any = {};
      
      // Crear grupos triangulares
      for (let i = 0; i < gruposDe3; i++) {
        grupos[String.fromCharCode(65 + i)] = {
          nombre: `Grupo ${String.fromCharCode(65 + i)}`,
          equipos: 3,
          configuracion: 'triangular'
        };
      }

      let manejo: ConfiguracionGrupos['equiposRestantes'] = undefined;
      let descripcionExtra = '';
      let viabilidad: ConfiguracionGrupos['viabilidad'] = 'buena';

      if (equiposRestantes === 1) {
        manejo = { cantidad: 1, manejo: 'bye' };
        descripcionExtra = ' + 1 equipo con bye';
        viabilidad = 'aceptable';
      } else if (equiposRestantes === 2) {
        manejo = { cantidad: 2, manejo: 'grupo_extra' };
        descripcionExtra = ' + 1 playoff directo';
        viabilidad = 'aceptable';
      }

      configuraciones.push({
        tipoConfiguracion: 'triangulares',
        descripcion: `${gruposDe3} grupos triangulares${descripcionExtra}`,
        grupos,
        equiposRestantes: manejo,
        recomendacion: `Formato dinámico con ${gruposDe3 * 3} partidos de grupo. Cada equipo juega 2 partidos por grupo.`,
        viabilidad
      });
    }
  }

  // Configuración 5: Grupos mixtos (combinación de 4 y 3)
  if (numEquipos >= 7) {
    // Intentar diferentes combinaciones
    for (let gruposDe4 = 1; gruposDe4 <= Math.floor(numEquipos / 4); gruposDe4++) {
      const equiposUsados = gruposDe4 * 4;
      const equiposRestantes = numEquipos - equiposUsados;
      
      if (equiposRestantes >= 3 && equiposRestantes <= 6) {
        const gruposDe3 = Math.floor(equiposRestantes / 3);
        const finalRestantes = equiposRestantes % 3;
        
        if (finalRestantes <= 1) { // Solo aceptar si queda máximo 1 equipo
          const grupos: any = {};
          
          // Grupos de 4
          for (let i = 0; i < gruposDe4; i++) {
            grupos[String.fromCharCode(65 + i)] = {
              nombre: `Grupo ${String.fromCharCode(65 + i)}`,
              equipos: 4,
              configuracion: 'todos_contra_todos'
            };
          }
          
          // Grupos de 3
          for (let i = 0; i < gruposDe3; i++) {
            grupos[String.fromCharCode(65 + gruposDe4 + i)] = {
              nombre: `Grupo ${String.fromCharCode(65 + gruposDe4 + i)}`,
              equipos: 3,
              configuracion: 'triangular'
            };
          }

          let manejo: ConfiguracionGrupos['equiposRestantes'] = undefined;
          let descripcionExtra = '';
          
          if (finalRestantes === 1) {
            manejo = { cantidad: 1, manejo: 'bye' };
            descripcionExtra = ' + 1 equipo con bye';
          }

          configuraciones.push({
            tipoConfiguracion: 'mixto',
            descripcion: `${gruposDe4} grupos de 4 + ${gruposDe3} grupos de 3${descripcionExtra}`,
            grupos,
            equiposRestantes: manejo,
            recomendacion: `Configuración mixta flexible. ${gruposDe4 * 6 + gruposDe3 * 3} partidos de grupo.`,
            viabilidad: 'buena'
          });
        }
      }
    }
  }

  // Ordenar por viabilidad y número de partidos
  return configuraciones.sort((a, b) => {
    const viabilidadOrder = { 'optima': 4, 'buena': 3, 'aceptable': 2, 'no_recomendada': 1 };
    return viabilidadOrder[b.viabilidad] - viabilidadOrder[a.viabilidad];
  });
}

/**
 * Distribuye los equipos en grupos según la configuración seleccionada
 */
export function distribuirEquiposEnGrupos(
  equiposIds: string[], 
  configuracion: ConfiguracionGrupos
): { [grupoId: string]: string[] } {
  const distribucion: { [grupoId: string]: string[] } = {};
  
  // Mezclar equipos aleatoriamente para distribución justa
  const equiposMezclados = [...equiposIds].sort(() => Math.random() - 0.5);
  
  let indiceEquipo = 0;
  
  // Distribuir equipos según la configuración
  Object.entries(configuracion.grupos).forEach(([grupoId, grupoConfig]) => {
    distribucion[grupoId] = [];
    
    for (let i = 0; i < grupoConfig.equipos; i++) {
      if (indiceEquipo < equiposMezclados.length) {
        distribucion[grupoId].push(equiposMezclados[indiceEquipo]);
        indiceEquipo++;
      }
    }
  });
  
  return distribucion;
}

/**
 * Calcula el número total de partidos para una configuración
 */
export function calcularPartidosConfiguracion(configuracion: ConfiguracionGrupos): number {
  let totalPartidos = 0;
  
  Object.values(configuracion.grupos).forEach(grupo => {
    if (grupo.configuracion === 'todos_contra_todos') {
      // n equipos = n*(n-1)/2 partidos
      totalPartidos += grupo.equipos * (grupo.equipos - 1) / 2;
    } else if (grupo.configuracion === 'triangular') {
      // 3 equipos = 3 partidos
      totalPartidos += 3;
    } else if (grupo.configuracion === 'simple') {
      // Playoff simple = 1 partido
      totalPartidos += 1;
    }
  });
  
  return totalPartidos;
}

/**
 * Genera partidos para una configuración de grupos específica
 */
export function generarPartidosParaGrupos(
  distribucion: { [grupoId: string]: string[] },
  configuracion: ConfiguracionGrupos,
  torneoId: string,
  fechaInicio: string,
  campoId?: string
): any[] {
  const partidos: any[] = [];
  let jornada = 1;
  
  Object.entries(distribucion).forEach(([grupoId, equiposGrupo]) => {
    const grupoConfig = configuracion.grupos[grupoId];
    
    if (grupoConfig.configuracion === 'todos_contra_todos') {
      // Generar todos contra todos
      for (let i = 0; i < equiposGrupo.length; i++) {
        for (let j = i + 1; j < equiposGrupo.length; j++) {
          // Validar y crear fecha segura
          let fecha = new Date(fechaInicio);
          if (isNaN(fecha.getTime())) {
            // Si la fecha es inválida, usar fecha actual + jornada
            fecha = new Date();
            fecha.setDate(fecha.getDate() + (jornada - 1) * 7);
          } else {
            fecha.setDate(fecha.getDate() + (jornada - 1) * 7);
          }
          
          // Validar que la fecha final sea válida antes de convertir
          const fechaString = isNaN(fecha.getTime()) ? 
            new Date().toISOString().split('T')[0] : 
            fecha.toISOString().split('T')[0];
          
          partidos.push({
            torneoId,
            equipoLocalId: equiposGrupo[i],
            equipoVisitanteId: equiposGrupo[j],
            fecha: fechaString,
            hora: '16:00',
            estado: 'Pendiente',
            jornada,
            fase: 'grupos',
            grupo: grupoId,
            campoId: campoId || '',
            goleadores: [],
            eventos: []
          });
          
          jornada++;
        }
      }
    } else if (grupoConfig.configuracion === 'triangular') {
      // Generar triangular: A vs B, B vs C, A vs C
      if (equiposGrupo.length === 3) {
        const fechaBase = new Date(fechaInicio);
        
        // A vs B
        partidos.push({
          torneoId,
          equipoLocalId: equiposGrupo[0],
          equipoVisitanteId: equiposGrupo[1],
          fecha: fechaBase.toISOString().split('T')[0],
          hora: '16:00',
          estado: 'Pendiente',
          jornada: jornada++,
          fase: 'grupos',
          grupo: grupoId,
          campoId: campoId || '',
          goleadores: [],
          eventos: []
        });
        
        // B vs C
        fechaBase.setDate(fechaBase.getDate() + 7);
        partidos.push({
          torneoId,
          equipoLocalId: equiposGrupo[1],
          equipoVisitanteId: equiposGrupo[2],
          fecha: fechaBase.toISOString().split('T')[0],
          hora: '16:00',
          estado: 'Pendiente',
          jornada: jornada++,
          fase: 'grupos',
          grupo: grupoId,
          campoId: campoId || '',
          goleadores: [],
          eventos: []
        });
        
        // A vs C
        fechaBase.setDate(fechaBase.getDate() + 7);
        partidos.push({
          torneoId,
          equipoLocalId: equiposGrupo[0],
          equipoVisitanteId: equiposGrupo[2],
          fecha: fechaBase.toISOString().split('T')[0],
          hora: '16:00',
          estado: 'Pendiente',
          jornada: jornada++,
          fase: 'grupos',
          grupo: grupoId,
          campoId: campoId || '',
          goleadores: [],
          eventos: []
        });
      }
    }
  });
  
  return partidos;
}

/**
 * Obtiene la mejor configuración recomendada para un número de equipos
 */
export function obtenerConfiguracionRecomendada(numEquipos: number): ConfiguracionGrupos {
  const configuraciones = generarConfiguracionesTorneo(numEquipos);
  
  // Filtrar solo las configuraciones óptimas y buenas
  const configuracionesViables = configuraciones.filter(c => 
    c.viabilidad === 'optima' || c.viabilidad === 'buena'
  );
  
  return configuracionesViables.length > 0 ? configuracionesViables[0] : configuraciones[0];
}