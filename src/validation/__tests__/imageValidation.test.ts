/**
 * Test file for image validation functionality
 * This file tests the image validation system to ensure it works correctly
 */

import { 
  validateImageFile, 
  validateImageFiles, 
  validateImageFileI18n, 
  validateImageFilesI18n,
  createImageValidationFunction,
  MAX_IMAGE_SIZE_MB,
  ALLOWED_IMAGE_TYPES
} from '../imageValidation';

// Mock translation function
const mockT = (key: string, params?: any) => {
  const translations: { [key: string]: string } = {
    'validation.imageTooLargeLimit': `Image size ${params?.size} MB exceeds the allowed (${params?.limit} MB)`,
    'validation.imagesTooLargeList': `The following image exceed the allowed size (${params?.limit} MB): ${params?.names}`,
    'validation.tooManyFiles': `Too many files. Maximum allowed: ${params?.limit}`,
    'validation.invalidFileType': `Invalid file type. Allowed types: ${params?.types}`
  };
  return translations[key] || key;
};

// Mock file creation helper
const createMockFile = (name: string, size: number, type: string = 'image/jpeg'): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('Image Validation Tests', () => {
  describe('validateImageFile', () => {
    it('should accept valid image file', () => {
      const file = createMockFile('test.jpg', 1024 * 1024); // 1MB
      const result = validateImageFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject file that is too large', () => {
      const file = createMockFile('test.jpg', 4 * 1024 * 1024); // 4MB
      const result = validateImageFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('exceeds the maximum allowed size');
    });

    it('should reject invalid file type', () => {
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const result = validateImageFile(file);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Invalid file type');
    });
  });

  describe('validateImageFiles', () => {
    it('should accept multiple valid files', () => {
      const files = [
        createMockFile('test1.jpg', 1024 * 1024),
        createMockFile('test2.png', 2 * 1024 * 1024)
      ];
      const result = validateImageFiles(files);
      expect(result.isValid).toBe(true);
    });

    it('should reject when too many files', () => {
      const files = Array(15).fill(null).map((_, i) => 
        createMockFile(`test${i}.jpg`, 1024)
      );
      const result = validateImageFiles(files);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Too many files');
    });

    it('should reject files that are too large', () => {
      const files = [
        createMockFile('test1.jpg', 4 * 1024 * 1024),
        createMockFile('test2.jpg', 5 * 1024 * 1024)
      ];
      const result = validateImageFiles(files);
      expect(result.isValid).toBe(false);
      expect(result.invalidFiles).toEqual(['test1.jpg', 'test2.jpg']);
    });
  });

  describe('validateImageFileI18n', () => {
    it('should work with translation function', () => {
      const file = createMockFile('test.jpg', 4 * 1024 * 1024);
      const result = validateImageFileI18n(file, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Image size');
    });
  });

  describe('validateImageFilesI18n', () => {
    it('should work with translation function for multiple files', () => {
      const files = [
        createMockFile('test1.jpg', 4 * 1024 * 1024),
        createMockFile('test2.jpg', 5 * 1024 * 1024)
      ];
      const result = validateImageFilesI18n(files, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('exceed the allowed size');
    });
  });

  describe('createImageValidationFunction', () => {
    it('should create a working validation function', () => {
      const validator = createImageValidationFunction(mockT);
      const files = [createMockFile('test.jpg', 4 * 1024 * 1024)];
      const result = validator(files);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    });
  });

  describe('Constants', () => {
    it('should have correct maximum size', () => {
      expect(MAX_IMAGE_SIZE_MB).toBe(3);
    });

    it('should have correct allowed types', () => {
      expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/png');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/gif');
      expect(ALLOWED_IMAGE_TYPES).toContain('image/webp');
    });
  });
});
