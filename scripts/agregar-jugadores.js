console.log('🏃‍♂️ === AGREGANDO JUGADORES A EQUIPOS ===');

// Lista de nombres de jugadores realistas
const nombresJugadores = [
    // Nombres españoles comunes
    'Alejandro García', 'Carlos Rodríguez', 'David López', 'Miguel Fernández',
    'Pablo Martín', 'Adrián Sánchez', 'Daniel Pérez', 'Mario Gómez',
    'Álvaro Jiménez', 'Sergio Ruiz', 'Hugo Moreno', 'Lucas Muñoz',
    'Iker Romero', 'Rubén Alonso', 'Diego Blanco', 'Jaime Castro',
    'Antonio Vargas', 'Francisco Ramos', 'Raúl Herrera', 'Gonzalo Medina',
    'Nicolás Torres', 'Fernando Díaz', 'Gabriel Santos', 'Víctor Aguilar',
    'Manuel Cortés', 'Rafael Vega', 'Eduardo Silva', 'Roberto Morales',
    'Emilio Guerrero', 'Cristian Ortega', 'Alberto Delgado', 'Jesús Molina',

    // Algunos nombres internacionales
    'Bruno Silva', 'Marco Rossi', 'Luca Bianchi', 'Andrea Conti',
    'Thomas Müller Jr.', 'Jean Dubois', 'Pierre Martin', 'Kevin Johnson',
    'Michael Smith', 'Ryan Williams', 'Aleksandr Petrov', 'Dmitri Volkov'
];

// Posiciones de fútbol
const posiciones = [
    'Portero', 'Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo',
    'Mediocentro Defensivo', 'Mediocentro', 'Mediocentro Ofensivo',
    'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro', 'Segundo Delantero'
];

// Función para generar un número de dorsal aleatorio
function generarDorsal(dorsalesUsados) {
    let dorsal;
    do {
        dorsal = Math.floor(Math.random() * 99) + 1; // Del 1 al 99
    } while (dorsalesUsados.includes(dorsal));
    return dorsal;
}

// Función para generar jugadores para un equipo
function generarJugadoresParaEquipo(equipoId, nombreEquipo, numJugadores = 18) {
    const jugadores = [];
    const dorsalesUsados = [];
    const nombresUsados = [];

    console.log(`\n⚽ Generando ${numJugadores} jugadores para: ${nombreEquipo}`);

    // Asegurar que hay al menos 1 portero
    const numPorteros = Math.min(2, Math.floor(numJugadores * 0.15)); // 15% porteros, mínimo 1
    const numDefensas = Math.floor(numJugadores * 0.35); // 35% defensas
    const numMedios = Math.floor(numJugadores * 0.35); // 35% medios
    const numDelanteros = numJugadores - numPorteros - numDefensas - numMedios; // Resto delanteros

    let posicionesAsignadas = [];

    // Agregar porteros
    for (let i = 0; i < numPorteros; i++) {
        posicionesAsignadas.push('Portero');
    }

    // Agregar defensas
    const posicionesDefensa = ['Defensa Central', 'Lateral Derecho', 'Lateral Izquierdo', 'Defensa Central'];
    for (let i = 0; i < numDefensas; i++) {
        posicionesAsignadas.push(posicionesDefensa[i % posicionesDefensa.length]);
    }

    // Agregar medios
    const posicionesMedio = ['Mediocentro Defensivo', 'Mediocentro', 'Mediocentro Ofensivo', 'Extremo Derecho', 'Extremo Izquierdo'];
    for (let i = 0; i < numMedios; i++) {
        posicionesAsignadas.push(posicionesMedio[i % posicionesMedio.length]);
    }

    // Agregar delanteros
    const posicionesDelantero = ['Delantero Centro', 'Segundo Delantero', 'Extremo Derecho', 'Extremo Izquierdo'];
    for (let i = 0; i < numDelanteros; i++) {
        posicionesAsignadas.push(posicionesDelantero[i % posicionesDelantero.length]);
    }

    // Mezclar posiciones para variedad
    posicionesAsignadas.sort(() => Math.random() - 0.5);

    for (let i = 0; i < numJugadores; i++) {
        let nombre;
        do {
            nombre = nombresJugadores[Math.floor(Math.random() * nombresJugadores.length)];
        } while (nombresUsados.includes(nombre));
        nombresUsados.push(nombre);

        const dorsal = generarDorsal(dorsalesUsados);
        dorsalesUsados.push(dorsal);

        const posicion = posicionesAsignadas[i];
        const edad = 16 + Math.floor(Math.random() * 6); // Edades entre 16 y 21 para alevines

        const jugador = {
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
            equipoId: equipoId,
            nombre: nombre,
            dorsal: dorsal,
            posicion: posicion,
            edad: edad,
            fechaRegistro: new Date().toISOString(),
            activo: true,
            // Estadísticas opcionales
            partidosJugados: 0,
            goles: 0,
            asistencias: 0,
            tarjetasAmarillas: 0,
            tarjetasRojas: 0
        };

        jugadores.push(jugador);
        console.log(`  ${i + 1}. ${nombre} (#${dorsal}) - ${posicion} (${edad} años)`);
    }

    return jugadores;
}

