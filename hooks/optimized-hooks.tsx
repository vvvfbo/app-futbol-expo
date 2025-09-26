/**
 * 🚀 OPTIMIZED HOOKS - Hooks mejorados con optimizaciones automáticas
 */

import { useEffect, useCallback, useMemo, useState } from 'react';
import { OptimizedStorage, PerformanceMonitor, DataValidator } from '../utils/supercomputer-optimization';

// 1. OPTIMIZED DATA CONTEXT HOOK
export const useOptimizedDataContext = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveData = useCallback(async (key: string, data: any) => {
    const endTiming = PerformanceMonitor.startTiming(`saveData_${key}`);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Validar datos antes de guardar
      const isValid = key.includes('torneo') 
        ? DataValidator.validateTorneo(data)
        : key.includes('partido')
        ? DataValidator.validatePartido(data)
        : true;
      
      if (!isValid) {
        throw new Error('Datos inválidos para guardar');
      }
      
      await OptimizedStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      throw error;
    } finally {
      setIsLoading(false);
      endTiming();
    }
  }, []);

  const loadData = useCallback(async (key: string) => {
    const endTiming = PerformanceMonitor.startTiming(`loadData_${key}`);
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await OptimizedStorage.getItem(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
      return null;
    } finally {
      setIsLoading(false);
      endTiming();
    }
  }, []);

  return {
    saveData,
    loadData,
    isLoading,
    error
  };
};

// 2. OPTIMIZED TOURNAMENT HOOK
export const useOptimizedTorneo = (torneoId?: string) => {
  const [torneo, setTorneo] = useState<any>(null);
  const [partidos, setPartidos] = useState<any[]>([]);
  const { loadData, saveData, isLoading } = useOptimizedDataContext();

  const loadTorneo = useCallback(async () => {
    if (!torneoId) return;
    
    const [torneoData, partidosData] = await Promise.all([
      loadData(`torneo_${torneoId}`),
      loadData('partidos')
    ]);
    
    if (torneoData) setTorneo(torneoData);
    if (partidosData) {
      const partidosDelTorneo = partidosData.filter(
        (p: any) => p.torneoId === torneoId
      );
      setPartidos(partidosDelTorneo);
    }
  }, [torneoId, loadData]);

  const updateTorneo = useCallback(async (updates: any) => {
    if (!torneo) return;
    
    const updatedTorneo = { ...torneo, ...updates };
    setTorneo(updatedTorneo);
    await saveData(`torneo_${torneo.id}`, updatedTorneo);
  }, [torneo, saveData]);

  const addPartido = useCallback(async (partido: any) => {
    const newPartido = {
      ...partido,
      id: `partido_${Date.now()}`,
      torneoId
    };
    
    const newPartidos = [...partidos, newPartido];
    setPartidos(newPartidos);
    await saveData('partidos', newPartidos);
  }, [partidos, torneoId, saveData]);

  useEffect(() => {
    loadTorneo();
  }, [loadTorneo]);

  return {
    torneo,
    partidos,
    updateTorneo,
    addPartido,
    isLoading
  };
};

