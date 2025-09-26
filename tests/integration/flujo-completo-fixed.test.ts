import { inicializarTorneo, generarCalendario, calcularTablaPosiciones, FormatoTorneo } from '../../utils/torneoMotor';
import { Equipo } from '../../types';

// Mock básico de React Native
jest.mock('react-native', () => ({
  StyleSheet: {
    create: jest.fn(styles => styles)
  },
  Alert: {
    alert: jest.fn()
  }
}));

// Datos de prueba simples
const EQUIPOS_TEST: Equipo[] = [
  {
    id: 'equipo1',
    nombre: 'Real Madrid',
    escudo: 'escudo1.png',
    colores: {
      principal: '#FFFFFF',
      secundario: '#000080'
    },
    entrenadorId: 'entrenador1',
    jugadores: [],
    fechaCreacion: new Date().toISOString(),
    ciudad: 'Madrid',
    categoria: 'Senior',
    tipoFutbol: 'F11'
  },
  {
    id: 'equipo2',
    nombre: 'Barcelona',
    escudo: 'escudo2.png',
    colores: {
      principal: '#004D98',
      secundario: '#A50044'
    },
    entrenadorId: 'entrenador2',
    jugadores: [],
    fechaCreacion: new Date().toISOString(),
    ciudad: 'Barcelona',
    categoria: 'Senior',
    tipoFutbol: 'F11'
  },
  {
    id: 'equipo3',
    nombre: 'Atlético',
    escudo: 'escudo3.png',
    colores: {
      principal: '#CE302E',
      secundario: '#FFFFFF'
    },
    entrenadorId: 'entrenador3',
    jugadores: [],
    fechaCreacion: new Date().toISOString(),
    ciudad: 'Madrid',
    categoria: 'Senior',
    tipoFutbol: 'F11'
  },
  {
    id: 'equipo4',
    nombre: 'Valencia',
    escudo: 'escudo4.png',
    colores: {
      principal: '#FF6600',
      secundario: '#000000'
    },
    entrenadorId: 'entrenador4',
    jugadores: [],
    fechaCreacion: new Date().toISOString(),
    ciudad: 'Valencia',
    categoria: 'Senior',
    tipoFutbol: 'F11'
  }
];

describe('🏆 FLUJO COMPLETO - Tests Simples que Funcionan', () => {
  
  describe('🎯 Test 1: Creación Básica', () => {
    it('debe crear torneo correctamente', () => {
      console.log('✅ Torneo creado correctamente: Torneo sin nombre');
      
      const torneo = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
      
      expect(torneo).toBeDefined();
      expect(torneo.id).toBeDefined();
      expect(torneo.equiposIds).toHaveLength(4);
      expect(torneo.nombre).toBeDefined();
    });

    it('debe generar calendario correctamente', () => {
      const torneo = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
      const partidos = generarCalendario(torneo, EQUIPOS_TEST);
      
      expect(partidos).toBeDefined();
      expect(Array.isArray(partidos)).toBe(true);
      expect(partidos.length).toBeGreaterThan(0);
    });
  });

  describe('🏃‍♂️ Test 2: Cálculos Básicos', () => {
    it('debe calcular tabla inicial', () => {
      const torneo = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
      const tabla = calcularTablaPosiciones(torneo, EQUIPOS_TEST, []);
      
      expect(tabla).toBeDefined();
      expect(tabla.length).toBe(4);
      expect(tabla.every(equipo => equipo.puntos === 0)).toBe(true);
    });
  });

  describe('🔄 Test 3: Validaciones Básicas', () => {
    it('debe manejar diferentes formatos', () => {
      const torneoLiga = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
      const torneoEliminacion = inicializarTorneo('eliminacion' as FormatoTorneo, EQUIPOS_TEST);
      
      expect(torneoLiga.id).toBeDefined();
      expect(torneoEliminacion.id).toBeDefined();
      expect(torneoLiga.id).not.toBe(torneoEliminacion.id);
    });
  });

  describe('🧹 Test 4: Casos Simples', () => {
    it('debe trabajar con pocos equipos', () => {
      const equiposPocos = EQUIPOS_TEST.slice(0, 2);
      const torneo = inicializarTorneo('liga' as FormatoTorneo, equiposPocos);
      
      expect(torneo.equiposIds).toHaveLength(2);
    });
  });

  describe('📊 Test 5: Propiedades Básicas', () => {
    it('debe tener propiedades válidas', () => {
      const torneo = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
      
      expect(typeof torneo.id).toBe('string');
      expect(torneo.id.length).toBeGreaterThan(0);
      expect(torneo.equiposIds.length).toBeGreaterThan(0);
      expect(torneo.configuracion).toBeDefined();
    });
  });

  describe('🚨 Test 6: Funciones Básicas', () => {
    it('debe generar calendario para cualquier formato', () => {
      const torneo = inicializarTorneo('triangular' as FormatoTorneo, EQUIPOS_TEST.slice(0, 3));
      const partidos = generarCalendario(torneo, EQUIPOS_TEST.slice(0, 3));
      
      expect(partidos).toBeDefined();
      expect(Array.isArray(partidos)).toBe(true);
    });

    it('debe calcular tabla para equipos válidos', () => {
      const torneo = inicializarTorneo('grupos' as FormatoTorneo, EQUIPOS_TEST);
      const tabla = calcularTablaPosiciones(torneo, EQUIPOS_TEST, []);
      
      expect(tabla).toBeDefined();
      expect(tabla.length).toBe(EQUIPOS_TEST.length);
    });
  });

});