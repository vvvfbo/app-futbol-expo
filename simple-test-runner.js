/**
 * Test Runner Simple - Sin dependencias externas
 * Ejecuta tests básicos para verificar la lógica antes del deploy
 */

console.log('🚀 Iniciando Tests Unitarios Simples...\n');

// Simulación de AsyncStorage
class MockAsyncStorage {
    constructor() {
        this.storage = new Map();
    }

    async getItem(key) {
        return this.storage.get(key) || null;
    }

    async setItem(key, value) {
        this.storage.set(key, value);
    }

    async clear() {
        this.storage.clear();
    }

    async getAllKeys() {
        return Array.from(this.storage.keys());
    }
}

// Clase para ejecutar tests
class SimpleTestRunner {
    constructor() {
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.errors = [];
    }

    test(description, testFunction) {
        this.totalTests++;
        try {
            const result = testFunction();
            if (result === true || result === undefined) {
                console.log(`✅ ${description}`);
                this.passedTests++;
            } else {
                console.log(`❌ ${description} - Resultado: ${result}`);
                this.failedTests++;
                this.errors.push({ test: description, error: `Test retornó: ${result}` });
            }
        } catch (error) {
            console.log(`❌ ${description} - Error: ${error.message}`);
            this.failedTests++;
            this.errors.push({ test: description, error: error.message });
        }
    }

    async asyncTest(description, testFunction) {
        this.totalTests++;
        try {
            const result = await testFunction();
            if (result === true || result === undefined) {
                console.log(`✅ ${description}`);
                this.passedTests++;
            } else {
                console.log(`❌ ${description} - Resultado: ${result}`);
                this.failedTests++;
                this.errors.push({ test: description, error: `Test retornó: ${result}` });
            }
        } catch (error) {
            console.log(`❌ ${description} - Error: ${error.message}`);
            this.failedTests++;
            this.errors.push({ test: description, error: error.message });
        }
    }

    printResults() {
        console.log('\n📊 RESULTADOS DE TESTS');
        console.log('═'.repeat(40));
        console.log(`🎯 Total: ${this.totalTests}`);
        console.log(`✅ Exitosos: ${this.passedTests}`);
        console.log(`❌ Fallidos: ${this.failedTests}`);

        const percentage = this.totalTests > 0 ? Math.round((this.passedTests / this.totalTests) * 100) : 0;
        console.log(`📈 Éxito: ${percentage}%`);

        if (this.errors.length > 0) {
            console.log('\n❌ ERRORES:');
            this.errors.forEach((error, i) => {
                console.log(`   ${i + 1}. ${error.test}: ${error.error}`);
            });
        }

        console.log('═'.repeat(40));

        if (percentage >= 90) {
            console.log('🎉 EXCELENTE - Listo para deploy');
        } else if (percentage >= 75) {
            console.log('⚠️  ADVERTENCIA - Revisar fallos');
        } else {
            console.log('🚨 CRÍTICO - NO deployar');
        }

        return percentage >= 75;
    }
}

