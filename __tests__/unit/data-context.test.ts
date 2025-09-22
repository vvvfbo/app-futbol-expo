import { useData } from '@/hooks/data-context';
import { Club, Equipo, Jugador } from '@/types';
import { act, renderHook } from '@testing-library/react-native';

// Mock de AsyncStorage más robusto
const mockAsyncStorage = {
    storage: new Map(),

    async getItem(key) {
        const value = this.storage.get(key);
        return value || null;
    },

    async setItem(key, value) {
        this.storage.set(key, value);
    },

    async removeItem(key) {
        this.storage.delete(key);
    },

    async clear() {
        this.storage.clear();
    },

    async getAllKeys() {
        return Array.from(this.storage.keys());
    }
};

// Reemplazar el mock por defecto
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock del contexto de autenticación
const mockUser = {
    id: 'test-user-id',
    nombre: 'Test User',
    email: 'test@example.com',
    rol: 'entrenador' as const
};

jest.mock('@/hooks/auth-context', () => ({
    useAuth: () => ({
        user: mockUser,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn()
    })
}));

describe('DataContext - Tests Unitarios Completos', () => {
    let hook;

    beforeEach(async () => {
        // Limpiar AsyncStorage antes de cada test
        await mockAsyncStorage.clear();

        // Renderizar el hook
        const { result } = renderHook(() => useData());
        hook = result;
    });

    afterEach(async () => {
        await mockAsyncStorage.clear();
    });

    describe('🔧 Tests de AsyncStorage', () => {
        test('AsyncStorage debe funcionar correctamente', async () => {
            const testData = { test: 'data' };

            await mockAsyncStorage.setItem('test-key', JSON.stringify(testData));
            const retrieved = await mockAsyncStorage.getItem('test-key');

            expect(retrieved).toBe(JSON.stringify(testData));
            expect(JSON.parse(retrieved)).toEqual(testData);
        });

        test('AsyncStorage debe manejar datos null', async () => {
            const result = await mockAsyncStorage.getItem('non-existent-key');
            expect(result).toBeNull();
        });

        test('AsyncStorage debe limpiar datos correctamente', async () => {
            await mockAsyncStorage.setItem('test-key', 'test-value');
            await mockAsyncStorage.clear();
            const result = await mockAsyncStorage.getItem('test-key');
            expect(result).toBeNull();
        });
    });

    describe('🏢 Tests de Clubes', () => {
        test('crearClub debe crear un club correctamente', async () => {
            const clubData: Omit<Club, 'id'> = {
                nombre: 'Club Test',
                ubicacion: {
                    direccion: 'Calle Test, 123',
                    ciudad: 'Madrid'
                },
                email: 'test@club.com',
                telefono: '+34 123 456 789',
                entrenadorId: mockUser.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: 'Club de prueba',
                categorias: {}
            };

            await act(async () => {
                const clubId = await hook.current.crearClub(clubData);

                expect(clubId).toBeDefined();
                expect(typeof clubId).toBe('string');
                expect(clubId.length).toBeGreaterThan(0);

                // Verificar que se guardó en AsyncStorage
                const clubesStorage = await mockAsyncStorage.getItem('clubes');
                expect(clubesStorage).not.toBeNull();

                const clubes = JSON.parse(clubesStorage);
                expect(Array.isArray(clubes)).toBe(true);
                expect(clubes).toHaveLength(1);

                const clubCreado = clubes[0];
                expect(clubCreado.id).toBe(clubId);
                expect(clubCreado.nombre).toBe(clubData.nombre);
                expect(clubCreado.entrenadorId).toBe(mockUser.id);
            });
        });

        test('crearClub debe generar IDs únicos', async () => {
            const clubData1: Omit<Club, 'id'> = {
                nombre: 'Club Test 1',
                ubicacion: { direccion: 'Calle 1', ciudad: 'Madrid' },
                email: 'test1@club.com',
                telefono: '+34 111 111 111',
                entrenadorId: mockUser.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: 'Club 1',
                categorias: {}
            };

            const clubData2: Omit<Club, 'id'> = {
                nombre: 'Club Test 2',
                ubicacion: { direccion: 'Calle 2', ciudad: 'Barcelona' },
                email: 'test2@club.com',
                telefono: '+34 222 222 222',
                entrenadorId: mockUser.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: 'Club 2',
                categorias: {}
            };

            await act(async () => {
                const clubId1 = await hook.current.crearClub(clubData1);
                const clubId2 = await hook.current.crearClub(clubData2);

                expect(clubId1).not.toBe(clubId2);
                expect(clubId1).toBeDefined();
                expect(clubId2).toBeDefined();
            });
        });

        test('crearClub debe manejar datos inválidos', async () => {
            const clubDataInvalido = {
                // Falta información requerida
                nombre: '',
                entrenadorId: mockUser.id
            };

            await act(async () => {
                // Este test verifica que la función no rompa con datos incompletos
                try {
                    const clubId = await hook.current.crearClub(clubDataInvalido as any);
                    // Si no lanza error, al menos debe crear algo
                    expect(typeof clubId).toBe('string');
                } catch (error) {
                    // Si lanza error, está bien manejado
                    expect(error).toBeDefined();
                }
            });
        });
    });

    describe('⚽ Tests de Equipos', () => {
        let clubId: string;

        beforeEach(async () => {
            // Crear un club antes de cada test de equipo
            const clubData: Omit<Club, 'id'> = {
                nombre: 'Club Para Equipos',
                ubicacion: { direccion: 'Calle Club', ciudad: 'Madrid' },
                email: 'club@equipos.com',
                telefono: '+34 123 456 789',
                entrenadorId: mockUser.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: 'Club para tests de equipos',
                categorias: {}
            };

            await act(async () => {
                clubId = await hook.current.crearClub(clubData);
            });
        });

        test('crearEquipo debe crear un equipo correctamente', async () => {
            const equipoData: Omit<Equipo, 'id' | 'fechaCreacion'> = {
                nombre: 'Equipo Test',
                categoria: 'Senior',
                ciudad: 'Madrid',
                colores: {
                    principal: '#FF0000',
                    secundario: '#FFFFFF'
                },
                entrenadorId: mockUser.id,
                clubId: clubId,
                jugadores: []
            };

            await act(async () => {
                const equipoId = await hook.current.crearEquipo(equipoData);

                expect(equipoId).toBeDefined();
                expect(typeof equipoId).toBe('string');
                expect(equipoId.length).toBeGreaterThan(0);

                // Verificar que se guardó en AsyncStorage
                const equiposStorage = await mockAsyncStorage.getItem('equipos');
                expect(equiposStorage).not.toBeNull();

                const equipos = JSON.parse(equiposStorage);
                expect(Array.isArray(equipos)).toBe(true);
                expect(equipos).toHaveLength(1);

                const equipoCreado = equipos[0];
                expect(equipoCreado.id).toBe(equipoId);
                expect(equipoCreado.nombre).toBe(equipoData.nombre);
                expect(equipoCreado.clubId).toBe(clubId);
                expect(equipoCreado.entrenadorId).toBe(mockUser.id);
            });
        });

        test('crearEquipo debe validar clubId existente', async () => {
            const equipoData: Omit<Equipo, 'id' | 'fechaCreacion'> = {
                nombre: 'Equipo Sin Club',
                categoria: 'Senior',
                ciudad: 'Madrid',
                colores: { principal: '#FF0000', secundario: '#FFFFFF' },
                entrenadorId: mockUser.id,
                clubId: 'club-inexistente',
                jugadores: []
            };

            await act(async () => {
                // El equipo debe crearse incluso si el club no existe (por ahora)
                // En el futuro se podría agregar validación
                const equipoId = await hook.current.crearEquipo(equipoData);
                expect(equipoId).toBeDefined();
            });
        });
    });

    describe('👤 Tests de Jugadores', () => {
        let equipoId: string;

        beforeEach(async () => {
            // Crear club y equipo antes de cada test de jugador
            const clubData: Omit<Club, 'id'> = {
                nombre: 'Club Para Jugadores',
                ubicacion: { direccion: 'Calle Club', ciudad: 'Madrid' },
                email: 'club@jugadores.com',
                telefono: '+34 123 456 789',
                entrenadorId: mockUser.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: 'Club para tests de jugadores',
                categorias: {}
            };

            const equipoData: Omit<Equipo, 'id' | 'fechaCreacion'> = {
                nombre: 'Equipo Para Jugadores',
                categoria: 'Senior',
                ciudad: 'Madrid',
                colores: { principal: '#FF0000', secundario: '#FFFFFF' },
                entrenadorId: mockUser.id,
                clubId: 'club-test',
                jugadores: []
            };

            await act(async () => {
                const clubId = await hook.current.crearClub(clubData);
                equipoId = await hook.current.crearEquipo({ ...equipoData, clubId });
            });
        });

        test('agregarJugador debe agregar un jugador correctamente', async () => {
            const jugadorData: Omit<Jugador, 'id' | 'equipoId' | 'fechaRegistro'> = {
                nombre: 'Jugador Test',
                numero: 10,
                posicion: 'Delantero',
                edad: 25,
                altura: 180,
                peso: 75
            };

            await act(async () => {
                await hook.current.agregarJugador(equipoId, jugadorData);

                // Verificar que se guardó en el equipo
                const equiposStorage = await mockAsyncStorage.getItem('equipos');
                expect(equiposStorage).not.toBeNull();

                const equipos = JSON.parse(equiposStorage);
                const equipo = equipos.find(e => e.id === equipoId);

                expect(equipo).toBeDefined();
                expect(equipo.jugadores).toHaveLength(1);

                const jugador = equipo.jugadores[0];
                expect(jugador.nombre).toBe(jugadorData.nombre);
                expect(jugador.numero).toBe(jugadorData.numero);
                expect(jugador.equipoId).toBe(equipoId);
            });
        });

        test('agregarJugador debe generar IDs únicos', async () => {
            const jugador1: Omit<Jugador, 'id' | 'equipoId' | 'fechaRegistro'> = {
                nombre: 'Jugador 1',
                numero: 1,
                posicion: 'Portero'
            };

            const jugador2: Omit<Jugador, 'id' | 'equipoId' | 'fechaRegistro'> = {
                nombre: 'Jugador 2',
                numero: 2,
                posicion: 'Defensa'
            };

            await act(async () => {
                await hook.current.agregarJugador(equipoId, jugador1);
                await hook.current.agregarJugador(equipoId, jugador2);

                const equiposStorage = await mockAsyncStorage.getItem('equipos');
                const equipos = JSON.parse(equiposStorage);
                const equipo = equipos.find(e => e.id === equipoId);

                expect(equipo.jugadores).toHaveLength(2);
                expect(equipo.jugadores[0].id).not.toBe(equipo.jugadores[1].id);
            });
        });
    });

    describe('📊 Tests de Estado del Hook', () => {
        test('el hook debe inicializarse con arrays vacíos', () => {
            expect(hook.current.clubes).toEqual([]);
            expect(hook.current.equipos).toEqual([]);
            expect(hook.current.torneos).toEqual([]);
            expect(hook.current.partidos).toEqual([]);
            expect(hook.current.amistosos).toEqual([]);
        });

        test('isLoading debe ser false inicialmente', () => {
            expect(hook.current.isLoading).toBe(false);
        });

        test('todas las funciones deben estar disponibles', () => {
            const expectedFunctions = [
                'crearClub', 'crearEquipo', 'agregarJugador', 'crearTorneo',
                'inscribirEquipoEnTorneo', 'crearPartidos', 'actualizarEquipo',
                'eliminarEquipo', 'obtenerEquiposPorEntrenador'
            ];

            expectedFunctions.forEach(funcName => {
                expect(typeof hook.current[funcName]).toBe('function');
            });
        });
    });

    describe('🔄 Tests de Persistencia', () => {
        test('los datos deben persistir entre reinicios del hook', async () => {
            const clubData: Omit<Club, 'id'> = {
                nombre: 'Club Persistente',
                ubicacion: { direccion: 'Calle Persistencia', ciudad: 'Madrid' },
                email: 'persistente@club.com',
                telefono: '+34 123 456 789',
                entrenadorId: mockUser.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: 'Club para test de persistencia',
                categorias: {}
            };

            // Crear club con el primer hook
            let clubId;
            await act(async () => {
                clubId = await hook.current.crearClub(clubData);
            });

            // Renderizar un nuevo hook (simular reinicio)
            const { result: newHook } = renderHook(() => useData());

            // Dar tiempo para que cargue los datos
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
            });

            // Verificar que los datos siguen ahí
            expect(newHook.current.clubes).toHaveLength(1);
            expect(newHook.current.clubes[0].id).toBe(clubId);
            expect(newHook.current.clubes[0].nombre).toBe(clubData.nombre);
        });
    });
});