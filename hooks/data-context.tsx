import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Equipo, Torneo, Partido, Jugador, Clasificacion, FiltroTorneos, FiltroEquipos, CampoFutbol, EventoPartido, Club, PartidoAmistoso, FiltroAmistosos } from '@/types';
import { CONFIGURACION_DEFAULT, CAMPOS_MOCK } from '@/constants/categories';

interface DataState {
  equipos: Equipo[];
  torneos: Torneo[];
  partidos: Partido[];
  campos: CampoFutbol[];
  clubes: Club[];
  amistosos: PartidoAmistoso[];
  isLoading: boolean;
  
  // Equipos
  crearEquipo: (equipo: Omit<Equipo, 'id' | 'fechaCreacion'>) => Promise<string>;
  actualizarEquipo: (id: string, equipo: Partial<Equipo>) => Promise<void>;
  eliminarEquipo: (id: string) => Promise<void>;
  obtenerEquiposPorEntrenador: (entrenadorId: string) => Equipo[];
  obtenerEquiposPorFiltro: (filtro: FiltroEquipos) => Equipo[];
  
  // Jugadores
  agregarJugador: (equipoId: string, jugador: Omit<Jugador, 'id' | 'equipoId' | 'fechaRegistro'>) => Promise<void>;
  actualizarJugador: (id: string, jugador: Partial<Jugador>) => Promise<void>;
  eliminarJugador: (id: string) => Promise<void>;
  obtenerJugadoresPorEquipo: (equipoId: string) => Jugador[];
  
  // Torneos
  crearTorneo: (torneo: Omit<Torneo, 'id' | 'fechaCreacion'>) => Promise<string>;
  actualizarTorneo: (id: string, torneo: Partial<Torneo>) => Promise<void>;
  eliminarTorneo: (id: string) => Promise<void>;
  finalizarTorneo: (id: string, resultado: { campeon?: string; subcampeon?: string; tercerPuesto?: string; fechaFinalizacion: string }) => Promise<void>;
  obtenerTorneosPorCreador: (creadorId: string) => Torneo[];
  obtenerTorneosPorFiltro: (filtro: FiltroTorneos) => Torneo[];
  inscribirEquipoEnTorneo: (torneoId: string, equipoId: string) => Promise<void>;
  desinscribirEquipoDelTorneo: (torneoId: string, equipoId: string) => Promise<void>;
  
  // Partidos
  crearPartidos: (partidos: Omit<Partido, 'id'>[]) => Promise<void>;
  actualizarPartido: (id: string, partido: Partial<Partido>) => Promise<void>;
  actualizarResultado: (partidoId: string, golesLocal: number, golesVisitante: number, goleadores?: { equipoId: string; jugadorId: string; minuto: number }[]) => Promise<void>;
  obtenerPartidosPorTorneo: (torneoId: string) => Partido[];
  obtenerPartidosPorEquipo: (equipoId: string) => Partido[];
  agregarEvento: (partidoId: string, evento: Omit<EventoPartido, 'id' | 'partidoId'>) => Promise<void>;
  
  // Campos
  crearCampo: (campo: Omit<CampoFutbol, 'id'>) => Promise<string>;
  actualizarCampo: (id: string, campo: Partial<CampoFutbol>) => Promise<void>;
  eliminarCampo: (id: string) => Promise<void>;
  obtenerCamposPorCiudad: (ciudad: string) => CampoFutbol[];
  obtenerCamposPorTipo: (tipo: string) => CampoFutbol[];
  
  // Clasificación y estadísticas
  obtenerClasificacion: (torneoId: string, grupo?: string) => Clasificacion[];
  obtenerClasificacionPorGrupo: (torneoId: string) => { [grupo: string]: Clasificacion[] };
  generarEliminatorias: (torneoId: string) => Promise<void>;
  avanzarEnEliminatorias: (partidoId: string, equipoGanadorId: string) => Promise<void>;
  editarPartido: (partidoId: string, cambios: { fecha?: string; hora?: string; equipoLocalId?: string; equipoVisitanteId?: string }) => Promise<void>;
  obtenerGoleadoresTorneo: (torneoId: string) => { jugadorId: string; equipoId: string; goles: number; nombre?: string }[];
  obtenerEstadisticasJugador: (jugadorId: string, torneoId?: string) => { goles: number; asistencias: number; tarjetasAmarillas: number; tarjetasRojas: number };
  
  // Clubes
  crearClub: (club: Omit<Club, 'id' | 'fechaCreacion'>) => Promise<string>;
  actualizarClub: (id: string, club: Partial<Club>) => Promise<void>;
  eliminarClub: (id: string) => Promise<void>;
  obtenerClubesPorEntrenador: (entrenadorId: string) => Club[];
  agregarEquipoAClub: (clubId: string, equipoId: string, categoria: string) => Promise<void>;
  removerEquipoDeClub: (clubId: string, equipoId: string) => Promise<void>;
  
  // Amistosos
  crearAmistoso: (amistoso: Omit<PartidoAmistoso, 'id' | 'fechaCreacion'>) => Promise<string>;
  actualizarAmistoso: (id: string, amistoso: Partial<PartidoAmistoso>) => Promise<void>;
  eliminarAmistoso: (id: string) => Promise<void>;
  buscarAmistosos: (filtro: FiltroAmistosos) => PartidoAmistoso[];
  proponerAmistoso: (amistosoId: string, equipoVisitanteId: string, entrenadorId: string) => Promise<void>;
  aceptarAmistoso: (amistosoId: string) => Promise<void>;
  rechazarAmistoso: (amistosoId: string) => Promise<void>;
  finalizarAmistoso: (amistosoId: string, golesLocal: number, golesVisitante: number, goleadores?: { equipoId: string; jugadorId: string; minuto: number }[]) => Promise<void>;
  obtenerAmistososPorEquipo: (equipoId: string) => PartidoAmistoso[];
  obtenerDisponibilidadesPorFiltro: (filtro: FiltroAmistosos) => PartidoAmistoso[];
  exportarResultadoAmistoso: (amistosoId: string) => Promise<string>;
  
  // Utilidades
  generarCalendarioTorneo: (torneoId: string) => Promise<void>;
  limpiarTodosLosDatos: () => Promise<void>;
  limpiarAsyncStorage: () => Promise<void>;
  recargarDatos: () => Promise<void>;
}

