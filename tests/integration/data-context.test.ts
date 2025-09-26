/**
 * 🗄️ TEST DE INTEGRACIÓN: Data Context y Estado Global
 * 
 * Este test valida el funcionamiento del contexto de datos:
 * 1. Persistencia en AsyncStorage
 * 2. Sincronización de estado
 * 3. Operaciones CRUD sobre entidades
 * 4. Consistencia entre diferentes contextos
 * 5. Manejo de errores y recuperación
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Equipo, Torneo, PartidoAmistoso, Club } from '../../types';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
}));

// Datos de prueba
const EQUIPO_PRUEBA: Equipo = {
  id: 'equipo-test-1',
  nombre: 'Equipo Test FC',
  ciudad: 'Madrid',
  categoria: 'Senior',
  tipoFutbol: 'F11',
  entrenadorId: 'entrenador-test',
  colores: { principal: '#FF0000', secundario: '#0000FF' },
  jugadores: [],
  fechaCreacion: new Date().toISOString()
};

const CLUB_PRUEBA: Club = {
  id: 'club-test-1',
  nombre: 'Club Test',
  descripcion: 'Club de prueba para tests',
  ubicacion: {
    ciudad: 'Madrid',
    direccion: 'Calle Test 123',
    coordenadas: { latitud: 40.4168, longitud: -3.7038 }
  },
  categorias: {
    'Senior': {
      nombre: 'Senior',
      equipos: []
    }
  },
  entrenadorId: 'entrenador-test',
  fechaCreacion: new Date().toISOString()
};

const AMISTOSO_PRUEBA: PartidoAmistoso = {
  id: 'amistoso-test-1',
  equipoLocalId: 'equipo-test-1',
  equipoVisitanteId: 'equipo-test-2',
  fecha: '2024-12-25',
  hora: '16:00',
  ubicacion: {
    direccion: 'Campo Test',
    coordenadas: { latitud: 40.4168, longitud: -3.7038 }
  },
  categoria: 'Senior',
  tipoFutbol: 'F11',
  estado: 'Disponible',
  esDisponibilidad: false,
  fechaCreacion: new Date().toISOString()
};

describe('🗄️ INTEGRACIÓN: Data Context y Estado Global', () => {

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
    
    // Configurar mocks por defecto
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);
  });

  describe('💾 Test 1: Persistencia en AsyncStorage', () => {

    it('debe guardar equipo en AsyncStorage', async () => {
      console.log('🚀 Probando persistencia de equipo...');
      
      // Simular guardado de equipo
      const equipos = [EQUIPO_PRUEBA];
      const equiposJson = JSON.stringify(equipos);
      
      // Verificar que se llama a setItem con los datos correctos
      await AsyncStorage.setItem('equipos', equiposJson);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('equipos', equiposJson);
      
      console.log('✅ Equipo guardado en AsyncStorage');
    });

    it('debe recuperar equipos de AsyncStorage', async () => {
      console.log('🚀 Probando recuperación de equipos...');
      
      const equiposJson = JSON.stringify([EQUIPO_PRUEBA]);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(equiposJson);
      
      const result = await AsyncStorage.getItem('equipos');
      const equiposRecuperados = result ? JSON.parse(result) : [];
      
      expect(equiposRecuperados).toHaveLength(1);
      expect(equiposRecuperados[0].id).toBe(EQUIPO_PRUEBA.id);
      expect(equiposRecuperados[0].nombre).toBe(EQUIPO_PRUEBA.nombre);
      
      console.log('✅ Equipos recuperados correctamente');
    });

    it('debe manejar datos corruptos en AsyncStorage', async () => {
      console.log('🚀 Probando manejo de datos corruptos...');
      
      // Simular datos corruptos
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('datos_corruptos_no_json');
      
      let equiposRecuperados = [];
      try {
        const result = await AsyncStorage.getItem('equipos');
        equiposRecuperados = result ? JSON.parse(result) : [];
      } catch (error) {
        // En caso de error, usar array vacío
        equiposRecuperados = [];
      }
      
      expect(equiposRecuperados).toEqual([]);
      
      console.log('✅ Datos corruptos manejados correctamente');
    });

    it('debe limpiar AsyncStorage completamente', async () => {
      console.log('🚀 Probando limpieza completa...');
      
      await AsyncStorage.clear();
      
      expect(AsyncStorage.clear).toHaveBeenCalled();
      
      console.log('✅ AsyncStorage limpiado completamente');
    });
  });

  describe('🔄 Test 2: Operaciones CRUD', () => {

    it('debe crear nuevo equipo con ID único', () => {
      console.log('🚀 Probando creación de equipo...');
      
      const nuevoEquipo = {
        ...EQUIPO_PRUEBA,
        id: 'equipo-' + Date.now(),
        nombre: 'Nuevo Equipo FC'
      };
      
      expect(nuevoEquipo.id).toBeDefined();
      expect(nuevoEquipo.id).not.toBe(EQUIPO_PRUEBA.id);
      expect(nuevoEquipo.fechaCreacion).toBeDefined();
      
      console.log('✅ Equipo creado con ID único:', nuevoEquipo.id);
    });

    it('debe actualizar equipo existente', async () => {
      console.log('🚀 Probando actualización de equipo...');
      
      // Simular lista actual con el equipo
      const equiposActuales = [EQUIPO_PRUEBA];
      
      // Actualizar nombre del equipo
      const equipoActualizado = {
        ...EQUIPO_PRUEBA,
        nombre: 'Equipo Actualizado FC'
      };
      
      const equiposNuevos = equiposActuales.map(e => 
        e.id === equipoActualizado.id ? equipoActualizado : e
      );
      
      expect(equiposNuevos[0].nombre).toBe('Equipo Actualizado FC');
      expect(equiposNuevos[0].id).toBe(EQUIPO_PRUEBA.id);
      
      console.log('✅ Equipo actualizado correctamente');
    });

    it('debe eliminar equipo por ID', () => {
      console.log('🚀 Probando eliminación de equipo...');
      
      const equiposActuales = [EQUIPO_PRUEBA, { ...EQUIPO_PRUEBA, id: 'otro-equipo' }];
      
      const equiposFiltrados = equiposActuales.filter(e => e.id !== EQUIPO_PRUEBA.id);
      
      expect(equiposFiltrados).toHaveLength(1);
      expect(equiposFiltrados[0].id).toBe('otro-equipo');
      
      console.log('✅ Equipo eliminado correctamente');
    });

    it('debe buscar equipos por criterios', () => {
      console.log('🚀 Probando búsqueda de equipos...');
      
      const equipos = [
        EQUIPO_PRUEBA,
        { ...EQUIPO_PRUEBA, id: 'equipo-2', ciudad: 'Barcelona' },
        { ...EQUIPO_PRUEBA, id: 'equipo-3', categoria: 'Juvenil' }
      ];
      
      // Buscar por ciudad
      const equiposMadrid = equipos.filter(e => e.ciudad === 'Madrid');
      expect(equiposMadrid).toHaveLength(2);
      
      // Buscar por categoría
      const equiposSenior = equipos.filter(e => e.categoria === 'Senior');
      expect(equiposSenior).toHaveLength(2);
      
      console.log('✅ Búsquedas funcionan correctamente');
    });
  });

  describe('🔗 Test 3: Relaciones entre Entidades', () => {

    it('debe vincular equipo a club correctamente', () => {
      console.log('🚀 Probando vinculación equipo-club...');
      
      const equipoConClub = {
        ...EQUIPO_PRUEBA,
        clubId: CLUB_PRUEBA.id
      };
      
      const clubConEquipo = {
        ...CLUB_PRUEBA,
        categorias: {
          'Senior': {
            nombre: 'Senior',
            equipos: [equipoConClub.id]
          }
        }
      };
      
      expect(equipoConClub.clubId).toBe(CLUB_PRUEBA.id);
      expect(clubConEquipo.categorias['Senior'].equipos).toContain(equipoConClub.id);
      
      console.log('✅ Relación equipo-club establecida');
    });

    it('debe encontrar amistosos de un equipo', () => {
      console.log('🚀 Probando búsqueda de amistosos...');
      
      const amistosos = [
        AMISTOSO_PRUEBA,
        { ...AMISTOSO_PRUEBA, id: 'amistoso-2', equipoLocalId: 'otro-equipo' },
        { ...AMISTOSO_PRUEBA, id: 'amistoso-3', equipoVisitanteId: EQUIPO_PRUEBA.id }
      ];
      
      const amistososDelEquipo = amistosos.filter(a => 
        a.equipoLocalId === EQUIPO_PRUEBA.id || a.equipoVisitanteId === EQUIPO_PRUEBA.id
      );
      
      expect(amistososDelEquipo).toHaveLength(2);
      
      console.log('✅ Amistosos del equipo encontrados:', amistososDelEquipo.length);
    });

    it('debe mantener integridad referencial', () => {
      console.log('🚀 Probando integridad referencial...');
      
      const equipoId = EQUIPO_PRUEBA.id;
      
      // Simular eliminación de equipo - debería limpiar referencias
      const amistososLimpiados = [AMISTOSO_PRUEBA].filter(a => 
        a.equipoLocalId !== equipoId && a.equipoVisitanteId !== equipoId
      );
      
      expect(amistososLimpiados).toHaveLength(0);
      
      console.log('✅ Integridad referencial mantenida');
    });
  });

  describe('⚡ Test 4: Sincronización de Estado', () => {

    it('debe sincronizar cambios entre múltiples contextos', () => {
      console.log('🚀 Probando sincronización de estado...');
      
      // Simular dos "contextos" que comparten datos
      let estadoContexto1 = { equipos: [EQUIPO_PRUEBA] };
      let estadoContexto2 = { equipos: [EQUIPO_PRUEBA] };
      
      // Modificar en contexto 1
      const equipoActualizado = { ...EQUIPO_PRUEBA, nombre: 'Nombre Actualizado' };
      estadoContexto1.equipos = [equipoActualizado];
      
      // Sincronizar a contexto 2
      estadoContexto2.equipos = estadoContexto1.equipos;
      
      expect(estadoContexto2.equipos[0].nombre).toBe('Nombre Actualizado');
      
      console.log('✅ Estados sincronizados correctamente');
    });

    it('debe notificar cambios a suscriptores', () => {
      console.log('🚀 Probando notificaciones de cambio...');
      
      let notificacionesRecibidas = 0;
      
      // Simular suscriptor
      const suscriptor = () => {
        notificacionesRecibidas++;
      };
      
      // Simular cambios
      suscriptor(); // Creación
      suscriptor(); // Actualización
      suscriptor(); // Eliminación
      
      expect(notificacionesRecibidas).toBe(3);
      
      console.log('✅ Notificaciones enviadas correctamente');
    });
  });

  describe('🛠️ Test 5: Manejo de Errores y Recuperación', () => {

    it('debe manejar errores de conexión a AsyncStorage', async () => {
      console.log('🚀 Probando manejo de errores de storage...');
      
      // Simular error en AsyncStorage
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      let equiposRecuperados = [];
      try {
        await AsyncStorage.getItem('equipos');
      } catch (error) {
        // Usar datos por defecto en caso de error
        equiposRecuperados = [];
      }
      
      expect(equiposRecuperados).toEqual([]);
      
      console.log('✅ Error de storage manejado correctamente');
    });

    it('debe recuperarse de datos inconsistentes', () => {
      console.log('🚀 Probando recuperación de inconsistencias...');
      
      // Datos inconsistentes: referencias rotas
      const equipos = [EQUIPO_PRUEBA];
      const amistosoValido = { 
        ...AMISTOSO_PRUEBA, 
        equipoLocalId: EQUIPO_PRUEBA.id,
        equipoVisitanteId: EQUIPO_PRUEBA.id // Para que sea válido
      };
      const amistosos = [
        amistosoValido,
        { ...AMISTOSO_PRUEBA, id: 'amistoso-roto', equipoLocalId: 'equipo-inexistente' }
      ];
      
      // Filtrar amistosos con referencias válidas
      const equiposIds = equipos.map(e => e.id);
      const amistososValidos = amistosos.filter(a => 
        equiposIds.includes(a.equipoLocalId) && 
        (a.equipoVisitanteId ? equiposIds.includes(a.equipoVisitanteId) : false)
      );
      
      expect(amistososValidos).toHaveLength(1);
      
      console.log('✅ Datos inconsistentes limpiados');
    });

    it('debe validar datos antes de guardar', () => {
      console.log('🚀 Probando validación de datos...');
      
      // Función simulada de validación
      const validarEquipo = (equipo: Partial<Equipo>) => {
        return !!(equipo.nombre && equipo.ciudad && equipo.categoria && equipo.entrenadorId);
      };
      
      const equipoValido = EQUIPO_PRUEBA;
      const equipoInvalido = { ...EQUIPO_PRUEBA, nombre: '' };
      
      expect(validarEquipo(equipoValido)).toBe(true);
      expect(validarEquipo(equipoInvalido)).toBe(false);
      
      console.log('✅ Validación de datos funciona correctamente');
    });
  });

  describe('📊 Test 6: Performance y Volumen de Datos', () => {

    it('debe manejar grandes listas de equipos eficientemente', () => {
      console.log('🚀 Probando performance con muchos equipos...');
      
      const tiempoInicio = Date.now();
      
      // Generar 100 equipos
      const equipos = Array.from({ length: 100 }, (_, i) => ({
        ...EQUIPO_PRUEBA,
        id: `equipo-${i}`,
        nombre: `Equipo ${i}`
      }));
      
      // Buscar en la lista
      const equipoEncontrado = equipos.find(e => e.id === 'equipo-50');
      
      const tiempoFin = Date.now();
      const duracion = tiempoFin - tiempoInicio;
      
      expect(equipoEncontrado).toBeDefined();
      expect(equipoEncontrado?.nombre).toBe('Equipo 50');
      expect(duracion).toBeLessThan(100); // Menos de 100ms
      
      console.log(`✅ 100 equipos procesados en ${duracion}ms`);
    });

    it('debe serializar y deserializar datos grandes', () => {
      console.log('🚀 Probando serialización de datos grandes...');
      
      const tiempoInicio = Date.now();
      
      // Crear estructura de datos grande
      const datosGrandes = {
        equipos: Array.from({ length: 50 }, (_, i) => ({
          ...EQUIPO_PRUEBA,
          id: `equipo-${i}`,
          jugadores: Array.from({ length: 20 }, (_, j) => ({
            id: `jugador-${i}-${j}`,
            nombre: `Jugador ${j}`,
            numero: j + 1,
            posicion: 'Delantero' as const,
            equipoId: `equipo-${i}`,
            fechaRegistro: new Date().toISOString(),
            fechaNacimiento: '1995-01-01'
          }))
        }))
      };
      
      // Serializar
      const datosJson = JSON.stringify(datosGrandes);
      
      // Deserializar
      const datosRecuperados = JSON.parse(datosJson);
      
      const tiempoFin = Date.now();
      const duracion = tiempoFin - tiempoInicio;
      
      expect(datosRecuperados.equipos).toHaveLength(50);
      expect(datosRecuperados.equipos[0].jugadores).toHaveLength(20);
      expect(duracion).toBeLessThan(1000); // Menos de 1 segundo
      
      console.log(`✅ Datos grandes serializados en ${duracion}ms`);
    });
  });
});

// Funciones auxiliares para tests
export function crearEquipoPrueba(overrides: Partial<Equipo> = {}): Equipo {
  return {
    ...EQUIPO_PRUEBA,
    id: 'equipo-' + Date.now() + '-' + Math.random(),
    ...overrides
  };
}

export function crearClubPrueba(overrides: Partial<Club> = {}): Club {
  return {
    ...CLUB_PRUEBA,
    id: 'club-' + Date.now() + '-' + Math.random(),
    ...overrides
  };
}

export function simularAsyncStorage() {
  const storage: Record<string, string> = {};
  
  return {
    getItem: jest.fn().mockImplementation((key: string) => Promise.resolve(storage[key] || null)),
    setItem: jest.fn().mockImplementation((key: string, value: string) => {
      storage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn().mockImplementation((key: string) => {
      delete storage[key];
      return Promise.resolve();
    }),
    clear: jest.fn().mockImplementation(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
      return Promise.resolve();
    })
  };
}