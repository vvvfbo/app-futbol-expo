import { ValidationError, RegisterFormData, LoginFormData, Equipo, Torneo, Jugador } from '@/types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[0-9]{9,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

export const validateAge = (birthDate: string, minAge: number = 16): boolean => {
  if (!validateDate(birthDate)) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
};

export const validateRegisterForm = (data: RegisterFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validar nombre completo
  if (!validateRequired(data.nombreCompleto)) {
    errors.push({
      field: 'nombreCompleto',
      message: 'El nombre completo es obligatorio'
    });
  } else if (data.nombreCompleto.trim().split(' ').length < 2) {
    errors.push({
      field: 'nombreCompleto',
      message: 'Ingresa nombre y apellido'
    });
  }

  // Validar email
  if (!validateRequired(data.email)) {
    errors.push({
      field: 'email',
      message: 'El email es obligatorio'
    });
  } else if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Email inválido'
    });
  }

  // Validar contraseña
  if (!validateRequired(data.password)) {
    errors.push({
      field: 'password',
      message: 'La contraseña es obligatoria'
    });
  } else if (!validatePassword(data.password)) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 6 caracteres'
    });
  }

  // Validar confirmación de contraseña
  if (!validateRequired(data.confirmPassword)) {
    errors.push({
      field: 'confirmPassword',
      message: 'Confirma tu contraseña'
    });
  } else if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Las contraseñas no coinciden'
    });
  }

  // Validar teléfono (opcional)
  if (data.telefono && !validatePhone(data.telefono)) {
    errors.push({
      field: 'telefono',
      message: 'Formato de teléfono inválido'
    });
  }

  // Validar fecha de nacimiento (opcional)
  if (data.fechaNacimiento) {
    if (!validateDate(data.fechaNacimiento)) {
      errors.push({
        field: 'fechaNacimiento',
        message: 'Formato de fecha inválido'
      });
    } else if (!validateAge(data.fechaNacimiento, 13)) {
      errors.push({
        field: 'fechaNacimiento',
        message: 'Debes tener al menos 13 años'
      });
    }
  }

  return errors;
};

export const validateLoginForm = (data: LoginFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validar email
  if (!validateRequired(data.email)) {
    errors.push({
      field: 'email',
      message: 'El email es obligatorio'
    });
  } else if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Email inválido'
    });
  }

  // Validar contraseña
  if (!validateRequired(data.password)) {
    errors.push({
      field: 'password',
      message: 'La contraseña es obligatoria'
    });
  }

  return errors;
};

export const validateEquipo = (data: Partial<Equipo>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.nombre || !validateRequired(data.nombre)) {
    errors.push({
      field: 'nombre',
      message: 'El nombre del equipo es obligatorio'
    });
  }

  if (!data.ciudad || !validateRequired(data.ciudad)) {
    errors.push({
      field: 'ciudad',
      message: 'La ciudad es obligatoria'
    });
  }

  return errors;
};

export const validateJugador = (data: Partial<Jugador>, equipoJugadores: Jugador[] = []): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.nombre || !validateRequired(data.nombre)) {
    errors.push({
      field: 'nombre',
      message: 'El nombre del jugador es obligatorio'
    });
  }

  if (!data.numero || data.numero < 1 || data.numero > 99) {
    errors.push({
      field: 'numero',
      message: 'El número debe estar entre 1 y 99'
    });
  } else {
    // Verificar que el número no esté ocupado
    const numeroOcupado = equipoJugadores.some(j => 
      j.id !== data.id && j.numero === data.numero
    );
    if (numeroOcupado) {
      errors.push({
        field: 'numero',
        message: 'Este número ya está ocupado'
      });
    }
  }

  if (!data.posicion) {
    errors.push({
      field: 'posicion',
      message: 'La posición es obligatoria'
    });
  }

  return errors;
};

export const validateTorneo = (data: Partial<Torneo>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.nombre || !validateRequired(data.nombre)) {
    errors.push({
      field: 'nombre',
      message: 'El nombre del torneo es obligatorio'
    });
  }

  if (!data.ciudad || !validateRequired(data.ciudad)) {
    errors.push({
      field: 'ciudad',
      message: 'La ciudad es obligatoria'
    });
  }

  if (!data.categoria) {
    errors.push({
      field: 'categoria',
      message: 'La categoría es obligatoria'
    });
  }

  if (!data.fechaInicio || !validateDate(data.fechaInicio)) {
    errors.push({
      field: 'fechaInicio',
      message: 'La fecha de inicio es obligatoria y debe ser válida'
    });
  } else {
    const fechaInicio = new Date(data.fechaInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaInicio < hoy) {
      errors.push({
        field: 'fechaInicio',
        message: 'La fecha de inicio no puede ser anterior a hoy'
      });
    }
  }

  if (!data.maxEquipos || data.maxEquipos < 2) {
    errors.push({
      field: 'maxEquipos',
      message: 'Debe permitir al menos 2 equipos'
    });
  }

  if (!data.minEquipos || data.minEquipos < 2) {
    errors.push({
      field: 'minEquipos',
      message: 'Debe requerir al menos 2 equipos'
    });
  }

  if (data.maxEquipos && data.minEquipos && data.maxEquipos < data.minEquipos) {
    errors.push({
      field: 'maxEquipos',
      message: 'El máximo no puede ser menor que el mínimo'
    });
  }

  return errors;
};

export const getFieldError = (errors: ValidationError[], field: string): string | undefined => {
  const error = errors.find(e => e.field === field);
  return error?.message;
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  return time.substring(0, 5); // HH:MM
};

export const formatDateTime = (date: string, time: string): string => {
  const d = new Date(`${date}T${time}`);
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};