import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, User, Lock, Mail, MapPin, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-context';
import { auth, db } from '@/config/firebase';
import Colors from '@/constants/colors';
import { RegisterFormData, ValidationError } from '@/types';
import { validateRegisterForm, getFieldError } from '@/utils/validation';
import { CIUDADES } from '@/constants/categories';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    nombreCompleto: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'espectador',
    ciudad: CIUDADES[0],
    telefono: '',
    fechaNacimiento: ''
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validación en tiempo real
  useEffect(() => {
    if (formData.nombreCompleto || formData.email || formData.password || formData.confirmPassword) {
      const validationErrors = validateRegisterForm(formData);
      setErrors(validationErrors);
    }
  }, [formData]);

  const handleRegister = async () => {
    console.log('🚀 === INICIANDO PROCESO DE REGISTRO DESDE UI ===');
    console.log('📄 Form data completo:', JSON.stringify(formData, null, 2));
    
    // Validar formulario antes de enviar
    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      console.log('⚠️ Errores de validación encontrados:', validationErrors);
      const errorList = validationErrors.map(e => `• ${e.message}`).join('\n');
      Alert.alert(
        'Error de validación', 
        `Por favor corrige los siguientes errores:\n\n${errorList}`,
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    console.log('✅ Validación del formulario pasada, iniciando registro...');
    setIsLoading(true);
    
    try {
      console.log('🔄 Llamando a la función register del contexto...');
      await register(formData);
      console.log('🎉 Registro completado exitosamente desde UI!');
      
      Alert.alert(
        '✅ ¡Registro exitoso!', 
        `¡Bienvenido a FutbolApp Torneos, ${formData.nombreCompleto}!\n\nTu cuenta como ${formData.rol} ha sido creada correctamente.`,
        [{ 
          text: 'Continuar', 
          style: 'default',
          onPress: () => {
            console.log('📱 Redirigiendo a la aplicación principal...');
            router.replace('/(tabs)/(home)/home');
          }
        }]
      );
    } catch (error) {
      console.error('❌ Error capturado en handleRegister:', error);
      
      let errorMessage = 'Error desconocido al registrarse';
      let errorTitle = 'Error de registro';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('💬 Error message:', errorMessage);
        
        // Personalizar título según el tipo de error
        if (errorMessage.includes('email')) {
          errorTitle = 'Error con el email';
        } else if (errorMessage.includes('contraseña')) {
          errorTitle = 'Error con la contraseña';
        } else if (errorMessage.includes('conexión') || errorMessage.includes('internet')) {
          errorTitle = 'Error de conexión';
        } else if (errorMessage.includes('Firebase')) {
          errorTitle = 'Error del servidor';
        }
      } else {
        console.error('🤔 Error no es una instancia de Error:', typeof error, error);
      }
      
      Alert.alert(
        errorTitle, 
        errorMessage,
        [
          { text: 'Intentar de nuevo', style: 'default' },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      console.log('🏁 Finalizando proceso de registro, removiendo loading...');
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient
      colors={[Colors.gradient.start, Colors.gradient.end]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Trophy size={60} color="white" />
              <Text style={styles.title}>Crear Cuenta</Text>
              {__DEV__ && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugText}>
                    Modo desarrollo - Los datos son temporales
                  </Text>
                  <TouchableOpacity 
                    style={styles.testButton}
                    onPress={() => {
                      console.log('🧪 Probando conexión Firebase...');
                      console.log('🔥 Auth object:', auth);
                      console.log('💾 DB object:', db);
                      console.log('🌐 Firebase config:', auth.app.options);
                      Alert.alert('Debug Info', `Firebase Auth: ${!!auth}\nFirestore: ${!!db}\nProject: ${auth.app.options.projectId}`);
                    }}
                  >
                    <Text style={styles.testButtonText}>Probar Firebase</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.form}>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.rol === 'entrenador' && styles.roleButtonActive
                  ]}
                  onPress={() => updateFormData('rol', 'entrenador')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.rol === 'entrenador' && styles.roleButtonTextActive
                  ]}>
                    Entrenador
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    formData.rol === 'espectador' && styles.roleButtonActive
                  ]}
                  onPress={() => updateFormData('rol', 'espectador')}
                >
                  <Text style={[
                    styles.roleButtonText,
                    formData.rol === 'espectador' && styles.roleButtonTextActive
                  ]}>
                    Espectador
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[
                styles.inputContainer,
                getFieldError(errors, 'nombreCompleto') && styles.inputError
              ]}>
                <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo *"
                  placeholderTextColor={Colors.textLight}
                  value={formData.nombreCompleto}
                  onChangeText={(text) => updateFormData('nombreCompleto', text)}
                  testID="nombre-input"
                />
              </View>
              {getFieldError(errors, 'nombreCompleto') && (
                <Text style={styles.errorText}>{getFieldError(errors, 'nombreCompleto')}</Text>
              )}

              <View style={[
                styles.inputContainer,
                getFieldError(errors, 'email') && styles.inputError
              ]}>
                <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email *"
                  placeholderTextColor={Colors.textLight}
                  value={formData.email}
                  onChangeText={(text) => updateFormData('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  testID="email-input"
                />
              </View>
              {getFieldError(errors, 'email') && (
                <Text style={styles.errorText}>{getFieldError(errors, 'email')}</Text>
              )}

              <View style={[
                styles.inputContainer,
                getFieldError(errors, 'password') && styles.inputError
              ]}>
                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña *"
                  placeholderTextColor={Colors.textLight}
                  value={formData.password}
                  onChangeText={(text) => updateFormData('password', text)}
                  secureTextEntry={!showPassword}
                  testID="password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textLight} />
                  ) : (
                    <Eye size={20} color={Colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
              {getFieldError(errors, 'password') && (
                <Text style={styles.errorText}>{getFieldError(errors, 'password')}</Text>
              )}

              <View style={[
                styles.inputContainer,
                getFieldError(errors, 'confirmPassword') && styles.inputError
              ]}>
                <Lock size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar contraseña *"
                  placeholderTextColor={Colors.textLight}
                  value={formData.confirmPassword}
                  onChangeText={(text) => updateFormData('confirmPassword', text)}
                  secureTextEntry={!showConfirmPassword}
                  testID="confirm-password-input"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={Colors.textLight} />
                  ) : (
                    <Eye size={20} color={Colors.textLight} />
                  )}
                </TouchableOpacity>
              </View>
              {getFieldError(errors, 'confirmPassword') && (
                <Text style={styles.errorText}>{getFieldError(errors, 'confirmPassword')}</Text>
              )}

              <View style={styles.inputContainer}>
                <MapPin size={20} color={Colors.textLight} style={styles.inputIcon} />
                <Text style={styles.label}>Ciudad:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
                  {CIUDADES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.cityChip,
                        formData.ciudad === c && styles.cityChipActive
                      ]}
                      onPress={() => updateFormData('ciudad', c)}
                    >
                      <Text style={[
                        styles.cityChipText,
                        formData.ciudad === c && styles.cityChipTextActive
                      ]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={[
                styles.inputContainer,
                getFieldError(errors, 'telefono') && styles.inputError
              ]}>
                <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Teléfono (opcional)"
                  placeholderTextColor={Colors.textLight}
                  value={formData.telefono}
                  onChangeText={(text) => updateFormData('telefono', text)}
                  keyboardType="phone-pad"
                  testID="telefono-input"
                />
              </View>
              {getFieldError(errors, 'telefono') && (
                <Text style={styles.errorText}>{getFieldError(errors, 'telefono')}</Text>
              )}

              <View style={[
                styles.inputContainer,
                getFieldError(errors, 'fechaNacimiento') && styles.inputError
              ]}>
                <User size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Fecha de nacimiento (YYYY-MM-DD) (opcional)"
                  placeholderTextColor={Colors.textLight}
                  value={formData.fechaNacimiento}
                  onChangeText={(text) => updateFormData('fechaNacimiento', text)}
                  testID="fecha-nacimiento-input"
                />
              </View>
              {getFieldError(errors, 'fechaNacimiento') && (
                <Text style={styles.errorText}>{getFieldError(errors, 'fechaNacimiento')}</Text>
              )}

              <Text style={styles.requiredNote}>* Campos obligatorios</Text>
              
              <Text style={styles.passwordRequirements}>
                La contraseña debe tener al menos 6 caracteres
              </Text>

              <TouchableOpacity 
                style={styles.registerButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.registerButtonText}>Registrarse</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => router.back()}
              >
                <Text style={styles.loginLinkText}>
                  ¿Ya tienes cuenta? Inicia sesión
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roleSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  roleButtonTextActive: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  cityScroll: {
    flex: 1,
    paddingVertical: 8,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityChipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  cityChipTextActive: {
    color: 'white',
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: Colors.secondary,
    fontSize: 14,
  },
  requiredNote: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  passwordRequirements: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  debugText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  debugContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});