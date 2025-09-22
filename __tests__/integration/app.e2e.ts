/**
 * Test de Integración Automático
 * Simula interacciones reales del usuario
 */

import { by, device, element, expect as detoxExpect } from 'detox';

describe('App Integration Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication Flow', () => {
    it('should show login screen on first launch', async () => {
      await detoxExpect(element(by.id('login-screen'))).toBeVisible();
    });

    it('should navigate to register screen', async () => {
      await element(by.id('register-link')).tap();
      await detoxExpect(element(by.id('register-screen'))).toBeVisible();
    });

    it('should validate registration form', async () => {
      await element(by.id('register-link')).tap();
      await element(by.id('submit-btn')).tap();
      
      await detoxExpect(element(by.text('El nombre es requerido'))).toBeVisible();
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between tabs', async () => {
      // Assuming user is logged in
      await element(by.id('torneos-tab')).tap();
      await detoxExpect(element(by.id('torneos-screen'))).toBeVisible();
      
      await element(by.id('equipos-tab')).tap();
      await detoxExpect(element(by.id('equipos-screen'))).toBeVisible();
      
      await element(by.id('clubes-tab')).tap();
      await detoxExpect(element(by.id('clubes-screen'))).toBeVisible();
    });
  });

  describe('Tournament Creation', () => {
    it('should create a new tournament', async () => {
      await element(by.id('crear-torneo-btn')).tap();
      
      await element(by.id('nombre-input')).typeText('Torneo Test');
      await element(by.id('descripcion-input')).typeText('Descripción del torneo');
      await element(by.id('categoria-picker')).tap();
      await element(by.text('Senior')).tap();
      
      await element(by.id('submit-btn')).tap();
      
      await detoxExpect(element(by.text('Torneo creado exitosamente'))).toBeVisible();
    });
  });

  describe('Team Management', () => {
    it('should create a new club', async () => {
      await element(by.id('crear-club-btn')).tap();
      
      await element(by.id('nombre-input')).typeText('Club Test');
      await element(by.id('ciudad-input')).typeText('Madrid');
      
      await element(by.id('submit-btn')).tap();
      
      await detoxExpect(element(by.text('Club creado exitosamente'))).toBeVisible();
    });
  });

  describe('Friendly Matches', () => {
    it('should create availability for friendly match', async () => {
      await element(by.id('amistosos-tab')).tap();
      await element(by.id('crear-disponibilidad-btn')).tap();
      
      await element(by.id('fecha-picker')).tap();
      // Select a future date
      await element(by.text('15')).tap();
      await element(by.text('OK')).tap();
      
      await element(by.id('ubicacion-input')).typeText('Campo Municipal');
      
      await element(by.id('submit-btn')).tap();
      
      await detoxExpect(element(by.text('Disponibilidad creada'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      await device.setURLBlacklist(['.*firebase.*']);
      
      await element(by.id('crear-torneo-btn')).tap();
      await element(by.id('nombre-input')).typeText('Torneo Test');
      await element(by.id('submit-btn')).tap();
      
      await detoxExpect(element(by.text('Error de conexión'))).toBeVisible();
      
      // Restore network
      await device.setURLBlacklist([]);
    });
  });

  describe('Performance Tests', () => {
    it('should load screens within acceptable time', async () => {
      const startTime = Date.now();
      
      await element(by.id('torneos-tab')).tap();
      await detoxExpect(element(by.id('torneos-screen'))).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // Should load within 2 seconds
    });
  });
});