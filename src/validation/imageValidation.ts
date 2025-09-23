/**
 * Image validation utilities
 * Provides comprehensive validation for image uploads with 3MB size limit
 */

export interface ImageValidationResult {
  isValid: boolean;
  errorMessage?: string;
  sizeInMB?: string;
  invalidFiles?: string[];
}

export interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

// Default validation options
const DEFAULT_OPTIONS: Required<ImageValidationOptions> = {
  maxSizeMB: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles: 10
};

/**
 * Validates a single image file
 * @param file - The file to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateImageFile = (
  file: File, 
  options: ImageValidationOptions = {}
): ImageValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check file type
  if (!opts.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: `Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}`
    };
  }
  
  // Check file size
  const maxSizeBytes = opts.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      errorMessage: `File size (${sizeInMB}MB) exceeds the maximum allowed size of ${opts.maxSizeMB}MB`,
      sizeInMB
    };
  }
  
  return { isValid: true };
};

/**
 * Validates multiple image files
 * @param files - Array of files to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateImageFiles = (
  files: File[], 
  options: ImageValidationOptions = {}
): ImageValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check number of files
  if (files.length > opts.maxFiles) {
    return {
      isValid: false,
      errorMessage: `Too many files. Maximum allowed: ${opts.maxFiles}`
    };
  }
  
  const invalidFiles: string[] = [];
  let firstOversizedSizeMB: string | undefined;
  
  for (const file of files) {
    const validation = validateImageFile(file, options);
    if (!validation.isValid) {
      invalidFiles.push(file.name);
      if (validation.sizeInMB && !firstOversizedSizeMB) {
        firstOversizedSizeMB = validation.sizeInMB;
      }
    }
  }
  
  if (invalidFiles.length > 0) {
    const names = invalidFiles.join(', ');
    const message = invalidFiles.length > 1
      ? `The following files exceed the ${opts.maxSizeMB}MB limit: ${names}`
      : `File "${names}" (${firstOversizedSizeMB}MB) exceeds the ${opts.maxSizeMB}MB limit`;
    
    return {
      isValid: false,
      errorMessage: message,
      invalidFiles
    };
  }
  
  return { isValid: true };
};

/**
 * Validates image files with internationalization support
 * @param files - Array of files to validate
 * @param t - Translation function
 * @param options - Validation options
 * @returns Validation result with localized messages
 */
export const validateImageFilesI18n = (
  files: File[], 
  t: (key: string, params?: any) => string,
  options: ImageValidationOptions = {}
): ImageValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check number of files
  if (files.length > opts.maxFiles) {
    return {
      isValid: false,
      errorMessage: t('validation.tooManyFiles', { limit: opts.maxFiles })
    };
  }
  
  const invalidFiles: string[] = [];
  let firstOversizedSizeMB: string | undefined;
  
  for (const file of files) {
    const validation = validateImageFile(file, options);
    if (!validation.isValid) {
      invalidFiles.push(file.name);
      if (validation.sizeInMB && !firstOversizedSizeMB) {
        firstOversizedSizeMB = validation.sizeInMB;
      }
    }
  }
  
  if (invalidFiles.length > 0) {
    const names = invalidFiles.join(', ');
    const message = invalidFiles.length > 1
      ? t('validation.imagesTooLargeList', { limit: opts.maxSizeMB, names })
      : t('validation.imageTooLargeLimit', { size: firstOversizedSizeMB, limit: opts.maxSizeMB });
    
    return {
      isValid: false,
      errorMessage: message,
      invalidFiles
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a single image file with internationalization support
 * @param file - The file to validate
 * @param t - Translation function
 * @param options - Validation options
 * @returns Validation result with localized messages
 */
export const validateImageFileI18n = (
  file: File, 
  t: (key: string, params?: any) => string,
  options: ImageValidationOptions = {}
): ImageValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check file type
  if (!opts.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: t('validation.invalidFileType', { types: opts.allowedTypes.join(', ') })
    };
  }
  
  // Check file size
  const maxSizeBytes = opts.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      errorMessage: t('validation.imageTooLargeLimit', { size: sizeInMB, limit: opts.maxSizeMB }),
      sizeInMB
    };
  }
  
  return { isValid: true };
};

/**
 * Creates a validation function for use with CustomFileInput
 * @param t - Translation function
 * @param options - Validation options
 * @returns Validation function
 */
export const createImageValidationFunction = (
  t: (key: string, params?: any) => string,
  options: ImageValidationOptions = {}
) => {
  return (files: File[]): { isValid: boolean; errorMessage?: string } => {
    const result = validateImageFilesI18n(files, t, options);
    return {
      isValid: result.isValid,
      errorMessage: result.errorMessage
    };
  };
};

// Constants for easy access
export const MAX_IMAGE_SIZE_MB = 3;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
