import { Categoria, TipoTorneo, TipoFutbol, CampoFutbol } from '@/types';

export const CATEGORIAS: Categoria[] = [
  'Benjamin',
  'Alevin', 
  'Infantil',
  'Cadete',
  'Juvenil',
  'Senior'
];

export const CIUDADES = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Zaragoza',
  'Málaga',
  'Murcia',
  'Palma',
  'Las Palmas',
  'Bilbao',
  'Alicante',
  'Córdoba',
  'Valladolid',
  'Vigo',
  'Gijón',
  'Hospitalet',
  'Vitoria',
  'A Coruña',
  'Granada',
  'Elche',
  'Oviedo',
  'Badalona',
  'Cartagena',
  'Terrassa',
  'Jerez',
  'Sabadell',
  'Móstoles',
  'Santa Cruz',
  'Pamplona',
  'Almería',
  'Alcalá de Henares',
  'Fuenlabrada',
  'Leganés',
  'Santander',
  'Burgos',
  'Castellón',
  'Getafe',
  'Albacete',
  'Alcorcón',
  'Logroño',
  'San Sebastián',
  'Badajoz',
  'Huelva',
  'Marbella',
  'Tarragona',
  'León',
  'Cádiz',
  'Dos Hermanas',
  'Mataró',
  'Torrejón',
  'Parla',
  'Algeciras'
];

export const TIPOS_TORNEO: { value: TipoTorneo; label: string; descripcion: string }[] = [
  {
    value: 'grupos',
    label: 'Liga',
    descripcion: 'Todos contra todos, el equipo con más puntos gana'
  },
  {
    value: 'eliminatorias',
    label: 'Eliminatorias',
    descripcion: 'Eliminación directa hasta la final'
  },
  {
    value: 'grupos-eliminatorias',
    label: 'Grupos + Eliminatorias',
    descripcion: 'Fase de grupos seguida de eliminatorias'
  }
];

export const POSICIONES = [
  'Portero',
  'Defensa',
  'Mediocampista',
  'Delantero'
] as const;

export const COLORES_EQUIPO = [
  { nombre: 'Rojo', valor: '#E74C3C' },
  { nombre: 'Azul', valor: '#3498DB' },
  { nombre: 'Verde', valor: '#2ECC40' },
  { nombre: 'Amarillo', valor: '#F1C40F' },
  { nombre: 'Naranja', valor: '#E67E22' },
  { nombre: 'Morado', valor: '#9B59B6' },
  { nombre: 'Rosa', valor: '#E91E63' },
  { nombre: 'Cian', valor: '#1ABC9C' },
  { nombre: 'Negro', valor: '#2C3E50' },
  { nombre: 'Blanco', valor: '#FFFFFF' },
  { nombre: 'Gris', valor: '#95A5A6' },
  { nombre: 'Marrón', valor: '#8D6E63' }
];

export const LOGROS_DISPONIBLES = [
  {
    id: 'primer_torneo',
    nombre: 'Primer Torneo',
    descripcion: 'Participa en tu primer torneo',
    icono: 'trophy',
    tipo: 'equipo' as const,
    condicion: 'participar_torneo',
    puntos: 10
  },
  {
    id: 'campeon',
    nombre: 'Campeón',
    descripcion: 'Gana tu primer torneo',
    icono: 'crown',
    tipo: 'equipo' as const,
    condicion: 'ganar_torneo',
    puntos: 50
  },
  {
    id: 'goleador',
    nombre: 'Máximo Goleador',
    descripcion: 'Ser el máximo goleador de un torneo',
    icono: 'target',
    tipo: 'jugador' as const,
    condicion: 'maximo_goleador',
    puntos: 30
  },
  {
    id: 'invicto',
    nombre: 'Invicto',
    descripcion: 'Termina un torneo sin perder ningún partido',
    icono: 'shield',
    tipo: 'equipo' as const,
    condicion: 'torneo_invicto',
    puntos: 40
  },
  {
    id: 'portero_cero',
    nombre: 'Muro Infranqueable',
    descripcion: 'Mantén la portería a cero en 5 partidos consecutivos',
    icono: 'shield-check',
    tipo: 'jugador' as const,
    condicion: 'porteria_cero_consecutiva',
    puntos: 25
  },
  {
    id: 'fan_dedicado',
    nombre: 'Fan Dedicado',
    descripcion: 'Sigue 10 torneos como espectador',
    icono: 'heart',
    tipo: 'espectador' as const,
    condicion: 'seguir_torneos',
    puntos: 15
  },
  {
    id: 'entrenador_experto',
    nombre: 'Entrenador Experto',
    descripcion: 'Crea y gestiona 5 equipos diferentes',
    icono: 'users',
    tipo: 'entrenador' as const,
    condicion: 'crear_equipos',
    puntos: 35
  },
  {
    id: 'organizador',
    nombre: 'Gran Organizador',
    descripcion: 'Organiza 3 torneos exitosos',
    icono: 'calendar',
    tipo: 'entrenador' as const,
    condicion: 'organizar_torneos',
    puntos: 45
  }
];

