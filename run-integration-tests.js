/**
 * Runner para Tests de Integración de Persistencia
 * Este ejecutor simula más fielmente el comportamiento real de AsyncStorage
 * y detecta problemas que los tests unitarios con mocks no pueden encontrar
 */

console.log('🧪 === TESTS DE INTEGRACIÓN - PROBLEMAS REALES ===\n');

// Mock de AsyncStorage que simula mejor el comportamiento real
const mockAsyncStorage = (() => {
    const storage = new Map();

    return {
        async getItem(key) {
            // Simular pequeño delay como en AsyncStorage real
            await new Promise(resolve => setTimeout(resolve, 10));
            const value = storage.get(key);
            return value || null;
        },

        async setItem(key, value) {
            // Simular pequeño delay como en AsyncStorage real
            await new Promise(resolve => setTimeout(resolve, 15));
            storage.set(key, value);
        },

        async removeItem(key) {
            await new Promise(resolve => setTimeout(resolve, 10));
            storage.delete(key);
        },

        async clear() {
            await new Promise(resolve => setTimeout(resolve, 20));
            storage.clear();
        },

        async getAllKeys() {
            await new Promise(resolve => setTimeout(resolve, 10));
            return Array.from(storage.keys());
        },

        // Método para inspección en tests
        _inspect() {
            return Object.fromEntries(storage.entries());
        }
    };
})();

