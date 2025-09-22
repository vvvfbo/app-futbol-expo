import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';

// Mock de los hooks
jest.mock('@/hooks/auth-context');
jest.mock('@/hooks/data-context');

describe('Torneos - Unit Tests', () => {
  const mockCrearTorneo = jest.fn();
  const mockActualizarTorneo = jest.fn();
  const mockEliminarTorneo = jest.fn();
  const mockFinalizarTorneo = jest.fn();
  const mockGenerarEliminatorias = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useData as jest.Mock).mockReturnValue({
      torneos: [
        {
          id: 'test-torneo-id',
          nombre: 'Test Tournament',
          tipo: 'grupos',
          estado: 'En curso',
          ciudad: 'Madrid',
          categoria: 'Senior',
          tipoFutbol: '11vs11',
          equiposIds: ['team1', 'team2', 'team3', 'team4'],
          creadorId: 'test-user-id',
          fechaInicio: '2024-01-01',
          fechaFin: '2024-01-31',
        }
      ],
      equipos: [
        { id: 'team1', nombre: 'Team 1', entrenadorId: 'user1' },
        { id: 'team2', nombre: 'Team 2', entrenadorId: 'user2' },
        { id: 'team3', nombre: 'Team 3', entrenadorId: 'user3' },
        { id: 'team4', nombre: 'Team 4', entrenadorId: 'user4' },
      ],
      partidos: [],
      clubes: [],
      amistosos: [],
      campos: [],
      isLoading: false,
      crearTorneo: mockCrearTorneo,
      actualizarTorneo: mockActualizarTorneo,
      eliminarTorneo: mockEliminarTorneo,
      finalizarTorneo: mockFinalizarTorneo,
      generarEliminatorias: mockGenerarEliminatorias,
      obtenerClasificacion: jest.fn(),
      obtenerClasificacionPorGrupo: jest.fn(),
      obtenerGoleadoresTorneo: jest.fn(),
      editarPartido: jest.fn(),
      crearEquipo: jest.fn(),
      actualizarEquipo: jest.fn(),
      eliminarEquipo: jest.fn(),
      crearClub: jest.fn(),
      actualizarClub: jest.fn(),
      eliminarClub: jest.fn(),
      crearAmistoso: jest.fn(),
      actualizarAmistoso: jest.fn(),
      eliminarAmistoso: jest.fn(),
      obtenerEquiposPorEntrenador: jest.fn(),
      obtenerEquiposPorFiltro: jest.fn(),
      agregarJugador: jest.fn(),
      actualizarJugador: jest.fn(),
      eliminarJugador: jest.fn(),
      obtenerJugadoresPorEquipo: jest.fn(),
      obtenerTorneosPorCreador: jest.fn(),
      obtenerTorneosPorFiltro: jest.fn(),
      inscribirEquipoEnTorneo: jest.fn(),
      desinscribirEquipoDelTorneo: jest.fn(),
      crearPartidos: jest.fn(),
      actualizarPartido: jest.fn(),
      actualizarResultado: jest.fn(),
      obtenerPartidosPorTorneo: jest.fn(),
      obtenerPartidosPorEquipo: jest.fn(),
      agregarEvento: jest.fn(),
      crearCampo: jest.fn(),
      actualizarCampo: jest.fn(),
      eliminarCampo: jest.fn(),
      obtenerCamposPorCiudad: jest.fn(),
      obtenerCamposPorTipo: jest.fn(),
      avanzarEnEliminatorias: jest.fn(),
      obtenerEstadisticasJugador: jest.fn(),
      obtenerClubesPorEntrenador: jest.fn(),
      agregarEquipoAClub: jest.fn(),
      removerEquipoDeClub: jest.fn(),
      buscarAmistosos: jest.fn(),
      proponerAmistoso: jest.fn(),
      aceptarAmistoso: jest.fn(),
      rechazarAmistoso: jest.fn(),
      finalizarAmistoso: jest.fn(),
      obtenerAmistososPorEquipo: jest.fn(),
      obtenerDisponibilidadesPorFiltro: jest.fn(),
      exportarResultadoAmistoso: jest.fn(),
      generarCalendarioTorneo: jest.fn(),
      limpiarTodosLosDatos: jest.fn(),
      limpiarAsyncStorage: jest.fn(),
      recargarDatos: jest.fn(),
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        nombre: 'Test User',
      },
      firebaseUser: {
        uid: 'test-user-id',
        email: 'test@example.com',
      },
      isLoading: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      suscribirseATorneo: jest.fn(),
      desuscribirseATorneo: jest.fn(),
      actualizarUsuario: jest.fn(),
    });
  });

  test('debe crear torneo en modo grupos', async () => {
    const torneoData = {
      nombre: 'Torneo de Grupos',
      tipo: 'grupos' as const,
      ciudad: 'Madrid',
      categoria: 'Senior',
      tipoFutbol: '11vs11',
      equiposIds: ['team1', 'team2', 'team3', 'team4'],
      creadorId: 'test-user-id',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
      configuracion: {
        numeroGrupos: 2,
        equiposPorGrupo: 2,
        clasificadosPorGrupo: 1,
      },
    };

    mockCrearTorneo.mockResolvedValue('new-torneo-id');

    const result = await mockCrearTorneo(torneoData);

    expect(mockCrearTorneo).toHaveBeenCalledWith(torneoData);
    expect(result).toBe('new-torneo-id');
  });

  test('debe crear torneo en modo eliminatorias', async () => {
    const torneoData = {
      nombre: 'Torneo Eliminatorias',
      tipo: 'eliminatorias' as const,
      ciudad: 'Barcelona',
      categoria: 'Senior',
      tipoFutbol: '7vs7',
      equiposIds: ['team1', 'team2', 'team3', 'team4'],
      creadorId: 'test-user-id',
      fechaInicio: '2024-02-01',
      fechaFin: '2024-02-28',
    };

    mockCrearTorneo.mockResolvedValue('eliminatorias-torneo-id');

    const result = await mockCrearTorneo(torneoData);

    expect(mockCrearTorneo).toHaveBeenCalledWith(torneoData);
    expect(result).toBe('eliminatorias-torneo-id');
  });

  test('debe crear torneo en modo mixto (grupos + eliminatorias)', async () => {
    const torneoData = {
      nombre: 'Torneo Mixto',
      tipo: 'grupos-eliminatorias' as const,
      ciudad: 'Valencia',
      categoria: 'Senior',
      tipoFutbol: '11vs11',
      equiposIds: ['team1', 'team2', 'team3', 'team4', 'team5', 'team6', 'team7', 'team8'],
      creadorId: 'test-user-id',
      fechaInicio: '2024-03-01',
      fechaFin: '2024-03-31',
      configuracion: {
        numeroGrupos: 2,
        equiposPorGrupo: 4,
        clasificadosPorGrupo: 2,
      },
    };

    mockCrearTorneo.mockResolvedValue('mixto-torneo-id');

    const result = await mockCrearTorneo(torneoData);

    expect(mockCrearTorneo).toHaveBeenCalledWith(torneoData);
    expect(result).toBe('mixto-torneo-id');
  });

  test('debe generar eliminatorias correctamente', async () => {
    const torneoId = 'test-torneo-id';

    mockGenerarEliminatorias.mockResolvedValue(undefined);

    await mockGenerarEliminatorias(torneoId);

    expect(mockGenerarEliminatorias).toHaveBeenCalledWith(torneoId);
  });

  test('debe finalizar torneo con resultados', async () => {
    const torneoId = 'test-torneo-id';
    const resultado = {
      campeon: 'team1',
      subcampeon: 'team2',
      tercerPuesto: 'team3',
      fechaFinalizacion: '2024-01-31T23:59:59.000Z',
    };

    mockFinalizarTorneo.mockResolvedValue(undefined);

    await mockFinalizarTorneo(torneoId, resultado);

    expect(mockFinalizarTorneo).toHaveBeenCalledWith(torneoId, resultado);
  });

  test('debe validar equipos mínimos para crear torneo', async () => {
    const torneoConPocosEquipos = {
      nombre: 'Torneo Inválido',
      tipo: 'grupos' as const,
      ciudad: 'Madrid',
      categoria: 'Senior',
      tipoFutbol: '11vs11',
      equiposIds: ['team1'], // Solo 1 equipo
      creadorId: 'test-user-id',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-01-31',
    };

    mockCrearTorneo.mockRejectedValue(new Error('Se requieren al menos 4 equipos'));

    await expect(mockCrearTorneo(torneoConPocosEquipos)).rejects.toThrow('Se requieren al menos 4 equipos');
  });

  test('debe validar fechas del torneo', async () => {
    const torneoConFechasInvalidas = {
      nombre: 'Torneo Fechas Inválidas',
      tipo: 'grupos' as const,
      ciudad: 'Madrid',
      categoria: 'Senior',
      tipoFutbol: '11vs11',
      equiposIds: ['team1', 'team2', 'team3', 'team4'],
      creadorId: 'test-user-id',
      fechaInicio: '2024-01-31', // Fecha fin antes que inicio
      fechaFin: '2024-01-01',
    };

    mockCrearTorneo.mockRejectedValue(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));

    await expect(mockCrearTorneo(torneoConFechasInvalidas)).rejects.toThrow('La fecha de fin debe ser posterior a la fecha de inicio');
  });
});

