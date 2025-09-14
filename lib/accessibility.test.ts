import { describe, it, expect } from 'vitest';
import { validateField, getAriaLabel, getAriaDescribedBy } from './accessibility';

describe('Accessibility Utilities', () => {
  describe('validateField', () => {
    it('should validate required fields', () => {
      const rules = { required: true, label: 'Name' };
      expect(validateField('', rules)).toEqual(['Name is required']);
      expect(validateField('John', rules)).toEqual([]);
    });

    it('should validate minLength', () => {
      const rules = { minLength: 3, label: 'Name' };
      expect(validateField('Jo', rules)).toEqual(['Name must be at least 3 characters']);
      expect(validateField('John', rules)).toEqual([]);
    });

    it('should validate maxLength', () => {
      const rules = { maxLength: 10, label: 'Name' };
      expect(validateField('John Doe Smith', rules)).toEqual(['Name must be no more than 10 characters']);
      expect(validateField('John', rules)).toEqual([]);
    });

    it('should validate pattern', () => {
      const rules = { pattern: /^[A-Za-z\s]+$/, label: 'Name' };
      expect(validateField('John123', rules)).toEqual(['Name format is invalid']);
      expect(validateField('John Doe', rules)).toEqual([]);
    });

    it('should validate min value', () => {
      const rules = { min: 0, label: 'Age' };
      expect(validateField(-1, rules)).toEqual(['Age must be at least 0']);
      expect(validateField(25, rules)).toEqual([]);
    });

    it('should validate max value', () => {
      const rules = { max: 100, label: 'Age' };
      expect(validateField(150, rules)).toEqual(['Age must be no more than 100']);
      expect(validateField(25, rules)).toEqual([]);
    });
  });

  describe('getAriaLabel', () => {
    it('should create aria label for required field', () => {
      expect(getAriaLabel('Name', true)).toBe('Name (required)');
    });

    it('should create aria label for optional field', () => {
      expect(getAriaLabel('Email', false)).toBe('Email');
    });
  });

  describe('getAriaDescribedBy', () => {
    it('should create describedBy for field with error and help', () => {
      expect(getAriaDescribedBy('name', true, true)).toBe('error-name help-name');
    });

    it('should create describedBy for field with only error', () => {
      expect(getAriaDescribedBy('name', true, false)).toBe('error-name');
    });

    it('should create describedBy for field with only help', () => {
      expect(getAriaDescribedBy('name', false, true)).toBe('help-name');
    });

    it('should return undefined for field with no error or help', () => {
      expect(getAriaDescribedBy('name', false, false)).toBeUndefined();
    });
  });
});