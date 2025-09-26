import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, Palette, X, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EscudoSelectorProps {
  visible: boolean;
  onClose: () => void;
  onEscudoSelect: (escudoUrl: string) => void;
  currentEscudo?: string;
}

const ESCUDOS_PREDEFINIDOS = [
  'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1614632537190-23e4b2e69c88?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200&h=200&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&h=200&fit=crop&crop=center'
];

const COLORES_ESCUDO = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function EscudoSelector({
  visible,
  onClose,
  onEscudoSelect,
  currentEscudo
}: EscudoSelectorProps) {
  const [selectedEscudo, setSelectedEscudo] = useState<string>(currentEscudo || '');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'galeria' | 'predefinidos' | 'creador'>('predefinidos');

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos permisos para acceder a tu galería de fotos.'
        );
        return false;
      }
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          setSelectedEscudo(imageUri);
        } else if (asset.uri) {
          setSelectedEscudo(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('No disponible', 'La cámara no está disponible en la web');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos permisos para acceder a la cámara.'
      );
      return;
    }

    try {
      setIsUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const imageUri = `data:image/jpeg;base64,${asset.base64}`;
          setSelectedEscudo(imageUri);
        } else if (asset.uri) {
          setSelectedEscudo(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setIsUploading(false);
    }
  };

  const generateEscudo = (color: string) => {
    // Crear un escudo simple con color sólido
    const canvas = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="90" fill="${color}" stroke="#ffffff" stroke-width="4"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#ffffff" stroke-width="2"/>
        <circle cx="100" cy="100" r="30" fill="#ffffff"/>
      </svg>
    `)}`;
    setSelectedEscudo(canvas);
  };

  const handleConfirm = () => {
    if (selectedEscudo) {
      onEscudoSelect(selectedEscudo);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Seleccionar Escudo</Text>
          <TouchableOpacity 
            style={[styles.confirmButton, !selectedEscudo && styles.confirmButtonDisabled]} 
            onPress={handleConfirm}
            disabled={!selectedEscudo}
          >
            <Check size={24} color={selectedEscudo ? 'white' : Colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'predefinidos' && styles.tabActive]}
            onPress={() => setActiveTab('predefinidos')}
          >
            <Upload size={20} color={activeTab === 'predefinidos' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'predefinidos' && styles.tabTextActive]}>
              Predefinidos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'galeria' && styles.tabActive]}
            onPress={() => setActiveTab('galeria')}
          >
            <Camera size={20} color={activeTab === 'galeria' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'galeria' && styles.tabTextActive]}>
              Galería
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'creador' && styles.tabActive]}
            onPress={() => setActiveTab('creador')}
          >
            <Palette size={20} color={activeTab === 'creador' ? Colors.primary : Colors.textLight} />
            <Text style={[styles.tabText, activeTab === 'creador' && styles.tabTextActive]}>
              Crear
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'predefinidos' && (
            <View style={styles.escudosGrid}>
              {ESCUDOS_PREDEFINIDOS.map((escudo, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.escudoOption,
                    selectedEscudo === escudo && styles.escudoOptionSelected
                  ]}
                  onPress={() => setSelectedEscudo(escudo)}
                >
                  <Image source={{ uri: escudo }} style={styles.escudoImage} />
                  {selectedEscudo === escudo && (
                    <View style={styles.selectedOverlay}>
                      <Check size={20} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'galeria' && (
            <View style={styles.galeriaOptions}>
              <TouchableOpacity 
                style={styles.galeriaButton}
                onPress={pickImageFromGallery}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="large" color={Colors.primary} />
                ) : (
                  <Upload size={32} color={Colors.primary} />
                )}
                <Text style={styles.galeriaButtonText}>
                  {isUploading ? 'Subiendo...' : 'Seleccionar de Galería'}
                </Text>
              </TouchableOpacity>
              
              {Platform.OS !== 'web' && (
                <TouchableOpacity 
                  style={styles.galeriaButton}
                  onPress={takePhoto}
                  disabled={isUploading}
                >
                  <Camera size={32} color={Colors.primary} />
                  <Text style={styles.galeriaButtonText}>Tomar Foto</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {activeTab === 'creador' && (
            <View style={styles.creadorSection}>
              <Text style={styles.creadorTitle}>Crear Escudo Simple</Text>
              <Text style={styles.creadorSubtitle}>Selecciona un color para tu escudo:</Text>
              <View style={styles.coloresGrid}>
                {COLORES_ESCUDO.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.colorOption, { backgroundColor: color }]}
                    onPress={() => generateEscudo(color)}
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {selectedEscudo && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Vista Previa:</Text>
            <Image source={{ uri: selectedEscudo }} style={styles.previewImage} />
          </View>
        )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  escudosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  escudoOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  escudoOptionSelected: {
    borderColor: Colors.primary,
  },
  escudoImage: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galeriaOptions: {
    gap: 16,
  },
  galeriaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 12,
  },
  galeriaButtonText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  creadorSection: {
    alignItems: 'center',
  },
  creadorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  creadorSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  coloresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  preview: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  previewTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});