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
import { Trophy, Lock, Mail, Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/auth-context';
import Colors from '@/constants/colors';
import { LoginFormData, ValidationError } from '@/types';
import { validateLoginForm, getFieldError } from '@/utils/validation';

export default function LoginScreen() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { resetPassword } = useAuth();

  // Validación en tiempo real
  useEffect(() => {
    if (formData.email || formData.password) {
      const validationErrors = validateLoginForm(formData);
      setErrors(validationErrors);
    }
  }, [formData]);

  const handleLogin = async () => {
    const validationErrors = validateLoginForm(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      Alert.alert('Error', 'Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    try {
      await login(formData);
      router.replace('/(tabs)/(home)/home');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      Alert.alert('Error de autenticación', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      Alert.alert(
        'Email enviado', 
        'Se ha enviado un enlace de recuperación a tu email',
        [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
      );
      setResetEmail('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar email';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  const updateFormData = (field: keyof LoginFormData, value: string | boolean) => {
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
              <Text style={styles.title}>FutbolApp</Text>
              <Text style={styles.subtitle}>Torneos</Text>
              {__DEV__ && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>📝 Usuarios de Prueba:</Text>
                  
                  <View style={styles.userTestContainer}>
                    <Text style={styles.debugText}>👑 Admin (Entrenador)</Text>
                    <Text style={styles.debugText}>📧 admin@futbolapp.com</Text>
                    <Text style={styles.debugText}>🔐 admin123</Text>
                    <TouchableOpacity 
                      style={styles.testButton}
                      onPress={() => {
                        updateFormData('email', 'admin@futbolapp.com');
                        updateFormData('password', 'admin123');
                      }}
                    >
                      <Text style={styles.testButtonText}>Completar Admin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.testButton, { backgroundColor: Colors.primary }]}
                      onPress={async () => {
                        try {
                          setIsLoading(true);
                          await login({ 
                            email: 'admin@futbolapp.com', 
                            password: 'admin123',
                            rememberMe: false 
                          });
                        } catch (error) {
                          Alert.alert('Error', 'No se pudo hacer login automático');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.testButtonText}>🚀 AUTO-LOGIN ADMIN</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.userTestContainer}>
                    <Text style={styles.debugText}>🧪 Usuario (Espectador)</Text>
                    <Text style={styles.debugText}>📧 test@futbolapp.com</Text>
                    <Text style={styles.debugText}>🔐 test123</Text>
                    <TouchableOpacity 
                      style={styles.testButton}
                      onPress={() => {
                        updateFormData('email', 'test@futbolapp.com');
                        updateFormData('password', 'test123');
                      }}
                    >
                      <Text style={styles.testButtonText}>Completar Test</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.testButton, { backgroundColor: Colors.secondary }]}
                      onPress={async () => {
                        try {
                          setIsLoading(true);
                          await login({ 
                            email: 'test@futbolapp.com', 
                            password: 'test123',
                            rememberMe: false 
                          });
                        } catch (error) {
                          Alert.alert('Error', 'No se pudo hacer login automático');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      <Text style={styles.testButtonText}>🧪 AUTO-LOGIN TEST</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.form}>
              <View style={[
                styles.inputContainer,
                getFieldError(errors, 'email') && styles.inputError
              ]}>
                <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
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
                  placeholder="Contraseña"
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

              <View style={styles.rememberMeContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => updateFormData('rememberMe', !formData.rememberMe)}
                >
                  <View style={[
                    styles.checkboxInner,
                    formData.rememberMe && styles.checkboxActive
                  ]} />
                </TouchableOpacity>
                <Text style={styles.rememberMeText}>Recordarme</Text>
              </View>

              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.forgotPasswordLink}
                onPress={() => setShowForgotPassword(true)}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.registerLink}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.registerLinkText}>
                  ¿No tienes cuenta? Regístrate
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modal de recuperar contraseña */}
            {showForgotPassword && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Recuperar Contraseña</Text>
                  <Text style={styles.modalSubtitle}>
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor={Colors.textLight}
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalCancelButton}
                      onPress={() => {
                        setShowForgotPassword(false);
                        setResetEmail('');
                      }}
                    >
                      <Text style={styles.modalCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.modalConfirmButton}
                      onPress={handleForgotPassword}
                      disabled={isResetting}
                    >
                      {isResetting ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Text style={styles.modalConfirmText}>Enviar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
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
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.textLight,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.text,
  },
  forgotPasswordLink: {
    alignItems: 'center',
    marginBottom: 12,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    color: Colors.secondary,
    fontSize: 14,
  },
  debugContainer: {
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  debugTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  userTestContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  debugText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
});