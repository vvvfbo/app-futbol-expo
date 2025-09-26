#!/usr/bin/env node

/**
 * 🏆 SIMULADOR DE TORNEOS COMPLETOS
 * Genera y simula múltiples torneos para validar el sistema completo
 */

console.log("🏆 === SIMULADOR DE TORNEOS COMPLETOS ===\n");

// Configuración del simulador
const CONFIG = {
    numTorneos: 5, // Número de torneos a simular
    equiposPorTorneo: 8, // Equipos por torneo
    partidosSimulados: true, // Si simular resultados automáticamente
    mostrarDetalles: true // Mostrar detalles de cada paso
};

// Datos base para simulación
const CLUBES_BASE = [
    { nombre: "Real Madrid CF", ciudad: "Madrid", fundacion: "1902" },
    { nombre: "FC Barcelona", ciudad: "Barcelona", fundacion: "1899" },
    { nombre: "Atlético Madrid", ciudad: "Madrid", fundacion: "1903" },
    { nombre: "Valencia CF", ciudad: "Valencia", fundacion: "1919" },
    { nombre: "Sevilla FC", ciudad: "Sevilla", fundacion: "1890" },
    { nombre: "Real Betis", ciudad: "Sevilla", fundacion: "1907" },
    { nombre: "Athletic Bilbao", ciudad: "Bilbao", fundacion: "1898" },
    { nombre: "Real Sociedad", ciudad: "San Sebastián", fundacion: "1909" },
    { nombre: "Villarreal CF", ciudad: "Villarreal", fundacion: "1923" },
    { nombre: "Deportivo Alavés", ciudad: "Vitoria", fundacion: "1921" },
    { nombre: "Celta de Vigo", ciudad: "Vigo", fundacion: "1923" },
    { nombre: "Real Valladolid", ciudad: "Valladolid", fundacion: "1928" },
    { nombre: "RCD Espanyol", ciudad: "Barcelona", fundacion: "1900" },
    { nombre: "UD Las Palmas", ciudad: "Las Palmas", fundacion: "1949" },
    { nombre: "Rayo Vallecano", ciudad: "Madrid", fundacion: "1924" },
    { nombre: "CA Osasuna", ciudad: "Pamplona", fundacion: "1920" }
];

const CATEGORIAS = ["Alevín F7", "Benjamín F7", "Infantil F11", "Cadete F11", "Juvenil F11"];
const TIPOS_TORNEO = ["Liga", "Copa", "Triangular", "Eliminatoria"];

// Utilidades
function generarId() {
    return Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
}

function obtenerFechaAleatoria() {
    const inicio = new Date();
    const fin = new Date();
    fin.setDate(inicio.getDate() + Math.floor(Math.random() * 90)); // Próximos 90 días
    return inicio.toISOString().split('T')[0];
}

function seleccionarClubesAleatorios(cantidad) {
    const clubesSeleccionados = [...CLUBES_BASE];
    clubesSeleccionados.sort(() => Math.random() - 0.5);
    return clubesSeleccionados.slice(0, cantidad);
}

function calcularResultadoPartido() {
    const golesLocal = Math.floor(Math.random() * 5); // 0-4 goles
    const golesVisitante = Math.floor(Math.random() * 5);
    return { golesLocal, golesVisitante };
}

// Generador de torneos
function crearTorneo(numeroTorneo) {
    const categoria = CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)];
    const tipo = TIPOS_TORNEO[Math.floor(Math.random() * TIPOS_TORNEO.length)];

    return {
        id: generarId(),
        nombre: `${tipo} ${categoria} ${new Date().getFullYear()} - Serie ${numeroTorneo}`,
        descripcion: `Torneo simulado de ${categoria} modalidad ${tipo}`,
        categoria,
        modalidad: categoria.includes("F7") ? "Fútbol 7" : "Fútbol 11",
        fechaInicio: obtenerFechaAleatoria(),
        fechaFin: null,
        estado: "Configuración",
        ubicacion: "Simulado",
        equiposInscritos: [],
        partidos: [],
        grupos: [],
        faseEliminatoria: [],
        configuracion: {
            formatoTorneo: "grupos-eliminatorias",
            numeroGrupos: 2,
            equiposPorGrupo: 4,
            puntosVictoria: 3,
            puntosEmpate: 1,
            puntosDerrota: 0,
            clasificanPorGrupo: 2
        },
        estadisticas: {
            partidosJugados: 0,
            golesTotal: 0,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0
        },
        fechaCreacion: new Date().toISOString()
    };
}

