// src/validation/unitsValidation.ts
// فالديشين الوحدات باستخدام النظام العام

import { ValidationSchema, COMMON_SCHEMAS, PATTERNS } from '../utils/validation';
import { TFunction } from 'i18next';

// Interface لبيانات فورم الوحدة
export interface UnitsFormData {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  symbol?: string;
  sortOrder?: number;
  isActive?: boolean;
}

// Schema للتحقق من صحة بيانات الوحدة
export const unitsValidationSchema: ValidationSchema = {
  nameAr: {
    required: true,
    type: 'arabicText',
    minLength: 2,
    maxLength: 50,
  },
  nameEn: {
    required: true,
    type: 'englishText',
    minLength: 2,
    maxLength: 50,
  },
  descriptionAr: {
    required: false,
    type: 'arabicText',
    maxLength: 500,
  },
  descriptionEn: {
    required: false,
    type: 'englishText',
    maxLength: 500,
  },
  symbol: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 10,
  },
  sortOrder: {
    required: false,
    type: 'number',
    min: 0,
    max: 999,
  },
};

// Schemas جاهزة للاستخدام المتكرر
export const UnitsSchemas = {
  // Schema للأسماء ثنائية اللغة
  names: COMMON_SCHEMAS.bilingualText(2, 50),
  
  // Schema للأوصاف ثنائية اللغة (اختيارية)
  descriptions: {
    descriptionAr: {
      required: false,
      type: 'arabicText' as const,
      maxLength: 500,
    },
    descriptionEn: {
      required: false,
      type: 'englishText' as const,
      maxLength: 500,
    },
  },
  
  // Schema للرمز
  symbol: {
    symbol: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 10,
    },
  },
  
  // Schema للترتيب
  sortOrder: {
    sortOrder: {
      required: false,
      type: 'number' as const,
      min: 0,
      max: 999,
    },
  },
  
  // Schema كامل للوحدة
  full: unitsValidationSchema,
};

/**
 * دالة مساعدة للتحقق من تكرار الاسم أو الرمز
 */
export const checkDuplicateUnit = (
  field: 'nameAr' | 'nameEn' | 'symbol',
  value: string, 
  units: any[], 
  currentId?: string | number | null
): boolean => {
  if (!value || value.trim() === '') return false;
  
  return units.some(unit => {
    // تجاهل الوحدة الحالية عند التعديل
    if (currentId && (unit.id === currentId || unit._id === currentId)) {
      return false;
    }
    
    // التحقق من تطابق القيمة
    return unit[field] && unit[field].trim().toLowerCase() === value.trim().toLowerCase();
  });
};

/**
 * دالة فالديشين شاملة للوحدة مع دعم التحقق من التكرار
 */
export const validateUnitsWithDuplicates = (
  form: UnitsFormData & { id?: string | number },
  units: any[],
  t: TFunction
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};
  
  console.log('validateUnitsWithDuplicates called with form:', form);

  // فالديشين الحقول الأساسية
  if (!form.nameAr || form.nameAr.trim() === '') {
    errors.nameAr = t('validation.required', { defaultValue: 'This field is required' });
  } else if (!PATTERNS.arabicText.test(form.nameAr)) {
    errors.nameAr = t('validation.arabicOnly', { defaultValue: 'Arabic text only' });
  } else if (form.nameAr.trim().length < 2) {
    errors.nameAr = t('validation.minLength', { defaultValue: 'Minimum length is {{min}} characters', min: 2 });
  } else if (form.nameAr.trim().length > 50) {
    errors.nameAr = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 50 });
  }

  if (!form.nameEn || form.nameEn.trim() === '') {
    errors.nameEn = t('validation.required', { defaultValue: 'This field is required' });
  } else if (!PATTERNS.englishText.test(form.nameEn)) {
    errors.nameEn = t('validation.englishOnly', { defaultValue: 'English text only' });
  } else if (form.nameEn.trim().length < 2) {
    errors.nameEn = t('validation.minLength', { defaultValue: 'Minimum length is {{min}} characters', min: 2 });
  } else if (form.nameEn.trim().length > 50) {
    errors.nameEn = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 50 });
  }

  // فالديشين الرمز
  if (!form.symbol || form.symbol.trim() === '') {
    errors.symbol = t('validation.required', { defaultValue: 'This field is required' });
  } else if (form.symbol.trim().length < 1) {
    errors.symbol = t('validation.minLength', { defaultValue: 'Minimum length is {{min}} characters', min: 1 });
  } else if (form.symbol.trim().length > 10) {
    errors.symbol = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 10 });
  }

  // فالديشين الأوصاف (اختياري)
  if (form.descriptionAr && form.descriptionAr.trim() !== '') {
    if (!PATTERNS.arabicText.test(form.descriptionAr)) {
      errors.descriptionAr = t('validation.arabicOnly', { defaultValue: 'Arabic text only' });
    } else if (form.descriptionAr.trim().length > 500) {
      errors.descriptionAr = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 500 });
    }
  }

  if (form.descriptionEn && form.descriptionEn.trim() !== '') {
    if (!PATTERNS.englishText.test(form.descriptionEn)) {
      errors.descriptionEn = t('validation.englishOnly', { defaultValue: 'English text only' });
    } else if (form.descriptionEn.trim().length > 500) {
      errors.descriptionEn = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 500 });
    }
  }

  // فالديشين الترتيب
  if (form.sortOrder !== undefined && form.sortOrder !== null) {
    const order = typeof form.sortOrder === 'string' ? parseInt(form.sortOrder) : form.sortOrder;
    if (isNaN(order) || order < 0 || order > 999) {
      errors.sortOrder = t('validation.numberRange', { defaultValue: 'Number must be between {{min}} and {{max}}', min: 0, max: 999 });
    }
  }

  // فالديشين عدم التكرار
  if (form.nameAr && checkDuplicateUnit('nameAr', form.nameAr, units, form.id)) {
    errors.nameAr = t('validation.duplicateNameAr', { defaultValue: 'Arabic name already exists' });
  }

  if (form.nameEn && checkDuplicateUnit('nameEn', form.nameEn, units, form.id)) {
    errors.nameEn = t('validation.duplicateNameEn', { defaultValue: 'English name already exists' });
  }

  if (form.symbol && checkDuplicateUnit('symbol', form.symbol, units, form.id)) {
    errors.symbol = t('validation.duplicateSymbol', { defaultValue: 'Symbol already exists' });
  }

  const result = {
    isValid: Object.keys(errors).length === 0,
    errors
  };
  
  console.log('validateUnitsWithDuplicates result:', result);
  
  return result;
}; 