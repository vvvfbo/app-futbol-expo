import Colors from '@/constants/colors';
import { Clasificacion, Equipo } from '@/types';
import { Award, Check, Medal, Trophy, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface FinalizarTorneoModalProps {
  visible: boolean;
  onClose: () => void;
  onFinalizarTorneo: (resultado: {
    campeon?: string;
    subcampeon?: string;
    tercerPuesto?: string;
    fechaFinalizacion: string;
  }) => void;
  equipos: Equipo[];
  clasificacion: Clasificacion[];
  torneoNombre: string;
}

export default function FinalizarTorneoModal({
  visible,
  onClose,
  onFinalizarTorneo,
  equipos,
  clasificacion,
  torneoNombre
}: FinalizarTorneoModalProps) {
  const [campeonId, setCampeonId] = useState<string>('');
  const [subcampeonId, setSubcampeonId] = useState<string>('');
  const [tercerPuestoId, setTercerPuestoId] = useState<string>('');

  const getEquipoById = (id: string) => equipos.find(e => e.id === id);

  const handleConfirm = () => {
    if (!campeonId) {
      Alert.alert('Error', 'Debes seleccionar al menos un campeón');
      return;
    }

    if (campeonId === subcampeonId || campeonId === tercerPuestoId ||
      (subcampeonId && subcampeonId === tercerPuestoId)) {
      Alert.alert('Error', 'No puedes seleccionar el mismo equipo para múltiples posiciones');
      return;
    }

    Alert.alert(
      'Confirmar Finalización',
      `¿Estás seguro de que quieres finalizar el torneo "${torneoNombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: () => {
            onFinalizarTorneo({
              campeon: campeonId,
              subcampeon: subcampeonId || undefined,
              tercerPuesto: tercerPuestoId || undefined,
              fechaFinalizacion: new Date().toISOString()
            });
            onClose();
          }
        }
      ]
    );
  };

  const renderEquipoSelector = (
    title: string,
    icon: React.ReactNode,
    selectedId: string,
    onSelect: (id: string) => void,
    color: string
  ) => (
    <View style={styles.selectorSection}>
      <View style={styles.selectorHeader}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.selectorTitle}>{title}</Text>
      </View>

      <ScrollView style={styles.equiposList} nestedScrollEnabled>
        {equipos.map(equipo => {
          const clasificacionEquipo = clasificacion.find(c => c.equipoId === equipo.id);
          return (
            <TouchableOpacity
              key={equipo.id}
              style={[
                styles.equipoOption,
                selectedId === equipo.id && { ...styles.equipoOptionSelected, borderColor: color }
              ]}
              onPress={() => onSelect(equipo.id)}
            >
              <View style={styles.equipoInfo}>
                {equipo.escudo && (
                  <Image source={{ uri: equipo.escudo }} style={styles.escudoSmall} />
                )}
                <View style={styles.equipoDetails}>
                  <Text style={styles.equipoNombre}>{equipo.nombre}</Text>
                  {clasificacionEquipo && (
                    <Text style={styles.equipoStats}>
                      Pos. {clasificacionEquipo.posicion} - {clasificacionEquipo.puntos} pts
                    </Text>
                  )}
                </View>
              </View>
              {selectedId === equipo.id && (
                <View style={[styles.checkmark, { backgroundColor: color }]}>
                  <Check size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Finalizar Torneo</Text>
          <TouchableOpacity
            style={[styles.confirmButton, !campeonId && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!campeonId}
          >
            <Check size={24} color={campeonId ? 'white' : Colors.textLight} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.tournamentInfo}>
            <Trophy size={32} color={Colors.primary} />
            <Text style={styles.tournamentName}>{torneoNombre}</Text>
            <Text style={styles.tournamentSubtitle}>
              Selecciona los equipos ganadores para finalizar el torneo
            </Text>
          </View>

          {renderEquipoSelector(
            '🏆 Campeón',
            <Trophy size={20} color="#FFD700" />,
            campeonId,
            setCampeonId,
            '#FFD700'
          )}

          {renderEquipoSelector(
            '🥈 Subcampeón',
            <Medal size={20} color="#C0C0C0" />,
            subcampeonId,
            setSubcampeonId,
            '#C0C0C0'
          )}

          {renderEquipoSelector(
            '🥉 Tercer Puesto',
            <Award size={20} color="#CD7F32" />,
            tercerPuestoId,
            setTercerPuestoId,
            '#CD7F32'
          )}

          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ Una vez finalizado el torneo, no podrás modificar los resultados ni agregar más partidos.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tournamentInfo: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tournamentName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  tournamentSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectorSection: {
    marginBottom: 24,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconContainer: {
    // Container for icon to avoid raw text error
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  equiposList: {
    maxHeight: 150,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  equipoOptionSelected: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
  },
  equipoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  escudoSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  equipoDetails: {
    flex: 1,
  },
  equipoNombre: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  equipoStats: {
    fontSize: 12,
    color: Colors.textLight,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warning: {
    backgroundColor: Colors.warning + '20',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    color: Colors.warning,
    textAlign: 'center',
    lineHeight: 20,
  },
});