// 3. OPTIMIZED MATCH HOOK
export const useOptimizedPartido = (partidoId?: string) => {
  const [partido, setPartido] = useState<any>(null);
  const [eventos, setEventos] = useState<any[]>([]);
  const { loadData, saveData, isLoading } = useOptimizedDataContext();

  const loadPartido = useCallback(async () => {
    if (!partidoId) return;
    
    const partidoData = await loadData(`partido_${partidoId}`);
    if (partidoData) {
      setPartido(partidoData);
      setEventos(partidoData.eventos || []);
    }
  }, [partidoId, loadData]);

  const addEvento = useCallback(async (evento: any) => {
    if (!partido) return;
    
    const newEvento = {
      ...evento,
      id: `evento_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const newEventos = [...eventos, newEvento];
    setEventos(newEventos);
    
    const updatedPartido = {
      ...partido,
      eventos: newEventos
    };
    
    setPartido(updatedPartido);
    await saveData(`partido_${partidoId}`, updatedPartido);
  }, [partido, eventos, partidoId, saveData]);

  const finalizarPartido = useCallback(async (resultado: any) => {
    if (!partido) return;
    
    const updatedPartido = {
      ...partido,
      finalizado: true,
      resultado,
      fechaFinalizacion: new Date().toISOString()
    };
    
    setPartido(updatedPartido);
    await saveData(`partido_${partidoId}`, updatedPartido);
  }, [partido, partidoId, saveData]);

  useEffect(() => {
    loadPartido();
  }, [loadPartido]);

  return {
    partido,
    eventos,
    addEvento,
    finalizarPartido,
    isLoading
  };
};

// 4. PERFORMANCE MONITORING HOOK
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<any>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = PerformanceMonitor.getMetrics();
      setMetrics(currentMetrics);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const trackOperation = useCallback((operationName: string) => {
    return PerformanceMonitor.startTiming(operationName);
  }, []);

  return {
    metrics,
    trackOperation
  };
};

// 5. ERROR BOUNDARY HOOK
export const useErrorHandler = () => {
  const [error, setError] = useState<Error | null>(null);
  const [hasError, setHasError] = useState(false);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    setError(error);
    setHasError(true);
    
    // Log to optimization system
    console.error('🚨 Error capturado:', {
      message: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);

  return {
    error,
    hasError,
    captureError,
    resetError
  };
};

// 6. OPTIMIZED FORM HOOK
export const useOptimizedForm = (initialValues: any, validationSchema?: any) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: string, value: any) => {
    setValues((prev: any) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    
    const newErrors: any = {};
    let isValid = true;
    
    for (const [field, rules] of Object.entries(validationSchema)) {
      const value = values[field];
      const fieldRules = rules as any;
      
      if (fieldRules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = 'Este campo es requerido';
        isValid = false;
      } else if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
        newErrors[field] = `Mínimo ${fieldRules.minLength} caracteres`;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (onSubmit: (values: any) => Promise<void>) => {
    const endTiming = PerformanceMonitor.startTiming('form_submit');
    
    try {
      setIsSubmitting(true);
      
      if (!validate()) {
        return;
      }
      
      await onSubmit(values);
    } catch (error) {
      console.error('Error en formulario:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
      endTiming();
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  };
};

// 7. MEMOIZED CALCULATIONS HOOK
export const useMemoizedCalculations = () => {
  const calculateTorneoStats = useMemo(() => {
    return (partidos: any[]) => {
      const endTiming = PerformanceMonitor.startTiming('torneo_stats_calculation');
      
      try {
        const stats = {
          totalPartidos: partidos.length,
          partidosJugados: partidos.filter(p => p.finalizado).length,
          partidosPendientes: partidos.filter(p => !p.finalizado).length,
          totalGoles: partidos.reduce((total, partido) => {
            return total + (partido.eventos?.filter((e: any) => e.tipo === 'gol').length || 0);
          }, 0)
        };
        
        return stats;
      } finally {
        endTiming();
      }
    };
  }, []);

  const calculateEquipoStats = useMemo(() => {
    return (equipoId: string, partidos: any[]) => {
      const endTiming = PerformanceMonitor.startTiming('equipo_stats_calculation');
      
      try {
        const partidosEquipo = partidos.filter(p => 
          p.equipoLocal?.id === equipoId || p.equipoVisitante?.id === equipoId
        );
        
        const stats = {
          partidosJugados: partidosEquipo.filter(p => p.finalizado).length,
          victorias: 0,
          empates: 0,
          derrotas: 0,
          golesAFavor: 0,
          golesEnContra: 0
        };
        
        // Calcular estadísticas detalladas...
        
        return stats;
      } finally {
        endTiming();
      }
    };
  }, []);

  return {
    calculateTorneoStats,
    calculateEquipoStats
  };
};