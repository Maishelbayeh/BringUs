// src/validation/specificationsValidation.ts
import { ValidationSchema, PATTERNS } from '../utils/validation';
import { TFunction } from 'i18next';

// Interface for a single specification value
export interface SpecValue {
  valueAr: string;
  valueEn: string;
}

// Interface for the specification form data
export interface SpecificationFormData {
  titleAr: string;
  titleEn: string;
  categoryId?: string;
  sortOrder?: number;
  isActive?: boolean;
  values: SpecValue[];
}

// Validation schema for a single value
export const specValueSchema: ValidationSchema = {
  valueAr: {
    required: true,
    type: 'arabicText',
    maxLength: 100,
  },
  valueEn: {
    required: true,
    type: 'englishText',
    maxLength: 100,
  },
};

// Main validation schema for the specification form
export const specificationValidationSchema: ValidationSchema = {
  titleAr: {
    required: true,
    type: 'arabicText',
    maxLength: 100,
  },
  titleEn: {
    required: true,
    type: 'englishText',
    maxLength: 100,
  },
  sortOrder: {
    required: false,
    type: 'number',
    min: 0,
    max: 999,
  },
  values: {
    required: true,
    custom: (values) => Array.isArray(values) && values.length > 0,
  },
};

/**
 * Validates the entire specification form, including duplicate checks.
 */
export const validateSpecificationWithDuplicates = (
  form: SpecificationFormData & { id?: string | number },
  allSpecs: any[],
  t: TFunction
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  // Validate titleAr
  if (!form.titleAr) {
    errors.titleAr = t('validation.required');
  } else if (!PATTERNS.arabicText.test(form.titleAr)) {
    errors.titleAr = t('validation.arabicOnly');
  } else if (form.titleAr.length > 100) {
    errors.titleAr = t('validation.maxLength', { max: 100 });
  }

  // Validate titleEn
  if (!form.titleEn) {
    errors.titleEn = t('validation.required');
  } else if (!PATTERNS.englishText.test(form.titleEn)) {
    errors.titleEn = t('validation.englishOnly');
  } else if (form.titleEn.length > 100) {
    errors.titleEn = t('validation.maxLength', { max: 100 });
  }

  // Duplicate title check
  const duplicate = allSpecs.find(spec =>
    spec._id !== form.id &&
    (spec.titleAr.trim().toLowerCase() === form.titleAr.trim().toLowerCase() ||
     spec.titleEn.trim().toLowerCase() === form.titleEn.trim().toLowerCase())
  );
  if (duplicate) {
    errors.titleAr = t('validation.duplicateSpecTitle');
    errors.titleEn = t('validation.duplicateSpecTitle');
  }

  // Validate values array
  if (!form.values || form.values.length === 0) {
    errors.values = t('validation.specValuesRequired');
  } else {
    form.values.forEach((value, index) => {
      if (!value.valueAr) {
        errors[`values.${index}.valueAr`] = t('validation.required');
      } else if (!PATTERNS.arabicText.test(value.valueAr)) {
        errors[`values.${index}.valueAr`] = t('validation.arabicOnly');
      }
      if (!value.valueEn) {
        errors[`values.${index}.valueEn`] = t('validation.required');
      } else if (!PATTERNS.englishText.test(value.valueEn)) {
        errors[`values.${index}.valueEn`] = t('validation.englishOnly');
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 