// Generador de equipos
function crearEquipo(club, categoria, numeroEquipo) {
    return {
        id: generarId(),
        nombre: `${club.nombre} ${categoria}${numeroEquipo > 1 ? ` ${numeroEquipo}` : ''}`,
        clubId: generarId(),
        categoria,
        modalidad: categoria.includes("F7") ? "Fútbol 7" : "Fútbol 11",
        entrenador: `Entrenador ${Math.floor(Math.random() * 100)}`,
        contacto: `entrenador${Math.floor(Math.random() * 100)}@club.com`,
        telefono: `+34 ${Math.floor(Math.random() * 900000000 + 100000000)}`,
        jugadores: generarJugadores(categoria),
        estadisticas: {
            partidosJugados: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            golesFavor: 0,
            golesContra: 0,
            puntos: 0
        },
        fechaCreacion: new Date().toISOString(),
        activo: true
    };
}

function generarJugadores(categoria) {
    const nombres = ["Alex", "Carlos", "Diego", "Eduardo", "Fernando", "Gabriel", "Hugo", "Iván", "Javier", "Kevin", "Lucas", "Miguel", "Nicolás", "Oscar", "Pablo", "Raúl", "Sergio", "Thomas", "Víctor", "William"];
    const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez", "Cruz", "Flores", "Morales", "Jiménez", "Herrera", "Silva", "Castro", "Vargas", "Ortega", "Ruiz", "Delgado", "Medina"];
    const posiciones = ["Portero", "Defensa Central", "Lateral Derecho", "Lateral Izquierdo", "Mediocentro", "Mediocentro Defensivo", "Mediocentro Ofensivo", "Extremo Derecho", "Extremo Izquierdo", "Delantero Centro", "Segundo Delantero"];

    const numJugadores = categoria.includes("F7") ? Math.floor(Math.random() * 5) + 14 : Math.floor(Math.random() * 8) + 18; // F7: 14-18, F11: 18-25
    const jugadores = [];
    const dorsalesUsados = [];

    for (let i = 0; i < numJugadores; i++) {
        let dorsal;
        do {
            dorsal = Math.floor(Math.random() * 99) + 1;
        } while (dorsalesUsados.includes(dorsal));
        dorsalesUsados.push(dorsal);

        jugadores.push({
            id: generarId(),
            nombre: `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
            dorsal,
            posicion: posiciones[Math.floor(Math.random() * posiciones.length)],
            edad: Math.floor(Math.random() * 6) + 16, // 16-21 años
            fechaRegistro: new Date().toISOString(),
            activo: true,
            estadisticas: {
                partidosJugados: 0,
                goles: 0,
                asistencias: 0,
                tarjetasAmarillas: 0,
                tarjetasRojas: 0
            }
        });
    }

    return jugadores;
}

// Simulador de sorteo
function realizarSorteo(equipos) {
    const equiposBarajados = [...equipos];

    // Fisher-Yates shuffle
    for (let i = equiposBarajados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [equiposBarajados[i], equiposBarajados[j]] = [equiposBarajados[j], equiposBarajados[i]];
    }

    const grupos = [[], []];
    equiposBarajados.forEach((equipo, index) => {
        grupos[index % 2].push(equipo);
    });

    return grupos.map((equipos, index) => ({
        id: generarId(),
        nombre: `Grupo ${String.fromCharCode(65 + index)}`, // A, B, C...
        equipos: equipos.map(eq => eq.id),
        partidos: [],
        clasificacion: equipos.map(eq => ({
            equipoId: eq.id,
            nombre: eq.nombre,
            partidosJugados: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            golesFavor: 0,
            golesContra: 0,
            diferencia: 0,
            puntos: 0
        }))
    }));
}

// Generador de partidos de grupo
function generarPartidosGrupo(grupo, torneo) {
    const partidos = [];
    const equipos = grupo.equipos;

    // Generar partidos round-robin dentro del grupo
    for (let i = 0; i < equipos.length; i++) {
        for (let j = i + 1; j < equipos.length; j++) {
            partidos.push({
                id: generarId(),
                torneoId: torneo.id,
                grupoId: grupo.id,
                equipoLocalId: equipos[i],
                equipoVisitanteId: equipos[j],
                fecha: obtenerFechaAleatoria(),
                hora: `${Math.floor(Math.random() * 12) + 9}:${Math.random() > 0.5 ? '00' : '30'}`,
                estado: "Programado",
                resultado: null,
                incidencias: [],
                arbitro: `Árbitro ${Math.floor(Math.random() * 50)}`,
                campo: `Campo ${Math.floor(Math.random() * 10) + 1}`
            });
        }
    }

    return partidos;
}

// Simulador de partido
function simularPartido(partido, equipos) {
    const resultado = calcularResultadoPartido();

    return {
        ...partido,
        estado: "Jugado",
        resultado: {
            golesLocal: resultado.golesLocal,
            golesVisitante: resultado.golesVisitante,
            ganador: resultado.golesLocal > resultado.golesVisitante ? partido.equipoLocalId :
                resultado.golesLocal < resultado.golesVisitante ? partido.equipoVisitanteId : null
        },
        incidencias: generarIncidenciasAleatorias(),
        fechaJugado: new Date().toISOString()
    };
}

function generarIncidenciasAleatorias() {
    const incidencias = [];
    const numIncidencias = Math.floor(Math.random() * 5); // 0-4 incidencias

    for (let i = 0; i < numIncidencias; i++) {
        const tipos = ["gol", "tarjeta_amarilla", "tarjeta_roja", "cambio"];
        incidencias.push({
            id: generarId(),
            tipo: tipos[Math.floor(Math.random() * tipos.length)],
            minuto: Math.floor(Math.random() * 90) + 1,
            jugadorId: generarId(),
            descripcion: "Incidencia simulada"
        });
    }

    return incidencias;
}

// Calculador de clasificación
function calcularClasificacion(grupo, partidos) {
    const clasificacion = [...grupo.clasificacion];

    partidos.forEach(partido => {
        if (partido.estado === "Jugado" && partido.resultado) {
            const localIdx = clasificacion.findIndex(c => c.equipoId === partido.equipoLocalId);
            const visitanteIdx = clasificacion.findIndex(c => c.equipoId === partido.equipoVisitanteId);

            if (localIdx !== -1 && visitanteIdx !== -1) {
                // Actualizar estadísticas equipo local
                clasificacion[localIdx].partidosJugados++;
                clasificacion[localIdx].golesFavor += partido.resultado.golesLocal;
                clasificacion[localIdx].golesContra += partido.resultado.golesVisitante;

                // Actualizar estadísticas equipo visitante
                clasificacion[visitanteIdx].partidosJugados++;
                clasificacion[visitanteIdx].golesFavor += partido.resultado.golesVisitante;
                clasificacion[visitanteIdx].golesContra += partido.resultado.golesLocal;

                // Determinar puntos
                if (partido.resultado.golesLocal > partido.resultado.golesVisitante) {
                    clasificacion[localIdx].victorias++;
                    clasificacion[localIdx].puntos += 3;
                    clasificacion[visitanteIdx].derrotas++;
                } else if (partido.resultado.golesLocal < partido.resultado.golesVisitante) {
                    clasificacion[visitanteIdx].victorias++;
                    clasificacion[visitanteIdx].puntos += 3;
                    clasificacion[localIdx].derrotas++;
                } else {
                    clasificacion[localIdx].empates++;
                    clasificacion[visitanteIdx].empates++;
                    clasificacion[localIdx].puntos += 1;
                    clasificacion[visitanteIdx].puntos += 1;
                }

                // Calcular diferencia de goles
                clasificacion[localIdx].diferencia = clasificacion[localIdx].golesFavor - clasificacion[localIdx].golesContra;
                clasificacion[visitanteIdx].diferencia = clasificacion[visitanteIdx].golesFavor - clasificacion[visitanteIdx].golesContra;
            }
        }
    });

    // Ordenar por puntos, diferencia de goles, goles favor
    clasificacion.sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
        return b.golesFavor - a.golesFavor;
    });

    return clasificacion;
}

// Generador de eliminatorias
function generarEliminatorias(grupos) {
    const clasificados = [];

    grupos.forEach(grupo => {
        const clasificacion = grupo.clasificacion.slice(0, 2); // Top 2 de cada grupo
        clasificados.push(...clasificacion);
    });

    // Generar enfrentamientos cruzados (1°A vs 2°B, 1°B vs 2°A)
    const eliminatorias = [
        {
            id: generarId(),
            fase: "Semifinal",
            equipoLocalId: clasificados[0].equipoId, // 1° Grupo A
            equipoVisitanteId: clasificados[3].equipoId, // 2° Grupo B
            fecha: obtenerFechaAleatoria(),
            estado: "Programado"
        },
        {
            id: generarId(),
            fase: "Semifinal",
            equipoLocalId: clasificados[2].equipoId, // 1° Grupo B
            equipoVisitanteId: clasificados[1].equipoId, // 2° Grupo A
            fecha: obtenerFechaAleatoria(),
            estado: "Programado"
        }
    ];

    return eliminatorias;
}

// Función principal de simulación
function simularTorneoCompleto(numeroTorneo) {
    console.log(`\n🏆 SIMULANDO TORNEO ${numeroTorneo}:`);
    console.log("=" + "=".repeat(50));

    // 1. Crear torneo
    const torneo = crearTorneo(numeroTorneo);
    if (CONFIG.mostrarDetalles) {
        console.log(`📋 Torneo creado: ${torneo.nombre}`);
        console.log(`   Modalidad: ${torneo.modalidad} | Categoría: ${torneo.categoria}`);
    }

    // 2. Crear y inscribir equipos
    const clubesSeleccionados = seleccionarClubesAleatorios(CONFIG.equiposPorTorneo);
    const equipos = clubesSeleccionados.map((club, index) =>
        crearEquipo(club, torneo.categoria, index + 1)
    );

    torneo.equiposInscritos = equipos.map(eq => eq.id);

    if (CONFIG.mostrarDetalles) {
        console.log(`👥 Equipos inscritos (${equipos.length}):`);
        equipos.forEach(eq => console.log(`   - ${eq.nombre} (${eq.jugadores.length} jugadores)`));
    }

    // 3. Realizar sorteo
    const grupos = realizarSorteo(equipos);
    torneo.grupos = grupos;

    if (CONFIG.mostrarDetalles) {
        console.log(`🎲 Sorteo realizado:`);
        grupos.forEach(grupo => {
            console.log(`   ${grupo.nombre}: ${grupo.equipos.map(id => equipos.find(eq => eq.id === id)?.nombre).join(', ')}`);
        });
    }

    // 4. Generar partidos de grupo
    let todosPartidos = [];
    grupos.forEach(grupo => {
        const partidosGrupo = generarPartidosGrupo(grupo, torneo);
        grupo.partidos = partidosGrupo.map(p => p.id);
        todosPartidos.push(...partidosGrupo);
    });

    torneo.partidos = todosPartidos.map(p => p.id);

    if (CONFIG.mostrarDetalles) {
        console.log(`⚽ Partidos programados: ${todosPartidos.length}`);
    }

    // 5. Simular partidos si está habilitado
    if (CONFIG.partidosSimulados) {
        todosPartidos = todosPartidos.map(partido => simularPartido(partido, equipos));

        if (CONFIG.mostrarDetalles) {
            console.log(`🎮 Simulando ${todosPartidos.length} partidos...`);
            todosPartidos.forEach(partido => {
                const equipoLocal = equipos.find(eq => eq.id === partido.equipoLocalId)?.nombre;
                const equipoVisitante = equipos.find(eq => eq.id === partido.equipoVisitanteId)?.nombre;
                console.log(`   ${equipoLocal} ${partido.resultado.golesLocal}-${partido.resultado.golesVisitante} ${equipoVisitante}`);
            });
        }
    }

    // 6. Calcular clasificaciones
    grupos.forEach(grupo => {
        const partidosGrupo = todosPartidos.filter(p => p.grupoId === grupo.id);
        grupo.clasificacion = calcularClasificacion(grupo, partidosGrupo);
    });

    if (CONFIG.mostrarDetalles) {
        console.log(`📊 Clasificaciones:`);
        grupos.forEach(grupo => {
            console.log(`   ${grupo.nombre}:`);
            grupo.clasificacion.forEach((pos, index) => {
                console.log(`     ${index + 1}. ${pos.nombre} - ${pos.puntos}pts (${pos.golesFavor}-${pos.golesContra})`);
            });
        });
    }

    // 7. Generar eliminatorias
    const eliminatorias = generarEliminatorias(grupos);
    torneo.faseEliminatoria = eliminatorias;

    if (CONFIG.mostrarDetalles) {
        console.log(`🏅 Eliminatorias generadas:`);
        eliminatorias.forEach(partido => {
            const equipoLocal = grupos.flatMap(g => g.clasificacion).find(c => c.equipoId === partido.equipoLocalId)?.nombre;
            const equipoVisitante = grupos.flatMap(g => g.clasificacion).find(c => c.equipoId === partido.equipoVisitanteId)?.nombre;
            console.log(`   ${partido.fase}: ${equipoLocal} vs ${equipoVisitante}`);
        });
    }

    // 8. Calcular estadísticas del torneo
    torneo.estadisticas = {
        partidosJugados: todosPartidos.filter(p => p.estado === "Jugado").length,
        golesTotal: todosPartidos.reduce((total, p) =>
            p.resultado ? total + p.resultado.golesLocal + p.resultado.golesVisitante : total, 0
        ),
        tarjetasAmarillas: todosPartidos.reduce((total, p) =>
            total + (p.incidencias?.filter(i => i.tipo === "tarjeta_amarilla").length || 0), 0
        ),
        tarjetasRojas: todosPartidos.reduce((total, p) =>
            total + (p.incidencias?.filter(i => i.tipo === "tarjeta_roja").length || 0), 0
        )
    };

    torneo.estado = eliminatorias.length > 0 ? "Fase Eliminatoria" : "Finalizado";

    return {
        torneo,
        equipos,
        partidos: todosPartidos,
        resumen: {
            equipos: equipos.length,
            partidos: todosPartidos.length,
            partidosJugados: torneo.estadisticas.partidosJugados,
            goles: torneo.estadisticas.golesTotal,
            eliminatorias: eliminatorias.length,
            estado: torneo.estado
        }
    };
}

// Ejecutar simulaciones
function ejecutarSimulaciones() {
    const resultados = [];
    const inicioSimulacion = Date.now();

    console.log(`🚀 Iniciando simulación de ${CONFIG.numTorneos} torneos...\n`);

    for (let i = 1; i <= CONFIG.numTorneos; i++) {
        const resultado = simularTorneoCompleto(i);
        resultados.push(resultado);

        console.log(`✅ Torneo ${i} completado: ${resultado.resumen.partidosJugados}/${resultado.resumen.partidos} partidos jugados, ${resultado.resumen.goles} goles`);
    }

    const tiempoTotal = Date.now() - inicioSimulacion;

    // Generar resumen final
    console.log("\n" + "=".repeat(60));
    console.log("📈 RESUMEN FINAL DE SIMULACIONES");
    console.log("=".repeat(60));

    const estadisticasGlobales = {
        torneosCreados: resultados.length,
        equiposCreados: resultados.reduce((total, r) => total + r.resumen.equipos, 0),
        partidosGenerados: resultados.reduce((total, r) => total + r.resumen.partidos, 0),
        partidosJugados: resultados.reduce((total, r) => total + r.resumen.partidosJugados, 0),
        golesTotal: resultados.reduce((total, r) => total + r.resumen.goles, 0),
        eliminatoriasGeneradas: resultados.reduce((total, r) => total + r.resumen.eliminatorias, 0),
        tiempoEjecucion: tiempoTotal
    };

    Object.entries(estadisticasGlobales).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`📊 ${label.charAt(0).toUpperCase() + label.slice(1)}: ${typeof value === 'number' && key === 'tiempoEjecucion' ? value + 'ms' : value}`);
    });

    // Validaciones
    console.log("\n🔍 VALIDACIONES:");
    const validaciones = [
        {
            nombre: "Todos los torneos tienen equipos",
            valido: resultados.every(r => r.resumen.equipos === CONFIG.equiposPorTorneo)
        },
        {
            nombre: "Todos los grupos tienen partidos",
            valido: resultados.every(r => r.resumen.partidos > 0)
        },
        {
            nombre: "Se generaron eliminatorias",
            valido: resultados.every(r => r.resumen.eliminatorias > 0)
        },
        {
            nombre: "Partidos simulados correctamente",
            valido: CONFIG.partidosSimulados ? resultados.every(r => r.resumen.partidosJugados === r.resumen.partidos) : true
        }
    ];

    validaciones.forEach(validacion => {
        console.log(`${validacion.valido ? '✅' : '❌'} ${validacion.nombre}`);
    });

    const todoValido = validaciones.every(v => v.valido);
    console.log(`\n🎯 RESULTADO: ${todoValido ? 'TODAS LAS VALIDACIONES EXITOSAS' : 'ALGUNAS VALIDACIONES FALLARON'}`);

    return {
        resultados,
        estadisticasGlobales,
        validaciones,
        todoValido
    };
}

// Ejecutar si se llama directamente
if (require.main === module) {
    ejecutarSimulaciones();
}

module.exports = {
    ejecutarSimulaciones,
    simularTorneoCompleto,
    CONFIG
};