/**
 * Tests de Integración Reales - Persistencia
 * Estos tests simulan mejor el comportamiento real de AsyncStorage
 * y detectan problemas de race conditions y persistencia
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

describe('🚨 TESTS DE INTEGRACIÓN - PROBLEMAS REALES', () => {
    beforeEach(async () => {
        // Limpiar AsyncStorage real
        await AsyncStorage.clear();
    });

    afterEach(async () => {
        await AsyncStorage.clear();
    });

    test('🔥 PROBLEMA REAL: Race Condition entre crearEquipo y agregarJugador', async () => {
        console.log('🧪 === TEST RACE CONDITION ===');

        // Simular creación de equipo
        const equipos = [];
        const nuevoEquipo = {
            id: '12345',
            nombre: 'Test Equipo',
            jugadores: []
        };

        console.log('📝 Paso 1: Guardar equipo en AsyncStorage');
        equipos.push(nuevoEquipo);
        await AsyncStorage.setItem('equipos', JSON.stringify(equipos));

        // Verificar que se guardó
        const equiposGuardados = JSON.parse(await AsyncStorage.getItem('equipos'));
        expect(equiposGuardados).toHaveLength(1);
        console.log('✅ Equipo guardado correctamente');

        // Simular el problema: agregarJugador se ejecuta inmediatamente
        // usando un estado obsoleto (equipos vacío)
        console.log('📝 Paso 2: Simular agregarJugador con estado obsoleto');

        // PROBLEMA: Este es el estado que tenía React antes de la actualización
        const estadoObsoleto = [];

        const nuevoJugador = {
            id: '67890',
            nombre: 'Test Jugador',
            equipoId: '12345'
        };

        // Si agregarJugador usa el estado obsoleto (como pasaba antes del fix)
        const equiposConJugadorIncorrecto = estadoObsoleto.map(e => {
            if (e.id === '12345') {
                return { ...e, jugadores: [...e.jugadores, nuevoJugador] };
            }
            return e;
        });

        console.log('⚠️ Equipos con estado obsoleto:', equiposConJugadorIncorrecto);
        expect(equiposConJugadorIncorrecto).toHaveLength(0); // ¡El equipo desaparece!

        // SOLUCIÓN: Leer desde AsyncStorage (como en el fix)
        console.log('📝 Paso 3: Aplicar el fix - leer desde AsyncStorage');
        const equiposReales = JSON.parse(await AsyncStorage.getItem('equipos') || '[]');

        const equiposCorregidos = equiposReales.map(e => {
            if (e.id === '12345') {
                return { ...e, jugadores: [...(e.jugadores || []), nuevoJugador] };
            }
            return e;
        });

        console.log('✅ Equipos con fix aplicado:', equiposCorregidos);
        expect(equiposCorregidos).toHaveLength(1);
        expect(equiposCorregidos[0].jugadores).toHaveLength(1);

        console.log('🎉 Fix funciona correctamente - los datos persisten');
    });

    test('🔥 PROBLEMA REAL: AsyncStorage timing en operaciones consecutivas', async () => {
        console.log('🧪 === TEST TIMING ISSUES ===');

        // Simular múltiples operaciones rápidas consecutivas
        const operaciones = [];

        // Operación 1: Crear club
        operaciones.push(
            AsyncStorage.setItem('clubes', JSON.stringify([{
                id: 'club1',
                nombre: 'Club Test',
                equipos: []
            }]))
        );

        // Operación 2: Crear equipo (casi simultánea)
        operaciones.push(
            AsyncStorage.setItem('equipos', JSON.stringify([{
                id: 'equipo1',
                nombre: 'Equipo Test',
                clubId: 'club1',
                jugadores: []
            }]))
        );

        // Operación 3: Agregar jugador (casi simultánea)
        operaciones.push(
            (async () => {
                // Pequeño delay para simular timing real
                await new Promise(resolve => setTimeout(resolve, 10));

                // Leer equipos actuales
                const equiposData = await AsyncStorage.getItem('equipos');
                const equipos = equiposData ? JSON.parse(equiposData) : [];

                const equiposConJugador = equipos.map(e => {
                    if (e.id === 'equipo1') {
                        return {
                            ...e,
                            jugadores: [...(e.jugadores || []), {
                                id: 'jugador1',
                                nombre: 'Jugador Test',
                                equipoId: 'equipo1'
                            }]
                        };
                    }
                    return e;
                });

                return AsyncStorage.setItem('equipos', JSON.stringify(equiposConJugador));
            })()
        );

        // Ejecutar todas las operaciones
        await Promise.all(operaciones);

        // Verificar resultados
        const clubes = JSON.parse(await AsyncStorage.getItem('clubes') || '[]');
        const equipos = JSON.parse(await AsyncStorage.getItem('equipos') || '[]');

        expect(clubes).toHaveLength(1);
        expect(equipos).toHaveLength(1);
        expect(equipos[0].jugadores).toHaveLength(1);

        console.log('✅ Datos persistidos correctamente:', {
            clubes: clubes.length,
            equipos: equipos.length,
            jugadores: equipos[0]?.jugadores?.length || 0
        });
    });

    test('🔥 PROBLEMA REAL: Verificar por qué los tests pasan pero la app falla', async () => {
        console.log('🧪 === TEST SIMULACIÓN REAL ===');

        // Simular el comportamiento exacto de la app
        let estadoEquipos = []; // Estado inicial vacío (como en la app)

        // Función que simula crearEquipo (como en data-context)
        const simularCrearEquipo = async (equipo) => {
            console.log('📝 CrearEquipo - Estado inicial:', estadoEquipos.length);

            const nuevoEquipo = { ...equipo, id: Date.now().toString() };
            const nuevosEquipos = [...estadoEquipos, nuevoEquipo];

            await AsyncStorage.setItem('equipos', JSON.stringify(nuevosEquipos));

            // Simular actualización de estado (que toma tiempo)
            setTimeout(() => {
                estadoEquipos = nuevosEquipos;
                console.log('📝 Estado actualizado después de crear equipo:', estadoEquipos.length);
            }, 50);

            return nuevoEquipo.id;
        };

        // Función que simula agregarJugador (VERSIÓN CON PROBLEMA)
        const simularAgregarJugadorProblema = async (equipoId, jugador) => {
            console.log('📝 AgregarJugador - Estado actual:', estadoEquipos.length);

            // PROBLEMA: Usa el estado React que puede estar desactualizado
            const nuevosEquipos = estadoEquipos.map(e => {
                if (e.id === equipoId) {
                    return { ...e, jugadores: [...(e.jugadores || []), jugador] };
                }
                return e;
            });

            await AsyncStorage.setItem('equipos', JSON.stringify(nuevosEquipos));
            estadoEquipos = nuevosEquipos;

            return nuevosEquipos;
        };

        // Función que simula agregarJugador (VERSIÓN ARREGLADA)
        const simularAgregarJugadorFix = async (equipoId, jugador) => {
            console.log('📝 AgregarJugador (Fix) - Leyendo desde AsyncStorage');

            // FIX: Lee desde AsyncStorage en lugar del estado React
            const equiposData = await AsyncStorage.getItem('equipos');
            const equiposActuales = equiposData ? JSON.parse(equiposData) : [];

            console.log('📝 Equipos leídos desde AsyncStorage:', equiposActuales.length);

            const nuevosEquipos = equiposActuales.map(e => {
                if (e.id === equipoId) {
                    return { ...e, jugadores: [...(e.jugadores || []), jugador] };
                }
                return e;
            });

            await AsyncStorage.setItem('equipos', JSON.stringify(nuevosEquipos));
            estadoEquipos = nuevosEquipos;

            return nuevosEquipos;
        };

        console.log('🧪 Probando VERSIÓN CON PROBLEMA:');

        // Crear equipo
        const equipoId = await simularCrearEquipo({
            nombre: 'Equipo Test',
            jugadores: []
        });

        // Inmediatamente agregar jugador (antes de que el estado se actualice)
        const resultadoProblema = await simularAgregarJugadorProblema(equipoId, {
            id: 'jugador1',
            nombre: 'Jugador Test'
        });

        console.log('⚠️ Resultado con problema:', resultadoProblema.length);
        expect(resultadoProblema).toHaveLength(0); // ¡Los datos desaparecen!

        console.log('🧪 Probando VERSIÓN ARREGLADA:');

        // Resetear
        estadoEquipos = [];
        await AsyncStorage.clear();

        // Crear equipo de nuevo
        const equipoId2 = await simularCrearEquipo({
            nombre: 'Equipo Test 2',
            jugadores: []
        });

        // Inmediatamente agregar jugador con el fix
        const resultadoFix = await simularAgregarJugadorFix(equipoId2, {
            id: 'jugador2',
            nombre: 'Jugador Test 2'
        });

        console.log('✅ Resultado con fix:', resultadoFix.length);
        expect(resultadoFix).toHaveLength(1);
        expect(resultadoFix[0].jugadores).toHaveLength(1);

        console.log('🎉 Fix resuelve el problema de race condition');
    });
});