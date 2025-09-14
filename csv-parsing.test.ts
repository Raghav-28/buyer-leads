import { describe, it, expect } from 'vitest';
import Papa from 'papaparse';

describe('CSV Parsing', () => {
  const validCSVData = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,status,notes
John Doe,john@example.com,9876543210,Chandigarh,Apartment,Two,Buy,5000000,7000000,M0_3m,Website,New,Looking for investment
Jane Smith,jane@example.com,9876543211,Mohali,Villa,Three,Buy,8000000,10000000,M3_6m,Referral,Qualified,Family home`;

  const invalidCSVData = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,status,notes
John Doe,invalid-email,123,InvalidCity,InvalidType,Five,InvalidPurpose,invalid,invalid,InvalidTimeline,InvalidSource,InvalidStatus,`;

  describe('Valid CSV Parsing', () => {
    it('should parse valid CSV data correctly', () => {
      const result = Papa.parse(validCSVData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      expect(result.errors).toHaveLength(0);
      expect(result.data).toHaveLength(2);
      
      const firstRow = result.data[0] as any;
      expect(firstRow.fullName).toBe('John Doe');
      expect(firstRow.email).toBe('john@example.com');
      expect(firstRow.phone).toBe('9876543210');
      expect(firstRow.city).toBe('Chandigarh');
      expect(firstRow.propertyType).toBe('Apartment');
      expect(firstRow.bhk).toBe('Two');
      expect(firstRow.purpose).toBe('Buy');
      expect(firstRow.budgetMin).toBe('5000000');
      expect(firstRow.budgetMax).toBe('7000000');
      expect(firstRow.timeline).toBe('M0_3m');
      expect(firstRow.source).toBe('Website');
      expect(firstRow.status).toBe('New');
      expect(firstRow.notes).toBe('Looking for investment');
    });

    it('should handle empty values correctly', () => {
      const csvWithEmptyValues = `fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,status,notes
John Doe,,9876543210,Chandigarh,Apartment,,Buy,,,M0_3m,Website,New,`;

      const result = Papa.parse(csvWithEmptyValues, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      expect(result.errors).toHaveLength(0);
      expect(result.data).toHaveLength(1);
      
      const row = result.data[0] as any;
      expect(row.email).toBe('');
      expect(row.bhk).toBe('');
      expect(row.budgetMin).toBe('');
      expect(row.budgetMax).toBe('');
      expect(row.notes).toBe('');
    });
  });

  describe('CSV Error Handling', () => {
    it('should detect parsing errors', () => {
      const malformedCSV = `fullName,email,phone,city
John Doe,john@example.com,9876543210,Chandigarh
Jane Smith,jane@example.com,9876543211,Mohali,Extra,Fields`;

      const result = Papa.parse(malformedCSV, {
        header: true,
        skipEmptyLines: true
      });

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle missing headers', () => {
      const csvWithoutHeaders = `John Doe,john@example.com,9876543210,Chandigarh`;

      const result = Papa.parse(csvWithoutHeaders, {
        header: true,
        skipEmptyLines: true
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        'Column 1': 'John Doe',
        'Column 2': 'john@example.com',
        'Column 3': '9876543210',
        'Column 4': 'Chandigarh'
      });
    });
  });

  describe('Data Transformation', () => {
    it('should convert string numbers to numbers', () => {
      const csvData = `fullName,phone,budgetMin,budgetMax
John Doe,9876543210,5000000,7000000`;

      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          if (field === 'budgetMin' || field === 'budgetMax') {
            return value ? Number(value) : undefined;
          }
          return value;
        }
      });

      const row = result.data[0] as any;
      expect(typeof row.budgetMin).toBe('number');
      expect(typeof row.budgetMax).toBe('number');
      expect(row.budgetMin).toBe(5000000);
      expect(row.budgetMax).toBe(7000000);
    });

    it('should handle empty string numbers', () => {
      const csvData = `fullName,phone,budgetMin,budgetMax
John Doe,9876543210,,`;

      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          if (field === 'budgetMin' || field === 'budgetMax') {
            return value ? Number(value) : undefined;
          }
          return value;
        }
      });

      const row = result.data[0] as any;
      expect(row.budgetMin).toBeUndefined();
      expect(row.budgetMax).toBeUndefined();
    });
  });

  describe('CSV Validation Integration', () => {
    it('should validate parsed CSV data against buyer schema', () => {
      const { buyerSchema } = require('../lib/validations/buyer');
      
      const result = Papa.parse(validCSVData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      const validationResults = result.data.map((row: any) => {
        // Transform string numbers to numbers
        const transformedRow = {
          ...row,
          budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
          budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
        };
        
        return buyerSchema.safeParse(transformedRow);
      });

      expect(validationResults.every(result => result.success)).toBe(true);
    });

    it('should identify invalid rows in CSV data', () => {
      const { buyerSchema } = require('../lib/validations/buyer');
      
      const result = Papa.parse(invalidCSVData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim()
      });

      const validationResults = result.data.map((row: any) => {
        const transformedRow = {
          ...row,
          budgetMin: row.budgetMin ? Number(row.budgetMin) : undefined,
          budgetMax: row.budgetMax ? Number(row.budgetMax) : undefined,
        };
        
        return buyerSchema.safeParse(transformedRow);
      });

      expect(validationResults.every(result => result.success)).toBe(false);
    });
  });
});