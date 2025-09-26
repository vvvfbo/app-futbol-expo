import { inicializarTorneo, generarCalendario, calcularTablaPosiciones, FormatoTorneo } from '../../utils/torneoMotor';
import { Equipo, TipoTorneo } from '../../types';

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
  }
];

describe('✅ Tests Básicos Motor Torneo', () => {
  
  it('inicializa torneo correctamente', () => {
    const torneo = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
    
    expect(torneo).toBeDefined();
    expect(torneo.id).toBeDefined();
    expect(torneo.equiposIds).toEqual(['equipo1', 'equipo2']);
    
    console.log('✅ Torneo iniciado:', torneo.nombre);
  });

  it('genera calendario', () => {
    const torneo = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
    const partidos = generarCalendario(torneo, EQUIPOS_TEST);
    
    expect(partidos).toBeDefined();
    expect(Array.isArray(partidos)).toBe(true);
    
    console.log('✅ Partidos:', partidos.length);
  });

  it('calcula tabla', () => {
    const torneo = inicializarTorneo('liga' as FormatoTorneo, EQUIPOS_TEST);
    const tabla = calcularTablaPosiciones(torneo, EQUIPOS_TEST, []);
    
    expect(tabla).toBeDefined();
    expect(tabla.length).toBe(2);
    
    console.log('✅ Tabla calculada');
  });

});