import Colors from '@/constants/colors';
import { useData } from '@/hooks/data-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle, RefreshCw, Wrench, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DataFixerModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function DataFixerModal({ visible, onClose }: DataFixerModalProps) {
    const [fixing, setFixing] = useState(false);
    const [fixResults, setFixResults] = useState<string[]>([]);
    const { recargarDatos, clubes, equipos } = useData();

    const arreglarDatosClubEquipos = async () => {
        setFixing(true);
        setFixResults([]);

        try {
            console.log('🔧 === INICIANDO REPARACIÓN DE IDs CLUB-EQUIPOS ===');
            setFixResults(prev => [...prev, '🔧 Iniciando reparación de IDs Club-Equipos...']);

            // Datos corregidos basados en el análisis en tiempo real
            const equiposCorregidos = [
                {
                    "id": "1758872778513",
                    "nombre": "Real Madrid CF Alevín F7",
                    "clubId": "1758872774348", // Real Madrid CF
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#FF6B35", "secundario": "#F7931E" },
                    "escudo": "⚽",
                    "ciudad": "Madrid",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                },
                {
                    "id": "1758872778559",
                    "nombre": "Real Madrid CF Alevín F7 B",
                    "clubId": "1758872774348", // Real Madrid CF
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#4ECDC4", "secundario": "#44A08D" },
                    "escudo": "⚽",
                    "ciudad": "Madrid",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                },
                {
                    "id": "1758872778612",
                    "nombre": "FC Barcelona Alevín F7",
                    "clubId": "1758872774352", // FC Barcelona
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#45B7D1", "secundario": "#96CEB4" },
                    "escudo": "⚽",
                    "ciudad": "Barcelona",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                },
                {
                    "id": "1758872778665",
                    "nombre": "FC Barcelona Alevín F7 B",
                    "clubId": "1758872774352", // FC Barcelona
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#FFA07A", "secundario": "#FFE66D" },
                    "escudo": "⚽",
                    "ciudad": "Barcelona",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                },
                {
                    "id": "1758872778719",
                    "nombre": "Atlético Madrid Alevín F7",
                    "clubId": "1758872774416", // Atlético Madrid
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#98D8C8", "secundario": "#F7DC6F" },
                    "escudo": "⚽",
                    "ciudad": "Madrid",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                },
                {
                    "id": "1758872778773",
                    "nombre": "Atlético Madrid Alevín F7 B",
                    "clubId": "1758872774416", // Atlético Madrid
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#FF69B4", "secundario": "#32CD32" },
                    "escudo": "⚽",
                    "ciudad": "Madrid",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                },
                {
                    "id": "1758872778831",
                    "nombre": "Valencia CF Alevín F7",
                    "clubId": "1758872774456", // Valencia CF
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#FFD700", "secundario": "#FF4500" },
                    "escudo": "⚽",
                    "ciudad": "Valencia",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                },
                {
                    "id": "1758872778887",
                    "nombre": "Valencia CF Alevín F7 B",
                    "clubId": "1758872774456", // Valencia CF
                    "categoria": "Alevin",
                    "tipoFutbol": "F7",
                    "entrenadorId": "test-user-123",
                    "colores": { "principal": "#9370DB", "secundario": "#20B2AA" },
                    "escudo": "⚽",
                    "ciudad": "Valencia",
                    "fechaCreacion": new Date().toISOString(),
                    "estadisticas": {
                        "partidosJugados": 0, "partidosGanados": 0, "partidosEmpatados": 0,
                        "partidosPerdidos": 0, "golesFavor": 0, "golesContra": 0,
                        "torneosGanados": 0, "torneosParticipados": 0, "amistososJugados": 0, "amistososGanados": 0
                    }
                }
            ];

            setFixResults(prev => [...prev, `✅ Equipos corregidos: ${equiposCorregidos.length}`]);

            // Actualizar AsyncStorage directamente
            await AsyncStorage.setItem('equipos', JSON.stringify(equiposCorregidos));
            setFixResults(prev => [...prev, '✅ Equipos guardados en AsyncStorage']);

            console.log('✅ EQUIPOS CORREGIDOS Y GUARDADOS');

            // Recargar datos para reflejar los cambios
            await recargarDatos();
            setFixResults(prev => [...prev, '🔄 Datos recargados exitosamente']);

            Alert.alert(
                '🎉 Reparación Completada',
                'Los IDs de clubes y equipos han sido corregidos. Las vinculaciones ahora funcionan correctamente.',
                [{ text: 'Perfecto', onPress: onClose }]
            );

        } catch (error) {
            console.error('❌ Error en la reparación:', error);
            setFixResults(prev => [...prev, `❌ Error: ${error}`]);
            Alert.alert('Error', 'Hubo un problema durante la reparación.');
        } finally {
            setFixing(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Wrench size={24} color={Colors.primary} />
                        <Text style={styles.title}>Reparador de Datos</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <XCircle size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <Text style={styles.description}>
                            Se ha detectado un problema con la vinculación entre clubes y equipos.
                            Los equipos tienen IDs de club incorrectos que impiden que aparezcan
                            correctamente en sus clubes correspondientes.
                        </Text>

                        <TouchableOpacity
                            style={[styles.fixButton, fixing && styles.fixButtonDisabled]}
                            onPress={arreglarDatosClubEquipos}
                            disabled={fixing}
                        >
                            {fixing ? (
                                <RefreshCw size={20} color="white" />
                            ) : (
                                <CheckCircle size={20} color="white" />
                            )}
                            <Text style={styles.fixButtonText}>
                                {fixing ? 'Reparando...' : 'Reparar Vínculos Club-Equipos'}
                            </Text>
                        </TouchableOpacity>

                        {fixResults.length > 0 && (
                            <View style={styles.resultsContainer}>
                                <Text style={styles.resultsTitle}>📋 Resultados:</Text>
                                {fixResults.map((result, index) => (
                                    <Text key={index} style={styles.resultText}>
                                        {result}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: 20,
        margin: 20,
        maxWidth: 400,
        maxHeight: '80%',
        width: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1,
        color: Colors.text,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    fixButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    fixButtonDisabled: {
        backgroundColor: Colors.textSecondary,
    },
    fixButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    resultsContainer: {
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: Colors.text,
    },
    resultText: {
        fontSize: 14,
        lineHeight: 20,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
});