// IDs de los equipos de prueba (basados en los logs que vimos)
const equiposPrueba = [
    { id: "1758872778513", nombre: "Real Madrid CF Alevín F7" },
    { id: "1758872778559", nombre: "Real Madrid CF Alevín F7 B" },
    { id: "1758872778612", nombre: "FC Barcelona Alevín F7" },
    { id: "1758872778665", nombre: "FC Barcelona Alevín F7 B" },
    { id: "1758872778719", nombre: "Atlético Madrid Alevín F7" },
    { id: "1758872778773", nombre: "Atlético Madrid Alevín F7 B" },
    { id: "1758872778831", nombre: "Valencia CF Alevín F7" },
    { id: "1758872778887", nombre: "Valencia CF Alevín F7 B" }
];

console.log(`\n🏆 Generando jugadores para ${equiposPrueba.length} equipos...\n`);

const todosLosJugadores = [];

equiposPrueba.forEach((equipo, index) => {
    const jugadores = generarJugadoresParaEquipo(equipo.id, equipo.nombre, 16 + Math.floor(Math.random() * 7)); // Entre 16 y 22 jugadores
    todosLosJugadores.push(...jugadores);
});

console.log(`\n📊 RESUMEN:`);
console.log(`✅ Total de jugadores generados: ${todosLosJugadores.length}`);
console.log(`📋 Promedio por equipo: ${Math.round(todosLosJugadores.length / equiposPrueba.length)} jugadores`);

console.log('\n💾 DATOS PARA IMPORTAR:');
console.log('================================================');
console.log('// Copia este código y ejecútalo en la consola del navegador');
console.log('// cuando tengas la app abierta para agregar los jugadores');
console.log('');
console.log('(async () => {');
console.log('  const jugadores = ' + JSON.stringify(todosLosJugadores, null, 2) + ';');
console.log('');
console.log('  console.log("🏃‍♂️ Importando", jugadores.length, "jugadores...");');
console.log('');
console.log('  try {');
console.log('    // Obtener datos actuales');
console.log('    const equiposData = await AsyncStorage.getItem("equipos-data");');
console.log('    let equipos = equiposData ? JSON.parse(equiposData) : [];');
console.log('');
console.log('    // Agregar jugadores a cada equipo');
console.log('    equipos = equipos.map(equipo => {');
console.log('      const jugadoresDelEquipo = jugadores.filter(j => j.equipoId === equipo.id);');
console.log('      if (jugadoresDelEquipo.length > 0) {');
console.log('        console.log(`➕ Agregando ${jugadoresDelEquipo.length} jugadores a ${equipo.nombre}`);');
console.log('        return {');
console.log('          ...equipo,');
console.log('          jugadores: [...(equipo.jugadores || []), ...jugadoresDelEquipo],');
console.log('          cantidadJugadores: (equipo.cantidadJugadores || 0) + jugadoresDelEquipo.length');
console.log('        };');
console.log('      }');
console.log('      return equipo;');
console.log('    });');
console.log('');
console.log('    // Guardar datos actualizados');
console.log('    await AsyncStorage.setItem("equipos-data", JSON.stringify(equipos));');
console.log('');
console.log('    console.log("✅ Jugadores importados exitosamente!");');
console.log('    console.log("🔄 Recarga la aplicación para ver los cambios");');
console.log('  } catch (error) {');
console.log('    console.error("❌ Error importando jugadores:", error);');
console.log('  }');
console.log('})();');
console.log('================================================');

console.log('\n🎯 INSTRUCCIONES:');
console.log('1. Abre la app en el navegador (http://localhost:8081)');
console.log('2. Presiona F12 para abrir DevTools');
console.log('3. Ve a la pestaña "Console"');
console.log('4. Copia y pega el código de arriba');
console.log('5. Presiona Enter para ejecutarlo');
console.log('6. Recarga la app para ver los jugadores');