// src/validation/categoryValidation.ts
// فالديشين الكاتيجوريز باستخدام النظام العام

import { ValidationSchema, COMMON_SCHEMAS, PATTERNS } from '../utils/validation';
import { TFunction } from 'i18next';

// Interface لبيانات فورم الكاتيجوري
export interface CategoryFormData {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  image?: string;
  order?: number;
  parentId?: string | number;
  isActive?: boolean;
}

// Schema للتحقق من صحة بيانات الكاتيجوري
export const categoryValidationSchema: ValidationSchema = {
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
  image: {
    required: false,
    type: 'url',
  },
  order: {
    required: false,
    type: 'number',
    min: 1,
    max: 999,
  },
};

// Schemas جاهزة للاستخدام المتكرر
export const CategorySchemas = {
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
  
  // Schema للترتيب
  order: {
    order: {
      required: false,
      type: 'number' as const,
      min: 1,
      max: 999,
    },
  },
  
  // Schema كامل للكاتيجوري
  full: categoryValidationSchema,
};

/**
 * دالة مساعدة للتحقق من تكرار الاسم في نفس المستوى
 */
export const checkDuplicateName = (
  name: string, 
  categories: any[], 
  currentId?: string | number | null, 
  parentId?: string | number | null
): boolean => {
  if (!name || name.trim() === '') return false;
  
  return categories.some(cat => {
    // تجاهل الفئة الحالية عند التعديل
    if (currentId && (cat.id === currentId || cat._id === currentId)) {
      return false;
    }
    
    // التحقق من نفس المستوى (نفس parentId)
    const catParentId = cat.parentId || (cat.parent && cat.parent.id) || null;
    if (catParentId !== parentId) {
      return false;
    }
    
    // التحقق من الاسم العربي والإنجليزي (حساسية لحالة الأحرف)
    return (cat.nameAr && cat.nameAr.trim().toLowerCase() === name.trim().toLowerCase()) || 
           (cat.nameEn && cat.nameEn.trim().toLowerCase() === name.trim().toLowerCase());
  });
};

/**
 * دالة فالديشين شاملة للكاتيجوري مع دعم التحقق من التكرار
 */
export const validateCategoryWithDuplicates = (
  form: CategoryFormData & { id?: string | number; parentId?: string | number },
  categories: any[],
  t: TFunction
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};
  
  console.log('validateCategoryWithDuplicates called with form:', form);

  // فالديشين الحقول الأساسية
  if (!form.nameAr || form.nameAr.trim() === '') {
    errors.nameAr = t('validation.required', { defaultValue: 'This field is required' });
  } else if (form.nameAr.trim().length < 2) {
    errors.nameAr = t('validation.minLength', { defaultValue: 'Minimum length is {{min}} characters', min: 2 });
  } else if (form.nameAr.trim().length > 50) {
    errors.nameAr = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 50 });
  } else if (!PATTERNS.arabicText.test(form.nameAr.trim())) {
    console.log(`Arabic text validation failed for: "${form.nameAr.trim()}"`);
    errors.nameAr = t('validation.arabicOnly', { defaultValue: 'Please enter Arabic text only' });
  }

  if (!form.nameEn || form.nameEn.trim() === '') {
    errors.nameEn = t('validation.required', { defaultValue: 'This field is required' });
  } else if (form.nameEn.trim().length < 2) {
    errors.nameEn = t('validation.minLength', { defaultValue: 'Minimum length is {{min}} characters', min: 2 });
  } else if (form.nameEn.trim().length > 50) {
    errors.nameEn = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 50 });
  } else if (!PATTERNS.englishText.test(form.nameEn.trim())) {
    console.log(`English text validation failed for: "${form.nameEn.trim()}"`);
    errors.nameEn = t('validation.englishOnly', { defaultValue: 'Please enter English text, numbers and common symbols only' });
  }

  // فالديشين الأوصاف (اختياري)
  if (form.descriptionAr && form.descriptionAr.trim() !== '') {
    if (form.descriptionAr.trim().length > 500) {
      errors.descriptionAr = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 500 });
    } else if (!PATTERNS.arabicText.test(form.descriptionAr.trim())) {
      errors.descriptionAr = t('validation.arabicOnly', { defaultValue: 'Please enter Arabic text only' });
    }
  }

  if (form.descriptionEn && form.descriptionEn.trim() !== '') {
    if (form.descriptionEn.trim().length > 500) {
      errors.descriptionEn = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 500 });
    } else if (!PATTERNS.englishText.test(form.descriptionEn.trim())) {
      errors.descriptionEn = t('validation.englishOnly', { defaultValue: 'Please enter English text, numbers and common symbols only' });
    }
  }

  // فالديشين الترتيب
  if (form.order !== undefined && form.order !== null) {
    const order = typeof form.order === 'string' ? parseInt(form.order) : form.order;
    if (isNaN(order) || order < 1 || order > 999) {
      errors.order = t('validation.numberRange', { defaultValue: 'Number must be between {{min}} and {{max}}', min: 1, max: 999 });
    }
  }

  // فالديشين الفئة الرئيسية
  if (form.parentId && form.id && form.parentId === form.id) {
    errors.parentId = t('validation.parentCategoryNotSelf', { defaultValue: 'Parent category cannot be the same as current category' });
  }

  // فالديشين عدم التكرار
  if (form.nameAr && checkDuplicateName(form.nameAr, categories, form.id, form.parentId)) {
    errors.nameAr = t('validation.duplicateNameAr', { defaultValue: 'Arabic name must be unique within the same level' });
  }

  if (form.nameEn && checkDuplicateName(form.nameEn, categories, form.id, form.parentId)) {
    errors.nameEn = t('validation.duplicateNameEn', { defaultValue: 'English name must be unique within the same level' });
  }

  const result = {
    isValid: Object.keys(errors).length === 0,
    errors
  };
  
  console.log('validateCategoryWithDuplicates result:', result);
  
  return result;
}; 