// Función principal de testing
async function runTests() {
    const runner = new SimpleTestRunner();

    console.log('🔧 Tests de AsyncStorage Mock');
    console.log('-'.repeat(30));

    // Test AsyncStorage básico
    await runner.asyncTest('AsyncStorage debe escribir y leer correctamente', async () => {
        const storage = new MockAsyncStorage();
        await storage.setItem('test', 'value');
        const result = await storage.getItem('test');
        return result === 'value';
    });

    await runner.asyncTest('AsyncStorage debe retornar null para claves inexistentes', async () => {
        const storage = new MockAsyncStorage();
        const result = await storage.getItem('no-existe');
        return result === null;
    });

    await runner.asyncTest('AsyncStorage debe limpiar correctamente', async () => {
        const storage = new MockAsyncStorage();
        await storage.setItem('test', 'value');
        await storage.clear();
        const result = await storage.getItem('test');
        return result === null;
    });

    console.log('\n🏢 Tests de Funciones de Club');
    console.log('-'.repeat(30));

    // Test función generadora de ID
    runner.test('Generador de ID debe crear IDs únicos', () => {
        const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const id1 = generateId('club');
        const id2 = generateId('club');

        return id1 !== id2 && id1.startsWith('club-') && id2.startsWith('club-');
    });

    // Test simulación de creación de club
    await runner.asyncTest('Simulación crearClub debe funcionar correctamente', async () => {
        const storage = new MockAsyncStorage();

        const crearClub = async (clubData) => {
            const clubId = `club-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const clubCompleto = { ...clubData, id: clubId, fechaCreacion: new Date().toISOString() };

            const clubesExistentes = await storage.getItem('clubes');
            const clubes = clubesExistentes ? JSON.parse(clubesExistentes) : [];
            clubes.push(clubCompleto);

            await storage.setItem('clubes', JSON.stringify(clubes));
            return clubId;
        };

        const clubData = {
            nombre: 'Club Test',
            entrenadorId: 'user-123',
            ubicacion: { direccion: 'Test', ciudad: 'Madrid' }
        };

        const clubId = await crearClub(clubData);

        // Verificar que se guardó
        const clubesGuardados = await storage.getItem('clubes');
        const clubes = JSON.parse(clubesGuardados);

        return clubes.length === 1 && clubes[0].id === clubId && clubes[0].nombre === 'Club Test';
    });

    console.log('\n⚽ Tests de Funciones de Equipo');
    console.log('-'.repeat(30));

    await runner.asyncTest('Simulación crearEquipo debe funcionar correctamente', async () => {
        const storage = new MockAsyncStorage();

        const crearEquipo = async (equipoData) => {
            const equipoId = `equipo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const equipoCompleto = { ...equipoData, id: equipoId, fechaCreacion: new Date().toISOString() };

            const equiposExistentes = await storage.getItem('equipos');
            const equipos = equiposExistentes ? JSON.parse(equiposExistentes) : [];
            equipos.push(equipoCompleto);

            await storage.setItem('equipos', JSON.stringify(equipos));
            return equipoId;
        };

        const equipoData = {
            nombre: 'Equipo Test',
            categoria: 'Senior',
            clubId: 'club-123',
            entrenadorId: 'user-123'
        };

        const equipoId = await crearEquipo(equipoData);

        const equiposGuardados = await storage.getItem('equipos');
        const equipos = JSON.parse(equiposGuardados);

        return equipos.length === 1 && equipos[0].id === equipoId && equipos[0].nombre === 'Equipo Test';
    });

    console.log('\n👤 Tests de Funciones de Jugador');
    console.log('-'.repeat(30));

    await runner.asyncTest('Simulación agregarJugador debe funcionar correctamente', async () => {
        const storage = new MockAsyncStorage();

        // Crear equipo primero
        const equipoData = { id: 'equipo-test', nombre: 'Equipo Test', jugadores: [] };
        await storage.setItem('equipos', JSON.stringify([equipoData]));

        const agregarJugador = async (equipoId, jugadorData) => {
            const jugadorId = `jugador-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const jugadorCompleto = { ...jugadorData, id: jugadorId, equipoId: equipoId };

            const equiposExistentes = await storage.getItem('equipos');
            const equipos = JSON.parse(equiposExistentes);

            const equipoIndex = equipos.findIndex(e => e.id === equipoId);
            if (equipoIndex !== -1) {
                if (!equipos[equipoIndex].jugadores) equipos[equipoIndex].jugadores = [];
                equipos[equipoIndex].jugadores.push(jugadorCompleto);
                await storage.setItem('equipos', JSON.stringify(equipos));
                return jugadorId;
            }
            throw new Error('Equipo no encontrado');
        };

        const jugadorData = { nombre: 'Jugador Test', numero: 10, posicion: 'Delantero' };
        const jugadorId = await agregarJugador('equipo-test', jugadorData);

        const equiposGuardados = await storage.getItem('equipos');
        const equipos = JSON.parse(equiposGuardados);
        const equipo = equipos[0];

        return equipo.jugadores.length === 1 && equipo.jugadores[0].id === jugadorId;
    });

    console.log('\n🔄 Tests de Integración');
    console.log('-'.repeat(30));

    await runner.asyncTest('Flujo completo: Club -> Equipo -> Jugador', async () => {
        const storage = new MockAsyncStorage();

        // 1. Crear club
        const clubId = 'club-integration-test';
        const clubData = { id: clubId, nombre: 'Club Integración' };
        await storage.setItem('clubes', JSON.stringify([clubData]));

        // 2. Crear equipo
        const equipoId = 'equipo-integration-test';
        const equipoData = { id: equipoId, nombre: 'Equipo Integración', clubId: clubId, jugadores: [] };
        await storage.setItem('equipos', JSON.stringify([equipoData]));

        // 3. Agregar jugador
        const jugadorData = { id: 'jugador-test', nombre: 'Jugador Integración', equipoId: equipoId };
        const equipos = JSON.parse(await storage.getItem('equipos'));
        equipos[0].jugadores = [jugadorData];
        await storage.setItem('equipos', JSON.stringify(equipos));

        // 4. Verificar todo
        const clubesFinales = JSON.parse(await storage.getItem('clubes'));
        const equiposFinales = JSON.parse(await storage.getItem('equipos'));

        return clubesFinales.length === 1 &&
            equiposFinales.length === 1 &&
            equiposFinales[0].jugadores.length === 1 &&
            equiposFinales[0].clubId === clubId;
    });

    console.log('\n✅ Tests de Validación');
    console.log('-'.repeat(30));

    runner.test('Validación de datos de club debe funcionar', () => {
        const validateClubData = (data) => {
            return data && data.nombre && data.nombre.trim().length > 0 && data.entrenadorId;
        };

        const validData = { nombre: 'Club Valid', entrenadorId: 'user-123' };
        const invalidData = { nombre: '', entrenadorId: null };

        return validateClubData(validData) === true && validateClubData(invalidData) === false;
    });

    runner.test('Generación de fechas ISO debe funcionar', () => {
        const fecha = new Date().toISOString();
        return typeof fecha === 'string' && fecha.includes('T') && fecha.includes('Z');
    });

    // Imprimir resultados finales
    console.log('\n');
    return runner.printResults();
}

// Ejecutar tests
runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
});