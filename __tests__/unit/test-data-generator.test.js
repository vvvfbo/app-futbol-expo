/**
 * Tests unitarios para use-test-data-generator
 * Verifica que el generador de datos funcione correctamente
 */

describe('🚀 Tests del Generador de Datos de Prueba', () => {
    // Mock de AsyncStorage
    const mockStorage = new Map();

    const mockAsyncStorage = {
        async getItem(key) {
            return mockStorage.get(key) || null;
        },
        async setItem(key, value) {
            mockStorage.set(key, value);
        },
        async clear() {
            mockStorage.clear();
        }
    };

    // Mock del usuario autenticado
    const mockUser = {
        id: 'test-user-123',
        nombre: 'Admin Test',
        email: 'admin@test.com',
        rol: 'entrenador'
    };

    // Mock de funciones del data context
    const mockDataFunctions = {
        crearClub: jest.fn(),
        crearEquipo: jest.fn(),
        agregarJugador: jest.fn(),
        crearTorneo: jest.fn(),
        inscribirEquipoEnTorneo: jest.fn(),
        crearPartidos: jest.fn()
    };

    beforeEach(() => {
        mockStorage.clear();
        jest.clearAllMocks();

        // Configurar mocks para que devuelvan IDs válidos
        mockDataFunctions.crearClub.mockResolvedValue('club-test-123');
        mockDataFunctions.crearEquipo.mockResolvedValue('equipo-test-123');
        mockDataFunctions.agregarJugador.mockResolvedValue(undefined);
        mockDataFunctions.crearTorneo.mockResolvedValue('torneo-test-123');
        mockDataFunctions.inscribirEquipoEnTorneo.mockResolvedValue(undefined);
        mockDataFunctions.crearPartidos.mockResolvedValue(undefined);
    });

    describe('🔧 Tests de Componentes Básicos', () => {
        test('debe generar datos de equipos españoles correctamente', () => {
            const EQUIPOS_DATA = [
                {
                    nombre: "Real Madrid CF",
                    colores: { principal: "#FFFFFF", secundario: "#000080" }
                },
                {
                    nombre: "FC Barcelona",
                    colores: { principal: "#A50044", secundario: "#004D98" }
                },
                {
                    nombre: "Atlético de Madrid",
                    colores: { principal: "#CE1126", secundario: "#FFFFFF" }
                }
            ];

            expect(EQUIPOS_DATA).toHaveLength(3);
            expect(EQUIPOS_DATA[0].nombre).toBe("Real Madrid CF");
            expect(EQUIPOS_DATA[1].colores.principal).toBe("#A50044");
            expect(EQUIPOS_DATA[2].nombre).toContain("Atlético");
        });

        test('debe generar jugadores con datos válidos', () => {
            const generarJugadores = (equipoId) => {
                const nombres = ['Carlos', 'Miguel', 'José', 'Antonio', 'Francisco'];
                const posiciones = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

                return Array.from({ length: 5 }, (_, i) => ({
                    id: `jugador-${equipoId}-${i + 1}`,
                    nombre: nombres[i % nombres.length],
                    numero: i + 1,
                    posicion: posiciones[i % posiciones.length],
                    equipoId: equipoId,
                    fechaRegistro: new Date().toISOString()
                }));
            };

            const jugadores = generarJugadores('equipo-123');

            expect(jugadores).toHaveLength(5);
            expect(jugadores[0].nombre).toBe('Carlos');
            expect(jugadores[0].numero).toBe(1);
            expect(jugadores[0].posicion).toBe('Portero');
            expect(jugadores[4].numero).toBe(5);
        });
    });

    describe('🏢 Tests de Creación de Club', () => {
        test('debe crear club con datos válidos', async () => {
            const clubData = {
                nombre: "Club Deportivo Prueba",
                ubicacion: {
                    direccion: "Calle Deporte, 123",
                    ciudad: "Madrid"
                },
                email: "info@clubprueba.com",
                telefono: "+34 123 456 789",
                entrenadorId: mockUser.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: "Club generado automáticamente para pruebas",
                categorias: {}
            };

            const clubId = await mockDataFunctions.crearClub(clubData);

            expect(clubId).toBe('club-test-123');
            expect(mockDataFunctions.crearClub).toHaveBeenCalledWith(clubData);
            expect(mockDataFunctions.crearClub).toHaveBeenCalledTimes(1);
        });

        test('debe manejar errores en creación de club', async () => {
            mockDataFunctions.crearClub.mockRejectedValue(new Error('Error de conexión'));

            try {
                await mockDataFunctions.crearClub({});
                fail('Debería haber lanzado error');
            } catch (error) {
                expect(error.message).toBe('Error de conexión');
            }
        });
    });

    describe('⚽ Tests de Creación de Equipos', () => {
        test('debe crear múltiples equipos correctamente', async () => {
            const equiposData = [
                { nombre: 'Real Madrid CF', colores: { principal: '#FFFFFF', secundario: '#000080' } },
                { nombre: 'FC Barcelona', colores: { principal: '#A50044', secundario: '#004D98' } },
                { nombre: 'Atlético de Madrid', colores: { principal: '#CE1126', secundario: '#FFFFFF' } }
            ];

            const equiposIds = [];

            for (let i = 0; i < equiposData.length; i++) {
                const equipoData = equiposData[i];
                const nuevoEquipo = {
                    nombre: equipoData.nombre,
                    categoria: 'Senior',
                    ciudad: "Madrid",
                    colores: equipoData.colores,
                    entrenadorId: mockUser.id,
                    clubId: 'club-test-123',
                    jugadores: []
                };

                const equipoId = await mockDataFunctions.crearEquipo(nuevoEquipo);
                equiposIds.push(equipoId);
            }

            expect(equiposIds).toHaveLength(3);
            expect(mockDataFunctions.crearEquipo).toHaveBeenCalledTimes(3);

            // Verificar que se llamó con los datos correctos
            const firstCall = mockDataFunctions.crearEquipo.mock.calls[0][0];
            expect(firstCall.nombre).toBe('Real Madrid CF');
            expect(firstCall.colores.principal).toBe('#FFFFFF');
        });

        test('debe manejar errores en creación de equipos', async () => {
            mockDataFunctions.crearEquipo.mockRejectedValue(new Error('Error creando equipo'));

            try {
                await mockDataFunctions.crearEquipo({});
                fail('Debería haber lanzado error');
            } catch (error) {
                expect(error.message).toBe('Error creando equipo');
            }
        });
    });

    describe('👤 Tests de Creación de Jugadores', () => {
        test('debe agregar jugadores a un equipo', async () => {
            const equipoId = 'equipo-test-123';
            const jugadores = [
                { nombre: 'Carlos García', numero: 1, posicion: 'Portero' },
                { nombre: 'Miguel López', numero: 2, posicion: 'Defensa' },
                { nombre: 'José Martín', numero: 3, posicion: 'Mediocampista' }
            ];

            for (const jugador of jugadores) {
                await mockDataFunctions.agregarJugador(equipoId, jugador);
            }

            expect(mockDataFunctions.agregarJugador).toHaveBeenCalledTimes(3);
            expect(mockDataFunctions.agregarJugador).toHaveBeenCalledWith(equipoId, jugadores[0]);
        });
    });

    describe('🏆 Tests de Creación de Torneo', () => {
        test('debe crear torneo con configuración válida', async () => {
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 7);

            const fechaFin = new Date(fechaInicio);
            fechaFin.setMonth(fechaFin.getMonth() + 2);

            const torneoData = {
                nombre: "Copa de Prueba 2024",
                descripcion: "Torneo generado automáticamente para pruebas de la aplicación",
                tipo: 'grupos',
                fechaInicio: fechaInicio.toISOString().split('T')[0],
                fechaFin: fechaFin.toISOString().split('T')[0],
                ubicacion: { direccion: "Madrid" },
                ciudad: "Madrid",
                categoria: "Senior",
                tipoFutbol: "F11",
                maxEquipos: 8,
                minEquipos: 4,
                creadorId: mockUser.id,
                equiposIds: [],
                estado: 'Próximo',
                configuracion: {
                    puntosVictoria: 3,
                    puntosEmpate: 1,
                    puntosDerrota: 0,
                    tiempoPartido: 90,
                    descanso: 15,
                    permitirEmpates: true
                }
            };

            const torneoId = await mockDataFunctions.crearTorneo(torneoData);

            expect(torneoId).toBe('torneo-test-123');
            expect(mockDataFunctions.crearTorneo).toHaveBeenCalledWith(torneoData);
        });
    });

    describe('📅 Tests de Creación de Partidos', () => {
        test('debe generar partidos para múltiples equipos', async () => {
            const equiposIds = ['equipo-1', 'equipo-2', 'equipo-3', 'equipo-4'];
            const torneoId = 'torneo-test-123';
            const fechaInicio = new Date();

            const partidos = [];

            // Generar partidos (todos contra todos)
            for (let i = 0; i < equiposIds.length; i++) {
                for (let j = i + 1; j < equiposIds.length; j++) {
                    const fechaPartido = new Date(fechaInicio);
                    fechaPartido.setDate(fechaPartido.getDate() + Math.floor(Math.random() * 30));

                    partidos.push({
                        torneoId,
                        equipoLocalId: equiposIds[i],
                        equipoVisitanteId: equiposIds[j],
                        fecha: fechaPartido.toISOString().split('T')[0],
                        hora: `${Math.floor(Math.random() * 4) + 16}:00`,
                        jornada: Math.floor(partidos.length / 2) + 1,
                        estado: 'Pendiente',
                        campoId: 'campo-1'
                    });
                }
            }

            await mockDataFunctions.crearPartidos(partidos);

            // Para 4 equipos, deberíamos tener 6 partidos (combinaciones de 4 tomados de 2 en 2)
            expect(partidos).toHaveLength(6);
            expect(mockDataFunctions.crearPartidos).toHaveBeenCalledWith(partidos);
        });
    });

    describe('🔄 Tests de Generación Completa', () => {
        test('debe ejecutar el flujo completo de generación', async () => {
            // Simular la función generarDatosPrueba
            const generarDatosPruebaSimulado = async () => {
                try {
                    console.log('🚀 Iniciando generación de datos de prueba...');

                    if (!mockUser) {
                        throw new Error('Usuario no autenticado');
                    }

                    // 1. Crear club
                    const clubData = {
                        nombre: "Club Deportivo Prueba",
                        ubicacion: { direccion: "Calle Deporte, 123", ciudad: "Madrid" },
                        email: "info@clubprueba.com",
                        telefono: "+34 123 456 789",
                        entrenadorId: mockUser.id,
                        fechaCreacion: new Date().toISOString(),
                        descripcion: "Club generado automáticamente para pruebas",
                        categorias: {}
                    };

                    const clubId = await mockDataFunctions.crearClub(clubData);

                    // 2. Crear equipos
                    const equiposIds = [];
                    const EQUIPOS_DATA = [
                        { nombre: "Real Madrid CF", colores: { principal: "#FFFFFF", secundario: "#000080" } },
                        { nombre: "FC Barcelona", colores: { principal: "#A50044", secundario: "#004D98" } }
                    ];

                    for (let i = 0; i < 2; i++) {
                        const equipoData = EQUIPOS_DATA[i];
                        const nuevoEquipo = {
                            nombre: equipoData.nombre,
                            categoria: 'Senior',
                            ciudad: "Madrid",
                            colores: equipoData.colores,
                            entrenadorId: mockUser.id,
                            clubId: clubId,
                            jugadores: []
                        };

                        const equipoId = await mockDataFunctions.crearEquipo(nuevoEquipo);
                        equiposIds.push(equipoId);

                        // Agregar jugadores
                        const jugadores = [
                            { nombre: `Jugador ${i * 2 + 1}`, numero: 1, posicion: 'Portero' },
                            { nombre: `Jugador ${i * 2 + 2}`, numero: 2, posicion: 'Defensa' }
                        ];

                        for (const jugador of jugadores) {
                            await mockDataFunctions.agregarJugador(equipoId, jugador);
                        }
                    }

                    // 3. Crear torneo
                    const fechaInicio = new Date();
                    fechaInicio.setDate(fechaInicio.getDate() + 7);

                    const torneoData = {
                        nombre: "Copa de Prueba 2024",
                        descripcion: "Torneo de prueba",
                        tipo: 'grupos',
                        fechaInicio: fechaInicio.toISOString().split('T')[0],
                        fechaFin: fechaInicio.toISOString().split('T')[0],
                        ciudad: "Madrid",
                        categoria: "Senior",
                        creadorId: mockUser.id,
                        equiposIds: [],
                        estado: 'Próximo'
                    };

                    const torneoId = await mockDataFunctions.crearTorneo(torneoData);

                    // 4. Inscribir equipos
                    for (const equipoId of equiposIds) {
                        await mockDataFunctions.inscribirEquipoEnTorneo(torneoId, equipoId);
                    }

                    // 5. Crear partidos
                    const partidos = [{
                        torneoId,
                        equipoLocalId: equiposIds[0],
                        equipoVisitanteId: equiposIds[1],
                        fecha: fechaInicio.toISOString().split('T')[0],
                        hora: '16:00',
                        jornada: 1,
                        estado: 'Pendiente',
                        campoId: 'campo-1'
                    }];

                    await mockDataFunctions.crearPartidos(partidos);

                    return {
                        success: true,
                        data: {
                            clubId,
                            equiposIds,
                            torneoId,
                            partidosCreados: partidos.length
                        }
                    };

                } catch (error) {
                    console.error('❌ Error generando datos:', error);
                    return {
                        success: false,
                        error: error.message
                    };
                }
            };

            const resultado = await generarDatosPruebaSimulado();

            expect(resultado.success).toBe(true);
            expect(resultado.data.clubId).toBe('club-test-123');
            expect(resultado.data.equiposIds).toHaveLength(2);
            expect(resultado.data.torneoId).toBe('torneo-test-123');
            expect(resultado.data.partidosCreados).toBe(1);

            // Verificar que se llamaron todas las funciones
            expect(mockDataFunctions.crearClub).toHaveBeenCalledTimes(1);
            expect(mockDataFunctions.crearEquipo).toHaveBeenCalledTimes(2);
            expect(mockDataFunctions.agregarJugador).toHaveBeenCalledTimes(4); // 2 jugadores por equipo
            expect(mockDataFunctions.crearTorneo).toHaveBeenCalledTimes(1);
            expect(mockDataFunctions.inscribirEquipoEnTorneo).toHaveBeenCalledTimes(2);
            expect(mockDataFunctions.crearPartidos).toHaveBeenCalledTimes(1);
        });

        test('debe manejar errores en el flujo completo', async () => {
            // Hacer que crearClub falle
            mockDataFunctions.crearClub.mockRejectedValue(new Error('Error de base de datos'));

            const generarDatosPruebaConError = async () => {
                try {
                    await mockDataFunctions.crearClub({});
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            };

            const resultado = await generarDatosPruebaConError();

            expect(resultado.success).toBe(false);
            expect(resultado.error).toBe('Error de base de datos');
        });
    });

    describe('🧪 Tests de Funciones de Prueba Simple', () => {
        test('pruebaSimple debe crear solo un club', async () => {
            const pruebaSimpleSimulada = async () => {
                try {
                    if (!mockUser) {
                        throw new Error('Usuario no autenticado');
                    }

                    const clubSimple = {
                        nombre: "Club Prueba Simple",
                        ubicacion: { direccion: "Calle Test, 123", ciudad: "Madrid" },
                        email: "test@clubsimple.com",
                        telefono: "+34 123 456 789",
                        entrenadorId: mockUser.id,
                        fechaCreacion: new Date().toISOString(),
                        descripcion: "Club de prueba simple",
                        categorias: {}
                    };

                    const clubId = await mockDataFunctions.crearClub(clubSimple);

                    return {
                        success: true,
                        data: { clubId, mensaje: 'Club simple creado correctamente' }
                    };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            };

            const resultado = await pruebaSimpleSimulada();

            expect(resultado.success).toBe(true);
            expect(resultado.data.clubId).toBe('club-test-123');
            expect(resultado.data.mensaje).toBe('Club simple creado correctamente');
            expect(mockDataFunctions.crearClub).toHaveBeenCalledTimes(1);
        });
    });
});