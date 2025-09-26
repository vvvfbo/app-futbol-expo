import { Calendar, Info, Target, Users, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Colors from '../constants/colors';
import {
  ConfiguracionGrupos,
  calcularPartidosConfiguracion,
  generarConfiguracionesTorneo
} from '../utils/torneo-utils';

interface ConfiguracionTorneoModalProps {
  visible: boolean;
  onClose: () => void;
  numEquipos: number;
  tipoTorneo?: 'grupos' | 'eliminatorias' | 'grupos-eliminatorias';
  onSeleccionarConfiguracion: (configuracion: ConfiguracionGrupos) => void;
}

export default function ConfiguracionTorneoModal({
  visible,
  onClose,
  numEquipos,
  tipoTorneo = 'grupos',
  onSeleccionarConfiguracion
}: ConfiguracionTorneoModalProps) {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionGrupos[]>([]);
  const [configuracionSeleccionada, setConfiguracionSeleccionada] = useState<ConfiguracionGrupos | null>(null);

  useEffect(() => {
    console.log('🔧 ConfiguracionTorneoModal useEffect:', { visible, numEquipos, tipoTorneo });


    // 🛡️ VALIDACIÓN MEJORADA
    if (!visible || numEquipos <= 0) {
      console.log('⚠️ Modal cerrado o equipos inválidos:', { visible, numEquipos });
      return;
    }

    console.log('🔧 Generando configuraciones para:', { numEquipos, tipoTorneo });

    if (visible && numEquipos > 0) {
      // Reset state when modal opens
      setConfiguraciones([]);
      setConfiguracionSeleccionada(null);

      // ⚡ GENERACIÓN INMEDIATA (sin timeout)
      console.log('⚡ Generando configuraciones inmediatamente para:', numEquipos, 'equipos');

      let configs: ConfiguracionGrupos[] = [];

      if (tipoTorneo === 'eliminatorias') {
        // Para eliminatorias, crear configuraciones simples
        configs = [{
          tipoConfiguracion: 'eliminatorias_directas',
          grupos: {},
          equiposRestantes: numEquipos % 2 === 1 ? {
            cantidad: 1,
            manejo: 'bye'
          } : undefined,
          recomendacion: `Sistema de eliminación directa con ${numEquipos} equipos. ${numEquipos - 1} partidos total.`,
          viabilidad: 'optima',
          descripcion: `Eliminatorias directas - ${numEquipos} equipos`
        }];
      } else {
        console.log('⚙️ Generando configuraciones de grupos para', numEquipos, 'equipos');
        configs = generarConfiguracionesTorneo(numEquipos);
      }

      console.log('📋 Configuraciones generadas:', configs.length, 'opciones');
      setConfiguraciones(configs);
      if (configs.length > 0) {
        setConfiguracionSeleccionada(configs[0]); // Seleccionar la primera por defecto
        console.log('✅ Configuración por defecto seleccionada:', configs[0].descripcion);
      }
    }
  }, [visible, numEquipos, tipoTorneo]);

  const getViabilidadColor = (viabilidad: ConfiguracionGrupos['viabilidad']) => {
    switch (viabilidad) {
      case 'optima': return '#10B981';
      case 'buena': return '#3B82F6';
      case 'aceptable': return '#F59E0B';
      case 'no_recomendada': return '#EF4444';
    }
  };

  const getViabilidadText = (viabilidad: ConfiguracionGrupos['viabilidad']) => {
    switch (viabilidad) {
      case 'optima': return 'Óptima';
      case 'buena': return 'Buena';
      case 'aceptable': return 'Aceptable';
      case 'no_recomendada': return 'No Recomendada';
    }
  };

  const getTipoIcon = (tipo: ConfiguracionGrupos['tipoConfiguracion']) => {
    switch (tipo) {
      case 'grupos': return <Users size={20} color={Colors.primary} />;
      case 'triangulares': return <Target size={20} color={Colors.primary} />;
      case 'mixto': return <Calendar size={20} color={Colors.primary} />;
      case 'eliminatorias_directas': return <Target size={20} color={Colors.primary} />;
    }
  };

  const handleSeleccionar = () => {
    if (configuracionSeleccionada) {
      onSeleccionarConfiguracion(configuracionSeleccionada);
      onClose();
    }
  };

  console.log('🎭 Modal render - visible:', visible, 'configuraciones:', configuraciones.length, 'seleccionada:', configuracionSeleccionada?.descripcion);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                Configuración del Torneo
              </Text>
              <Text style={styles.modalSubtitle}>
                {numEquipos} equipos inscritos - Selecciona una configuración
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.configuracionesList} showsVerticalScrollIndicator={false}>
            {configuraciones.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={48} color={Colors.textLight} />
                <Text style={styles.emptyStateTitle}>Generando configuraciones...</Text>
                <Text style={styles.emptyStateText}>
                  Calculando las mejores opciones para {numEquipos} equipos
                </Text>
              </View>
            ) : (
              configuraciones.map((config, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.configuracionCard,
                    configuracionSeleccionada === config && styles.configuracionSelected
                  ]}
                  onPress={() => setConfiguracionSeleccionada(config)}
                >
                  <View style={styles.configuracionHeader}>
                    <View style={styles.configuracionTipo}>
                      {getTipoIcon(config.tipoConfiguracion)}
                      <Text style={styles.configuracionTitulo}>
                        {config.descripcion}
                      </Text>
                    </View>
                    <View style={[
                      styles.viabilidadBadge,
                      { backgroundColor: getViabilidadColor(config.viabilidad) + '20' }
                    ]}>
                      <Text style={[
                        styles.viabilidadText,
                        { color: getViabilidadColor(config.viabilidad) }
                      ]}>
                        {getViabilidadText(config.viabilidad)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.gruposDetalle}>
                    {Object.entries(config.grupos).map(([grupoId, grupoConfig]) => (
                      <View key={grupoId} style={styles.grupoItem}>
                        <Text style={styles.grupoNombre}>{grupoConfig.nombre}</Text>
                        <Text style={styles.grupoInfo}>
                          {grupoConfig.equipos} equipos • {grupoConfig.configuracion.replace('_', ' ')}
                        </Text>
                      </View>
                    ))}

                    {config.equiposRestantes && (
                      <View style={styles.equiposRestantes}>
                        <Info size={16} color={Colors.textLight} />
                        <Text style={styles.equiposRestantesText}>
                          {config.equiposRestantes.cantidad} equipo(s) con {config.equiposRestantes.manejo}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.estadisticas}>
                    <View style={styles.estadistica}>
                      <Calendar size={16} color={Colors.textLight} />
                      <Text style={styles.estadisticaText}>
                        {calcularPartidosConfiguracion(config)} partidos
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.recomendacion}>{config.recomendacion}</Text>

                  {configuracionSeleccionada === config && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>✓ Seleccionada</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectButton,
                !configuracionSeleccionada && styles.selectButtonDisabled
              ]}
              onPress={handleSeleccionar}
              disabled={!configuracionSeleccionada}
            >
              <Text style={styles.selectButtonText}>
                Usar esta Configuración
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  closeButton: {
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  configuracionesList: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  configuracionCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  configuracionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  configuracionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '30',
  },
  configuracionTipo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  configuracionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  viabilidadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viabilidadText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gruposDetalle: {
    marginBottom: 16,
  },
  grupoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border + '20',
  },
  grupoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  grupoInfo: {
    fontSize: 12,
    color: Colors.textLight,
  },
  equiposRestantes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: Colors.textLight + '10',
    borderRadius: 8,
  },
  equiposRestantesText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 6,
  },
  estadisticas: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  estadistica: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  estadisticaText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  recomendacion: {
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  selectedIndicator: {
    alignSelf: 'flex-end',
  },
  selectedText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  selectButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  selectButtonDisabled: {
    backgroundColor: Colors.textLight,
    shadowOpacity: 0.1,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});