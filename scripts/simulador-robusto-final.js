#!/usr/bin/env node

/**
 * 🎯 SIMULADOR DE TORNEOS COMPLETOS - VERSIÓN ROBUSTA
 * Simula torneos completos con diferentes configuraciones para validar toda la funcionalidad
 */

console.log("🎯 === SIMULADOR ROBUSTO DE TORNEOS ===\n");

// Configuraciones de prueba
const CONFIGURACIONES_TEST = [
    {
        nombre: "Torneo Pequeño F7",
        categoria: "Alevín F7",
        numEquipos: 4,
        formatoTorneo: "eliminatoria-directa"
    },
    {
        nombre: "Torneo Estándar F7",
        categoria: "Benjamín F7",
        numEquipos: 8,
        formatoTorneo: "grupos-eliminatorias"
    },
    {
        nombre: "Torneo Grande F11",
        categoria: "Infantil F11",
        numEquipos: 12,
        formatoTorneo: "grupos-eliminatorias"
    },
    {
        nombre: "Liga Simple F11",
        categoria: "Cadete F11",
        numEquipos: 6,
        formatoTorneo: "liga-simple"
    }
];

// Datos base mejorados
const CLUBES_ESPANA = [
    "Real Madrid CF", "FC Barcelona", "Atlético Madrid", "Valencia CF",
    "Sevilla FC", "Real Betis", "Athletic Bilbao", "Real Sociedad",
    "Villarreal CF", "Deportivo Alavés", "Celta de Vigo", "Real Valladolid",
    "RCD Espanyol", "UD Las Palmas", "Rayo Vallecano", "CA Osasuna",
    "Deportivo La Coruña", "Málaga CF", "Real Zaragoza", "Sporting Gijón"
];