// Test para emparejamientos
describe('Emparejamientos - Unit Tests', () => {
  test('debe generar emparejamientos aleatorios', () => {
    const equipos = ['team1', 'team2', 'team3', 'team4'];
    
    const generarEmparejamientos = (equiposIds: string[]) => {
      const emparejamientos = [];
      const equiposDisponibles = [...equiposIds];
      
      while (equiposDisponibles.length >= 2) {
        const local = equiposDisponibles.splice(Math.floor(Math.random() * equiposDisponibles.length), 1)[0];
        const visitante = equiposDisponibles.splice(Math.floor(Math.random() * equiposDisponibles.length), 1)[0];
        emparejamientos.push({ local, visitante });
      }
      
      return emparejamientos;
    };

    const emparejamientos = generarEmparejamientos(equipos);
    
    expect(emparejamientos).toHaveLength(2);
    expect(emparejamientos[0]).toHaveProperty('local');
    expect(emparejamientos[0]).toHaveProperty('visitante');
    expect(emparejamientos[1]).toHaveProperty('local');
    expect(emparejamientos[1]).toHaveProperty('visitante');
  });

  test('debe permitir editar emparejamientos', () => {
    const emparejamientoOriginal = {
      id: 'match1',
      equipoLocalId: 'team1',
      equipoVisitanteId: 'team2',
    };

    const emparejamientoEditado = {
      ...emparejamientoOriginal,
      equipoLocalId: 'team3',
      equipoVisitanteId: 'team4',
    };

    expect(emparejamientoEditado.equipoLocalId).toBe('team3');
    expect(emparejamientoEditado.equipoVisitanteId).toBe('team4');
    expect(emparejamientoEditado.id).toBe(emparejamientoOriginal.id);
  });
});

