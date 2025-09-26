console.log('🎲 === GENERANDO DATOS DE PRUEBA EN TIEMPO REAL ===');

// Simular AsyncStorage para Node.js
global.AsyncStorage = {
  data: {},
  async getItem(key) { return this.data[key] || null; },
  async setItem(key, value) { this.data[key] = value; console.log(`✅ Saved ${key}: ${value.length} chars`); }
};

// Generar datos coherentes
function generateTestData() {
  const now = Date.now();
  const entrenadorId = "test-user-123";
  
  // Generar clubes
  const clubes = [
    {
      id: `${now + 1000}`,
      nombre: "Real Madrid CF",
      entrenadorId,
      ubicacion: { ciudad: "Madrid", direccion: "Estadio Santiago Bernabéu" },
      categorias: {
        alevin: { nombre: "Alevín", equipos: [] }
      },
      fechaCreacion: new Date().toISOString(),
      estadisticas: { totalEquipos: 0, torneosParticipados: 0, amistososJugados: 0 }
    },
    {
      id: `${now + 2000}`,
      nombre: "FC Barcelona", 
      entrenadorId,
      ubicacion: { ciudad: "Barcelona", direccion: "Camp Nou" },
      categorias: {
        alevin: { nombre: "Alevín", equipos: [] }
      },
      fechaCreacion: new Date().toISOString(),
      estadisticas: { totalEquipos: 0, torneosParticipados: 0, amistososJugados: 0 }
    },
    {
      id: `${now + 3000}`,
      nombre: "Atlético Madrid",
      entrenadorId,
      ubicacion: { ciudad: "Madrid", direccion: "Metropolitano" },
      categorias: {
        alevin: { nombre: "Alevín", equipos: [] }
      },
      fechaCreacion: new Date().toISOString(),
      estadisticas: { totalEquipos: 0, torneosParticipados: 0, amistososJugados: 0 }
    }
  ];

  // Generar equipos VINCULADOS CORRECTAMENTE a los clubes
  const equipos = [
    {
      id: `${now + 5000}`,
      nombre: "Real Madrid CF Alevín A",
      clubId: `${now + 1000}`, // ¡VINCULACIÓN CORRECTA!
      categoria: "Alevin",
      tipoFutbol: "F7",
      entrenadorId,
      colores: { principal: "#FFFFFF", secundario: "#000080" },
      escudo: "⚽",
      ciudad: "Madrid",
      fechaCreacion: new Date().toISOString(),
      jugadores: [],
      estadisticas: {
        partidosJugados: 0, partidosGanados: 0, partidosEmpatados: 0,
        partidosPerdidos: 0, golesFavor: 0, golesContra: 0,
        torneosGanados: 0, torneosParticipados: 0, amistososJugados: 0, amistososGanados: 0
      }
    },
    {
      id: `${now + 6000}`,
      nombre: "FC Barcelona Alevín A",
      clubId: `${now + 2000}`, // ¡VINCULACIÓN CORRECTA!
      categoria: "Alevin",
      tipoFutbol: "F7",
      entrenadorId,
      colores: { principal: "#004D98", secundario: "#FFCC00" },
      escudo: "⚽",
      ciudad: "Barcelona",
      fechaCreacion: new Date().toISOString(),
      jugadores: [],
      estadisticas: {
        partidosJugados: 0, partidosGanados: 0, partidosEmpatados: 0,
        partidosPerdidos: 0, golesFavor: 0, golesContra: 0,
        torneosGanados: 0, torneosParticipados: 0, amistososJugados: 0, amistososGanados: 0
      }
    },
    {
      id: `${now + 7000}`,
      nombre: "Atlético Madrid Alevín A",
      clubId: `${now + 3000}`, // ¡VINCULACIÓN CORRECTA!
      categoria: "Alevin",
      tipoFutbol: "F7", 
      entrenadorId,
      colores: { principal: "#CE3524", secundario: "#FFFFFF" },
      escudo: "⚽",
      ciudad: "Madrid",
      fechaCreación: new Date().toISOString(),
      jugadores: [],
      estadisticas: {
        partidosJugados: 0, partidosGanados: 0, partidosEmpatados: 0,
        partidosPerdidos: 0, golesFavor: 0, golesContra: 0,
        torneosGanados: 0, torneosParticipados: 0, amistososJugados: 0, amistososGanados: 0
      }
    }
  ];

  console.log('✅ Clubes generados:', clubes.length);
  console.log('✅ Equipos generados:', equipos.length);
  console.log('🔗 Verificando vinculaciones:');
  
  equipos.forEach(equipo => {
    const club = clubes.find(c => c.id === equipo.clubId);
    console.log(`  ${equipo.nombre} -> Club: ${club ? club.nombre : '❌ NO ENCONTRADO'} (${equipo.clubId})`);
  });

  return { clubes, equipos };
}

const data = generateTestData();
console.log('\\n🛠️ DATOS PARA INYECTAR EN LA APP:');
console.log('==========================================');
console.log('// Para aplicar directamente en AsyncStorage:');
console.log(`const clubes = ${JSON.stringify(data.clubes, null, 2)};`);
console.log(`const equipos = ${JSON.stringify(data.equipos, null, 2)};`);
console.log('\\n// Comandos para ejecutar en la app:');
console.log('await AsyncStorage.setItem("clubes", JSON.stringify(clubes));');
console.log('await AsyncStorage.setItem("equipos", JSON.stringify(equipos));');
console.log('\\n🎯 ¡Listo para usar!');