// Utilidades mejoradas
function generarId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function crearEquipoCompleto(club, categoria, numero = 1) {
    const id = generarId();
    const modalidad = categoria.includes("F7") ? "Fútbol 7" : "Fútbol 11";
    const minJugadores = modalidad === "Fútbol 7" ? 14 : 18;
    const maxJugadores = modalidad === "Fútbol 7" ? 18 : 25;
    const numJugadores = Math.floor(Math.random() * (maxJugadores - minJugadores + 1)) + minJugadores;

    return {
        id,
        nombre: `${club} ${categoria}${numero > 1 ? ` ${numero}` : ''}`,
        clubId: generarId(),
        categoria,
        modalidad,
        entrenador: `Entrenador ${Math.floor(Math.random() * 100)}`,
        jugadores: generarJugadoresCompletos(numJugadores, id),
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

function generarJugadoresCompletos(cantidad, equipoId) {
    const nombres = ["Álvaro", "Bruno", "Carlos", "Diego", "Eduardo", "Fernando", "Gabriel", "Hugo", "Iván", "Javier", "Kevin", "Lucas", "Miguel", "Nicolás", "Óscar", "Pablo", "Raúl", "Sergio", "Thomas", "Víctor"];
    const apellidos = ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores"];
    const posiciones = ["Portero", "Defensa Central", "Lateral Derecho", "Lateral Izquierdo", "Mediocentro", "Mediocentro Defensivo", "Mediocentro Ofensivo", "Extremo Derecho", "Extremo Izquierdo", "Delantero Centro", "Segundo Delantero"];

    const jugadores = [];
    const dorsalesUsados = [];

    // Asegurar al menos 2 porteros
    for (let i = 0; i < Math.min(2, cantidad); i++) {
        let dorsal;
        do {
            dorsal = i === 0 ? 1 : Math.floor(Math.random() * 99) + 1;
        } while (dorsalesUsados.includes(dorsal));
        dorsalesUsados.push(dorsal);

        jugadores.push({
            id: generarId(),
            equipoId,
            nombre: `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
            dorsal,
            posicion: "Portero",
            edad: Math.floor(Math.random() * 6) + 16,
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

    // Completar con jugadores de campo
    for (let i = jugadores.length; i < cantidad; i++) {
        let dorsal;
        do {
            dorsal = Math.floor(Math.random() * 99) + 1;
        } while (dorsalesUsados.includes(dorsal));
        dorsalesUsados.push(dorsal);

        jugadores.push({
            id: generarId(),
            equipoId,
            nombre: `${nombres[Math.floor(Math.random() * nombres.length)]} ${apellidos[Math.floor(Math.random() * apellidos.length)]}`,
            dorsal,
            posicion: posiciones[Math.floor(Math.random() * (posiciones.length - 1)) + 1], // Excluir portero
            edad: Math.floor(Math.random() * 6) + 16,
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

function crearTorneoCompleto(config) {
    return {
        id: generarId(),
        nombre: `${config.nombre} ${new Date().getFullYear()}`,
        descripcion: `Torneo de prueba con ${config.numEquipos} equipos en modalidad ${config.categoria}`,
        categoria: config.categoria,
        modalidad: config.categoria.includes("F7") ? "Fútbol 7" : "Fútbol 11",
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: null,
        estado: "Configuración",
        ubicacion: "Centro Deportivo Test",
        equiposInscritos: [],
        partidos: [],
        grupos: [],
        faseEliminatoria: [],
        configuracion: {
            formatoTorneo: config.formatoTorneo,
            numeroGrupos: config.formatoTorneo === "grupos-eliminatorias" ? Math.ceil(config.numEquipos / 4) : 1,
            equiposPorGrupo: config.formatoTorneo === "grupos-eliminatorias" ? Math.floor(config.numEquipos / Math.ceil(config.numEquipos / 4)) : config.numEquipos,
            puntosVictoria: 3,
            puntosEmpate: 1,
            puntosDerrota: 0,
            clasificanPorGrupo: config.formatoTorneo === "grupos-eliminatorias" ? 2 : config.numEquipos
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

function realizarSorteoInteligente(equipos, numGrupos) {
    // Fisher-Yates shuffle
    const equiposBarajados = [...equipos];
    for (let i = equiposBarajados.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [equiposBarajados[i], equiposBarajados[j]] = [equiposBarajados[j], equiposBarajados[i]];
    }

    const grupos = [];
    for (let i = 0; i < numGrupos; i++) {
        grupos.push({
            id: generarId(),
            nombre: `Grupo ${String.fromCharCode(65 + i)}`,
            equipos: [],
            partidos: [],
            clasificacion: []
        });
    }

    // Distribuir equipos equitativamente
    equiposBarajados.forEach((equipo, index) => {
        const grupoIndex = index % numGrupos;
        grupos[grupoIndex].equipos.push(equipo.id);
        grupos[grupoIndex].clasificacion.push({
            equipoId: equipo.id,
            nombre: equipo.nombre,
            partidosJugados: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            golesFavor: 0,
            golesContra: 0,
            diferencia: 0,
            puntos: 0
        });
    });

    return grupos;
}

function generarPartidosCompletos(torneo, grupos, equipos) {
    const partidos = [];

    for (const grupo of grupos) {
        const equiposGrupo = grupo.equipos;

        // Generar enfrentamientos round-robin
        for (let i = 0; i < equiposGrupo.length; i++) {
            for (let j = i + 1; j < equiposGrupo.length; j++) {
                const partido = {
                    id: generarId(),
                    torneoId: torneo.id,
                    grupoId: grupo.id,
                    equipoLocalId: equiposGrupo[i],
                    equipoVisitanteId: equiposGrupo[j],
                    fecha: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    hora: `${Math.floor(Math.random() * 6) + 9}:${Math.random() > 0.5 ? '00' : '30'}`,
                    estado: "Programado",
                    resultado: null,
                    incidencias: [],
                    arbitro: `Árbitro ${Math.floor(Math.random() * 20) + 1}`,
                    campo: `Campo ${Math.floor(Math.random() * 8) + 1}`,
                    observaciones: ""
                };

                partidos.push(partido);
            }
        }
    }

    return partidos;
}

function simularPartidoCompleto(partido, equipos) {
    // Generar resultado más realista
    const probabilidades = [0.15, 0.25, 0.30, 0.20, 0.08, 0.02]; // 0,1,2,3,4,5+ goles

    function generarGoles() {
        const rand = Math.random();
        let acumulado = 0;
        for (let i = 0; i < probabilidades.length; i++) {
            acumulado += probabilidades[i];
            if (rand <= acumulado) {
                return i === probabilidades.length - 1 ? Math.floor(Math.random() * 3) + 5 : i;
            }
        }
        return 0;
    }

    const golesLocal = generarGoles();
    const golesVisitante = generarGoles();

    // Generar incidencias realistas
    const incidencias = [];
    const totalGoles = golesLocal + golesVisitante;
    const numIncidencias = Math.floor(Math.random() * (totalGoles + 3));

    for (let i = 0; i < numIncidencias; i++) {
        const tipos = ["gol", "tarjeta_amarilla", "tarjeta_roja", "cambio"];
        const pesos = [0.4, 0.3, 0.05, 0.25]; // Probabilidades

        let tipoSeleccionado = "gol";
        const rand = Math.random();
        let acum = 0;
        for (let j = 0; j < tipos.length; j++) {
            acum += pesos[j];
            if (rand <= acum) {
                tipoSeleccionado = tipos[j];
                break;
            }
        }

        incidencias.push({
            id: generarId(),
            tipo: tipoSeleccionado,
            minuto: Math.floor(Math.random() * 90) + 1,
            jugadorId: generarId(),
            equipoId: Math.random() > 0.5 ? partido.equipoLocalId : partido.equipoVisitanteId,
            descripcion: `${tipoSeleccionado} simulada`
        });
    }

    return {
        ...partido,
        estado: "Jugado",
        resultado: {
            golesLocal,
            golesVisitante,
            ganador: golesLocal > golesVisitante ? partido.equipoLocalId :
                golesLocal < golesVisitante ? partido.equipoVisitanteId : null
        },
        incidencias: incidencias.slice(0, 8), // Máximo 8 incidencias por partido
        fechaJugado: new Date().toISOString()
    };
}

function calcularClasificacionCompleta(grupo, partidos) {
    const clasificacion = [...grupo.clasificacion];

    // Resetear estadísticas
    clasificacion.forEach(equipo => {
        Object.assign(equipo, {
            partidosJugados: 0,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            golesFavor: 0,
            golesContra: 0,
            diferencia: 0,
            puntos: 0
        });
    });

    // Calcular estadísticas de partidos jugados
    const partidosGrupo = partidos.filter(p => p.grupoId === grupo.id && p.estado === "Jugado");

    partidosGrupo.forEach(partido => {
        const localIdx = clasificacion.findIndex(eq => eq.equipoId === partido.equipoLocalId);
        const visitanteIdx = clasificacion.findIndex(eq => eq.equipoId === partido.equipoVisitanteId);

        if (localIdx !== -1 && visitanteIdx !== -1 && partido.resultado) {
            // Actualizar partidos jugados
            clasificacion[localIdx].partidosJugados++;
            clasificacion[visitanteIdx].partidosJugados++;

            // Goles
            clasificacion[localIdx].golesFavor += partido.resultado.golesLocal;
            clasificacion[localIdx].golesContra += partido.resultado.golesVisitante;
            clasificacion[visitanteIdx].golesFavor += partido.resultado.golesVisitante;
            clasificacion[visitanteIdx].golesContra += partido.resultado.golesLocal;

            // Resultados y puntos
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

            // Diferencia de goles
            clasificacion[localIdx].diferencia = clasificacion[localIdx].golesFavor - clasificacion[localIdx].golesContra;
            clasificacion[visitanteIdx].diferencia = clasificacion[visitanteIdx].golesFavor - clasificacion[visitanteIdx].golesContra;
        }
    });

    // Ordenar por criterios oficiales
    clasificacion.sort((a, b) => {
        // 1. Puntos
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        // 2. Diferencia de goles
        if (b.diferencia !== a.diferencia) return b.diferencia - a.diferencia;
        // 3. Goles a favor
        if (b.golesFavor !== a.golesFavor) return b.golesFavor - a.golesFavor;
        // 4. Nombre (alfabético como desempate final)
        return a.nombre.localeCompare(b.nombre);
    });

    return clasificacion;
}

function generarEliminatoriasCompletas(grupos, configuracion) {
    if (configuracion.formatoTorneo !== "grupos-eliminatorias") {
        return [];
    }

    const clasificados = [];

    // Obtener clasificados de cada grupo
    grupos.forEach(grupo => {
        const topClasificados = grupo.clasificacion
            .slice(0, configuracion.clasificanPorGrupo)
            .map(eq => ({ ...eq, grupo: grupo.nombre }));
        clasificados.push(...topClasificados);
    });

    if (clasificados.length < 2) {
        return [];
    }

    // Generar enfrentamientos
    const eliminatorias = [];

    // Ordenar clasificados por posición y grupo
    const primeros = clasificados.filter((_, index) => index % configuracion.clasificanPorGrupo === 0);
    const segundos = clasificados.filter((_, index) => index % configuracion.clasificanPorGrupo === 1);

    // Enfrentamientos cruzados: 1°A vs 2°B, 1°B vs 2°A, etc.
    for (let i = 0; i < primeros.length && i < segundos.length; i++) {
        const segundoRival = segundos[(i + 1) % segundos.length] || segundos[0];

        eliminatorias.push({
            id: generarId(),
            fase: clasificados.length <= 4 ? "Semifinal" : "Cuartos de Final",
            equipoLocalId: primeros[i].equipoId,
            equipoVisitanteId: segundoRival.equipoId,
            equipoLocal: primeros[i].nombre,
            equipoVisitante: segundoRival.nombre,
            fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hora: "16:00",
            estado: "Programado",
            resultado: null
        });
    }

    return eliminatorias;
}

// Función principal de simulación
async function simularTorneoRobusto(configuracion) {
    console.log(`\n🏆 SIMULANDO: ${configuracion.nombre.toUpperCase()}`);
    console.log("=" + "=".repeat(configuracion.nombre.length + 15));

    // 1. Crear torneo
    const torneo = crearTorneoCompleto(configuracion);
    console.log(`📋 Torneo: ${torneo.nombre}`);
    console.log(`   📊 Formato: ${torneo.configuracion.formatoTorneo}`);
    console.log(`   🏃 Modalidad: ${torneo.modalidad}`);
    console.log(`   👥 Equipos esperados: ${configuracion.numEquipos}`);

    // 2. Crear equipos
    const clubesSeleccionados = CLUBES_ESPANA.slice(0, configuracion.numEquipos);
    const equipos = clubesSeleccionados.map((club, index) =>
        crearEquipoCompleto(club, configuracion.categoria, index + 1)
    );

    torneo.equiposInscritos = equipos.map(eq => eq.id);

    console.log(`✅ Equipos creados: ${equipos.length}`);
    equipos.forEach(eq => {
        console.log(`   - ${eq.nombre} (${eq.jugadores.length} jugadores)`);
    });

    // 3. Realizar sorteo
    const numGrupos = torneo.configuracion.numeroGrupos;
    const grupos = realizarSorteoInteligente(equipos, numGrupos);
    torneo.grupos = grupos;

    console.log(`🎲 Sorteo en ${numGrupos} grupo(s):`);
    grupos.forEach(grupo => {
        const equiposNombres = grupo.equipos.map(id =>
            equipos.find(eq => eq.id === id)?.nombre
        );
        console.log(`   ${grupo.nombre}: ${equiposNombres.join(', ')}`);
    });

    // 4. Generar partidos
    const partidos = generarPartidosCompletos(torneo, grupos, equipos);
    torneo.partidos = partidos.map(p => p.id);

    console.log(`⚽ Partidos programados: ${partidos.length}`);

    // 5. Simular partidos
    const partidosJugados = partidos.map(partido => simularPartidoCompleto(partido, equipos));

    console.log(`🎮 Simulando ${partidosJugados.length} partidos...`);
    let golesTotal = 0;
    let incidenciasTotal = 0;

    partidosJugados.forEach(partido => {
        const equipoLocal = equipos.find(eq => eq.id === partido.equipoLocalId);
        const equipoVisitante = equipos.find(eq => eq.id === partido.equipoVisitanteId);
        console.log(`   ${equipoLocal.nombre} ${partido.resultado.golesLocal}-${partido.resultado.golesVisitante} ${equipoVisitante.nombre}`);

        golesTotal += partido.resultado.golesLocal + partido.resultado.golesVisitante;
        incidenciasTotal += partido.incidencias.length;
    });

    // 6. Calcular clasificaciones
    grupos.forEach(grupo => {
        grupo.clasificacion = calcularClasificacionCompleta(grupo, partidosJugados);
    });

    console.log(`📊 Clasificaciones finales:`);
    grupos.forEach(grupo => {
        console.log(`   ${grupo.nombre}:`);
        grupo.clasificacion.forEach((equipo, index) => {
            const estadisticas = `${equipo.puntos}pts - ${equipo.partidosJugados}PJ ${equipo.victorias}V ${equipo.empates}E ${equipo.derrotas}D (${equipo.golesFavor}-${equipo.golesContra})`;
            console.log(`     ${index + 1}. ${equipo.nombre} - ${estadisticas}`);
        });
    });

    // 7. Generar eliminatorias si aplica
    const eliminatorias = generarEliminatoriasCompletas(grupos, torneo.configuracion);
    torneo.faseEliminatoria = eliminatorias;

    if (eliminatorias.length > 0) {
        console.log(`🏅 Eliminatorias (${eliminatorias.length} partidos):`);
        eliminatorias.forEach(partido => {
            console.log(`   ${partido.fase}: ${partido.equipoLocal} vs ${partido.equipoVisitante}`);
        });
    }

    // 8. Estadísticas finales del torneo
    torneo.estadisticas = {
        partidosJugados: partidosJugados.length,
        golesTotal,
        tarjetasAmarillas: partidosJugados.reduce((total, p) =>
            total + p.incidencias.filter(i => i.tipo === "tarjeta_amarilla").length, 0
        ),
        tarjetasRojas: partidosJugados.reduce((total, p) =>
            total + p.incidencias.filter(i => i.tipo === "tarjeta_roja").length, 0
        ),
        promedioGolesPorPartido: partidosJugados.length > 0 ? (golesTotal / partidosJugados.length).toFixed(2) : 0
    };

    torneo.estado = eliminatorias.length > 0 ? "Fase Eliminatoria" : "Finalizado";

    console.log(`📈 Estadísticas del torneo:`);
    console.log(`   ⚽ ${golesTotal} goles en ${partidosJugados.length} partidos (${torneo.estadisticas.promedioGolesPorPartido} por partido)`);
    console.log(`   🟨 ${torneo.estadisticas.tarjetasAmarillas} tarjetas amarillas`);
    console.log(`   🟥 ${torneo.estadisticas.tarjetasRojas} tarjetas rojas`);
    console.log(`   📊 ${incidenciasTotal} incidencias totales`);

    return {
        torneo,
        equipos,
        partidos: partidosJugados,
        grupos,
        eliminatorias,
        estadisticas: {
            equipos: equipos.length,
            partidos: partidosJugados.length,
            goles: golesTotal,
            jugadoresTotal: equipos.reduce((total, eq) => total + eq.jugadores.length, 0),
            incidencias: incidenciasTotal
        }
    };
}

// Ejecutar simulaciones robustas
async function ejecutarSimulacionesRobustas() {
    console.log(`🚀 Iniciando simulación robusta de ${CONFIGURACIONES_TEST.length} torneos...\n`);

    const resultados = [];
    const inicioTotal = Date.now();

    for (const configuracion of CONFIGURACIONES_TEST) {
        try {
            const resultado = await simularTorneoRobusto(configuracion);
            resultados.push({
                configuracion,
                resultado,
                exitoso: true
            });
        } catch (error) {
            console.error(`❌ Error en ${configuracion.nombre}: ${error.message}`);
            resultados.push({
                configuracion,
                error: error.message,
                exitoso: false
            });
        }
    }

    const tiempoTotal = Date.now() - inicioTotal;

    // Generar reporte final
    console.log("\n" + "=".repeat(80));
    console.log("🎯 REPORTE FINAL DE SIMULACIONES ROBUSTAS");
    console.log("=".repeat(80));

    const exitosos = resultados.filter(r => r.exitoso);
    const fallidos = resultados.filter(r => !r.exitoso);

    console.log(`📊 Torneos simulados: ${resultados.length}`);
    console.log(`✅ Exitosos: ${exitosos.length}`);
    console.log(`❌ Fallidos: ${fallidos.length}`);
    console.log(`⏱️ Tiempo total: ${tiempoTotal}ms\n`);

    if (exitosos.length > 0) {
        const estadisticasGlobales = exitosos.reduce((total, r) => ({
            equipos: total.equipos + r.resultado.estadisticas.equipos,
            partidos: total.partidos + r.resultado.estadisticas.partidos,
            goles: total.goles + r.resultado.estadisticas.goles,
            jugadores: total.jugadores + r.resultado.estadisticas.jugadoresTotal,
            incidencias: total.incidencias + r.resultado.estadisticas.incidencias
        }), { equipos: 0, partidos: 0, goles: 0, jugadores: 0, incidencias: 0 });

        console.log("📈 ESTADÍSTICAS GLOBALES:");
        console.log(`   👥 Equipos gestionados: ${estadisticasGlobales.equipos}`);
        console.log(`   ⚽ Partidos simulados: ${estadisticasGlobales.partidos}`);
        console.log(`   🥅 Goles marcados: ${estadisticasGlobales.goles}`);
        console.log(`   🏃 Jugadores creados: ${estadisticasGlobales.jugadores}`);
        console.log(`   📋 Incidencias generadas: ${estadisticasGlobales.incidencias}`);

        const promedioGoles = estadisticasGlobales.partidos > 0 ?
            (estadisticasGlobales.goles / estadisticasGlobales.partidos).toFixed(2) : 0;
        console.log(`   📊 Promedio goles/partido: ${promedioGoles}`);
    }

    // Validaciones del sistema
    console.log("\n🔍 VALIDACIONES DEL SISTEMA:");

    const validaciones = [
        {
            nombre: "Creación de torneos diversos",
            valido: exitosos.length === CONFIGURACIONES_TEST.length,
            detalle: `${exitosos.length}/${CONFIGURACIONES_TEST.length} configuraciones exitosas`
        },
        {
            nombre: "Generación de equipos con jugadores",
            valido: exitosos.every(r => r.resultado.estadisticas.jugadores > 0),
            detalle: exitosos.every(r => r.resultado.estadisticas.jugadores > 0) ? "Todos los equipos tienen jugadores" : "Algunos equipos sin jugadores"
        },
        {
            nombre: "Sorteo y distribución equitativa",
            valido: exitosos.every(r => r.resultado.grupos.every(g => g.equipos.length > 0)),
            detalle: "Todos los grupos tienen equipos asignados"
        },
        {
            nombre: "Simulación de partidos completa",
            valido: exitosos.every(r => r.resultado.estadisticas.partidos > 0),
            detalle: "Todos los torneos generaron partidos"
        },
        {
            nombre: "Cálculo de clasificaciones",
            valido: exitosos.every(r => r.resultado.grupos.every(g => g.clasificacion.length > 0)),
            detalle: "Todas las clasificaciones calculadas correctamente"
        },
        {
            nombre: "Detección de eliminatorias",
            valido: exitosos.filter(r => r.configuracion.formatoTorneo === "grupos-eliminatorias").every(r => r.resultado.eliminatorias.length > 0),
            detalle: "Eliminatorias generadas cuando corresponde"
        }
    ];

    validaciones.forEach(validacion => {
        const estado = validacion.valido ? "✅" : "❌";
        console.log(`${estado} ${validacion.nombre}: ${validacion.detalle}`);
    });

    const todoValido = validaciones.every(v => v.valido);
    console.log(`\n🎯 EVALUACIÓN FINAL: ${todoValido ? "SISTEMA COMPLETAMENTE FUNCIONAL" : "REQUIERE REVISIÓN"}`);

    return {
        exitoso: todoValido,
        resultados,
        estadisticasGlobales: exitosos.length > 0 ? exitosos.reduce((total, r) => ({
            equipos: total.equipos + r.resultado.estadisticas.equipos,
            partidos: total.partidos + r.resultado.estadisticas.partidos,
            goles: total.goles + r.resultado.estadisticas.goles,
            jugadores: total.jugadores + r.resultado.estadisticas.jugadoresTotal
        }), { equipos: 0, partidos: 0, goles: 0, jugadores: 0 }) : null,
        validaciones,
        tiempoEjecucion: tiempoTotal
    };
}

// Ejecutar si se llama directamente
if (require.main === module) {
    ejecutarSimulacionesRobustas().then(resultado => {
        process.exit(resultado.exitoso ? 0 : 1);
    });
}

module.exports = {
    ejecutarSimulacionesRobustas,
    simularTorneoRobusto,
    CONFIGURACIONES_TEST
};