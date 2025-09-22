import { validateEmail, validatePassword, validateRequired } from '../../utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('MyPassword1')).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(validatePassword('123456')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('validates non-empty values', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('0')).toBe(true);
      expect(validateRequired('123')).toBe(true);
    });

    it('rejects empty values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('')).toBe(false);
    });
  });
});