import { Categoria, Club, Equipo, EstadoAmistoso, Jugador, Partido, PartidoAmistoso, TipoTorneo, Torneo } from '../types';

// 🏆 Nombres de clubes realistas
const CLUBES_NOMBRES = [
    'Real Madrid CF', 'FC Barcelona', 'Atlético Madrid', 'Valencia CF',
    'Sevilla FC', 'Real Betis', 'Athletic Bilbao', 'Real Sociedad',
    'Villarreal CF', 'Celta de Vigo', 'RCD Espanyol', 'Getafe CF',
    'CA Osasuna', 'Rayo Vallecano', 'Elche CF', 'Cádiz CF'
];

// ⚽ Nombres de equipos para diferentes categorías
const EQUIPOS_NOMBRES = {
    juvenil: ['Juvenil A', 'Juvenil B', 'Juvenil C'],
    infantil: ['Infantil A', 'Infantil B', 'Infantil C'],
    cadete: ['Cadete A', 'Cadete B'],
    alevin: ['Alevín A', 'Alevín B'],
    benjamin: ['Benjamín A', 'Benjamín B'],
    prebenjamin: ['Pre-Benjamín A', 'Pre-Benjamín B']
};

// 👥 Pool de nombres realistas para jugadores
const NOMBRES_JUGADORES = [
    'Alejandro', 'Diego', 'Pablo', 'Carlos', 'Javier', 'Miguel', 'Antonio', 'Manuel',
    'Francisco', 'Daniel', 'David', 'José', 'Juan', 'Pedro', 'Sergio', 'Luis',
    'Iker', 'Adrián', 'Álvaro', 'Rubén', 'Marcos', 'Hugo', 'Mario', 'Víctor'
];

const APELLIDOS_JUGADORES = [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez',
    'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez',
    'Muñoz', 'Romero', 'Alonso', 'Gutierrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez'
];

// 🎨 Colores para equipos
const COLORES_EQUIPOS = [
    { principal: '#FF6B35', secundario: '#F7931E', nombre: 'Naranja' },
    { principal: '#4ECDC4', secundario: '#44A08D', nombre: 'Turquesa' },
    { principal: '#45B7D1', secundario: '#96CEB4', nombre: 'Azul' },
    { principal: '#FFA07A', secundario: '#FFE66D', nombre: 'Coral' },
    { principal: '#98D8C8', secundario: '#F7DC6F', nombre: 'Menta' },
    { principal: '#BB6BD9', secundario: '#C9C9FF', nombre: 'Púrpura' },
    { principal: '#FF7979', secundario: '#FDCB6E', nombre: 'Rojo' },
    { principal: '#6C5CE7', secundario: '#A29BFE', nombre: 'Violeta' },
    { principal: '#00B894', secundario: '#55EFC4', nombre: 'Verde' },
    { principal: '#E17055', secundario: '#FDCB6E', nombre: 'Terracota' }
];

// 🏟️ Nombres de campos realistas
const CAMPOS_NOMBRES = [
    'Santiago Bernabéu', 'Camp Nou', 'Metropolitano', 'Mestalla',
    'Ramón Sánchez Pizjuán', 'San Mamés', 'Reale Arena', 'La Cerámica',
    'Balaídos', 'Coliseum Alfonso Pérez', 'El Sadar', 'Vallecas'
];