export const [DataProvider, useData] = createContextHook<DataState>(() => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [campos, setCampos] = useState<CampoFutbol[]>(CAMPOS_MOCK);
  const [clubes, setClubes] = useState<Club[]>([]);
  const [amistosos, setAmistosos] = useState<PartidoAmistoso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const parseJsonSafely = useCallback((data: string | null, dataType: string): any[] => {
    if (!data || data.trim() === '') {
      console.log(`ℹ️ No ${dataType} data found`);
      return [];
    }
    
    // Check for common corruption patterns
    if (data.includes('undefined') || data.includes('NaN') || data.includes('[object Object]')) {
      console.warn(`⚠️ Corrupted ${dataType} data detected, clearing...`);
      AsyncStorage.removeItem(dataType.toLowerCase());
      return [];
    }
    
    try {
      // Try to clean the data first
      let cleanData = data.trim();
      
      // Remove any trailing commas or malformed JSON
      cleanData = cleanData.replace(/,\s*([}\]])/g, '$1');
      
      // Check if it starts and ends correctly
      if (!cleanData.startsWith('[') || !cleanData.endsWith(']')) {
        console.warn(`⚠️ ${dataType} data doesn't have proper array format`);
        AsyncStorage.removeItem(dataType.toLowerCase());
        return [];
      }
      
      const parsed = JSON.parse(cleanData);
      
      if (!Array.isArray(parsed)) {
        console.warn(`⚠️ ${dataType} data is not an array:`, typeof parsed);
        AsyncStorage.removeItem(dataType.toLowerCase());
        return [];
      }
      
      console.log(`✅ ${dataType} loaded:`, parsed.length);
      return parsed;
    } catch (error: any) {
      console.error(`❌ Error parsing ${dataType} data:`, error.message);
      console.log(`🧹 Clearing corrupted ${dataType} data`);
      AsyncStorage.removeItem(dataType.toLowerCase());
      return [];
    }
  }, []);

  const loadData = useCallback(async () => {
    let isMounted = true;
    
    // Set a timeout to prevent hydration timeout
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('⏰ Data loading timeout - setting loading to false');
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout for faster loading
    
    try {
      console.log('📦 === STARTING DATA LOAD ===');
      
      // Load all data with timeout protection
      const loadPromises = [
        AsyncStorage.getItem('equipos'),
        AsyncStorage.getItem('torneos'),
        AsyncStorage.getItem('partidos'),
        AsyncStorage.getItem('campos'),
        AsyncStorage.getItem('clubes'),
        AsyncStorage.getItem('amistosos')
      ];
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 5000);
      });
      
      const [equiposData, torneosData, partidosData, camposData, clubesData, amistososData] = await Promise.race([
        Promise.all(loadPromises),
        timeoutPromise
      ]) as string[];
      
      if (!isMounted) return;
      
      console.log('📦 Raw data loaded from AsyncStorage');
      console.log('🏆 Equipos data length:', equiposData?.length || 0);
      console.log('🏟️ Torneos data length:', torneosData?.length || 0);
      console.log('⚽ Partidos data length:', partidosData?.length || 0);
      console.log('🏟️ Campos data length:', camposData?.length || 0);
      console.log('🏛️ Clubes data length:', clubesData?.length || 0);
      console.log('🤝 Amistosos data length:', amistososData?.length || 0);
      
      // Parse all data safely
      const parsedEquipos = parseJsonSafely(equiposData, 'Equipos');
      const parsedTorneos = parseJsonSafely(torneosData, 'Torneos');
      const parsedPartidos = parseJsonSafely(partidosData, 'Partidos');
      const parsedClubes = parseJsonSafely(clubesData, 'Clubes');
      const parsedAmistosos = parseJsonSafely(amistososData, 'Amistosos');
      
      // Handle campos separately (has default)
      let parsedCampos = CAMPOS_MOCK;
      if (camposData) {
        const campos = parseJsonSafely(camposData, 'Campos');
        if (campos.length > 0) {
          parsedCampos = campos;
        }
      }
      
      if (!isMounted) return;
      
      // Set all state at once to avoid multiple re-renders
      setEquipos(parsedEquipos);
      setTorneos(parsedTorneos);
      setPartidos(parsedPartidos);
      setCampos(parsedCampos);
      setClubes(parsedClubes);
      setAmistosos(parsedAmistosos);
      
      console.log('✅ === DATA LOAD COMPLETED ===');
      console.log('📊 Final counts:');
      console.log('  - Equipos:', parsedEquipos.length);
      console.log('  - Torneos:', parsedTorneos.length);
      console.log('  - Partidos:', parsedPartidos.length);
      console.log('  - Campos:', parsedCampos.length);
      console.log('  - Clubes:', parsedClubes.length);
      console.log('  - Amistosos:', parsedAmistosos.length);
      
    } catch (error: any) {
      console.error('❌ === CRITICAL ERROR LOADING DATA ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message || 'Unknown error');
      console.error('Error stack:', error?.stack || 'No stack trace');
      
      if (!isMounted) return;
      
      // Force reset all data on critical error
      console.log('🔄 Resetting all data to safe defaults...');
      setEquipos([]);
      setTorneos([]);
      setPartidos([]);
      setCampos(CAMPOS_MOCK);
      setClubes([]);
      setAmistosos([]);
      
      // Clear potentially corrupted AsyncStorage
      try {
        await Promise.all([
          AsyncStorage.removeItem('equipos'),
          AsyncStorage.removeItem('torneos'),
          AsyncStorage.removeItem('partidos'),
          AsyncStorage.removeItem('clubes'),
          AsyncStorage.removeItem('amistosos')
        ]);
        console.log('🧹 Cleared potentially corrupted AsyncStorage data');
      } catch (clearError) {
        console.error('❌ Error clearing AsyncStorage:', clearError);
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
        clearTimeout(timeoutId);
        console.log('🏁 Data loading process finished');
      }
    }
  }, [parseJsonSafely]);

  const saveEquipos = useCallback(async (newEquipos: Equipo[]) => {
    try {
      if (!Array.isArray(newEquipos)) {
        console.error('❌ saveEquipos: newEquipos is not an array:', typeof newEquipos);
        return;
      }
      
      const jsonString = JSON.stringify(newEquipos);
      await AsyncStorage.setItem('equipos', jsonString);
      setEquipos(newEquipos);
      console.log('✅ Equipos saved successfully:', newEquipos.length);
    } catch (error) {
      console.error('❌ Error saving equipos:', error);
      throw error;
    }
  }, []);

  const saveTorneos = useCallback(async (newTorneos: Torneo[]) => {
    try {
      if (!Array.isArray(newTorneos)) {
        console.error('❌ saveTorneos: newTorneos is not an array:', typeof newTorneos);
        return;
      }
      
      const jsonString = JSON.stringify(newTorneos);
      await AsyncStorage.setItem('torneos', jsonString);
      setTorneos(newTorneos);
      console.log('✅ Torneos saved successfully:', newTorneos.length);
    } catch (error) {
      console.error('❌ Error saving torneos:', error);
      throw error;
    }
  }, []);

  const savePartidos = useCallback(async (newPartidos: Partido[]) => {
    try {
      if (!Array.isArray(newPartidos)) {
        console.error('❌ savePartidos: newPartidos is not an array:', typeof newPartidos);
        return;
      }
      
      const jsonString = JSON.stringify(newPartidos);
      await AsyncStorage.setItem('partidos', jsonString);
      setPartidos(newPartidos);
      console.log('✅ Partidos saved successfully:', newPartidos.length);
    } catch (error) {
      console.error('❌ Error saving partidos:', error);
      throw error;
    }
  }, []);

  const saveCampos = useCallback(async (newCampos: CampoFutbol[]) => {
    try {
      if (!Array.isArray(newCampos)) {
        console.error('❌ saveCampos: newCampos is not an array:', typeof newCampos);
        return;
      }
      
      const jsonString = JSON.stringify(newCampos);
      await AsyncStorage.setItem('campos', jsonString);
      setCampos(newCampos);
      console.log('✅ Campos saved successfully:', newCampos.length);
    } catch (error) {
      console.error('❌ Error saving campos:', error);
      throw error;
    }
  }, []);

  const crearEquipo = useCallback(async (equipo: Omit<Equipo, 'id' | 'fechaCreacion'>): Promise<string> => {
    console.log('🏗️ === CREANDO EQUIPO ===');
    console.log('🏗️ Datos recibidos:', equipo);
    console.log('🏗️ Equipos actuales:', equipos.length);
    
    const id = Date.now().toString();
    const nuevoEquipo: Equipo = { 
      ...equipo, 
      id,
      fechaCreacion: new Date().toISOString(),
      jugadores: equipo.jugadores || []
    };
    
    console.log('🏗️ Nuevo equipo creado:', nuevoEquipo);
    console.log('🏗️ Llamando saveEquipos con:', [...equipos, nuevoEquipo].length, 'equipos');
    
    await saveEquipos([...equipos, nuevoEquipo]);
    
    console.log('🏗️ Equipo guardado correctamente, ID:', id);
    return id;
  }, [equipos, saveEquipos]);

  const actualizarEquipo = useCallback(async (id: string, equipoActualizado: Partial<Equipo>) => {
    console.log('🔄 === ACTUALIZANDO EQUIPO ===');
    console.log('🔄 Equipo ID:', id);
    console.log('🔄 Cambios:', equipoActualizado);
    console.log('🔄 Estado actual del equipo:', equipos.find(e => e.id === id));
    
    const nuevosEquipos = equipos.map(e => 
      e.id === id ? { ...e, ...equipoActualizado } : e
    );
    
    console.log('🔄 Nuevo estado del equipo:', nuevosEquipos.find(e => e.id === id));
    
    await saveEquipos(nuevosEquipos);
    
    console.log('✅ Equipo actualizado exitosamente');
    console.log('🔄 === ACTUALIZACIÓN COMPLETADA ===');
  }, [equipos, saveEquipos]);

  const eliminarEquipo = useCallback(async (id: string) => {
    const nuevosEquipos = equipos.filter(e => e.id !== id);
    await saveEquipos(nuevosEquipos);
  }, [equipos, saveEquipos]);

  const obtenerEquiposPorEntrenador = useCallback((entrenadorId: string): Equipo[] => {
    return equipos.filter(e => e.entrenadorId === entrenadorId);
  }, [equipos]);

  const obtenerEquiposPorFiltro = useCallback((filtro: FiltroEquipos): Equipo[] => {
    return equipos.filter(equipo => {
      if (filtro.ciudad && equipo.ciudad !== filtro.ciudad) return false;
      if (filtro.categoria && equipo.categoria !== filtro.categoria) return false;
      if (filtro.tipoFutbol && equipo.tipoFutbol !== filtro.tipoFutbol) return false;
      if (filtro.nombre && !equipo.nombre.toLowerCase().includes(filtro.nombre.toLowerCase())) return false;
      if (filtro.entrenador) {
        // Aquí necesitarías acceso a los datos de usuarios para filtrar por nombre del entrenador
        // Por simplicidad, omitimos esta funcionalidad por ahora
      }
      return true;
    });
  }, [equipos]);

  const agregarJugador = useCallback(async (equipoId: string, jugador: Omit<Jugador, 'id' | 'equipoId' | 'fechaRegistro'>) => {
    const nuevoJugador: Jugador = {
      ...jugador,
      id: Date.now().toString(),
      equipoId,
      fechaRegistro: new Date().toISOString()
    };
    
    const nuevosEquipos = equipos.map(e => {
      if (e.id === equipoId) {
        return { ...e, jugadores: [...(e.jugadores || []), nuevoJugador] };
      }
      return e;
    });
    
    await saveEquipos(nuevosEquipos);
  }, [equipos, saveEquipos]);

  const actualizarJugador = useCallback(async (id: string, jugadorActualizado: Partial<Jugador>) => {
    const nuevosEquipos = equipos.map(equipo => ({
      ...equipo,
      jugadores: equipo.jugadores.map(jugador =>
        jugador.id === id ? { ...jugador, ...jugadorActualizado } : jugador
      )
    }));
    await saveEquipos(nuevosEquipos);
  }, [equipos, saveEquipos]);

  const eliminarJugador = useCallback(async (id: string) => {
    const nuevosEquipos = equipos.map(equipo => ({
      ...equipo,
      jugadores: equipo.jugadores.filter(jugador => jugador.id !== id)
    }));
    await saveEquipos(nuevosEquipos);
  }, [equipos, saveEquipos]);

  const obtenerJugadoresPorEquipo = useCallback((equipoId: string): Jugador[] => {
    const equipo = equipos.find(e => e.id === equipoId);
    return equipo?.jugadores || [];
  }, [equipos]);

  const crearTorneo = useCallback(async (torneo: Omit<Torneo, 'id' | 'fechaCreacion'>): Promise<string> => {
    const id = Date.now().toString();
    const nuevoTorneo: Torneo = { 
      ...torneo, 
      id,
      fechaCreacion: new Date().toISOString(),
      equiposIds: torneo.equiposIds || [],
      configuracion: torneo.configuracion || CONFIGURACION_DEFAULT
    };
    await saveTorneos([...torneos, nuevoTorneo]);
    return id;
  }, [torneos, saveTorneos]);

  const actualizarTorneo = useCallback(async (id: string, torneoActualizado: Partial<Torneo>) => {
    const nuevosTorneos = torneos.map(t => 
      t.id === id ? { ...t, ...torneoActualizado } : t
    );
    await saveTorneos(nuevosTorneos);
  }, [torneos, saveTorneos]);

  const eliminarTorneo = useCallback(async (id: string) => {
    const nuevosTorneos = torneos.filter(t => t.id !== id);
    await saveTorneos(nuevosTorneos);
  }, [torneos, saveTorneos]);

  const finalizarTorneo = useCallback(async (id: string, resultado: { campeon?: string; subcampeon?: string; tercerPuesto?: string; fechaFinalizacion: string }) => {
    const torneo = torneos.find(t => t.id === id);
    if (!torneo) return;

    const nuevosTorneos = torneos.map(t => 
      t.id === id 
        ? { 
            ...t, 
            estado: 'Finalizado' as const,
            fechaFin: resultado.fechaFinalizacion,
            resultadoFinal: resultado
          } 
        : t
    );
    await saveTorneos(nuevosTorneos);

    // Enviar notificación de torneo finalizado
    const equipoCampeon = resultado.campeon ? equipos.find(e => e.id === resultado.campeon) : undefined;
    const equipoSubcampeon = resultado.subcampeon ? equipos.find(e => e.id === resultado.subcampeon) : undefined;
    
    console.log(`Torneo finalizado: ${torneo.nombre}`);
    if (equipoCampeon) {
      console.log(`Campeón: ${equipoCampeon.nombre}`);
    }
    if (equipoSubcampeon) {
      console.log(`Subcampeón: ${equipoSubcampeon.nombre}`);
    }
  }, [torneos, equipos, saveTorneos]);

  const obtenerTorneosPorCreador = useCallback((creadorId: string): Torneo[] => {
    return torneos.filter(t => t.creadorId === creadorId);
  }, [torneos]);

  const obtenerTorneosPorFiltro = useCallback((filtro: FiltroTorneos): Torneo[] => {
    return torneos.filter(torneo => {
      if (filtro.ciudad && torneo.ciudad !== filtro.ciudad) return false;
      if (filtro.categoria && torneo.categoria !== filtro.categoria) return false;
      if (filtro.tipoFutbol && torneo.tipoFutbol !== filtro.tipoFutbol) return false;
      if (filtro.estado && torneo.estado !== filtro.estado) return false;
      if (filtro.tipo && torneo.tipo !== filtro.tipo) return false;
      if (filtro.nombre && !torneo.nombre.toLowerCase().includes(filtro.nombre.toLowerCase())) return false;
      if (filtro.fechaDesde && torneo.fechaInicio < filtro.fechaDesde) return false;
      if (filtro.fechaHasta && torneo.fechaInicio > filtro.fechaHasta) return false;
      return true;
    });
  }, [torneos]);

  const inscribirEquipoEnTorneo = useCallback(async (torneoId: string, equipoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo || torneo.equiposIds.includes(equipoId)) return;
    
    if (torneo.equiposIds.length >= torneo.maxEquipos) {
      throw new Error('El torneo ya está completo');
    }

    const nuevosEquiposIds = [...torneo.equiposIds, equipoId];
    await actualizarTorneo(torneoId, { equiposIds: nuevosEquiposIds });
  }, [torneos, actualizarTorneo]);

  const desinscribirEquipoDelTorneo = useCallback(async (torneoId: string, equipoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return;

    const nuevosEquiposIds = torneo.equiposIds.filter(id => id !== equipoId);
    await actualizarTorneo(torneoId, { equiposIds: nuevosEquiposIds });
  }, [torneos, actualizarTorneo]);

  const crearPartidos = useCallback(async (nuevosPartidos: Omit<Partido, 'id'>[]) => {
    const partidosConId = nuevosPartidos.map(p => ({
      ...p,
      id: Date.now().toString() + Math.random().toString()
    }));
    await savePartidos([...partidos, ...partidosConId]);
  }, [partidos, savePartidos]);

  const actualizarPartido = useCallback(async (id: string, partidoActualizado: Partial<Partido>) => {
    const nuevosPartidos = partidos.map(p => 
      p.id === id ? { ...p, ...partidoActualizado } : p
    );
    await savePartidos(nuevosPartidos);
  }, [partidos, savePartidos]);

  const avanzarEnEliminatorias = useCallback(async (partidoId: string, equipoGanadorId: string) => {
    const partido = partidos.find(p => p.id === partidoId);
    if (!partido || !partido.fase) return;

    const torneo = torneos.find(t => t.id === partido.torneoId);
    if (!torneo) return;

    // Buscar el siguiente partido en la fase siguiente
    const siguienteFase = partido.fase === 'octavos' ? 'cuartos' : 
                         partido.fase === 'cuartos' ? 'semifinal' : 
                         partido.fase === 'semifinal' ? 'final' : null;

    if (siguienteFase) {
      const partidosSiguienteFase = partidos.filter(p => 
        p.torneoId === partido.torneoId && p.fase === siguienteFase
      ).sort((a, b) => a.jornada - b.jornada);

      // Encontrar el partido correspondiente basado en la posición del partido actual
      const partidosActualFase = partidos.filter(p => 
        p.torneoId === partido.torneoId && p.fase === partido.fase
      ).sort((a, b) => a.jornada - b.jornada);
      
      const posicionPartidoActual = partidosActualFase.findIndex(p => p.id === partidoId);
      const siguientePartidoIndex = Math.floor(posicionPartidoActual / 2);
      const siguientePartido = partidosSiguienteFase[siguientePartidoIndex];

      if (siguientePartido) {
        // Determinar si el ganador va como local o visitante
        const esLocal = posicionPartidoActual % 2 === 0;
        await actualizarPartido(siguientePartido.id, {
          [esLocal ? 'equipoLocalId' : 'equipoVisitanteId']: equipoGanadorId
        });
      }
    }
  }, [partidos, torneos, actualizarPartido]);

  const actualizarResultado = useCallback(async (partidoId: string, golesLocal: number, golesVisitante: number, goleadores?: { equipoId: string; jugadorId: string; minuto: number }[]) => {
    const partido = partidos.find(p => p.id === partidoId);
    if (!partido) return;

    const torneo = torneos.find(t => t.id === partido.torneoId);
    const estadoAnterior = partido.estado;
    
    const nuevosPartidos = partidos.map(p => 
      p.id === partidoId 
        ? { ...p, golesLocal, golesVisitante, estado: 'Jugado' as const, goleadores: goleadores || [] }
        : p
    );
    await savePartidos(nuevosPartidos);
    
    // Si es un partido de eliminatorias, avanzar al ganador
    if (partido.fase && (torneo?.tipo === 'eliminatorias' || torneo?.tipo === 'grupos-eliminatorias')) {
      const equipoGanadorId = golesLocal > golesVisitante ? partido.equipoLocalId : 
                             golesVisitante > golesLocal ? partido.equipoVisitanteId : 
                             partido.equipoLocalId; // En caso de empate, avanza el local (se puede cambiar esta lógica)
      
      await avanzarEnEliminatorias(partidoId, equipoGanadorId);
    }
    
    // Enviar notificación solo si el partido cambió de estado a "Jugado" y el torneo no está finalizado
    if (estadoAnterior !== 'Jugado' && torneo && torneo.estado !== 'Finalizado') {
      const equipoLocal = equipos.find(e => e.id === partido.equipoLocalId);
      const equipoVisitante = equipos.find(e => e.id === partido.equipoVisitanteId);
      
      if (equipoLocal && equipoVisitante) {
        // Aquí se enviaría la notificación usando el hook de notificaciones
        console.log(`Notificación: ${equipoLocal.nombre} ${golesLocal} - ${golesVisitante} ${equipoVisitante.nombre}`);
      }
    }
    
    // Actualizar estadísticas de jugadores automáticamente
    if (goleadores && goleadores.length > 0) {
      const nuevosEquipos = equipos.map(equipo => {
        const jugadoresActualizados = equipo.jugadores.map(jugador => {
          const golesJugador = goleadores.filter(g => g.jugadorId === jugador.id).length;
          if (golesJugador > 0) {
            return {
              ...jugador,
              estadisticas: {
                partidosJugados: (jugador.estadisticas?.partidosJugados || 0) + 1,
                goles: (jugador.estadisticas?.goles || 0) + golesJugador,
                asistencias: jugador.estadisticas?.asistencias || 0,
                tarjetasAmarillas: jugador.estadisticas?.tarjetasAmarillas || 0,
                tarjetasRojas: jugador.estadisticas?.tarjetasRojas || 0,
                porteriasCero: jugador.estadisticas?.porteriasCero || 0
              }
            };
          }
          return jugador;
        });
        return { ...equipo, jugadores: jugadoresActualizados };
      });
      await saveEquipos(nuevosEquipos);
    }
  }, [partidos, equipos, torneos, savePartidos, saveEquipos, avanzarEnEliminatorias]);

  const obtenerPartidosPorTorneo = useCallback((torneoId: string): Partido[] => {
    return partidos.filter(p => p.torneoId === torneoId);
  }, [partidos]);

  const obtenerPartidosPorEquipo = useCallback((equipoId: string): Partido[] => {
    return partidos.filter(p => p.equipoLocalId === equipoId || p.equipoVisitanteId === equipoId);
  }, [partidos]);

  const obtenerClasificacion = useCallback((torneoId: string, grupo?: string): Clasificacion[] => {
    const partidosTorneo = partidos.filter(p => {
      if (p.torneoId !== torneoId) return false;
      if (grupo && p.grupo !== grupo) return false;
      return true;
    });
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo) return [];

    const clasificacion: Map<string, Clasificacion> = new Map();
    
    // Determinar equipos a incluir
    let equiposIds: string[] = [];
    if (grupo && torneo.grupos && torneo.grupos[grupo]) {
      equiposIds = torneo.grupos[grupo].equiposIds;
    } else {
      equiposIds = torneo.equiposIds;
    }
    
    // Inicializar clasificación para cada equipo
    equiposIds.forEach((equipoId, index) => {
      clasificacion.set(equipoId, {
        equipoId,
        torneoId,
        partidosJugados: 0,
        partidosGanados: 0,
        partidosEmpatados: 0,
        partidosPerdidos: 0,
        golesFavor: 0,
        golesContra: 0,
        diferenciaGoles: 0,
        puntos: 0,
        posicion: index + 1,
        grupo
      });
    });

    // Calcular estadísticas
    partidosTorneo.forEach(partido => {
      if (partido.estado === 'Jugado' && partido.golesLocal !== undefined && partido.golesVisitante !== undefined) {
        const local = clasificacion.get(partido.equipoLocalId);
        const visitante = clasificacion.get(partido.equipoVisitanteId);
        
        if (local && visitante) {
          local.partidosJugados++;
          visitante.partidosJugados++;
          
          local.golesFavor += partido.golesLocal;
          local.golesContra += partido.golesVisitante;
          visitante.golesFavor += partido.golesVisitante;
          visitante.golesContra += partido.golesLocal;
          
          if (partido.golesLocal > partido.golesVisitante) {
            local.partidosGanados++;
            local.puntos += torneo.configuracion.puntosVictoria;
            visitante.partidosPerdidos++;
            visitante.puntos += torneo.configuracion.puntosDerrota;
          } else if (partido.golesLocal < partido.golesVisitante) {
            visitante.partidosGanados++;
            visitante.puntos += torneo.configuracion.puntosVictoria;
            local.partidosPerdidos++;
            local.puntos += torneo.configuracion.puntosDerrota;
          } else {
            local.partidosEmpatados++;
            visitante.partidosEmpatados++;
            local.puntos += torneo.configuracion.puntosEmpate;
            visitante.puntos += torneo.configuracion.puntosEmpate;
          }
          
          local.diferenciaGoles = local.golesFavor - local.golesContra;
          visitante.diferenciaGoles = visitante.golesFavor - visitante.golesContra;
        }
      }
    });

    const clasificacionArray = Array.from(clasificacion.values()).sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.diferenciaGoles !== a.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
      return b.golesFavor - a.golesFavor;
    });

    // Actualizar posiciones
    clasificacionArray.forEach((item, index) => {
      item.posicion = index + 1;
    });

    return clasificacionArray;
  }, [partidos, torneos]);

  const obtenerClasificacionPorGrupo = useCallback((torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo || !torneo.grupos) return {};

    const clasificacionPorGrupo: { [grupo: string]: Clasificacion[] } = {};
    
    Object.keys(torneo.grupos).forEach(grupoId => {
      clasificacionPorGrupo[grupoId] = obtenerClasificacion(torneoId, grupoId);
    });

    return clasificacionPorGrupo;
  }, [torneos, obtenerClasificacion]);

  const generarEliminatorias = useCallback(async (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo || torneo.tipo !== 'grupos-eliminatorias') return;

    // Obtener clasificados de cada grupo
    const clasificacionPorGrupo = obtenerClasificacionPorGrupo(torneoId);
    const clasificados: string[] = [];

    Object.values(clasificacionPorGrupo).forEach(clasificacion => {
      // Tomar los primeros 2 de cada grupo
      const clasificadosGrupo = clasificacion
        .slice(0, torneo.configuracion.clasificadosPorGrupo || 2)
        .map(c => c.equipoId);
      clasificados.push(...clasificadosGrupo);
    });

    // Mezclar clasificados aleatoriamente
    for (let i = clasificados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clasificados[i], clasificados[j]] = [clasificados[j], clasificados[i]];
    }

    // Generar partidos de eliminatorias
    const nuevosPartidos: Omit<Partido, 'id'>[] = [];
    let equiposRestantes = [...clasificados];
    let ronda = 1;

    while (equiposRestantes.length > 1) {
      const faseName = equiposRestantes.length <= 2 ? 'final' : 
                      equiposRestantes.length <= 4 ? 'semifinal' : 
                      equiposRestantes.length <= 8 ? 'cuartos' : 'octavos';
      
      for (let i = 0; i < equiposRestantes.length; i += 2) {
        if (i + 1 < equiposRestantes.length) {
          const fecha = new Date(torneo.fechaInicio);
          fecha.setDate(fecha.getDate() + 30 + (ronda - 1) * 7); // Empezar eliminatorias 30 días después
          
          nuevosPartidos.push({
            torneoId,
            equipoLocalId: equiposRestantes[i],
            equipoVisitanteId: equiposRestantes[i + 1],
            fecha: fecha.toISOString().split('T')[0],
            hora: '16:00',
            estado: 'Pendiente',
            jornada: ronda + 100, // Usar jornadas altas para eliminatorias
            fase: faseName,
            campoId: torneo.campoId
          });
        }
      }
      
      equiposRestantes = equiposRestantes.filter((_, index) => index % 2 === 0);
      ronda++;
    }

    await crearPartidos(nuevosPartidos);
    await actualizarTorneo(torneoId, { faseActual: 'octavos' });
  }, [torneos, obtenerClasificacionPorGrupo, crearPartidos, actualizarTorneo]);



  const editarPartido = useCallback(async (partidoId: string, cambios: { fecha?: string; hora?: string; equipoLocalId?: string; equipoVisitanteId?: string }) => {
    await actualizarPartido(partidoId, cambios);
  }, [actualizarPartido]);

  const generarCalendarioTorneo = useCallback(async (torneoId: string) => {
    const torneo = torneos.find(t => t.id === torneoId);
    if (!torneo || torneo.equiposIds.length < 2) return;

    const equipos = torneo.equiposIds;
    const nuevosPartidos: Omit<Partido, 'id'>[] = [];

    if (torneo.tipo === 'grupos') {
      // Generar partidos de liga (todos contra todos)
      for (let i = 0; i < equipos.length; i++) {
        for (let j = i + 1; j < equipos.length; j++) {
          nuevosPartidos.push({
            torneoId,
            equipoLocalId: equipos[i],
            equipoVisitanteId: equipos[j],
            fecha: torneo.fechaInicio,
            hora: '10:00',
            estado: 'Pendiente',
            jornada: 1
          });
        }
      }
    } else if (torneo.tipo === 'eliminatorias') {
      // Generar partidos de eliminatorias
      let equiposRestantes = [...equipos];
      
      // Mezclar equipos aleatoriamente
      for (let i = equiposRestantes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [equiposRestantes[i], equiposRestantes[j]] = [equiposRestantes[j], equiposRestantes[i]];
      }
      
      let ronda = 1;
      let fechaBase = new Date(torneo.fechaInicio);
      
      while (equiposRestantes.length > 1) {
        const partidosRonda: Omit<Partido, 'id'>[] = [];
        
        // Determinar nombre de la fase según el número de equipos
        let faseName: string;
        if (equiposRestantes.length <= 2) {
          faseName = 'final';
        } else if (equiposRestantes.length <= 4) {
          faseName = 'semifinal';
        } else if (equiposRestantes.length <= 8) {
          faseName = 'cuartos';
        } else {
          faseName = 'octavos';
        }
        
        for (let i = 0; i < equiposRestantes.length; i += 2) {
          if (i + 1 < equiposRestantes.length) {
            const fechaPartido = new Date(fechaBase);
            fechaPartido.setDate(fechaPartido.getDate() + (ronda - 1) * 7); // Una semana entre rondas
            
            partidosRonda.push({
              torneoId,
              equipoLocalId: equiposRestantes[i],
              equipoVisitanteId: equiposRestantes[i + 1],
              fecha: fechaPartido.toISOString().split('T')[0],
              hora: '16:00',
              estado: 'Pendiente',
              jornada: ronda,
              fase: faseName,
              campoId: torneo.campoId
            });
          }
        }
        
        nuevosPartidos.push(...partidosRonda);
        
        // Para la siguiente ronda, solo mantener la mitad de los equipos
        // En eliminatorias reales, esto se actualizará cuando se jueguen los partidos
        const nuevosEquiposRestantes: string[] = [];
        for (let i = 0; i < equiposRestantes.length; i += 2) {
          if (i + 1 < equiposRestantes.length) {
            // Por ahora, avanzamos el primer equipo de cada pareja
            // Esto se actualizará cuando se registren los resultados
            nuevosEquiposRestantes.push(equiposRestantes[i]);
          }
        }
        
        equiposRestantes = nuevosEquiposRestantes;
        ronda++;
      }
    }

    await crearPartidos(nuevosPartidos);
  }, [torneos, crearPartidos]);

  const obtenerCamposPorCiudad = useCallback((ciudad: string): CampoFutbol[] => {
    return campos.filter(campo => campo.ciudad === ciudad);
  }, [campos]);

  const obtenerCamposPorTipo = useCallback((tipo: string): CampoFutbol[] => {
    return campos.filter(campo => campo.tipo === tipo);
  }, [campos]);

  const crearCampo = useCallback(async (campo: Omit<CampoFutbol, 'id'>): Promise<string> => {
    const id = Date.now().toString();
    const nuevoCampo: CampoFutbol = { ...campo, id };
    await saveCampos([...campos, nuevoCampo]);
    return id;
  }, [campos, saveCampos]);

  const actualizarCampo = useCallback(async (id: string, campoActualizado: Partial<CampoFutbol>) => {
    const nuevosCampos = campos.map(c => 
      c.id === id ? { ...c, ...campoActualizado } : c
    );
    await saveCampos(nuevosCampos);
  }, [campos, saveCampos]);

  const eliminarCampo = useCallback(async (id: string) => {
    const nuevosCampos = campos.filter(c => c.id !== id);
    await saveCampos(nuevosCampos);
  }, [campos, saveCampos]);

  const obtenerGoleadoresTorneo = useCallback((torneoId: string) => {
    const partidosTorneo = partidos.filter(p => p.torneoId === torneoId && p.estado === 'Jugado');
    const goleadores: Record<string, { jugadorId: string; equipoId: string; goles: number; nombre?: string }> = {};

    partidosTorneo.forEach(partido => {
      if (partido.goleadores) {
        partido.goleadores.forEach(gol => {
          const key = `${gol.jugadorId}-${gol.equipoId}`;
          if (!goleadores[key]) {
            const equipo = equipos.find(e => e.id === gol.equipoId);
            const jugador = equipo?.jugadores.find(j => j.id === gol.jugadorId);
            goleadores[key] = {
              jugadorId: gol.jugadorId,
              equipoId: gol.equipoId,
              goles: 0,
              nombre: jugador?.nombre
            };
          }
          goleadores[key].goles++;
        });
      }
    });

    return Object.values(goleadores).sort((a, b) => b.goles - a.goles);
  }, [partidos, equipos]);

  const obtenerEstadisticasJugador = useCallback((jugadorId: string, torneoId?: string) => {
    let partidosJugador = partidos.filter(p => {
      const equipo = equipos.find(e => e.jugadores.some(j => j.id === jugadorId));
      return equipo && (p.equipoLocalId === equipo.id || p.equipoVisitanteId === equipo.id) && p.estado === 'Jugado';
    });

    if (torneoId) {
      partidosJugador = partidosJugador.filter(p => p.torneoId === torneoId);
    }

    let goles = 0;
    let asistencias = 0;
    let tarjetasAmarillas = 0;
    let tarjetasRojas = 0;

    partidosJugador.forEach(partido => {
      if (partido.goleadores) {
        goles += partido.goleadores.filter(g => g.jugadorId === jugadorId).length;
      }
      if (partido.eventos) {
        const eventosJugador = partido.eventos.filter(e => e.jugadorId === jugadorId);
        tarjetasAmarillas += eventosJugador.filter(e => e.tipo === 'tarjeta_amarilla').length;
        tarjetasRojas += eventosJugador.filter(e => e.tipo === 'tarjeta_roja').length;
      }
    });

    return { goles, asistencias, tarjetasAmarillas, tarjetasRojas };
  }, [partidos, equipos]);

  const agregarEvento = useCallback(async (partidoId: string, evento: Omit<EventoPartido, 'id' | 'partidoId'>) => {
    const nuevoEvento: EventoPartido = {
      ...evento,
      id: Date.now().toString(),
      partidoId
    };

    const nuevosPartidos = partidos.map(p => {
      if (p.id === partidoId) {
        return {
          ...p,
          eventos: [...(p.eventos || []), nuevoEvento]
        };
      }
      return p;
    });

    await savePartidos(nuevosPartidos);
  }, [partidos, savePartidos]);

  const saveClubes = useCallback(async (newClubes: Club[]) => {
    try {
      if (!Array.isArray(newClubes)) {
        console.error('❌ saveClubes: newClubes is not an array:', typeof newClubes);
        return;
      }
      
      const jsonString = JSON.stringify(newClubes);
      await AsyncStorage.setItem('clubes', jsonString);
      setClubes(newClubes);
      console.log('✅ Clubes saved successfully:', newClubes.length);
    } catch (error) {
      console.error('❌ Error saving clubes:', error);
      throw error;
    }
  }, []);

  const saveAmistosos = useCallback(async (newAmistosos: PartidoAmistoso[]) => {
    try {
      if (!Array.isArray(newAmistosos)) {
        console.error('❌ saveAmistosos: newAmistosos is not an array:', typeof newAmistosos);
        return;
      }
      
      const jsonString = JSON.stringify(newAmistosos);
      await AsyncStorage.setItem('amistosos', jsonString);
      setAmistosos(newAmistosos);
      console.log('✅ Amistosos saved successfully:', newAmistosos.length);
    } catch (error) {
      console.error('❌ Error saving amistosos:', error);
      throw error;
    }
  }, []);

  // Funciones para clubes
  const crearClub = useCallback(async (club: Omit<Club, 'id' | 'fechaCreacion'>): Promise<string> => {
    const id = Date.now().toString();
    const nuevoClub: Club = { 
      ...club, 
      id,
      fechaCreacion: new Date().toISOString(),
      categorias: club.categorias || {}
    };
    await saveClubes([...clubes, nuevoClub]);
    return id;
  }, [clubes, saveClubes]);

  const actualizarClub = useCallback(async (id: string, clubActualizado: Partial<Club>) => {
    const nuevosClubes = clubes.map(c => 
      c.id === id ? { ...c, ...clubActualizado } : c
    );
    await saveClubes(nuevosClubes);
  }, [clubes, saveClubes]);

  const eliminarClub = useCallback(async (id: string) => {
    const nuevosClubes = clubes.filter(c => c.id !== id);
    await saveClubes(nuevosClubes);
  }, [clubes, saveClubes]);

  const obtenerClubesPorEntrenador = useCallback((entrenadorId: string): Club[] => {
    return clubes.filter(c => c.entrenadorId === entrenadorId);
  }, [clubes]);

  const agregarEquipoAClub = useCallback(async (clubId: string, equipoId: string, categoria: string) => {
    console.log('🏛️ === AGREGANDO EQUIPO AL CLUB ===');
    console.log('🏛️ Club ID:', clubId);
    console.log('🏛️ Equipo ID:', equipoId);
    console.log('🏛️ Categoría:', categoria);
    
    // Validar parámetros
    if (!clubId || !equipoId || !categoria) {
      const error = 'Parámetros inválidos: clubId, equipoId y categoria son requeridos';
      console.error('❌', error);
      throw new Error(error);
    }
    
    const club = clubes.find(c => c.id === clubId);
    if (!club) {
      console.error('❌ Club no encontrado:', clubId);
      console.error('❌ Clubes disponibles:', clubes.map(c => ({ id: c.id, nombre: c.nombre })));
      throw new Error(`Club con ID ${clubId} no encontrado`);
    }

    const equipo = equipos.find(e => e.id === equipoId);
    if (!equipo) {
      console.error('❌ Equipo no encontrado:', equipoId);
      console.error('❌ Equipos disponibles:', equipos.map(e => ({ id: e.id, nombre: e.nombre })));
      throw new Error(`Equipo con ID ${equipoId} no encontrado`);
    }

    console.log('✅ Club encontrado:', club.nombre);
    console.log('✅ Equipo encontrado:', equipo.nombre);
    console.log('🔍 Estado inicial del equipo:', { id: equipo.id, nombre: equipo.nombre, clubId: equipo.clubId });

    // Verificar si el equipo ya pertenece a otro club
    if (equipo.clubId && equipo.clubId !== clubId) {
      console.warn('⚠️ El equipo ya pertenece a otro club:', equipo.clubId);
      throw new Error('El equipo ya pertenece a otro club');
    }

    // Actualizar el equipo con clubId PRIMERO
    console.log('🔗 Vinculando equipo al club...');
    const nuevosEquipos = equipos.map(e => 
      e.id === equipoId ? { ...e, clubId } : e
    );
    
    // Actualizar las categorías del club
    const nuevasCategorias = { ...club.categorias };
    if (!nuevasCategorias[categoria]) {
      console.log('📝 Creando nueva categoría:', categoria);
      nuevasCategorias[categoria] = {
        nombre: categoria as any,
        equipos: []
      };
    }
    
    if (!nuevasCategorias[categoria].equipos.includes(equipoId)) {
      console.log('➕ Agregando equipo a la categoría');
      nuevasCategorias[categoria].equipos.push(equipoId);
    } else {
      console.log('⚠️ El equipo ya está en la categoría');
    }

    // Actualizar estadísticas del club
    const totalEquipos = Object.values(nuevasCategorias).reduce((total, cat) => total + cat.equipos.length, 0);
    const nuevasEstadisticas = {
      totalEquipos,
      torneosParticipados: club.estadisticas?.torneosParticipados || 0,
      amistososJugados: club.estadisticas?.amistososJugados || 0
    };

    console.log('💾 Actualizando club con nuevas categorías y estadísticas...');
    console.log('📊 Total equipos calculado:', totalEquipos);
    console.log('📊 Equipos en categorías:', Object.entries(nuevasCategorias).map(([cat, data]) => ({ categoria: cat, equipos: data.equipos.length })));
    
    const nuevosClubes = clubes.map(c => 
      c.id === clubId ? { 
        ...c, 
        categorias: nuevasCategorias,
        estadisticas: nuevasEstadisticas
      } : c
    );
    
    try {
      // Guardar ambos cambios de forma secuencial para evitar problemas de concurrencia
      console.log('💾 Guardando equipos...');
      await saveEquipos(nuevosEquipos);
      console.log('✅ Equipos guardados exitosamente');
      
      console.log('💾 Guardando clubes...');
      await saveClubes(nuevosClubes);
      console.log('✅ Clubes guardados exitosamente');
      
      // Verificar el estado final después de guardar
      const equipoFinal = nuevosEquipos.find(e => e.id === equipoId);
      const clubFinal = nuevosClubes.find(c => c.id === clubId);
      console.log('🔍 Estado final del equipo:', { id: equipoFinal?.id, nombre: equipoFinal?.nombre, clubId: equipoFinal?.clubId });
      console.log('🔍 Estado final del club:', { id: clubFinal?.id, nombre: clubFinal?.nombre, totalEquipos: clubFinal?.estadisticas?.totalEquipos });
      console.log('🔍 Categorías del club:', Object.keys(clubFinal?.categorias || {}));
      console.log('🔍 Equipos en categoría ' + categoria + ':', clubFinal?.categorias?.[categoria]?.equipos || []);
      
      // Verificar que el equipo realmente tenga el clubId usando el estado actualizado
      const equipoVerificacion = nuevosEquipos.find(e => e.id === equipoId);
      console.log('🔍 Verificación final - equipo en estado actualizado:', { id: equipoVerificacion?.id, clubId: equipoVerificacion?.clubId });
      
      console.log('🏛️ === PROCESO COMPLETADO EXITOSAMENTE ===');
    } catch (error) {
      console.error('❌ Error guardando datos:', error);
      throw new Error(`Error al guardar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [clubes, equipos, saveClubes, saveEquipos]);

  const removerEquipoDeClub = useCallback(async (clubId: string, equipoId: string) => {
    const club = clubes.find(c => c.id === clubId);
    if (!club) return;

    const nuevasCategorias = { ...club.categorias };
    Object.keys(nuevasCategorias).forEach(categoria => {
      nuevasCategorias[categoria].equipos = nuevasCategorias[categoria].equipos.filter(id => id !== equipoId);
    });

    await actualizarClub(clubId, { categorias: nuevasCategorias });
    
    // Remover la referencia del club del equipo
    await actualizarEquipo(equipoId, { clubId: undefined });
  }, [clubes, actualizarClub, actualizarEquipo]);

  // Funciones para amistosos
  const crearAmistoso = useCallback(async (amistoso: Omit<PartidoAmistoso, 'id' | 'fechaCreacion'>): Promise<string> => {
    try {
      console.log('🤝 === CREANDO AMISTOSO EN DATA-CONTEXT ===');
      console.log('🤝 Datos recibidos:', JSON.stringify(amistoso, null, 2));
      console.log('🤝 Estado actual de amistosos:', amistosos.length);
      
      const id = Date.now().toString();
      const nuevoAmistoso: PartidoAmistoso = { 
        ...amistoso, 
        id,
        fechaCreacion: new Date().toISOString()
      };
      
      console.log('🤝 Nuevo amistoso creado:', JSON.stringify(nuevoAmistoso, null, 2));
      
      const nuevosAmistosos = [...amistosos, nuevoAmistoso];
      console.log('🤝 Total amistosos después de agregar:', nuevosAmistosos.length);
      
      await saveAmistosos(nuevosAmistosos);
      
      console.log('✅ Amistoso guardado exitosamente con ID:', id);
      console.log('🤝 === PROCESO COMPLETADO ===');
      
      return id;
    } catch (error) {
      console.error('❌ Error en crearAmistoso:', error);
      throw error;
    }
  }, [amistosos, saveAmistosos]);

  const actualizarAmistoso = useCallback(async (id: string, amistosoActualizado: Partial<PartidoAmistoso>) => {
    const nuevosAmistosos = amistosos.map(a => 
      a.id === id ? { ...a, ...amistosoActualizado } : a
    );
    await saveAmistosos(nuevosAmistosos);
  }, [amistosos, saveAmistosos]);

  const eliminarAmistoso = useCallback(async (id: string) => {
    const nuevosAmistosos = amistosos.filter(a => a.id !== id);
    await saveAmistosos(nuevosAmistosos);
  }, [amistosos, saveAmistosos]);

  const buscarAmistosos = useCallback((filtro: FiltroAmistosos): PartidoAmistoso[] => {
    return amistosos.filter(amistoso => {
      if (filtro.categoria && amistoso.categoria !== filtro.categoria) return false;
      if (filtro.tipoFutbol && amistoso.tipoFutbol !== filtro.tipoFutbol) return false;
      if (filtro.fecha && amistoso.fecha !== filtro.fecha) return false;
      if (filtro.franjaHoraria && amistoso.franjaHoraria !== filtro.franjaHoraria) return false;
      
      // Filtro por proximidad (si se proporciona ubicación y rango)
      if (filtro.ubicacion && filtro.rangoKm && amistoso.ubicacion.coordenadas) {
        const distancia = calcularDistancia(
          filtro.ubicacion.latitud,
          filtro.ubicacion.longitud,
          amistoso.ubicacion.coordenadas.latitud,
          amistoso.ubicacion.coordenadas.longitud
        );
        if (distancia > filtro.rangoKm) return false;
      }
      
      return true;
    });
  }, [amistosos]);

  const proponerAmistoso = useCallback(async (amistosoId: string, equipoVisitanteId: string, entrenadorId: string) => {
    const amistoso = amistosos.find(a => a.id === amistosoId);
    if (!amistoso || !amistoso.esDisponibilidad) return;

    const equipoVisitante = equipos.find(e => e.id === equipoVisitanteId);
    if (!equipoVisitante) return;

    await actualizarAmistoso(amistosoId, {
      equipoVisitanteId,
      estado: 'Propuesto',
      esDisponibilidad: false,
      propuestaPor: entrenadorId,
      propuestaA: equipoVisitante.entrenadorId
    });

    console.log(`Propuesta de amistoso enviada a ${equipoVisitante.entrenadorId}`);
  }, [amistosos, equipos, actualizarAmistoso]);

  const aceptarAmistoso = useCallback(async (amistosoId: string) => {
    await actualizarAmistoso(amistosoId, {
      estado: 'Confirmado',
      fechaConfirmacion: new Date().toISOString()
    });
    console.log('Amistoso confirmado');
  }, [actualizarAmistoso]);

  const rechazarAmistoso = useCallback(async (amistosoId: string) => {
    await actualizarAmistoso(amistosoId, {
      estado: 'Cancelado'
    });
    console.log('Amistoso rechazado');
  }, [actualizarAmistoso]);

  const finalizarAmistoso = useCallback(async (amistosoId: string, golesLocal: number, golesVisitante: number, goleadores?: { equipoId: string; jugadorId: string; minuto: number }[]) => {
    await actualizarAmistoso(amistosoId, {
      estado: 'Finalizado',
      golesLocal,
      golesVisitante,
      goleadores: goleadores || [],
      fechaFinalizacion: new Date().toISOString()
    });
    
    // Actualizar estadísticas de equipos
    const amistoso = amistosos.find(a => a.id === amistosoId);
    if (amistoso && amistoso.equipoVisitanteId) {
      const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
      const equipoVisitante = equipos.find(e => e.id === amistoso.equipoVisitanteId);
      
      if (equipoLocal && equipoVisitante) {
        // Actualizar estadísticas del equipo local
        const nuevasEstadisticasLocal = {
          partidosJugados: equipoLocal.estadisticas?.partidosJugados || 0,
          partidosGanados: equipoLocal.estadisticas?.partidosGanados || 0,
          partidosEmpatados: equipoLocal.estadisticas?.partidosEmpatados || 0,
          partidosPerdidos: equipoLocal.estadisticas?.partidosPerdidos || 0,
          golesFavor: equipoLocal.estadisticas?.golesFavor || 0,
          golesContra: equipoLocal.estadisticas?.golesContra || 0,
          torneosParticipados: equipoLocal.estadisticas?.torneosParticipados || 0,
          torneosGanados: equipoLocal.estadisticas?.torneosGanados || 0,
          amistososJugados: (equipoLocal.estadisticas?.amistososJugados || 0) + 1,
          amistososGanados: (equipoLocal.estadisticas?.amistososGanados || 0) + (golesLocal > golesVisitante ? 1 : 0)
        };
        
        // Actualizar estadísticas del equipo visitante
        const nuevasEstadisticasVisitante = {
          partidosJugados: equipoVisitante.estadisticas?.partidosJugados || 0,
          partidosGanados: equipoVisitante.estadisticas?.partidosGanados || 0,
          partidosEmpatados: equipoVisitante.estadisticas?.partidosEmpatados || 0,
          partidosPerdidos: equipoVisitante.estadisticas?.partidosPerdidos || 0,
          golesFavor: equipoVisitante.estadisticas?.golesFavor || 0,
          golesContra: equipoVisitante.estadisticas?.golesContra || 0,
          torneosParticipados: equipoVisitante.estadisticas?.torneosParticipados || 0,
          torneosGanados: equipoVisitante.estadisticas?.torneosGanados || 0,
          amistososJugados: (equipoVisitante.estadisticas?.amistososJugados || 0) + 1,
          amistososGanados: (equipoVisitante.estadisticas?.amistososGanados || 0) + (golesVisitante > golesLocal ? 1 : 0)
        };
        
        await actualizarEquipo(amistoso.equipoLocalId, { estadisticas: nuevasEstadisticasLocal });
        await actualizarEquipo(amistoso.equipoVisitanteId, { estadisticas: nuevasEstadisticasVisitante });
      }
    }
    
    console.log('Amistoso finalizado');
  }, [amistosos, equipos, actualizarAmistoso, actualizarEquipo]);

  const obtenerAmistososPorEquipo = useCallback((equipoId: string): PartidoAmistoso[] => {
    return amistosos.filter(a => a.equipoLocalId === equipoId || a.equipoVisitanteId === equipoId);
  }, [amistosos]);

  const obtenerDisponibilidadesPorFiltro = useCallback((filtro: FiltroAmistosos): PartidoAmistoso[] => {
    return amistosos.filter(amistoso => {
      if (!amistoso.esDisponibilidad || amistoso.estado !== 'Disponible') return false;
      return buscarAmistosos(filtro).includes(amistoso);
    });
  }, [amistosos, buscarAmistosos]);

  const exportarResultadoAmistoso = useCallback(async (amistosoId: string): Promise<string> => {
    const amistoso = amistosos.find(a => a.id === amistosoId);
    if (!amistoso || amistoso.estado !== 'Finalizado') {
      throw new Error('Amistoso no encontrado o no finalizado');
    }

    const equipoLocal = equipos.find(e => e.id === amistoso.equipoLocalId);
    const equipoVisitante = equipos.find(e => e.id === amistoso.equipoVisitanteId);
    
    if (!equipoLocal || !equipoVisitante) {
      throw new Error('Equipos no encontrados');
    }

    // Generar contenido del resultado
    const resultado = `
🏆 RESULTADO DEL AMISTOSO

${equipoLocal.nombre} ${amistoso.golesLocal} - ${amistoso.golesVisitante} ${equipoVisitante.nombre}

📅 Fecha: ${amistoso.fecha}
⏰ Hora: ${amistoso.hora}
📍 Lugar: ${amistoso.ubicacion.direccion}

${amistoso.goleadores && amistoso.goleadores.length > 0 ? '⚽ Goleadores:\n' + amistoso.goleadores.map(g => {
      const equipo = equipos.find(e => e.id === g.equipoId);
      const jugador = equipo?.jugadores.find(j => j.id === g.jugadorId);
      return `${jugador?.nombre || 'Desconocido'} (${equipo?.nombre || 'Desconocido'}) - Min ${g.minuto}`;
    }).join('\n') : ''}

#FutbolApp #Amistoso
    `;

    return resultado.trim();
  }, [amistosos, equipos]);

  // Función auxiliar para calcular distancia entre coordenadas
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const limpiarTodosLosDatos = useCallback(async () => {
    try {
      console.log('🧹 Iniciando limpieza de todos los datos...');
      
      // Clear AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem('equipos'),
        AsyncStorage.removeItem('torneos'),
        AsyncStorage.removeItem('partidos'),
        AsyncStorage.removeItem('campos'),
        AsyncStorage.removeItem('clubes'),
        AsyncStorage.removeItem('amistosos')
      ]);
      
      console.log('✅ AsyncStorage limpiado');
      
      // Reset state
      setEquipos([]);
      setTorneos([]);
      setPartidos([]);
      setCampos(CAMPOS_MOCK);
      setClubes([]);
      setAmistosos([]);
      
      console.log('✅ Estados reseteados');
      console.log('🎉 Todos los datos han sido eliminados exitosamente');
      
      // Force a reload of data to ensure clean state
      setTimeout(() => {
        loadData();
      }, 100);
      
    } catch (error) {
      console.error('❌ Error al limpiar los datos:', error);
      
      // Force reset even if there's an error
      setEquipos([]);
      setTorneos([]);
      setPartidos([]);
      setCampos(CAMPOS_MOCK);
      setClubes([]);
      setAmistosos([]);
      
      throw error;
    }
  }, [loadData]);

  return useMemo(() => ({
    equipos,
    torneos,
    partidos,
    campos,
    clubes,
    amistosos,
    isLoading,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo,
    obtenerEquiposPorEntrenador,
    obtenerEquiposPorFiltro,
    agregarJugador,
    actualizarJugador,
    eliminarJugador,
    obtenerJugadoresPorEquipo,
    crearTorneo,
    actualizarTorneo,
    eliminarTorneo,
    finalizarTorneo,
    obtenerTorneosPorCreador,
    obtenerTorneosPorFiltro,
    inscribirEquipoEnTorneo,
    desinscribirEquipoDelTorneo,
    crearPartidos,
    actualizarPartido,
    actualizarResultado,
    obtenerPartidosPorTorneo,
    obtenerPartidosPorEquipo,
    crearCampo,
    actualizarCampo,
    eliminarCampo,
    obtenerCamposPorCiudad,
    obtenerCamposPorTipo,
    obtenerClasificacion,
    obtenerClasificacionPorGrupo,
    generarEliminatorias,
    avanzarEnEliminatorias,
    editarPartido,
    obtenerGoleadoresTorneo,
    obtenerEstadisticasJugador,
    agregarEvento,
    generarCalendarioTorneo,
    crearClub,
    actualizarClub,
    eliminarClub,
    obtenerClubesPorEntrenador,
    agregarEquipoAClub,
    removerEquipoDeClub,
    crearAmistoso,
    actualizarAmistoso,
    eliminarAmistoso,
    buscarAmistosos,
    proponerAmistoso,
    aceptarAmistoso,
    rechazarAmistoso,
    finalizarAmistoso,
    obtenerAmistososPorEquipo,
    obtenerDisponibilidadesPorFiltro,
    exportarResultadoAmistoso,
    limpiarTodosLosDatos,
    limpiarAsyncStorage: limpiarTodosLosDatos,
    recargarDatos: loadData
  }), [
    equipos,
    torneos,
    partidos,
    campos,
    clubes,
    amistosos,
    isLoading,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo,
    obtenerEquiposPorEntrenador,
    obtenerEquiposPorFiltro,
    agregarJugador,
    actualizarJugador,
    eliminarJugador,
    obtenerJugadoresPorEquipo,
    crearTorneo,
    actualizarTorneo,
    eliminarTorneo,
    finalizarTorneo,
    obtenerTorneosPorCreador,
    obtenerTorneosPorFiltro,
    inscribirEquipoEnTorneo,
    desinscribirEquipoDelTorneo,
    crearPartidos,
    actualizarPartido,
    actualizarResultado,
    obtenerPartidosPorTorneo,
    obtenerPartidosPorEquipo,
    crearCampo,
    actualizarCampo,
    eliminarCampo,
    obtenerCamposPorCiudad,
    obtenerCamposPorTipo,
    obtenerClasificacion,
    obtenerClasificacionPorGrupo,
    generarEliminatorias,
    avanzarEnEliminatorias,
    editarPartido,
    obtenerGoleadoresTorneo,
    obtenerEstadisticasJugador,
    agregarEvento,
    generarCalendarioTorneo,
    crearClub,
    actualizarClub,
    eliminarClub,
    obtenerClubesPorEntrenador,
    agregarEquipoAClub,
    removerEquipoDeClub,
    crearAmistoso,
    actualizarAmistoso,
    eliminarAmistoso,
    buscarAmistosos,
    proponerAmistoso,
    aceptarAmistoso,
    rechazarAmistoso,
    finalizarAmistoso,
    obtenerAmistososPorEquipo,
    obtenerDisponibilidadesPorFiltro,
    exportarResultadoAmistoso,
    limpiarTodosLosDatos,
    loadData
  ]);
});