/**
 * 🎮 TEST FUNCIONAL: Simulador de Interacciones de Usuario
 * 
 * Este test simula las interacciones más comunes que un usuario haría:
 * 1. Crear equipos y clubes
 * 2. Crear torneos y amistosos  
 * 3. Registrar resultados
 * 4. Navegar entre pantallas
 * 5. Verificar que todo funciona en conjunto
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Equipo, Club, Torneo, PartidoAmistoso } from '../../types';

// Simulador de estado de la app
class AppStateSimulator {
  private equipos: Equipo[] = [];
  private clubes: Club[] = [];
  private torneos: Torneo[] = [];
  private amistosos: PartidoAmistoso[] = [];
  private usuarioActual = {
    id: 'user-test',
    nombre: 'Usuario Test',
    email: 'test@test.com',
    rol: 'entrenador' as const,
    ciudad: 'Madrid'
  };

  // Simular creación de equipo
  crearEquipo(nombre: string, ciudad: string, categoria: string = 'Senior') {
    const nuevoEquipo: Equipo = {
      id: `equipo-${Date.now()}-${Math.random()}`,
      nombre,
      ciudad,
      categoria: categoria as any,
      tipoFutbol: 'F11',
      entrenadorId: this.usuarioActual.id,
      colores: { principal: '#FF0000', secundario: '#0000FF' },
      jugadores: [],
      fechaCreacion: new Date().toISOString()
    };

    this.equipos.push(nuevoEquipo);
    return nuevoEquipo;
  }

  // Simular creación de club
  crearClub(nombre: string, descripcion: string = '') {
    const nuevoClub: Club = {
      id: `club-${Date.now()}-${Math.random()}`,
      nombre,
      descripcion,
      ubicacion: {
        ciudad: this.usuarioActual.ciudad,
        direccion: 'Dirección del club',
        coordenadas: { latitud: 40.4168, longitud: -3.7038 }
      },
      categorias: {},
      entrenadorId: this.usuarioActual.id,
      fechaCreacion: new Date().toISOString()
    };

    this.clubes.push(nuevoClub);
    return nuevoClub;
  }

  // Simular agregar equipo a club
  agregarEquipoAClub(equipoId: string, clubId: string, categoria: string) {
    const equipo = this.equipos.find(e => e.id === equipoId);
    const club = this.clubes.find(c => c.id === clubId);

    if (!equipo || !club) return false;

    // Actualizar equipo
    equipo.clubId = clubId;

    // Actualizar club
    if (!club.categorias[categoria]) {
      club.categorias[categoria] = {
        nombre: categoria as any,
        equipos: []
      };
    }
    club.categorias[categoria].equipos.push(equipoId);

    return true;
  }

  // Simular creación de amistoso
  crearAmistoso(equipoLocalId: string, equipoVisitanteId: string, fecha: string) {
    const nuevoAmistoso: PartidoAmistoso = {
      id: `amistoso-${Date.now()}-${Math.random()}`,
      equipoLocalId,
      equipoVisitanteId,
      fecha,
      hora: '16:00',
      ubicacion: {
        direccion: 'Campo de fútbol',
        coordenadas: { latitud: 40.4168, longitud: -3.7038 }
      },
      categoria: 'Senior',
      tipoFutbol: 'F11',
      estado: 'Confirmado',
      esDisponibilidad: false,
      fechaCreacion: new Date().toISOString()
    };

    this.amistosos.push(nuevoAmistoso);
    return nuevoAmistoso;
  }

  // Simular registro de resultado
  registrarResultado(amistosoId: string, golesLocal: number, golesVisitante: number) {
    const amistoso = this.amistosos.find(a => a.id === amistosoId);
    if (!amistoso) return false;

    amistoso.golesLocal = golesLocal;
    amistoso.golesVisitante = golesVisitante;
    amistoso.estado = 'Finalizado';

    return true;
  }

  // Obtener equipos del usuario
  obtenerMisEquipos() {
    return this.equipos.filter(e => e.entrenadorId === this.usuarioActual.id);
  }

  // Obtener amistosos de un equipo
  obtenerAmistososDeEquipo(equipoId: string) {
    return this.amistosos.filter(a => 
      a.equipoLocalId === equipoId || a.equipoVisitanteId === equipoId
    );
  }

  // Obtener estadísticas básicas
  obtenerEstadisticas() {
    return {
      totalEquipos: this.equipos.length,
      totalClubes: this.clubes.length,
      totalAmistosos: this.amistosos.length,
      amistososFinalizados: this.amistosos.filter(a => a.estado === 'Finalizado').length
    };
  }

  // Limpiar estado
  limpiar() {
    this.equipos = [];
    this.clubes = [];
    this.torneos = [];
    this.amistosos = [];
  }
}

describe('🎮 FUNCIONAL: Simulador de Interacciones de Usuario', () => {
  let app: AppStateSimulator;

  beforeEach(() => {
    app = new AppStateSimulator();
  });

  describe('⚽ Flujo 1: Gestión de Equipos', () => {

    it('debe permitir crear varios equipos', () => {
      console.log('🚀 Usuario crea sus primeros equipos...');

      const equipo1 = app.crearEquipo('Real Madrid CF', 'Madrid');
      const equipo2 = app.crearEquipo('FC Barcelona', 'Barcelona');
      const equipo3 = app.crearEquipo('Atlético Madrid', 'Madrid');

      const misEquipos = app.obtenerMisEquipos();
      
      expect(misEquipos).toHaveLength(3);
      expect(misEquipos.map(e => e.nombre)).toContain('Real Madrid CF');
      expect(misEquipos.map(e => e.nombre)).toContain('FC Barcelona');

      console.log('✅ Equipos creados:', misEquipos.map(e => e.nombre).join(', '));
    });

    it('debe mantener equipos separados por entrenador', () => {
      console.log('🚀 Verificando separación por entrenador...');

      // Simular otro usuario
      const otroEquipo: Equipo = {
        id: 'equipo-otro',
        nombre: 'Equipo Otro Entrenador',
        ciudad: 'Valencia',
        categoria: 'Senior',
        tipoFutbol: 'F11',
        entrenadorId: 'otro-entrenador',
        colores: { principal: '#FF0000', secundario: '#0000FF' },
        jugadores: [],
        fechaCreacion: new Date().toISOString()
      };
      
      app['equipos'].push(otroEquipo);
      app.crearEquipo('Mi Equipo', 'Madrid');

      const misEquipos = app.obtenerMisEquipos();
      
      expect(misEquipos).toHaveLength(1);
      expect(misEquipos[0].nombre).toBe('Mi Equipo');

      console.log('✅ Equipos correctamente separados por entrenador');
    });
  });

  describe('🏛️ Flujo 2: Gestión de Clubes', () => {

    it('debe permitir crear club y agregar equipos', () => {
      console.log('🚀 Usuario crea club y agrega equipos...');

      // Crear equipo primero
      const equipo = app.crearEquipo('Juvenil A', 'Madrid', 'Juvenil');
      
      // Crear club
      const club = app.crearClub('CD Atlético Madrid', 'Club deportivo histórico');
      
      // Agregar equipo al club
      const agregado = app.agregarEquipoAClub(equipo.id, club.id, 'Juvenil');

      expect(agregado).toBe(true);
      expect(equipo.clubId).toBe(club.id);
      expect(club.categorias['Juvenil']).toBeDefined();
      expect(club.categorias['Juvenil'].equipos).toContain(equipo.id);

      console.log('✅ Equipo agregado al club correctamente');
    });

    it('debe manejar múltiples categorías en un club', () => {
      console.log('🚀 Creando club con múltiples categorías...');

      const club = app.crearClub('Club Completo FC');
      const equipoSenior = app.crearEquipo('Senior A', 'Madrid', 'Senior');
      const equipoJuvenil = app.crearEquipo('Juvenil A', 'Madrid', 'Juvenil');

      app.agregarEquipoAClub(equipoSenior.id, club.id, 'Senior');
      app.agregarEquipoAClub(equipoJuvenil.id, club.id, 'Juvenil');

      expect(Object.keys(club.categorias)).toHaveLength(2);
      expect(club.categorias['Senior']).toBeDefined();
      expect(club.categorias['Juvenil']).toBeDefined();

      console.log('✅ Club con múltiples categorías creado');
    });
  });

  describe('🤝 Flujo 3: Gestión de Amistosos', () => {

    it('debe permitir crear y jugar amistoso completo', () => {
      console.log('🚀 Flujo completo de amistoso...');

      // Crear equipos
      const equipoLocal = app.crearEquipo('Equipo Local FC', 'Madrid');
      const equipoVisitante = app.crearEquipo('Equipo Visitante FC', 'Madrid');

      // Crear amistoso
      const amistoso = app.crearAmistoso(equipoLocal.id, equipoVisitante.id, '2024-12-25');

      expect(amistoso.estado).toBe('Confirmado');
      expect(amistoso.equipoLocalId).toBe(equipoLocal.id);

      // Registrar resultado
      const resultadoRegistrado = app.registrarResultado(amistoso.id, 2, 1);

      expect(resultadoRegistrado).toBe(true);
      expect(amistoso.golesLocal).toBe(2);
      expect(amistoso.golesVisitante).toBe(1);
      expect(amistoso.estado).toBe('Finalizado');

      console.log('✅ Amistoso jugado:', `${amistoso.golesLocal}-${amistoso.golesVisitante}`);
    });

    it('debe mostrar amistosos de un equipo específico', () => {
      console.log('🚀 Verificando amistosos por equipo...');

      const equipo1 = app.crearEquipo('Equipo Principal', 'Madrid');
      const equipo2 = app.crearEquipo('Equipo Secundario', 'Madrid');
      const equipo3 = app.crearEquipo('Equipo Tercero', 'Barcelona');

      // Crear varios amistosos
      app.crearAmistoso(equipo1.id, equipo2.id, '2024-12-20');
      app.crearAmistoso(equipo3.id, equipo1.id, '2024-12-25');
      app.crearAmistoso(equipo2.id, equipo3.id, '2024-12-30');

      const amistososEquipo1 = app.obtenerAmistososDeEquipo(equipo1.id);
      const amistososEquipo2 = app.obtenerAmistososDeEquipo(equipo2.id);

      expect(amistososEquipo1).toHaveLength(2); // Local y visitante
      expect(amistososEquipo2).toHaveLength(2); // Local y visitante

      console.log('✅ Amistosos por equipo calculados correctamente');
    });
  });

  describe('📊 Flujo 4: Dashboard y Estadísticas', () => {

    it('debe mostrar estadísticas generales correctas', () => {
      console.log('🚀 Generando dashboard de usuario...');

      // Crear contenido variado
      app.crearEquipo('Equipo 1', 'Madrid');
      app.crearEquipo('Equipo 2', 'Barcelona');
      app.crearClub('Club Test', 'Descripción');
      
      const amistoso1 = app.crearAmistoso('equipo-1', 'equipo-2', '2024-12-20');
      const amistoso2 = app.crearAmistoso('equipo-2', 'equipo-1', '2024-12-25');
      
      // Finalizar un amistoso
      app.registrarResultado(amistoso1.id, 3, 1);

      const stats = app.obtenerEstadisticas();

      expect(stats.totalEquipos).toBe(2);
      expect(stats.totalClubes).toBe(1);
      expect(stats.totalAmistosos).toBe(2);
      expect(stats.amistososFinalizados).toBe(1);

      console.log('✅ Dashboard:', JSON.stringify(stats, null, 2));
    });

    it('debe manejar actividad intensa del usuario', () => {
      console.log('🚀 Simulando actividad intensa...');

      const tiempoInicio = Date.now();

      // Crear muchos elementos rápidamente
      for (let i = 0; i < 10; i++) {
        app.crearEquipo(`Equipo ${i}`, 'Madrid');
      }

      for (let i = 0; i < 5; i++) {
        app.crearClub(`Club ${i}`);
      }

      // Crear amistosos entre equipos
      const equipos = app.obtenerMisEquipos();
      for (let i = 0; i < equipos.length - 1; i++) {
        app.crearAmistoso(equipos[i].id, equipos[i + 1].id, `2024-12-${20 + i}`);
      }

      const tiempoFin = Date.now();
      const duracion = tiempoFin - tiempoInicio;

      const stats = app.obtenerEstadisticas();
      
      expect(stats.totalEquipos).toBe(10);
      expect(stats.totalClubes).toBe(5);
      expect(duracion).toBeLessThan(100); // Menos de 100ms

      console.log(`✅ Actividad intensa procesada en ${duracion}ms`);
    });
  });

  describe('🔄 Flujo 5: Flujos de Error y Recovery', () => {

    it('debe manejar operaciones con datos inexistentes', () => {
      console.log('🚀 Probando robustez con datos inexistentes...');

      // Intentar agregar equipo inexistente a club inexistente
      const resultado1 = app.agregarEquipoAClub('equipo-inexistente', 'club-inexistente', 'Senior');
      expect(resultado1).toBe(false);

      // Intentar registrar resultado de amistoso inexistente
      const resultado2 = app.registrarResultado('amistoso-inexistente', 2, 1);
      expect(resultado2).toBe(false);

      // Obtener amistosos de equipo inexistente
      const amistosos = app.obtenerAmistososDeEquipo('equipo-inexistente');
      expect(amistosos).toHaveLength(0);

      console.log('✅ Errores manejados gracefully');
    });

    it('debe mantener consistencia después de operaciones mixtas', () => {
      console.log('🚀 Probando consistencia con operaciones mixtas...');

      // Crear datos base
      const equipo = app.crearEquipo('Equipo Test', 'Madrid');
      const club = app.crearClub('Club Test');

      // Operaciones válidas e inválidas mezcladas
      const op1 = app.agregarEquipoAClub(equipo.id, club.id, 'Senior'); // Válida
      const op2 = app.agregarEquipoAClub('inexistente', club.id, 'Senior'); // Inválida
      const op3 = app.crearAmistoso(equipo.id, equipo.id, '2024-12-25'); // Válida pero rara

      expect(op1).toBe(true);
      expect(op2).toBe(false);
      
      const stats = app.obtenerEstadisticas();
      expect(stats.totalEquipos).toBe(1);
      expect(stats.totalClubes).toBe(1);

      console.log('✅ Consistencia mantenida tras operaciones mixtas');
    });
  });

  describe('🎯 Flujo 6: Casos de Uso Reales', () => {

    it('debe simular temporada completa de un club', () => {
      console.log('🚀 Simulando temporada completa...');

      // Crear club y equipos
      const club = app.crearClub('Atlético Completo FC', 'Club con todas las categorías');
      
      const equipoSenior = app.crearEquipo('Senior A', 'Madrid', 'Senior');
      const equipoJuvenil = app.crearEquipo('Juvenil A', 'Madrid', 'Juvenil');
      const equipoInfantil = app.crearEquipo('Infantil A', 'Madrid', 'Infantil');

      // Agregar equipos al club
      app.agregarEquipoAClub(equipoSenior.id, club.id, 'Senior');
      app.agregarEquipoAClub(equipoJuvenil.id, club.id, 'Juvenil');
      app.agregarEquipoAClub(equipoInfantil.id, club.id, 'Infantil');

      // Crear temporada de amistosos
      const fechas = ['2024-09-15', '2024-10-15', '2024-11-15', '2024-12-15'];
      const amistosos = fechas.map(fecha => 
        app.crearAmistoso(equipoSenior.id, equipoJuvenil.id, fecha)
      );

      // Jugar algunos partidos
      app.registrarResultado(amistosos[0].id, 2, 1);
      app.registrarResultado(amistosos[1].id, 0, 2);
      app.registrarResultado(amistosos[2].id, 1, 1);

      const stats = app.obtenerEstadisticas();
      
      expect(Object.keys(club.categorias)).toHaveLength(3);
      expect(stats.totalAmistosos).toBe(4);
      expect(stats.amistososFinalizados).toBe(3);

      console.log('✅ Temporada completa simulada');
      console.log(`   Club: ${club.nombre} con ${Object.keys(club.categorias).length} categorías`);
      console.log(`   Partidos: ${stats.amistososFinalizados}/${stats.totalAmistosos} completados`);
    });

    it('debe manejar usuario con múltiples clubes y equipos', () => {
      console.log('🚀 Usuario con múltiples clubes...');

      // Crear estructura compleja
      const club1 = app.crearClub('Club Norte FC');
      const club2 = app.crearClub('Club Sur FC');

      const equipos = [
        app.crearEquipo('Norte Senior', 'Madrid', 'Senior'),
        app.crearEquipo('Norte Juvenil', 'Madrid', 'Juvenil'),
        app.crearEquipo('Sur Senior', 'Madrid', 'Senior'),
        app.crearEquipo('Equipo Independiente', 'Barcelona', 'Senior')
      ];

      // Distribuir equipos
      app.agregarEquipoAClub(equipos[0].id, club1.id, 'Senior');
      app.agregarEquipoAClub(equipos[1].id, club1.id, 'Juvenil');
      app.agregarEquipoAClub(equipos[2].id, club2.id, 'Senior');
      // equipos[3] queda independiente

      // Crear amistosos cruzados
      app.crearAmistoso(equipos[0].id, equipos[2].id, '2024-12-20'); // Entre clubes
      app.crearAmistoso(equipos[1].id, equipos[3].id, '2024-12-25'); // Con independiente

      const misEquipos = app.obtenerMisEquipos();
      const stats = app.obtenerEstadisticas();

      expect(misEquipos).toHaveLength(4);
      expect(stats.totalClubes).toBe(2);
      expect(stats.totalAmistosos).toBe(2);

      // Verificar que un equipo puede quedar sin club
      const equipoIndependiente = misEquipos.find(e => e.nombre === 'Equipo Independiente');
      expect(equipoIndependiente?.clubId).toBeUndefined();

      console.log('✅ Usuario con estructura compleja manejado correctamente');
    });
  });
});

// Helper para generar datos de prueba realistas
export function generarDatosPrueba() {
  const equiposReales = [
    'Real Madrid CF', 'FC Barcelona', 'Atlético Madrid', 'Valencia CF',
    'Sevilla FC', 'Real Betis', 'Villarreal CF', 'Real Sociedad'
  ];

  const ciudades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'];
  
  return {
    equiposReales,
    ciudades,
    generarEquipoAleatorio: () => {
      const nombre = equiposReales[Math.floor(Math.random() * equiposReales.length)];
      const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
      return { nombre, ciudad };
    }
  };
}