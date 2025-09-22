import { useAuth } from './auth-context';
import { useData } from './data-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Club, Equipo, Jugador } from '@/types';

export const useComprehensiveTester = () => {
    const { user } = useAuth();
    const { 
        crearClub, 
        crearEquipo, 
        agregarJugador, 
        crearTorneo, 
        inscribirEquipoEnTorneo, 
        crearPartidos,
        clubes,
        equipos,
        torneos,
        partidos
    } = useData();

    const logSection = (title: string) => {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🔍 ${title}`);
        console.log(`${'='.repeat(50)}`);
    };

    const testAsyncStorage = async () => {
        logSection('TEST 1: AsyncStorage Básico');
        
        try {
            // Test de escritura
            console.log('📝 Probando escritura en AsyncStorage...');
            await AsyncStorage.setItem('test-key', 'test-value');
            console.log('✅ Escritura exitosa');

            // Test de lectura
            console.log('📖 Probando lectura de AsyncStorage...');
            const value = await AsyncStorage.getItem('test-key');
            console.log('📖 Valor leído:', value);
            
            if (value === 'test-value') {
                console.log('✅ AsyncStorage funciona correctamente');
                return true;
            } else {
                console.log('❌ AsyncStorage no devuelve el valor correcto');
                return false;
            }
        } catch (error) {
            console.error('❌ Error en AsyncStorage:', error);
            return false;
        }
    };

    const testAuth = () => {
        logSection('TEST 2: Autenticación');
        
        console.log('👤 Usuario actual:', user);
        console.log('🔍 Tipo de usuario:', typeof user);
        console.log('🔍 Usuario existe:', !!user);
        console.log('🔍 Usuario ID:', user?.id);
        console.log('🔍 Usuario nombre:', user?.nombre);
        console.log('🔍 Usuario rol:', user?.rol);
        
        if (user && user.id && user.nombre) {
            console.log('✅ Autenticación OK');
            return true;
        } else {
            console.log('❌ Usuario no autenticado correctamente');
            return false;
        }
    };

    const testFunctionAvailability = () => {
        logSection('TEST 3: Disponibilidad de Funciones');
        
        const functions = {
            crearClub: typeof crearClub,
            crearEquipo: typeof crearEquipo,
            agregarJugador: typeof agregarJugador,
            crearTorneo: typeof crearTorneo,
            inscribirEquipoEnTorneo: typeof inscribirEquipoEnTorneo,
            crearPartidos: typeof crearPartidos
        };

        console.log('🔍 Funciones disponibles:', functions);
        
        const allFunctionsAvailable = Object.entries(functions).every(([name, type]) => {
            const isFunction = type === 'function';
            console.log(`${isFunction ? '✅' : '❌'} ${name}: ${type}`);
            return isFunction;
        });

        if (allFunctionsAvailable) {
            console.log('✅ Todas las funciones están disponibles');
            return true;
        } else {
            console.log('❌ Algunas funciones no están disponibles');
            return false;
        }
    };

    const testDataContext = () => {
        logSection('TEST 4: Estado del Data Context');
        
        console.log('📊 Estado actual del data context:');
        console.log('🏢 Clubes:', clubes?.length || 0, 'elementos');
        console.log('⚽ Equipos:', equipos?.length || 0, 'elementos');
        console.log('🏆 Torneos:', torneos?.length || 0, 'elementos');
        console.log('📅 Partidos:', partidos?.length || 0, 'elementos');
        
        console.log('🔍 Tipos de datos:');
        console.log('clubes type:', typeof clubes);
        console.log('equipos type:', typeof equipos);
        console.log('torneos type:', typeof torneos);
        console.log('partidos type:', typeof partidos);
        
        return true;
    };

    const testCreateClub = async () => {
        logSection('TEST 5: Crear Club');
        
        if (!user) {
            console.log('❌ No hay usuario autenticado');
            return false;
        }

        try {
            const testClub: Omit<Club, 'id'> = {
                nombre: `Club Test ${Date.now()}`,
                ubicacion: {
                    direccion: "Calle Test, 123",
                    ciudad: "Madrid"
                },
                email: `test${Date.now()}@clubtest.com`,
                telefono: "+34 123 456 789",
                entrenadorId: user.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: "Club de prueba para testing",
                categorias: {}
            };

            console.log('🏢 Intentando crear club:', testClub.nombre);
            console.log('🔧 Datos del club:', testClub);
            
            const clubId = await crearClub(testClub);
            
            console.log('📝 Club creado con ID:', clubId);
            console.log('🔍 Tipo de ID:', typeof clubId);
            console.log('🔍 ID existe:', !!clubId);
            
            if (clubId && typeof clubId === 'string') {
                console.log('✅ Club creado exitosamente');
                return { success: true, id: clubId };
            } else {
                console.log('❌ Club no creado correctamente');
                return { success: false, error: 'ID no válido' };
            }
        } catch (error) {
            console.error('❌ Error creando club:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    };

    const testCreateEquipo = async (clubId?: string) => {
        logSection('TEST 6: Crear Equipo');
        
        if (!user) {
            console.log('❌ No hay usuario autenticado');
            return false;
        }

        // Si no se proporciona clubId, usar uno por defecto
        const useClubId = clubId || 'club-test-default';
        console.log('🏢 Usando Club ID:', useClubId);

        try {
            const testEquipo: Omit<Equipo, 'id' | 'fechaCreacion'> = {
                nombre: `Equipo Test ${Date.now()}`,
                categoria: 'Senior',
                ciudad: "Madrid",
                colores: {
                    principal: "#FF0000",
                    secundario: "#FFFFFF"
                },
                entrenadorId: user.id,
                clubId: useClubId,
                jugadores: []
            };

            console.log('⚽ Intentando crear equipo:', testEquipo.nombre);
            console.log('🔧 Datos del equipo:', testEquipo);
            console.log('🔧 Función crearEquipo disponible:', typeof crearEquipo);
            
            const equipoId = await crearEquipo(testEquipo);
            
            console.log('📝 Equipo creado con ID:', equipoId);
            console.log('🔍 Tipo de ID:', typeof equipoId);
            console.log('🔍 ID existe:', !!equipoId);
            
            if (equipoId && typeof equipoId === 'string') {
                console.log('✅ Equipo creado exitosamente');
                return { success: true, id: equipoId };
            } else {
                console.log('❌ Equipo no creado correctamente');
                return { success: false, error: 'ID no válido' };
            }
        } catch (error) {
            console.error('❌ Error creando equipo:', error);
            console.error('❌ Error tipo:', typeof error);
            console.error('❌ Error stack:', error instanceof Error ? error.stack : 'Sin stack');
            return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    };

    const testCreateJugador = async (equipoId?: string) => {
        logSection('TEST 7: Crear Jugador');
        
        const useEquipoId = equipoId || 'equipo-test-default';
        console.log('⚽ Usando Equipo ID:', useEquipoId);

        try {
            const testJugador: Omit<Jugador, 'id' | 'equipoId' | 'fechaRegistro'> = {
                nombre: `Jugador Test ${Date.now()}`,
                numero: Math.floor(Math.random() * 99) + 1,
                posicion: "Delantero",
                edad: 25,
                altura: 180,
                peso: 75,
                piePredominante: "Derecho"
            };

            console.log('👤 Intentando crear jugador:', testJugador.nombre);
            console.log('🔧 Datos del jugador:', testJugador);
            
            await agregarJugador(useEquipoId, testJugador);
            
            console.log('✅ Jugador creado exitosamente');
            return { success: true };
        } catch (error) {
            console.error('❌ Error creando jugador:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    };

    const verifyAsyncStorageData = async () => {
        logSection('TEST 8: Verificar Datos en AsyncStorage');
        
        try {
            const keys = ['clubes', 'equipos', 'jugadores', 'torneos', 'partidos'];
            
            for (const key of keys) {
                const data = await AsyncStorage.getItem(key);
                if (data) {
                    const parsedData = JSON.parse(data);
                    console.log(`📦 ${key}: ${parsedData.length} elementos`);
                    if (parsedData.length > 0) {
                        console.log(`🔍 Primer elemento de ${key}:`, parsedData[0]);
                    }
                } else {
                    console.log(`📦 ${key}: No existe`);
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error verificando AsyncStorage:', error);
            return false;
        }
    };

    const runComprehensiveTest = async () => {
        logSection('🚀 INICIANDO TEST COMPREHENSIVO COMPLETO');
        
        const results = {
            asyncStorage: false,
            auth: false,
            functions: false,
            dataContext: false,
            createClub: false,
            createEquipo: false,
            createJugador: false,
            verifyStorage: false
        };

        try {
            // Test 1: AsyncStorage
            console.log('\n🔄 Ejecutando Test 1/8...');
            results.asyncStorage = await testAsyncStorage();
            
            // Test 2: Auth
            console.log('\n🔄 Ejecutando Test 2/8...');
            results.auth = testAuth();
            
            // Test 3: Functions
            console.log('\n🔄 Ejecutando Test 3/8...');
            results.functions = testFunctionAvailability();
            
            // Test 4: Data Context
            console.log('\n🔄 Ejecutando Test 4/8...');
            results.dataContext = testDataContext();
            
            // Test 5: Create Club
            console.log('\n🔄 Ejecutando Test 5/8...');
            const clubResult = await testCreateClub();
            results.createClub = typeof clubResult === 'object' && clubResult.success;
            const clubId = typeof clubResult === 'object' && clubResult.success ? clubResult.id : undefined;
            
            // Test 6: Create Equipo
            console.log('\n🔄 Ejecutando Test 6/8...');
            const equipoResult = await testCreateEquipo(clubId);
            results.createEquipo = typeof equipoResult === 'object' && equipoResult.success;
            const equipoId = typeof equipoResult === 'object' && equipoResult.success ? equipoResult.id : undefined;
            
            // Test 7: Create Jugador
            console.log('\n🔄 Ejecutando Test 7/8...');
            const jugadorResult = await testCreateJugador(equipoId);
            results.createJugador = typeof jugadorResult === 'object' && jugadorResult.success;
            
            // Test 8: Verify Storage
            console.log('\n🔄 Ejecutando Test 8/8...');
            results.verifyStorage = await verifyAsyncStorageData();
            
            // Resumen final
            logSection('📊 RESUMEN DE RESULTADOS');
            Object.entries(results).forEach(([test, success]) => {
                console.log(`${success ? '✅' : '❌'} ${test}: ${success ? 'PASÓ' : 'FALLÓ'}`);
            });
            
            const totalTests = Object.keys(results).length;
            const passedTests = Object.values(results).filter(Boolean).length;
            const percentage = Math.round((passedTests / totalTests) * 100);
            
            console.log(`\n📈 Resultado final: ${passedTests}/${totalTests} tests pasados (${percentage}%)`);
            
            if (percentage === 100) {
                console.log('🎉 ¡TODOS LOS TESTS PASARON!');
            } else if (percentage >= 75) {
                console.log('⚠️  La mayoría de tests pasaron, revisar los fallos');
            } else {
                console.log('💥 Múltiples fallos detectados, revisar configuración');
            }
            
            return results;
            
        } catch (error) {
            console.error('💥 Error durante el test comprehensivo:', error);
            return results;
        }
    };

    return {
        runComprehensiveTest,
        testAsyncStorage,
        testAuth,
        testFunctionAvailability,
        testDataContext,
        testCreateClub,
        testCreateEquipo,
        testCreateJugador,
        verifyAsyncStorageData
    };
};