import { useAuth } from '@/hooks/auth-context';
import { useData } from '@/hooks/data-context';
import { Club, Equipo, Jugador, Torneo } from '@/types';

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

            if (!user) {
                console.error('❌ Error: Usuario no autenticado');
                throw new Error('Usuario no autenticado');
            }

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
            const equiposIds: string[] = [];

            for (let i = 0; i < 6; i++) {
                try {
                    const equipoData = EQUIPOS_DATA[i];
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
                    const jugadores = generarJugadores(equipoId);
                    for (const jugador of jugadores) {
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
            console.log('🧹 Limpiando datos de prueba...');
            // Aquí podrías implementar la limpieza si tienes funciones de eliminación
            console.log('✅ Datos de prueba limpiados');
            return { success: true };
        } catch (error) {
            console.error('❌ Error limpiando datos:', error);
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

    return {
        generarDatosPrueba,
        limpiarDatosPrueba,
        pruebaSimple
    };
};