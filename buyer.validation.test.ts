import { describe, it, expect } from 'vitest';
import { buyerSchema } from '../lib/validations/buyer';

describe('Buyer Validation', () => {
  const validBuyer = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    city: 'Chandigarh',
    propertyType: 'Apartment',
    bhk: 'Two',
    purpose: 'Buy',
    budgetMin: 5000000,
    budgetMax: 7000000,
    timeline: 'M0_3m',
    source: 'Website',
    status: 'New',
    notes: 'Looking for investment property'
  };

  describe('Valid Data', () => {
    it('should validate a complete buyer object', () => {
      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should validate with minimal required fields', () => {
      const minimalBuyer = {
        fullName: 'Jane Doe',
        phone: '9876543210',
        city: 'Mohali',
        propertyType: 'Villa',
        purpose: 'Rent',
        timeline: 'M3_6m',
        source: 'Referral',
        status: 'New'
      };
      
      const result = buyerSchema.safeParse(minimalBuyer);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields undefined', () => {
      const buyerWithoutOptionals = {
        ...validBuyer,
        email: undefined,
        bhk: undefined,
        budgetMin: undefined,
        budgetMax: undefined,
        notes: undefined
      };
      
      const result = buyerSchema.safeParse(buyerWithoutOptionals);
      expect(result.success).toBe(true);
    });
  });

  describe('Required Fields', () => {
    it('should fail without fullName', () => {
      const invalidBuyer = { ...validBuyer, fullName: '' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Full Name is required');
      }
    });

    it('should fail without phone', () => {
      const invalidBuyer = { ...validBuyer, phone: '123' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Phone number required');
      }
    });

    it('should fail with invalid city', () => {
      const invalidBuyer = { ...validBuyer, city: 'InvalidCity' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid propertyType', () => {
      const invalidBuyer = { ...validBuyer, propertyType: 'InvalidType' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid purpose', () => {
      const invalidBuyer = { ...validBuyer, purpose: 'InvalidPurpose' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid timeline', () => {
      const invalidBuyer = { ...validBuyer, timeline: 'InvalidTimeline' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid source', () => {
      const invalidBuyer = { ...validBuyer, source: 'InvalidSource' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid status', () => {
      const invalidBuyer = { ...validBuyer, status: 'InvalidStatus' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email', () => {
      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email format', () => {
      const invalidBuyer = { ...validBuyer, email: 'invalid-email' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should accept undefined email', () => {
      const buyerWithoutEmail = { ...validBuyer, email: undefined };
      const result = buyerSchema.safeParse(buyerWithoutEmail);
      expect(result.success).toBe(true);
    });
  });

  describe('Budget Validation', () => {
    it('should accept valid budget range', () => {
      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should fail when budgetMax is less than budgetMin', () => {
      const invalidBuyer = {
        ...validBuyer,
        budgetMin: 7000000,
        budgetMax: 5000000
      };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('budgetMax must be greater than or equal to budgetMin');
      }
    });

    it('should accept only budgetMin', () => {
      const buyerWithMinOnly = { ...validBuyer, budgetMax: undefined };
      const result = buyerSchema.safeParse(buyerWithMinOnly);
      expect(result.success).toBe(true);
    });

    it('should accept only budgetMax', () => {
      const buyerWithMaxOnly = { ...validBuyer, budgetMin: undefined };
      const result = buyerSchema.safeParse(buyerWithMaxOnly);
      expect(result.success).toBe(true);
    });

    it('should fail with negative budgetMin', () => {
      const invalidBuyer = { ...validBuyer, budgetMin: -1000 };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should fail with negative budgetMax', () => {
      const invalidBuyer = { ...validBuyer, budgetMax: -1000 };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });
  });

  describe('Notes Validation', () => {
    it('should accept notes within limit', () => {
      const result = buyerSchema.safeParse(validBuyer);
      expect(result.success).toBe(true);
    });

    it('should fail with notes exceeding 1000 characters', () => {
      const longNotes = 'a'.repeat(1001);
      const invalidBuyer = { ...validBuyer, notes: longNotes };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should accept undefined notes', () => {
      const buyerWithoutNotes = { ...validBuyer, notes: undefined };
      const result = buyerSchema.safeParse(buyerWithoutNotes);
      expect(result.success).toBe(true);
    });
  });

  describe('BHK Validation', () => {
    it('should accept valid BHK values', () => {
      const validBHKs = ['Studio', 'One', 'Two', 'Three', 'Four'];
      
      validBHKs.forEach(bhk => {
        const buyer = { ...validBuyer, bhk };
        const result = buyerSchema.safeParse(buyer);
        expect(result.success).toBe(true);
      });
    });

    it('should fail with invalid BHK', () => {
      const invalidBuyer = { ...validBuyer, bhk: 'Five' };
      const result = buyerSchema.safeParse(invalidBuyer);
      expect(result.success).toBe(false);
    });

    it('should accept undefined BHK', () => {
      const buyerWithoutBHK = { ...validBuyer, bhk: undefined };
      const result = buyerSchema.safeParse(buyerWithoutBHK);
      expect(result.success).toBe(true);
    });
  });
});