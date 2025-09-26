import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const datosCompletos = {
    "equipos": [
        {
            "id": "equipo-club-real-madrid-alevin",
            "nombre": "Real Madrid CF Alevín F7",
            "colores": {
                "principal": "#FFFFFF",
                "secundario": "#000080"
            },
            "entrenadorId": "entrenador-demo",
            "jugadores": [
                {
                    "id": "jugador-equipo-club-real-madrid-alevin-1",
                    "nombre": "Alejandro Hernández",
                    "numero": 1,
                    "posicion": "Portero",
                    "equipoId": "equipo-club-real-madrid-alevin",
                    "edad": 12,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-real-madrid-alevin-2",
                    "nombre": "Ángel Moreno",
                    "numero": 2,
                    "posicion": "Defensa",
                    "equipoId": "equipo-club-real-madrid-alevin",
                    "edad": 11,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-real-madrid-alevin-3",
                    "nombre": "Daniel Fernández",
                    "numero": 3,
                    "posicion": "Mediocampista",
                    "equipoId": "equipo-club-real-madrid-alevin",
                    "edad": 11,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-real-madrid-alevin-4",
                    "nombre": "Pablo Gómez",
                    "numero": 4,
                    "posicion": "Mediocampista",
                    "equipoId": "equipo-club-real-madrid-alevin",
                    "edad": 10,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-real-madrid-alevin-5",
                    "nombre": "Diego Fernández",
                    "numero": 5,
                    "posicion": "Delantero",
                    "equipoId": "equipo-club-real-madrid-alevin",
                    "edad": 11,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                }
            ],
            "fechaCreacion": "2025-09-26T09:14:28.500Z",
            "ciudad": "Madrid",
            "categoria": "Alevin",
            "tipoFutbol": "F7",
            "clubId": "club-real-madrid",
            "estadisticas": {
                "partidosJugados": 0,
                "partidosGanados": 0,
                "partidosEmpatados": 0,
                "partidosPerdidos": 0,
                "golesFavor": 0,
                "golesContra": 0,
                "torneosParticipados": 0,
                "torneosGanados": 0,
                "amistososJugados": 0,
                "amistososGanados": 0
            }
        },
        {
            "id": "equipo-club-barcelona-alevin",
            "nombre": "FC Barcelona Alevín F7",
            "colores": {
                "principal": "#004D98",
                "secundario": "#FCBF49"
            },
            "entrenadorId": "entrenador-demo",
            "jugadores": [
                {
                    "id": "jugador-equipo-club-barcelona-alevin-1",
                    "nombre": "Rafael Martínez",
                    "numero": 1,
                    "posicion": "Portero",
                    "equipoId": "equipo-club-barcelona-alevin",
                    "edad": 10,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-barcelona-alevin-2",
                    "nombre": "Javier Gómez",
                    "numero": 2,
                    "posicion": "Defensa",
                    "equipoId": "equipo-club-barcelona-alevin",
                    "edad": 10,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-barcelona-alevin-3",
                    "nombre": "Rafael Fernández",
                    "numero": 3,
                    "posicion": "Mediocampista",
                    "equipoId": "equipo-club-barcelona-alevin",
                    "edad": 12,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-barcelona-alevin-4",
                    "nombre": "Javier Pérez",
                    "numero": 4,
                    "posicion": "Delantero",
                    "equipoId": "equipo-club-barcelona-alevin",
                    "edad": 11,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                },
                {
                    "id": "jugador-equipo-club-barcelona-alevin-5",
                    "nombre": "Carlos Martín",
                    "numero": 5,
                    "posicion": "Mediocampista",
                    "equipoId": "equipo-club-barcelona-alevin",
                    "edad": 11,
                    "fechaRegistro": "2025-09-26T09:14:28.500Z"
                }
            ],
            "fechaCreacion": "2025-09-26T09:14:28.500Z",
            "ciudad": "Barcelona",
            "categoria": "Alevin",
            "tipoFutbol": "F7",
            "clubId": "club-barcelona",
            "estadisticas": {
                "partidosJugados": 0,
                "partidosGanados": 0,
                "partidosEmpatados": 0,
                "partidosPerdidos": 0,
                "golesFavor": 0,
                "golesContra": 0,
                "torneosParticipados": 0,
                "torneosGanados": 0,
                "amistososJugados": 0,
                "amistososGanados": 0
            }
        }
    ],
    "torneos": [
        {
            "id": "torneo-demo-alevin",
            "nombre": "Liga Alevín F7 - Demo",
            "descripcion": "Torneo de demostración con equipos y jugadores completos",
            "fechaInicio": "2025-09-26",
            "fechaFin": "2025-10-26",
            "estado": "En curso",
            "tipo": "grupos",
            "categoria": "Alevin",
            "tipoFutbol": "F7",
            "ubicacion": "Madrid",
            "entrenadorId": "entrenador-demo",
            "equiposIds": [
                "equipo-club-real-madrid-alevin",
                "equipo-club-barcelona-alevin"
            ],
            "configuracion": {
                "maxEquipos": 16,
                "minEquipos": 4,
                "tiempoPartido": 30,
                "tiempoDescanso": 10,
                "puntosVictoria": 3,
                "puntosEmpate": 1,
                "puntosDerrota": 0,
                "permiteTarjetas": true,
                "permiteCambios": true,
                "maxCambios": 5
            },
            "grupos": {
                "A": [
                    "equipo-club-real-madrid-alevin",
                    "equipo-club-barcelona-alevin"
                ]
            },
            "fechaCreacion": "2025-09-26T09:14:28.500Z"
        }
    ],
    "partidos": [
        {
            "id": "partido-demo-1",
            "equipoLocalId": "equipo-club-real-madrid-alevin",
            "equipoVisitanteId": "equipo-club-barcelona-alevin",
            "torneoId": "torneo-demo-alevin",
            "fecha": "2025-09-26",
            "hora": "10:00",
            "jornada": 1,
            "estado": "Pendiente",
            "goleadores": [],
            "eventos": [],
            "campoId": "campo-demo-1"
        }
    ],
    "campos": [
        {
            "id": "campo-demo-1",
            "nombre": "Campo Municipal Norte",
            "direccion": "Calle del Deporte 1",
            "ciudad": "Madrid",
            "tipo": "F7",
            "disponible": true,
            "superficie": "césped artificial",
            "entrenadorId": "entrenador-demo"
        }
    ],
    "clubes": [
        {
            "id": "club-real-madrid",
            "nombre": "Real Madrid CF",
            "ubicacion": {
                "direccion": "Santiago Bernabéu",
                "ciudad": "Madrid"
            },
            "entrenadorId": "entrenador-demo",
            "fechaCreacion": "2025-09-26T09:14:28.501Z",
            "categorias": {
                "alevin": {
                    "nombre": "Alevin",
                    "equipos": ["equipo-club-real-madrid-alevin"]
                }
            }
        },
        {
            "id": "club-barcelona",
            "nombre": "FC Barcelona",
            "ubicacion": {
                "direccion": "Camp Nou",
                "ciudad": "Barcelona"
            },
            "entrenadorId": "entrenador-demo",
            "fechaCreacion": "2025-09-26T09:14:28.501Z",
            "categorias": {
                "alevin": {
                    "nombre": "Alevin",
                    "equipos": ["equipo-club-barcelona-alevin"]
                }
            }
        }
    ]
};