export const CONFIGURACION_DEFAULT = {
  puntosVictoria: 3,
  puntosEmpate: 1,
  puntosDerrota: 0,
  tiempoPartido: 90,
  descanso: 15,
  permitirEmpates: true
};

export const CONFIGURACION_POR_TIPO: Record<TipoFutbol, typeof CONFIGURACION_DEFAULT> = {
  F11: {
    puntosVictoria: 3,
    puntosEmpate: 1,
    puntosDerrota: 0,
    tiempoPartido: 90,
    descanso: 15,
    permitirEmpates: true
  },
  F7: {
    puntosVictoria: 3,
    puntosEmpate: 1,
    puntosDerrota: 0,
    tiempoPartido: 60,
    descanso: 10,
    permitirEmpates: true
  },
  Sala: {
    puntosVictoria: 3,
    puntosEmpate: 1,
    puntosDerrota: 0,
    tiempoPartido: 40,
    descanso: 10,
    permitirEmpates: true
  }
};

export const NUMEROS_CAMISETA = Array.from({ length: 99 }, (_, i) => i + 1);

export const DIAS_SEMANA = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
] as const;

export const PIES_PREDOMINANTES = [
  'Derecho',
  'Izquierdo', 
  'Ambidiestro'
] as const;

export const TIPOS_FUTBOL: { value: TipoFutbol; label: string; descripcion: string; jugadores: number }[] = [
  {
    value: 'F11',
    label: 'Fútbol 11',
    descripcion: 'Fútbol tradicional con 11 jugadores por equipo',
    jugadores: 11
  },
  {
    value: 'F7',
    label: 'Fútbol 7',
    descripcion: 'Fútbol reducido con 7 jugadores por equipo',
    jugadores: 7
  },
  {
    value: 'Sala',
    label: 'Fútbol Sala',
    descripcion: 'Fútbol indoor con 5 jugadores por equipo',
    jugadores: 5
  }
];

export const SUPERFICIES_CAMPO = [
  'Césped natural',
  'Césped artificial',
  'Tierra',
  'Cemento'
] as const;

export const CAMPOS_MOCK: CampoFutbol[] = [
  {
    id: '1',
    nombre: 'Campo Municipal Norte',
    direccion: 'Av. de la Constitución, 123',
    ciudad: 'Madrid',
    tipo: 'F11',
    superficie: 'Césped natural',
    iluminacion: true,
    vestuarios: true,
    capacidad: 500,
    precio: 80
  },
  {
    id: '2',
    nombre: 'Polideportivo Central',
    direccion: 'C/ del Deporte, 45',
    ciudad: 'Barcelona',
    tipo: 'F7',
    superficie: 'Césped artificial',
    iluminacion: true,
    vestuarios: true,
    capacidad: 200,
    precio: 50
  },
  {
    id: '3',
    nombre: 'Pabellón San José',
    direccion: 'Plaza San José, 12',
    ciudad: 'Valencia',
    tipo: 'Sala',
    superficie: 'Cemento',
    iluminacion: true,
    vestuarios: true,
    capacidad: 100,
    precio: 30
  },
  {
    id: '4',
    nombre: 'Campo de la Juventud',
    direccion: 'C/ Juventud, 78',
    ciudad: 'Sevilla',
    tipo: 'F11',
    superficie: 'Césped artificial',
    iluminacion: false,
    vestuarios: true,
    capacidad: 300,
    precio: 60
  },
  {
    id: '5',
    nombre: 'Complejo Deportivo Este',
    direccion: 'Av. del Este, 234',
    ciudad: 'Madrid',
    tipo: 'F7',
    superficie: 'Césped artificial',
    iluminacion: true,
    vestuarios: true,
    capacidad: 150,
    precio: 45
  }
];