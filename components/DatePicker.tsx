import Colors from '@/constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import React, { memo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface TimePickerProps {
  value: string; // formato HH:MM
  onTimeChange: (time: string) => void;
  placeholder?: string;
  label?: string;
}

export function TimePicker({
  value,
  onTimeChange,
  placeholder = 'Seleccionar hora',
  label
}: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return date;
    }
    return new Date();
  });

  const formatTimeToHHMM = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (event: any, time?: Date) => {
    console.log('🕐 TimePicker - handleTimeChange:', { event: event?.type, time });

    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (event?.type === 'dismissed') {
      console.log('🕐 TimePicker - Usuario canceló');
      setShowPicker(false);
      return;
    }

    if (time && event?.type !== 'dismissed') {
      console.log('🕐 TimePicker - Nueva hora seleccionada:', time);
      setSelectedTime(time);
      const formattedTime = formatTimeToHHMM(time);
      console.log('🕐 TimePicker - Hora formateada:', formattedTime);
      onTimeChange(formattedTime);

      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
    }
  };

  const handlePress = () => {
    console.log('🕐 TimePicker - Abriendo selector de hora');
    setShowPicker(true);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const handleConfirm = () => {
    setShowPicker(false);
    const formattedTime = formatTimeToHHMM(selectedTime);
    onTimeChange(formattedTime);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.dateButton} onPress={handlePress}>
        <Clock size={20} color={Colors.textLight} />
        <Text style={[
          styles.dateText,
          !value && styles.placeholder
        ]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {Platform.OS === 'web' ? 'Seleccionar Hora' : 'Confirma la hora'}
              </Text>
            </View>

            {Platform.OS === 'web' ? (
              <View style={styles.webInputContainer}>
                <input
                  type="time"
                  value={selectedTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    console.log('🕐 TimePicker Web - Hora seleccionada:', e.target.value);
                    if (e.target.value) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newTime = new Date();
                      newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                      setSelectedTime(newTime);
                    }
                  }}
                  style={styles.webDateInput}
                  autoFocus
                />
              </View>
            ) : (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                locale="es-ES"
                textColor={Colors.text}
                accentColor={Colors.primary}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  const formattedTime = formatTimeToHHMM(selectedTime);
                  onTimeChange(formattedTime);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface DatePickerProps {
  value: string; // formato DD/MM/YYYY
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  minimumDate?: Date;
}

export default function DatePicker({
  value,
  onDateChange,
  placeholder = 'Seleccionar fecha',
  label,
  minimumDate
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (value) {
      // Convertir DD/MM/YYYY a Date
      const [day, month, year] = value.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date();
  });

  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (event: any, date?: Date) => {
    console.log('📅 DatePicker - handleDateChange:', { event: event?.type, date });

    // En Android, siempre cerramos el picker después de seleccionar
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    // Si el usuario canceló, cerramos sin cambios
    if (event?.type === 'dismissed') {
      console.log('📅 DatePicker - Usuario canceló');
      setShowPicker(false);
      return;
    }

    // Si hay una fecha válida, la procesamos
    if (date && event?.type !== 'dismissed') {
      console.log('📅 DatePicker - Nueva fecha seleccionada:', date);
      setSelectedDate(date);
      const formattedDate = formatDateToDDMMYYYY(date);
      console.log('📅 DatePicker - Fecha formateada:', formattedDate);
      onDateChange(formattedDate);

      // En Android cerramos inmediatamente, en iOS esperamos confirmación
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }
    }
  };

  const handlePress = () => {
    console.log('📅 DatePicker - Abriendo selector de fecha');
    setShowPicker(true);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const handleConfirm = () => {
    setShowPicker(false);
    const formattedDate = formatDateToDDMMYYYY(selectedDate);
    onDateChange(formattedDate);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.dateButton} onPress={handlePress}>
        <Calendar size={20} color={Colors.textLight} />
        <Text style={[
          styles.dateText,
          !value && styles.placeholder
        ]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPicker(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {Platform.OS === 'web' ? 'Seleccionar Fecha' : 'Confirma la fecha'}
              </Text>
            </View>

            {Platform.OS === 'web' ? (
              <View style={styles.webInputContainer}>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    console.log('📅 DatePicker Web - Fecha seleccionada:', e.target.value);
                    if (e.target.value) {
                      const newDate = new Date(e.target.value + 'T00:00:00');
                      setSelectedDate(newDate);
                    }
                  }}
                  min={minimumDate?.toISOString().split('T')[0]}
                  style={styles.webDateInput}
                  autoFocus
                />
              </View>
            ) : (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={minimumDate}
                locale="es-ES"
                textColor={Colors.text}
                accentColor={Colors.primary}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  const formattedDate = formatDateToDDMMYYYY(selectedDate);
                  onDateChange(formattedDate);
                  setShowPicker(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    minHeight: 48,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.textLight,
  },
  // Nuevos estilos para Modal
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
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  webInputContainer: {
    marginVertical: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.border,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  webDateInput: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    color: Colors.text,
    fontSize: 16,
    width: '100%',
    fontFamily: Platform.OS === 'web' ? 'system-ui' : undefined,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
  },
});