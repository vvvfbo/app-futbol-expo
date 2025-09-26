/**
 * 🏆 TEST DE INTEGRACIÓN BÁSICO: Creación de Torneos
 * 
 * Test simplificado que valida las funciones principales del sistema:
 * 1. Crear equipos de prueba  
 * 2. Inicializar torneos con diferentes formatos
 * 3. Verificar que los datos se crean correctamente
 * 4. Probar casos básicos de funcionamiento
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { inicializarTorneo, FormatoTorneo } from '../../utils/torneoMotor';
import { Equipo } from '../../types';

// Equipos de prueba mínimos
const EQUIPOS_PRUEBA: Equipo[] = [
  {
    id: 'equipo-1',
    nombre: 'Real Madrid FC',
    ciudad: 'Madrid',
    categoria: 'Senior',
    tipoFutbol: 'F11',
    entrenadorId: 'entrenador-1',
    colores: { principal: '#FFFFFF', secundario: '#000080' },
    jugadores: [],
    fechaCreacion: new Date().toISOString()
  },
  {
    id: 'equipo-2', 
    nombre: 'FC Barcelona',
    ciudad: 'Barcelona',
    categoria: 'Senior',
    tipoFutbol: 'F11',
    entrenadorId: 'entrenador-2',
    colores: { principal: '#004D98', secundario: '#A50044' },
    jugadores: [],
    fechaCreacion: new Date().toISOString()
  },
  {
    id: 'equipo-3',
    nombre: 'Atlético Madrid', 
    ciudad: 'Madrid',
    categoria: 'Senior',
    tipoFutbol: 'F11',
    entrenadorId: 'entrenador-3',
    colores: { principal: '#CE2029', secundario: '#FFFFFF' },
    jugadores: [],
    fechaCreacion: new Date().toISOString()
  },
  {
    id: 'equipo-4',
    nombre: 'Valencia CF',
    ciudad: 'Valencia',
    categoria: 'Senior',
    tipoFutbol: 'F11',
    entrenadorId: 'entrenador-4', 
    colores: { principal: '#FF6600', secundario: '#000000' },
    jugadores: [],
    fechaCreacion: new Date().toISOString()
  }
];

describe('🏆 INTEGRACIÓN BÁSICA: Creación de Torneos', () => {

  beforeEach(() => {
    // Limpiar cualquier estado antes de cada test
    jest.clearAllMocks();
  });

  describe('🎯 Test 1: Inicialización de Torneos por Formato', () => {

    it('debe crear torneo de eliminación correctamente', () => {
      console.log('🚀 Creando torneo de eliminación...');
      
      const resultado = inicializarTorneo(
        'eliminacion' as FormatoTorneo,
        EQUIPOS_PRUEBA,
        { byes_permitidos: true }
      );

      // Verificaciones básicas
      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(resultado.equiposIds).toEqual(expect.arrayContaining(EQUIPOS_PRUEBA.map(e => e.id)));
      expect(resultado.partidosIniciales).toBeDefined();
      expect(Array.isArray(resultado.partidosIniciales)).toBe(true);

      console.log('✅ Torneo eliminación creado con', resultado.partidosIniciales.length, 'partidos');
    });

    it('debe crear torneo triangular con 3 equipos', () => {
      console.log('🚀 Creando torneo triangular...');
      
      const equiposTriangular = EQUIPOS_PRUEBA.slice(0, 3);
      
      const resultado = inicializarTorneo(
        'triangular' as FormatoTorneo,
        equiposTriangular
      );

      expect(resultado).toBeDefined();
      expect(resultado.equiposIds).toHaveLength(3);
      expect(resultado.partidosIniciales).toBeDefined();

      console.log('✅ Torneo triangular creado con', resultado.partidosIniciales.length, 'partidos');
    });

    it('debe crear torneo de liga correctamente', () => {
      console.log('🚀 Creando torneo de liga...');
      
      const resultado = inicializarTorneo(
        'liga' as FormatoTorneo,
        EQUIPOS_PRUEBA,
        { permitirEmpates: true }
      );

      expect(resultado).toBeDefined();
      expect(resultado.configuracion).toBeDefined();
      expect(resultado.configuracion.permitirEmpates).toBe(true);

      console.log('✅ Torneo de liga creado');
    });

    it('debe crear torneo por grupos', () => {
      console.log('🚀 Creando torneo por grupos...');
      
      const resultado = inicializarTorneo(
        'grupos' as FormatoTorneo,
        EQUIPOS_PRUEBA,
        { 
          clasifican_por_grupo: 2,
          mejores_terceros: false
        }
      );

      expect(resultado).toBeDefined();
      expect(resultado.equiposIds).toHaveLength(4);

      console.log('✅ Torneo por grupos creado');
    });
  });

  describe('🔧 Test 2: Configuraciones Avanzadas', () => {

    it('debe manejar configuración personalizada correctamente', () => {
      console.log('🚀 Probando configuración personalizada...');
      
      const resultado = inicializarTorneo(
        'eliminacion' as FormatoTorneo,
        EQUIPOS_PRUEBA,
        {
          byes_permitidos: true,
          partido_tercer_puesto: true,
          playoff_final: false
        }
      );

      expect(resultado).toBeDefined();
      expect(resultado.configuracion).toBeDefined();

      console.log('✅ Configuración personalizada aplicada');
    });

    it('debe usar configuración por defecto cuando no se especifica', () => {
      console.log('🚀 Probando configuración por defecto...');
      
      const resultado = inicializarTorneo(
        'liga' as FormatoTorneo,
        EQUIPOS_PRUEBA
        // Sin configuración personalizada
      );

      expect(resultado).toBeDefined();
      expect(resultado.configuracion.puntosVictoria).toBe(3);
      expect(resultado.configuracion.puntosEmpate).toBe(1);
      expect(resultado.configuracion.puntosDerrota).toBe(0);

      console.log('✅ Configuración por defecto aplicada correctamente');
    });
  });

  describe('⚠️ Test 3: Casos Extremos y Validaciones', () => {

    it('debe manejar lista vacía de equipos', () => {
      console.log('🚀 Probando con lista vacía...');
      
      expect(() => {
        inicializarTorneo('eliminacion' as FormatoTorneo, []);
      }).not.toThrow();

      console.log('✅ Lista vacía manejada correctamente');
    });

    it('debe manejar un solo equipo', () => {
      console.log('🚀 Probando con un solo equipo...');
      
      const unSoloEquipo = [EQUIPOS_PRUEBA[0]];
      
      expect(() => {
        inicializarTorneo('liga' as FormatoTorneo, unSoloEquipo);
      }).not.toThrow();

      console.log('✅ Un solo equipo manejado correctamente');
    });

    it('debe generar IDs únicos para diferentes torneos', () => {
      console.log('🚀 Probando IDs únicos...');
      
      const torneo1 = inicializarTorneo('eliminacion' as FormatoTorneo, EQUIPOS_PRUEBA);
      const torneo2 = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_PRUEBA);
      
      expect(torneo1.id).not.toBe(torneo2.id);

      console.log('✅ IDs únicos generados correctamente');
      console.log('   Torneo 1:', torneo1.id.substring(0, 8) + '...');
      console.log('   Torneo 2:', torneo2.id.substring(0, 8) + '...');
    });
  });

  describe('📊 Test 4: Verificación de Datos', () => {

    it('debe incluir todos los equipos en el torneo', () => {
      console.log('🚀 Verificando inclusión de equipos...');
      
      const resultado = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_PRUEBA);
      
      EQUIPOS_PRUEBA.forEach(equipo => {
        expect(resultado.equiposIds).toContain(equipo.id);
      });

      console.log('✅ Todos los equipos incluidos correctamente');
    });

    it('debe generar partidos con equipos válidos', () => {
      console.log('🚀 Verificando validez de partidos...');
      
      const resultado = inicializarTorneo('eliminacion' as FormatoTorneo, EQUIPOS_PRUEBA);
      
      resultado.partidosIniciales.forEach(partido => {
        expect(resultado.equiposIds).toContain(partido.equipoLocalId);
        expect(resultado.equiposIds).toContain(partido.equipoVisitanteId);
        expect(partido.equipoLocalId).not.toBe(partido.equipoVisitanteId);
      });

      console.log('✅ Partidos generados con equipos válidos');
    });

    it('debe mantener metadatos del torneo consistentes', () => {
      console.log('🚀 Verificando metadatos...');
      
      const resultado = inicializarTorneo(
        'grupos' as FormatoTorneo,
        EQUIPOS_PRUEBA
      );
      
      expect(resultado.fechaCreacion).toBeDefined();
      expect(resultado.configuracion).toBeDefined();
      expect(typeof resultado.id).toBe('string');
      expect(resultado.id.length).toBeGreaterThan(0);

      console.log('✅ Metadatos consistentes');
    });
  });

  describe('🚀 Test 5: Performance Básico', () => {

    it('debe crear torneos rápidamente', () => {
      console.log('🚀 Probando performance de creación...');
      
      const tiempoInicio = Date.now();
      
      // Crear 5 torneos
      for (let i = 0; i < 5; i++) {
        inicializarTorneo('triangular' as FormatoTorneo, EQUIPOS_PRUEBA.slice(0, 3));
      }
      
      const tiempoFin = Date.now();
      const duracion = tiempoFin - tiempoInicio;
      
      expect(duracion).toBeLessThan(500); // Menos de medio segundo

      console.log(`✅ 5 torneos creados en ${duracion}ms`);
    });

    it('debe manejar equipos con nombres largos', () => {
      console.log('🚀 Probando con nombres largos...');
      
      const equiposNombresLargos: Equipo[] = EQUIPOS_PRUEBA.map((equipo, i) => ({
        ...equipo,
        id: `equipo-largo-${i}`,
        nombre: `Este es un nombre muy muy muy largo para el equipo número ${i} que podría causar problemas de performance o memoria`
      }));
      
      const resultado = inicializarTorneo('liga' as FormatoTorneo, equiposNombresLargos);
      
      expect(resultado).toBeDefined();
      expect(resultado.equiposIds).toHaveLength(4);

      console.log('✅ Nombres largos manejados correctamente');
    });
  });
});

// Función auxiliar para debug
export function debugTorneo(torneo: any) {
  console.log('\n🔍 DEBUG TORNEO:');
  console.log(`   ID: ${torneo.id}`);
  console.log(`   Equipos: ${torneo.equiposIds?.length || 0}`);
  console.log(`   Partidos: ${torneo.partidosIniciales?.length || 0}`);
  console.log(`   Configuración: ${JSON.stringify(torneo.configuracion, null, 2)}`);
  console.log('');
}