export default function ImportadorDatos() {
    const importarDatos = async () => {
        try {
            console.log('🚀 Iniciando importación de datos de prueba...');

            // Guardar cada tipo de datos
            await AsyncStorage.setItem('equipos', JSON.stringify(datosCompletos.equipos));
            await AsyncStorage.setItem('torneos', JSON.stringify(datosCompletos.torneos));
            await AsyncStorage.setItem('partidos', JSON.stringify(datosCompletos.partidos));
            await AsyncStorage.setItem('campos', JSON.stringify(datosCompletos.campos));
            await AsyncStorage.setItem('clubes', JSON.stringify(datosCompletos.clubes));

            console.log('✅ Datos importados correctamente');

            Alert.alert(
                '🎉 ¡Datos Importados!',
                'Los datos de prueba han sido importados correctamente.\n\n' +
                '📊 Equipos: ' + datosCompletos.equipos.length + '\n' +
                '🏆 Torneos: ' + datosCompletos.torneos.length + '\n' +
                '⚽ Partidos: ' + datosCompletos.partidos.length + '\n' +
                '🏟️ Campos: ' + datosCompletos.campos.length + '\n\n' +
                'Puedes probar la funcionalidad de partidos ahora.',
                [{ text: 'OK', style: 'default' }]
            );
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            Alert.alert('Error', 'No se pudieron importar los datos: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const verificarDatos = async () => {
        try {
            const equipos = await AsyncStorage.getItem('equipos');
            const partidos = await AsyncStorage.getItem('partidos');
            const torneos = await AsyncStorage.getItem('torneos');

            const equiposParsed = equipos ? JSON.parse(equipos) : [];
            const partidosParsed = partidos ? JSON.parse(partidos) : [];
            const torneosParsed = torneos ? JSON.parse(torneos) : [];

            console.log('📊 Datos actuales:', {
                equipos: equiposParsed.length,
                partidos: partidosParsed.length,
                torneos: torneosParsed.length
            });

            Alert.alert(
                '📊 Estado Actual',
                `Datos en AsyncStorage:\n\n` +
                `⚽ Equipos: ${equiposParsed.length}\n` +
                `🥅 Partidos: ${partidosParsed.length}\n` +
                `🏆 Torneos: ${torneosParsed.length}`
            );
        } catch (error) {
            console.error('❌ Error verificando datos:', error);
            Alert.alert('Error', 'No se pudieron verificar los datos');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>🧪 Datos de Prueba</Text>
            <Text style={styles.descripcion}>
                Importa datos de prueba completos para probar la funcionalidad de partidos
            </Text>

            <TouchableOpacity style={styles.botonImportar} onPress={importarDatos}>
                <Text style={styles.textoBoton}>📥 Importar Datos de Prueba</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonVerificar} onPress={verificarDatos}>
                <Text style={styles.textoBotonVerificar}>📊 Verificar Estado</Text>
            </TouchableOpacity>

            <Text style={styles.info}>
                Los datos incluyen:{'\n'}
                • 2 equipos con 5 jugadores cada uno{'\n'}
                • 1 torneo configurado{'\n'}
                • 1 partido listo para jugar{'\n'}
                • Campos y clubes de prueba
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.background,
        justifyContent: 'center',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: Colors.text,
    },
    descripcion: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: Colors.textLight,
        lineHeight: 24,
    },
    botonImportar: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    textoBoton: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    botonVerificar: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textoBotonVerificar: {
        color: Colors.text,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    info: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
        fontStyle: 'italic',
    },
});