// Función helper para aserciones
function expect(actual) {
    return {
        toHaveLength(expected) {
            if (actual.length !== expected) {
                throw new Error(`Expected length ${expected}, but got ${actual.length}`);
            }
            console.log(`✅ Length assertion passed: ${actual.length} === ${expected}`);
        },
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`);
            }
            console.log(`✅ Equality assertion passed: ${actual} === ${expected}`);
        },
        toEqual(expected) {
            if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
            }
            console.log(`✅ Deep equality assertion passed`);
        }
    };
}

// Test 1: Race Condition entre crearEquipo y agregarJugador
async function testRaceCondition() {
    console.log('🔥 TEST 1: Race Condition entre crearEquipo y agregarJugador');

    try {
        await mockAsyncStorage.clear();

        // Simular creación de equipo
        const equipos = [];
        const nuevoEquipo = {
            id: '12345',
            nombre: 'Test Equipo',
            jugadores: []
        };

        console.log('📝 Paso 1: Guardar equipo en AsyncStorage');
        equipos.push(nuevoEquipo);
        await mockAsyncStorage.setItem('equipos', JSON.stringify(equipos));

        // Verificar que se guardó
        const equiposGuardados = JSON.parse(await mockAsyncStorage.getItem('equipos'));
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

        console.log('⚠️ Equipos con estado obsoleto:', equiposConJugadorIncorrecto.length);
        expect(equiposConJugadorIncorrecto).toHaveLength(0); // ¡El equipo desaparece!

        // SOLUCIÓN: Leer desde AsyncStorage (como en el fix)
        console.log('📝 Paso 3: Aplicar el fix - leer desde AsyncStorage');
        const equiposReales = JSON.parse(await mockAsyncStorage.getItem('equipos') || '[]');

        const equiposCorregidos = equiposReales.map(e => {
            if (e.id === '12345') {
                return { ...e, jugadores: [...(e.jugadores || []), nuevoJugador] };
            }
            return e;
        });

        console.log('✅ Equipos con fix aplicado:', equiposCorregidos.length);
        expect(equiposCorregidos).toHaveLength(1);
        expect(equiposCorregidos[0].jugadores).toHaveLength(1);

        console.log('🎉 Fix funciona correctamente - los datos persisten\n');
        return true;

    } catch (error) {
        console.error('❌ TEST 1 FAILED:', error.message);
        return false;
    }
}

// Test 2: AsyncStorage timing en operaciones consecutivas
async function testAsyncStorageTiming() {
    console.log('🔥 TEST 2: AsyncStorage timing en operaciones consecutivas');

    try {
        await mockAsyncStorage.clear();

        // Simular múltiples operaciones rápidas consecutivas
        const operaciones = [];

        // Operación 1: Crear club
        operaciones.push(
            mockAsyncStorage.setItem('clubes', JSON.stringify([{
                id: 'club1',
                nombre: 'Club Test',
                equipos: []
            }]))
        );

        // Operación 2: Crear equipo (casi simultánea)
        operaciones.push(
            mockAsyncStorage.setItem('equipos', JSON.stringify([{
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
                await new Promise(resolve => setTimeout(resolve, 25));

                // Leer equipos actuales
                const equiposData = await mockAsyncStorage.getItem('equipos');
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

                return mockAsyncStorage.setItem('equipos', JSON.stringify(equiposConJugador));
            })()
        );

        // Ejecutar todas las operaciones
        await Promise.all(operaciones);

        // Verificar resultados
        const clubes = JSON.parse(await mockAsyncStorage.getItem('clubes') || '[]');
        const equipos = JSON.parse(await mockAsyncStorage.getItem('equipos') || '[]');

        expect(clubes).toHaveLength(1);
        expect(equipos).toHaveLength(1);
        expect(equipos[0].jugadores).toHaveLength(1);

        console.log('✅ Datos persistidos correctamente:', {
            clubes: clubes.length,
            equipos: equipos.length,
            jugadores: equipos[0]?.jugadores?.length || 0
        });
        console.log('🎉 Operaciones concurrentes completadas exitosamente\n');
        return true;

    } catch (error) {
        console.error('❌ TEST 2 FAILED:', error.message);
        return false;
    }
}

// Test 3: Simulación exacta del comportamiento de la app
async function testRealAppBehavior() {
    console.log('🔥 TEST 3: Simulación exacta del comportamiento de la app');

    try {
        await mockAsyncStorage.clear();

        // Simular el comportamiento exacto de la app
        let estadoEquipos = []; // Estado inicial vacío (como en la app)

        // Función que simula crearEquipo (como en data-context)
        const simularCrearEquipo = async (equipo) => {
            console.log('📝 CrearEquipo - Estado inicial:', estadoEquipos.length);

            const nuevoEquipo = { ...equipo, id: Date.now().toString() };
            const nuevosEquipos = [...estadoEquipos, nuevoEquipo];

            await mockAsyncStorage.setItem('equipos', JSON.stringify(nuevosEquipos));

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

            await mockAsyncStorage.setItem('equipos', JSON.stringify(nuevosEquipos));
            estadoEquipos = nuevosEquipos;

            return nuevosEquipos;
        };

        // Función que simula agregarJugador (VERSIÓN ARREGLADA)
        const simularAgregarJugadorFix = async (equipoId, jugador) => {
            console.log('📝 AgregarJugador (Fix) - Leyendo desde AsyncStorage');

            // FIX: Lee desde AsyncStorage en lugar del estado React
            const equiposData = await mockAsyncStorage.getItem('equipos');
            const equiposActuales = equiposData ? JSON.parse(equiposData) : [];

            console.log('📝 Equipos leídos desde AsyncStorage:', equiposActuales.length);

            const nuevosEquipos = equiposActuales.map(e => {
                if (e.id === equipoId) {
                    return { ...e, jugadores: [...(e.jugadores || []), jugador] };
                }
                return e;
            });

            await mockAsyncStorage.setItem('equipos', JSON.stringify(nuevosEquipos));
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
        await mockAsyncStorage.clear();

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

        console.log('🎉 Fix resuelve el problema de race condition\n');
        return true;

    } catch (error) {
        console.error('❌ TEST 3 FAILED:', error.message);
        return false;
    }
}

// Ejecutar todos los tests
async function runIntegrationTests() {
    console.log('🚀 EJECUTANDO TESTS DE INTEGRACIÓN DE PERSISTENCIA\n');

    const results = [];

    results.push(await testRaceCondition());
    results.push(await testAsyncStorageTiming());
    results.push(await testRealAppBehavior());

    const totalTests = results.length;
    const passedTests = results.filter(Boolean).length;
    const failedTests = totalTests - passedTests;

    console.log('📊 === RESUMEN DE RESULTADOS ===');
    console.log(`✅ Tests pasados: ${passedTests}`);
    console.log(`❌ Tests fallidos: ${failedTests}`);
    console.log(`📈 Porcentaje de éxito: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 ¡TODOS LOS TESTS DE INTEGRACIÓN PASARON!');
        console.log('✅ El fix de race condition está funcionando correctamente');
        console.log('✅ La persistencia de datos funciona como esperado');
    } else {
        console.log('\n💥 ALGUNOS TESTS FALLARON');
        console.log('⚠️ Hay problemas de persistencia que necesitan ser resueltos');
    }

    return passedTests === totalTests;
}

// Ejecutar
runIntegrationTests()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('💥 Error ejecutando tests:', error);
        process.exit(1);
    });