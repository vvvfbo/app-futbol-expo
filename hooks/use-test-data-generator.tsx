import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { Club, Equipo, Jugador, Torneo } from '@/types';
import { OptimizedStorage } from '../utils/supercomputer-optimization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTestDataGenerator = () => {
    const { crearClub, crearEquipo, agregarJugador, crearTorneo, inscribirEquipoEnTorneo, crearPartidos } = useData();
    const { user } = useAuth();

    const EQUIPOS_DATA = [
        { nombre: "Real Madrid", colores: { principal: "#FFFFFF", secundario: "#000080" } },
        { nombre: "FC Barcelona", colores: { principal: "#A50044", secundario: "#004D98" } },
        { nombre: "Atlético Madrid", colores: { principal: "#CE3524", secundario: "#FFFFFF" } },
        { nombre: "Valencia CF", colores: { principal: "#FF7900", secundario: "#FFFFFF" } },
        { nombre: "Sevilla FC", colores: { principal: "#D40000", secundario: "#FFFFFF" } },
        { nombre: "Real Betis", colores: { principal: "#00954C", secundario: "#FFFFFF" } },
        { nombre: "Athletic Bilbao", colores: { principal: "#EE2523", secundario: "#FFFFFF" } },
        { nombre: "Real Sociedad", colores: { principal: "#003d82", secundario: "#FFFFFF" } }
    ];

    const JUGADORES_NOMBRES = [
        "Alejandro García", "Miguel Rodríguez", "David López", "Sergio Martín",
        "Carlos Sánchez", "Javier Pérez", "Antonio González", "Manuel Fernández",
        "Francisco Jiménez", "Rafael Ruiz", "Pablo Moreno", "Adrián Muñoz",
        "Álvaro Romero", "Diego Navarro", "Lucas Torres", "Mario Domínguez",
        "Iván Vázquez", "Hugo Ramos", "Nicolás Gil", "Bruno Ortega"
    ];

    const generarJugadores = (equipoId: string, cantidad: number = 15) => {
        const jugadores: Omit<Jugador, 'id' | 'equipoId' | 'fechaRegistro'>[] = [];

        for (let i = 0; i < cantidad; i++) {
            const nombre = JUGADORES_NOMBRES[Math.floor(Math.random() * JUGADORES_NOMBRES.length)];
            const numero = i + 1;
            const posiciones = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'] as const;
            const posicion = posiciones[Math.floor(Math.random() * posiciones.length)];

            jugadores.push({
                nombre: `${nombre} ${numero}`,
                numero,
                posicion,
                edad: Math.floor(Math.random() * 15) + 16 // 16-30 años
            });
        }

        return jugadores;
    };

    const verificarDatos = async () => {
        try {
            console.log('🔍 === VERIFICACIÓN COMPLETA DE DATOS ===');

            // Verificar AsyncStorage directamente
            const keys = ['clubes', 'equipos', 'jugadores', 'torneos', 'partidos'];
            let totalDatos = 0;

            for (const key of keys) {
                const data = await OptimizedStorage.getItem(key);
                if (data) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`✅ ${key}: ${parsed.length} elementos`);
                        totalDatos += parsed.length;

                        // Mostrar detalles de los primeros elementos
                        if (parsed.length > 0 && (key === 'clubes' || key === 'equipos')) {
                            console.log(`  └ Primer elemento de ${key}:`, parsed[0].nombre || parsed[0].id);
                        }
                    } catch (parseError) {
                        const errorMessage = parseError instanceof Error ? parseError.message : 'Error desconocido';
                        console.error(`❌ ${key}: DATOS CORRUPTOS - ${errorMessage}`);
                        console.error(`📄 Contenido crudo de ${key}:`, data.substring(0, 100) + '...');
                        console.log(`🔧 Recomendación: Ejecutar limpieza de datos para eliminar ${key} corrupto`);
                    }
                } else {
                    console.log(`📦 ${key}: No existe`);
                }
            }

            // Verificar TODAS las claves para detectar más corrupción
            console.log('🔍 === DIAGNÓSTICO COMPLETO DE ASYNCSTORAGE ===');
            try {
                const allKeys = await AsyncStorage.getAllKeys();
                console.log(`📋 Total claves en AsyncStorage: ${allKeys.length}`);

                for (const key of allKeys) {
                    const value = await OptimizedStorage.getItem(key);
                    if (value) {
                        try {
                            JSON.parse(value);
                            console.log(`✅ ${key}: JSON válido`);
                        } catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                            console.error(`❌ ${key}: JSON INVÁLIDO - ${errorMessage}`);
                            console.log(`📄 Contenido: ${value.substring(0, 50)}...`);
                        }
                    }
                }
            } catch (allKeysError) {
                console.error('❌ Error obteniendo todas las claves:', allKeysError);
            }

            // Verificar usuario actual
            console.log('👤 Usuario actual:', user?.nombre, `(${user?.id})`);
            console.log('📊 Total datos en sistema:', totalDatos);

            return {
                success: true,
                data: { totalDatos, message: totalDatos > 0 ? '¡Datos encontrados!' : 'No hay datos' }
            };
        } catch (error) {
            console.error('❌ Error verificando datos:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    };

    const generarDatosPrueba = async () => {
        try {
            console.log('🚀 Iniciando generación de datos de prueba...');
            console.log('👤 Usuario actual:', user);
            console.log('🔧 Funciones disponibles:', {
                crearClub: typeof crearClub,
                crearEquipo: typeof crearEquipo,
                agregarJugador: typeof agregarJugador,
                crearTorneo: typeof crearTorneo
            });

            console.log('🔐 Verificando autenticación...');
            if (!user) {
                console.error('❌ Error: Usuario no autenticado');
                throw new Error('Usuario no autenticado');
            }
            console.log('✅ Usuario autenticado correctamente');

            // 1. Crear club
            console.log('🏢 Creando club...');
            const clubData: Omit<Club, 'id'> = {
                nombre: "Club Deportivo Prueba",
                ubicacion: {
                    direccion: "Calle Deporte, 123",
                    ciudad: "Madrid"
                },
                email: "info@clubprueba.com",
                telefono: "+34 123 456 789",
                entrenadorId: user.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: "Club generado automáticamente para pruebas",
                categorias: {}
            };

            console.log('🏢 Intentando crear club con datos:', clubData);
            const clubId = await crearClub(clubData);
            console.log('✅ Club creado exitosamente:', clubId);

            // 2. Crear equipos
            console.log('👥 Creando equipos...');
            console.log('📋 EQUIPOS_DATA disponibles:', EQUIPOS_DATA.length);
            console.log('🔧 crearEquipo function:', typeof crearEquipo);
            const equiposIds: string[] = [];

            console.log('🔄 Iniciando bucle de creación de equipos...');
            for (let i = 0; i < 6; i++) {
                console.log(`🔄 Iteración ${i + 1}/6`);
                const equipoData = EQUIPOS_DATA[i];
                try {
                    console.log(`⚽ Creando equipo ${i + 1}/6: ${equipoData.nombre}`);

                    const nuevoEquipo: Omit<Equipo, 'id' | 'fechaCreacion'> = {
                        nombre: equipoData.nombre,
                        categoria: (['Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Senior'] as const)[i % 6],
                        ciudad: "Madrid",
                        colores: equipoData.colores,
                        entrenadorId: user.id,
                        clubId: clubId,
                        jugadores: []
                    };

                    console.log(`🔧 Datos del equipo ${equipoData.nombre}:`, nuevoEquipo);
                    const equipoId = await crearEquipo(nuevoEquipo);
                    console.log(`✅ Equipo ${equipoData.nombre} creado con ID:`, equipoId);
                    equiposIds.push(equipoId);

                    // Agregar jugadores al equipo
                    console.log(`👥 Generando ${15} jugadores para ${equipoData.nombre}...`);
                    const jugadores = generarJugadores(equipoId);
                    console.log(`📝 Agregando jugadores uno por uno...`);
                    for (let j = 0; j < jugadores.length; j++) {
                        const jugador = jugadores[j];
                        console.log(`  └ Jugador ${j + 1}/${jugadores.length}: ${jugador.nombre}`);
                        await agregarJugador(equipoId, jugador);
                    }
                    console.log(`✅ ${jugadores.length} jugadores agregados a ${equipoData.nombre}`);
                } catch (equipoError) {
                    console.error(`❌ Error creando equipo ${equipoData.nombre}:`, equipoError);
                    // Continuamos con el siguiente equipo
                }
            }

            // 3. Crear torneo
            console.log('🏆 Creando torneo...');
            const fechaInicio = new Date();
            fechaInicio.setDate(fechaInicio.getDate() + 7); // Empieza en una semana

            const fechaFin = new Date(fechaInicio);
            fechaFin.setMonth(fechaFin.getMonth() + 2); // Dura 2 meses

            const torneoData: Omit<Torneo, 'id' | 'fechaCreacion'> = {
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
                creadorId: user.id,
                equiposIds: [],
                estado: 'Próximo',
                configuracion: {
                    puntosVictoria: 3,
                    puntosEmpate: 1,
                    puntosDerrota: 0,
                    tiempoPartido: 90,
                    descanso: 15,
                    permitirEmpates: true
                },

            };

            const torneoId = await crearTorneo(torneoData);
            console.log('✅ Torneo creado:', torneoId);

            // 4. Inscribir equipos en el torneo
            console.log('📝 Inscribiendo equipos en torneo...');
            for (const equipoId of equiposIds) {
                await inscribirEquipoEnTorneo(torneoId, equipoId);
                console.log(`✅ Equipo inscrito: ${equipoId}`);
            }

            // 5. Crear partidos
            console.log('⚽ Generando calendario de partidos...');
            const partidos = [];

            for (let i = 0; i < equiposIds.length; i++) {
                for (let j = i + 1; j < equiposIds.length; j++) {
                    const fechaPartido = new Date(fechaInicio);
                    fechaPartido.setDate(fechaPartido.getDate() + Math.floor(Math.random() * 30));

                    partidos.push({
                        torneoId,
                        equipoLocalId: equiposIds[i],
                        equipoVisitanteId: equiposIds[j],
                        fecha: fechaPartido.toISOString().split('T')[0],
                        hora: `${Math.floor(Math.random() * 4) + 16}:00`, // Entre 16:00 y 19:00
                        jornada: Math.floor(partidos.length / 3) + 1,
                        estado: 'Pendiente' as const,
                        campoId: 'campo-1' // Campo por defecto
                    });
                }
            }

            await crearPartidos(partidos);
            console.log(`✅ ${partidos.length} partidos creados`);

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
            console.error('❌ Error generando datos de prueba:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    };

    const limpiarDatosPrueba = async () => {
        try {
            console.log('🧹 === LIMPIEZA FORZADA DE ASYNCSTORAGE ===');

            // Lista de todas las claves que pueden tener datos corruptos
            const keys = [
                'clubes',
                'equipos',
                'torneos',
                'partidos',
                'jugadores',
                'test-key', // Esta es la clave corrupta detectada
                'user-data',
                'app-data'
            ];

            console.log('🔍 Limpiando claves:', keys);

            for (const key of keys) {
                try {
                    console.log(`🗑️ Eliminando clave: ${key}`);
                    await AsyncStorage.removeItem(key);
                    console.log(`✅ Clave ${key} eliminada`);
                } catch (keyError) {
                    console.log(`⚠️ Error eliminando ${key}:`, keyError);
                    // Continuar con las demás claves
                }
            }

            // Limpiar TODAS las claves (método nuclear)
            console.log('💣 Ejecutando limpieza nuclear de AsyncStorage...');
            try {
                const allKeys = await AsyncStorage.getAllKeys();
                console.log('📋 Todas las claves encontradas:', allKeys);

                if (allKeys.length > 0) {
                    await AsyncStorage.multiRemove(allKeys);
                    console.log('🧨 TODAS las claves eliminadas');
                }
            } catch (nuclearError) {
                console.error('💥 Error en limpieza nuclear:', nuclearError);
            }

            // Verificar limpieza
            console.log('🔍 Verificando limpieza...');
            const remainingKeys = await AsyncStorage.getAllKeys();
            console.log('📄 Claves restantes:', remainingKeys);

            console.log('✅ === LIMPIEZA COMPLETADA ===');
            return {
                success: true,
                message: `Limpieza completada. ${keys.length} claves procesadas.`,
                remainingKeys: remainingKeys.length
            };
        } catch (error) {
            console.error('❌ Error en limpieza:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
        }
    };

    const pruebaSimple = async () => {
        try {
            console.log('🧪 PRUEBA SIMPLE: Solo crear un club...');

            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            const clubSimple: Omit<Club, 'id'> = {
                nombre: "Club Prueba Simple",
                ubicacion: {
                    direccion: "Calle Test, 123",
                    ciudad: "Madrid"
                },
                email: "test@clubsimple.com",
                telefono: "+34 123 456 789",
                entrenadorId: user.id,
                fechaCreacion: new Date().toISOString(),
                descripcion: "Club de prueba simple",
                categorias: {}
            };

            console.log('🏢 Creando club simple...');
            const clubId = await crearClub(clubSimple);
            console.log('✅ Club simple creado exitosamente:', clubId);

            return {
                success: true,
                data: { clubId, mensaje: 'Club simple creado correctamente' }
            };

        } catch (error) {
            console.error('❌ Error en prueba simple:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    };

    const probarPersistencia = async () => {
        try {
            console.log('🧪 === PRUEBA DE PERSISTENCIA EN TIEMPO REAL ===');

            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Paso 1: Crear un club
            console.log('📝 Paso 1: Creando club...');
            const clubData: Omit<Club, 'id'> = {
                nombre: `Club Persistencia ${Date.now()}`,
                ubicacion: { direccion: "Test", ciudad: "Madrid" },
                entrenadorId: user.id,
                fechaCreacion: new Date().toISOString(),
                categorias: {}
            };

            const clubId = await crearClub(clubData);
            console.log('✅ Club creado con ID:', clubId);

            // Verificar inmediatamente en AsyncStorage
            await new Promise(resolve => setTimeout(resolve, 100));
            const clubesEnStorage = await OptimizedStorage.getItem('clubes');
            const clubesParsed = clubesEnStorage ? JSON.parse(clubesEnStorage) : [];
            console.log('📦 Clubes en AsyncStorage después de crear:', clubesParsed.length);

            // Paso 2: Crear un equipo inmediatamente
            console.log('📝 Paso 2: Creando equipo inmediatamente...');
            const equipoData: Omit<Equipo, 'id' | 'fechaCreacion'> = {
                nombre: `Equipo Persistencia ${Date.now()}`,
                categoria: 'Senior',
                ciudad: 'Madrid',
                colores: { principal: '#FF0000', secundario: '#FFFFFF' },
                entrenadorId: user.id,
                clubId: clubId,
                jugadores: []
            };

            const equipoId = await crearEquipo(equipoData);
            console.log('✅ Equipo creado con ID:', equipoId);

            // Verificar inmediatamente en AsyncStorage
            await new Promise(resolve => setTimeout(resolve, 100));
            const equiposEnStorage = await OptimizedStorage.getItem('equipos');
            const equiposParsed = equiposEnStorage ? JSON.parse(equiposEnStorage) : [];
            console.log('📦 Equipos en AsyncStorage después de crear:', equiposParsed.length);

            // Paso 3: Agregar jugador inmediatamente (aquí es donde fallaba antes)
            console.log('📝 Paso 3: Agregando jugador inmediatamente...');
            const jugadorData = {
                nombre: `Jugador Persistencia ${Date.now()}`,
                numero: 10,
                posicion: 'Delantero' as const,
                edad: 25
            };

            await agregarJugador(equipoId, jugadorData);
            console.log('✅ Jugador agregado');

            // Verificar final en AsyncStorage
            await new Promise(resolve => setTimeout(resolve, 200));
            const equiposFinales = await OptimizedStorage.getItem('equipos');
            const equiposFinalesParsed = equiposFinales ? JSON.parse(equiposFinales) : [];

            console.log('📦 Verificación final:', {
                equiposTotal: equiposFinalesParsed.length,
                equipoEncontrado: equiposFinalesParsed.find((e: any) => e.id === equipoId),
                jugadoresDelEquipo: equiposFinalesParsed.find((e: any) => e.id === equipoId)?.jugadores?.length || 0
            });

            const equipoCreado = equiposFinalesParsed.find((e: any) => e.id === equipoId);
            const jugadoresCount = equipoCreado?.jugadores?.length || 0;

            if (jugadoresCount === 0) {
                throw new Error('❌ RACE CONDITION DETECTADO: El jugador se perdió');
            }

            return {
                success: true,
                data: {
                    clubId,
                    equipoId,
                    jugadoresAgregados: jugadoresCount,
                    mensaje: '✅ Persistencia funciona correctamente - No hay race conditions'
                }
            };

        } catch (error) {
            console.error('❌ Error en prueba de persistencia:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido'
            };
        }
    };

    // Funciones adicionales requeridas por los tests
    const generateTestData = async () => {
        return await generarDatosPrueba();
    };

    const clearAllData = async () => {
        return await limpiarDatosPrueba();
    };

    const MOCK_USERS = [
        { id: '1', email: 'admin@futbolapp.com', name: 'Admin Test' },
        { id: '2', email: 'test@futbolapp.com', name: 'Test User' },
        { id: '3', email: 'user@example.com', name: 'Example User' }
    ];

    return {
        generarDatosPrueba,
        limpiarDatosPrueba,
        pruebaSimple,
        verificarDatos,
        probarPersistencia,
        // Funciones adicionales para tests
        generateTestData,
        clearAllData,
        MOCK_USERS
    };
};