export class DataGenerator {
    private getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private getRandomElements<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }

    private generateId(): string {
        return `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateNombreJugador(): string {
        const nombre = this.getRandomElement(NOMBRES_JUGADORES);
        const apellido = this.getRandomElement(APELLIDOS_JUGADORES);
        return `${nombre} ${apellido}`;
    }

    // 🏛️ Generar clubes
    generateClubes(cantidad: number = 8): Club[] {
        const clubes: Club[] = [];

        for (let i = 0; i < Math.min(cantidad, CLUBES_NOMBRES.length); i++) {
            const ciudadAleatoria = this.getRandomElement(['Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Bilbao', 'Málaga']);
            const club: Club = {
                id: this.generateId(),
                nombre: CLUBES_NOMBRES[i],
                ubicacion: {
                    direccion: `Calle ${this.getRandomElement(['Gran Vía', 'Castellana', 'Alcalá', 'Mayor'])}, ${Math.floor(Math.random() * 200 + 1)}`,
                    ciudad: ciudadAleatoria,
                    coordenadas: {
                        latitud: 40.4168 + (Math.random() - 0.5) * 0.1,
                        longitud: -3.7038 + (Math.random() - 0.5) * 0.1
                    }
                },
                telefono: `+34 ${Math.floor(Math.random() * 900 + 600)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`,
                email: `info@${CLUBES_NOMBRES[i].toLowerCase().replace(/\s+/g, '')}.com`,
                fechaCreacion: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                entrenadorId: 'test-user-123',
                categorias: {
                    juvenil: { nombre: 'Juvenil', equipos: [] },
                    cadete: { nombre: 'Cadete', equipos: [] },
                    infantil: { nombre: 'Infantil', equipos: [] }
                },
                estadisticas: {
                    totalEquipos: 0,
                    torneosParticipados: Math.floor(Math.random() * 5),
                    amistososJugados: Math.floor(Math.random() * 20)
                }
            };
            clubes.push(club);
        }

        return clubes;
    }

    // ⚽ Generar equipos para clubes
    generateEquipos(clubes: Club[], equiposPorClub: number = 2): Equipo[] {
        const equipos: Equipo[] = [];

        clubes.forEach(club => {
            for (let i = 0; i < equiposPorClub; i++) {
                const categoria = this.getRandomElement(Object.keys(EQUIPOS_NOMBRES));
                const nombreCategoria = this.getRandomElement(EQUIPOS_NOMBRES[categoria as keyof typeof EQUIPOS_NOMBRES]);
                const colores = this.getRandomElement(COLORES_EQUIPOS);

                const equipo: Equipo = {
                    id: this.generateId(),
                    nombre: `${club.nombre} ${nombreCategoria}`,
                    clubId: club.id,
                    categoria: this.getRandomElement(['Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Senior'] as Categoria[]),
                    colores: {
                        principal: colores.principal,
                        secundario: colores.secundario
                    },
                    escudo: '⚽',
                    entrenadorId: 'test-user-123',
                    jugadores: this.generateJugadores(18 + Math.floor(Math.random() * 8)), // 18-25 jugadores
                    fechaCreacion: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
                    ciudad: club.ubicacion.ciudad,
                    estadisticas: {
                        partidosJugados: 0,
                        partidosGanados: 0,
                        partidosEmpatados: 0,
                        partidosPerdidos: 0,
                        golesFavor: 0,
                        golesContra: 0,
                        torneosParticipados: 0,
                        torneosGanados: 0,
                        amistososJugados: 0,
                        amistososGanados: 0
                    }
                };

                equipos.push(equipo);

                // Agregar equipo a las categorías del club
                const categoriaClub = Object.keys(club.categorias)[Math.floor(Math.random() * Object.keys(club.categorias).length)];
                club.categorias[categoriaClub].equipos.push(equipo.id);
            }
        });

        return equipos;
    }

    // 👥 Generar jugadores
    private generateJugadores(cantidad: number): Jugador[] {
        const jugadores: Jugador[] = [];
        const posiciones: ('Portero' | 'Defensa' | 'Mediocampista' | 'Delantero')[] = ['Portero', 'Defensa', 'Mediocampista', 'Delantero'];

        for (let i = 0; i < cantidad; i++) {
            const jugador: Jugador = {
                id: this.generateId(),
                nombre: this.generateNombreJugador(),
                numero: i + 1,
                posicion: this.getRandomElement(posiciones),
                edad: 16 + Math.floor(Math.random() * 10), // 16-25 años
                equipoId: '', // Se asignará después
                fechaRegistro: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                estadisticas: {
                    partidosJugados: Math.floor(Math.random() * 20),
                    goles: Math.floor(Math.random() * 10),
                    asistencias: Math.floor(Math.random() * 8),
                    tarjetasAmarillas: Math.floor(Math.random() * 3),
                    tarjetasRojas: Math.floor(Math.random() * 1),
                    porteriasCero: Math.floor(Math.random() * 5)
                }
            };
            jugadores.push(jugador);
        }

        return jugadores;
    }

    // 🏆 Generar torneos
    generateTorneos(equipos: Equipo[], cantidad: number = 3): { torneos: Torneo[], partidos: Partido[] } {
        const torneos: Torneo[] = [];
        const allPartidos: Partido[] = [];

        for (let i = 0; i < cantidad; i++) {
            const tipoTorneo = this.getRandomElement(['grupos', 'eliminatorias', 'grupos-eliminatorias'] as TipoTorneo[]);
            const equiposParticipantes = this.getRandomElements(equipos, 6 + Math.floor(Math.random() * 6)); // 6-12 equipos

            const torneo: Torneo = {
                id: this.generateId(),
                nombre: `${this.getRandomElement(['Liga', 'Copa', 'Torneo'])} ${this.getRandomElement(['Primavera', 'Otoño', 'Invierno', 'Verano'])} 2024`,
                descripcion: `Competición ${tipoTorneo} con ${equiposParticipantes.length} equipos participantes`,
                ciudad: this.getRandomElement(['Madrid', 'Barcelona', 'Sevilla', 'Valencia']),
                categoria: this.getRandomElement(['Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Senior'] as Categoria[]),
                tipoFutbol: this.getRandomElement(['F11', 'F7', 'Sala']),
                maxEquipos: 16,
                minEquipos: 4,
                tipo: tipoTorneo,
                estado: Math.random() > 0.3 ? 'En curso' : 'Finalizado',
                fechaInicio: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
                fechaFin: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                equiposIds: equiposParticipantes.map(e => e.id),
                creadorId: 'test-user-123',
                fechaCreacion: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                configuracion: {
                    puntosVictoria: 3,
                    puntosEmpate: 1,
                    puntosDerrota: 0,
                    tiempoPartido: 90,
                    descanso: 15,
                    permitirEmpates: tipoTorneo !== 'eliminatorias',
                    equiposPorGrupo: tipoTorneo.includes('grupos') ? 4 : undefined,
                    clasificadosPorGrupo: tipoTorneo.includes('grupos') ? 2 : undefined
                }
            };

            torneos.push(torneo);

            // Generar partidos para el torneo
            const partidos = this.generatePartidos(torneo, equiposParticipantes);
            allPartidos.push(...partidos);
        }

        return { torneos, partidos: allPartidos };
    }

    // 📊 Generar clasificación
    private generateClasificacion(equipos: Equipo[]): any[] {
        return equipos.map((equipo, index) => ({
            equipoId: equipo.id,
            posicion: index + 1,
            puntos: Math.max(0, 30 - index * 3 + Math.floor(Math.random() * 10)),
            partidosJugados: 10 + Math.floor(Math.random() * 5),
            partidosGanados: Math.floor(Math.random() * 8),
            partidosEmpatados: Math.floor(Math.random() * 4),
            partidosPerdidos: Math.floor(Math.random() * 6),
            golesAFavor: 15 + Math.floor(Math.random() * 20),
            golesEnContra: 5 + Math.floor(Math.random() * 15),
            diferenciaGoles: Math.floor(Math.random() * 20) - 10
        }));
    }

    // 🥅 Generar tabla de goleadores
    private generateGoleadores(equipos: Equipo[]): any[] {
        const goleadores: any[] = [];

        equipos.forEach(equipo => {
            const jugadoresGoleadores = equipo.jugadores
                .filter(j => ['Delantero', 'Centrocampista'].includes(j.posicion))
                .slice(0, 2);

            jugadoresGoleadores.forEach(jugador => {
                if (Math.random() > 0.5) { // 50% probabilidad de tener goles
                    goleadores.push({
                        jugadorId: jugador.id,
                        equipoId: equipo.id,
                        goles: Math.floor(Math.random() * 12) + 1,
                        asistencias: Math.floor(Math.random() * 8),
                        partidosJugados: Math.floor(Math.random() * 10) + 5
                    });
                }
            });
        });

        return goleadores.sort((a, b) => b.goles - a.goles).slice(0, 10);
    }

    // ⚽ Generar partidos
    private generatePartidos(torneo: Torneo, equipos: Equipo[]): Partido[] {
        const partidos: Partido[] = [];
        const jornadas = Math.ceil(equipos.length - 1);

        // Generar fixture round-robin básico
        for (let jornada = 1; jornada <= jornadas; jornada++) {
            for (let i = 0; i < equipos.length / 2; i++) {
                if (i < equipos.length - 1 - i) {
                    const equipoLocal = equipos[i];
                    const equipoVisitante = equipos[equipos.length - 1 - i];

                    const fechaPartido = new Date(new Date(torneo.fechaInicio).getTime() + (jornada - 1) * 7 * 24 * 60 * 60 * 1000);
                    const horaPartido = `${15 + Math.floor(Math.random() * 4)}:${Math.random() > 0.5 ? '00' : '30'}`;

                    const esJugado = Math.random() > 0.3; // 70% de partidos jugados

                    const partido: Partido = {
                        id: this.generateId(),
                        torneoId: torneo.id,
                        equipoLocalId: equipoLocal.id,
                        equipoVisitanteId: equipoVisitante.id,
                        fecha: fechaPartido.toISOString().split('T')[0],
                        hora: horaPartido,
                        estado: esJugado ? 'Jugado' : 'Pendiente',
                        jornada,
                        campoId: this.generateId(), // Se podría conectar con campos reales
                        arbitroId: this.generateId(),
                        observaciones: '',
                        eventos: [],
                        goleadores: []
                    };

                    if (esJugado) {
                        // Generar resultado
                        partido.golesLocal = Math.floor(Math.random() * 5);
                        partido.golesVisitante = Math.floor(Math.random() * 5);

                        // Generar algunos eventos
                        partido.eventos = this.generateEventosPartido(partido, equipoLocal, equipoVisitante);
                    }

                    partidos.push(partido);
                }
            }

            // Rotar equipos para la siguiente jornada
            if (equipos.length > 2) {
                const ultimo = equipos.pop()!;
                equipos.splice(1, 0, ultimo);
            }
        }

        return partidos;
    }

    // 📝 Generar eventos de partido
    private generateEventosPartido(partido: Partido, equipoLocal: Equipo, equipoVisitante: Equipo): any[] {
        const eventos: any[] = [];
        const totalGoles = (partido.golesLocal || 0) + (partido.golesVisitante || 0);

        // Generar goles
        for (let i = 0; i < totalGoles; i++) {
            const esLocal = Math.random() < (partido.golesLocal || 0) / totalGoles;
            const equipo = esLocal ? equipoLocal : equipoVisitante;
            const jugador = this.getRandomElement(equipo.jugadores.filter(j => j.posicion !== 'Portero'));

            eventos.push({
                id: this.generateId(),
                tipo: 'gol',
                minuto: Math.floor(Math.random() * 90) + 1,
                jugadorId: jugador.id,
                equipoId: equipo.id,
                descripcion: `Gol de ${jugador.nombre}`
            });
        }

        // Generar algunas tarjetas
        const numTarjetas = Math.floor(Math.random() * 4);
        for (let i = 0; i < numTarjetas; i++) {
            const equipo = this.getRandomElement([equipoLocal, equipoVisitante]);
            const jugador = this.getRandomElement(equipo.jugadores);
            const tipoTarjeta = Math.random() > 0.8 ? 'tarjeta_roja' : 'tarjeta_amarilla';

            eventos.push({
                id: this.generateId(),
                tipo: tipoTarjeta,
                minuto: Math.floor(Math.random() * 90) + 1,
                jugadorId: jugador.id,
                equipoId: equipo.id,
                descripcion: `${tipoTarjeta.replace('_', ' ')} para ${jugador.nombre}`
            });
        }

        return eventos.sort((a, b) => a.minuto - b.minuto);
    }

    // 🤝 Generar partidos amistosos
    generateAmistosos(equipos: Equipo[], cantidad: number = 5): PartidoAmistoso[] {
        const amistosos: PartidoAmistoso[] = [];

        for (let i = 0; i < cantidad; i++) {
            const equipoLocal = this.getRandomElement(equipos);
            const equiposDisponibles = equipos.filter(e => e.id !== equipoLocal.id);
            const equipoVisitante = this.getRandomElement(equiposDisponibles);

            const fechaFutura = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);

            const amistoso: PartidoAmistoso = {
                id: this.generateId(),
                equipoLocalId: equipoLocal.id,
                equipoVisitanteId: equipoVisitante.id,
                fecha: fechaFutura.toISOString().split('T')[0],
                hora: `${15 + Math.floor(Math.random() * 4)}:${Math.random() > 0.5 ? '00' : '30'}`,
                ubicacion: {
                    direccion: `Campo ${Math.floor(Math.random() * 10) + 1}, Calle Deportes ${Math.floor(Math.random() * 100) + 1}`,
                    coordenadas: {
                        latitud: 40.4168 + (Math.random() - 0.5) * 0.1,
                        longitud: -3.7038 + (Math.random() - 0.5) * 0.1
                    }
                },
                estado: this.getRandomElement(['Disponible', 'Propuesto', 'Confirmado', 'Finalizado', 'Cancelado'] as EstadoAmistoso[]),
                tipoFutbol: this.getRandomElement(['F11', 'F7', 'Sala']),
                categoria: this.getRandomElement(['Benjamin', 'Alevin', 'Infantil', 'Cadete', 'Juvenil', 'Senior'] as Categoria[]),
                esDisponibilidad: Math.random() > 0.5,
                fechaCreacion: new Date().toISOString(),
                observaciones: ''
            };

            // Si está finalizado, agregar resultado
            if (amistoso.estado === 'Finalizado') {
                amistoso.golesLocal = Math.floor(Math.random() * 5);
                amistoso.golesVisitante = Math.floor(Math.random() * 5);
            }

            amistosos.push(amistoso);
        }

        return amistosos;
    }

    // 🎲 Generar dataset completo
    generateCompleteDataset(): {
        clubes: Club[];
        equipos: Equipo[];
        torneos: Torneo[];
        partidos: Partido[];
        amistosos: PartidoAmistoso[];
    } {
        console.log('🎲 Generando dataset completo de prueba...');

        // Generar clubes
        const clubes = this.generateClubes(6);
        console.log(`✅ ${clubes.length} clubes generados`);

        // Generar equipos
        const equipos = this.generateEquipos(clubes, 2);
        console.log(`✅ ${equipos.length} equipos generados`);

        // Generar torneos y partidos
        const { torneos, partidos } = this.generateTorneos(equipos, 2);
        console.log(`✅ ${torneos.length} torneos generados`);
        console.log(`✅ ${partidos.length} partidos generados`);

        // Generar amistosos
        const amistosos = this.generateAmistosos(equipos, 8);
        console.log(`✅ ${amistosos.length} amistosos generados`);

        console.log('🎉 Dataset completo generado exitosamente!');

        return {
            clubes,
            equipos,
            torneos,
            partidos,
            amistosos
        };
    }
}

export const dataGenerator = new DataGenerator();