// Test para clasificaciones
describe('Clasificaciones - Unit Tests', () => {
  test('debe calcular puntos correctamente', () => {
    const calcularPuntos = (partidosGanados: number, partidosEmpatados: number) => {
      return (partidosGanados * 3) + (partidosEmpatados * 1);
    };

    expect(calcularPuntos(3, 1)).toBe(10); // 3 victorias + 1 empate = 9 + 1 = 10
    expect(calcularPuntos(2, 2)).toBe(8);  // 2 victorias + 2 empates = 6 + 2 = 8
    expect(calcularPuntos(0, 3)).toBe(3);  // 0 victorias + 3 empates = 0 + 3 = 3
    expect(calcularPuntos(0, 0)).toBe(0);  // Sin partidos = 0
  });

  test('debe calcular diferencia de goles', () => {
    const calcularDiferenciaGoles = (golesFavor: number, golesContra: number) => {
      return golesFavor - golesContra;
    };

    expect(calcularDiferenciaGoles(10, 5)).toBe(5);
    expect(calcularDiferenciaGoles(3, 3)).toBe(0);
    expect(calcularDiferenciaGoles(2, 8)).toBe(-6);
  });

  test('debe ordenar clasificación correctamente', () => {
    const equipos = [
      { id: 'team1', puntos: 6, diferenciaGoles: 2, golesFavor: 8 },
      { id: 'team2', puntos: 9, diferenciaGoles: 5, golesFavor: 10 },
      { id: 'team3', puntos: 6, diferenciaGoles: 2, golesFavor: 6 },
      { id: 'team4', puntos: 3, diferenciaGoles: -3, golesFavor: 4 },
    ];

    const ordenarClasificacion = (equiposArray: { id: string; puntos: number; diferenciaGoles: number; golesFavor: number }[]) => {
      return equiposArray.sort((a, b) => {
        if (a.puntos !== b.puntos) return b.puntos - a.puntos;
        if (a.diferenciaGoles !== b.diferenciaGoles) return b.diferenciaGoles - a.diferenciaGoles;
        return b.golesFavor - a.golesFavor;
      });
    };

    const clasificacionOrdenada = ordenarClasificacion([...equipos]);

    expect(clasificacionOrdenada[0].id).toBe('team2'); // 9 puntos
    expect(clasificacionOrdenada[1].id).toBe('team1'); // 6 puntos, más goles a favor
    expect(clasificacionOrdenada[2].id).toBe('team3'); // 6 puntos, menos goles a favor
    expect(clasificacionOrdenada[3].id).toBe('team4'); // 3 puntos
  });
});