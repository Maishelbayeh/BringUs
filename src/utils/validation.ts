// src/utils/validation.ts
// نظام فالديشين عام للمشروع بأكمله

import { TFunction } from 'i18next';

// Types for validation
export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'arabicText' | 'englishText' | 'url' | 'file';
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

// Regex patterns
export const PATTERNS = {
  email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+[1-9]\d{1,14}$/,  // يبدأ بـ + ويتبعه رمز دولة (1-9) ثم أرقام (إجمالي 15 رقم كحد أقصى)
  arabicText: /^[\s\S]*$/,
  // arabicText: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s\u0660-\u0669\u06F0-\u06F90-9.,-_،!؟]+$/,  // عربي مع أرقام إنجليزية
  englishText: /^[a-zA-Z0-9\s\-_.,,—:;!?()-_'"&@#$%*+=/\\[\]{}|<>~`’^]+$/,  // أحرف إنجليزية + أرقام + رموز عادية
  englishWithNumbers: /^[a-zA-Z0-9\s]+$/,  // احتفظ بالنمط القديم للتوافق مع الخلف
  url: /^https?:\/\/.+/,
  imageUrl: /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i,
  whatsapp: /^\+[1-9]\d{1,14}$/,  // نفس نمط الهاتف الدولي
  whatsappPalestinian: /^\+970[5][0-9]{8}$/,  // رقم فلسطيني: +970 + 5 + 8 أرقام
  whatsappIsraeli: /^\+972[5][0-8][0-9]{7}$/,  // رقم إسرائيلي: +972 + 5 + رقم من 0-8 + 7 أرقام
  slug: /^[a-z0-9-]+$/,
};

// File validation constants
export const FILE_VALIDATION = {
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'],
  maxImageSize:10 * 1024 * 1024, // 10MB
  allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  maxDocumentSize: 10 * 1024 * 1024, // 10MB
};

/**
 * دالة التحقق من صحة حقل واحد
 */
export const validateField = (
  value: any,
  rule: ValidationRule,
  t: TFunction,
  _fieldName?: string
): string | undefined => {
  // Required validation
  if (rule.required) {
    if (value === undefined || value === null || value === '') {
      return t('validation.required', 'This field is required');
    }
    if (typeof value === 'string' && !value.trim()) {
      return t('validation.required', 'This field is required');
    }
    if (Array.isArray(value) && value.length === 0) {
      return t('validation.required', 'This field is required');
    }
  }

  // If value is empty and not required, skip other validations
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return undefined;
  }

  // Type-specific validations
  switch (rule.type) {
    case 'string':
      return validateString(value, rule, t);
    case 'number':
      return validateNumber(value, rule, t);
    case 'email':
      return validateEmail(value, t);
    case 'phone':
      return validatePhone(value, t);
    case 'arabicText':
      return validateArabicText(value, rule, t);
    case 'englishText':
      return validateEnglishText(value, rule, t);
    case 'url':
      return validateUrl(value, t);
    case 'file':
      return validateFile(value, rule, t);
  }

  // General validations
  if (typeof value === 'string') {
    return validateString(value, rule, t);
  }

  if (typeof value === 'number') {
    return validateNumber(value, rule, t);
  }

  return undefined;
};

/**
 * دالة التحقق من صحة نص
 */
export const validateString = (
  value: string,
  rule: ValidationRule,
  t: TFunction
): string | undefined => {
  const trimmedValue = value.trim();

  // Length validations
  if (rule.minLength && trimmedValue.length < rule.minLength) {
    return t('validation.minLength', { min: rule.minLength });
  }

  if (rule.maxLength && trimmedValue.length > rule.maxLength) {
    return t('validation.maxLength', { max: rule.maxLength });
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(trimmedValue)) {
    return t('validation.invalidFormat', 'Invalid format');
  }

  // Custom validation
  if (rule.custom && !rule.custom(value)) {
    return t('validation.invalidValue', 'Invalid value');
  }

  return undefined;
};

/**
 * دالة التحقق من صحة رقم
 */
export const validateNumber = (
  value: number | string,
  rule: ValidationRule,
  t: TFunction
): string | undefined => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return t('validation.invalidNumber', 'Please enter a valid number');
  }

  if (rule.min !== undefined && numValue < rule.min) {
    return t('validation.minValue', { min: rule.min });
  }

  if (rule.max !== undefined && numValue > rule.max) {
    return t('validation.maxValue', { max: rule.max });
  }

  if (numValue === 0 && rule.custom) {
    return t('validation.zeroNotAllowed', 'Value cannot be zero');
  }

  return undefined;
};

/**
 * دالة التحقق من صحة البريد الإلكتروني
 */
export const validateEmail = (value: string, t: TFunction): string | undefined => {
  const trimmedValue = value.trim();

  if (/[^\u0000-\u007F]/.test(trimmedValue)) {
    return t('validation.emailEnglishOnly', 'Email must contain English characters only');
  }

  if (!PATTERNS.email.test(trimmedValue)) {
    return t('validation.emailInvalid', 'Please enter a valid email address');
  }

  return undefined;
};

/**
 * دالة التحقق من صحة رقم الهاتف
 */
export const validatePhone = (value: string, t: TFunction): string | undefined => {
  const cleanNumber = value.replace(/[\s\-\(\)]/g, '');

  if (!PATTERNS.phone.test(cleanNumber)) {
    return t('validation.phoneInvalid', 'Please enter a valid phone number starting with + and country code');
  }

  if (cleanNumber.length > 15) {
    return t('validation.phoneMaxLength', 'Phone number cannot exceed 15 digits');
  }

  return undefined;
};

/**
 * دالة التحقق من صحة النص العربي
 */
export const validateArabicText = (
  value: string,
  rule: ValidationRule,
  t: TFunction
): string | undefined => {
  const stringError = validateString(value, rule, t);
  if (stringError) return stringError;

  if (!PATTERNS.arabicText.test(value.trim())) {
    return t('validation.arabicWithNumbersOnly', 'Please enter Arabic text and numbers only');
  }

  return undefined;
};

/**
 * دالة التحقق من صحة النص الإنجليزي
 */
export const validateEnglishText = (
  value: string,
  rule: ValidationRule,
  t: TFunction
): string | undefined => {
  const stringError = validateString(value, rule, t);
  if (stringError) return stringError;

  if (!PATTERNS.englishText.test(value.trim())) {
    return t('validation.englishOnly', 'Please enter English text only');
  }

  return undefined;
};

/**
 * دالة التحقق من صحة الرابط
 */
export const validateUrl = (value: string, t: TFunction): string | undefined => {
  if (!PATTERNS.url.test(value.trim())) {
    return t('validation.invalidUrl', 'Please enter a valid URL');
  }

  return undefined;
};

/**
 * دالة التحقق من صحة الملف
 */
export const validateFile = (
  file: File,
  rule: ValidationRule,
  t: TFunction
): string | undefined => {
  // Check file type
  if (rule.pattern === PATTERNS.imageUrl || !rule.pattern) {
    if (!FILE_VALIDATION.allowedImageTypes.includes(file.type)) {
      return t('validation.invalidFileType', 'Please upload a valid image file (JPG, PNG, GIF, SVG, WebP)');
    }

    if (file.size > FILE_VALIDATION.maxImageSize) {
      return t('validation.fileTooLarge', 'File size must be less than 10MB');
    }
  }

  return undefined;
};

/**
 * دالة التحقق من صحة رقم الواتساب
 */
export const validateWhatsApp = (value: string, t: TFunction): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }

  const cleanValue = value.replace(/\s/g, '');
  console.log('cleanValue', cleanValue);
  
  if (cleanValue.startsWith('970') || cleanValue.startsWith('972')) {
    console.log('cleanValue2', cleanValue);
    const code = cleanValue.startsWith('970') ? '970' : '972';
    const numberWithoutCode = cleanValue.slice(code.length);
    console.log(numberWithoutCode);
    
    // 🚫 تحقق: عدم السماح ببدء الجزء المحلي بـ 0
    if (numberWithoutCode.startsWith('0')) {
      return t('store.whatsappNoLeadingZero'); // لا تبدأ بـ 0 بعد المقدمة
    }
    // ✅ تحقق: الطول الكلي يجب أن يكون 12 رقمًا بالضبط (مثلاً +970598765432)
    else if (cleanValue.length !== 12) {
      return t('store.whatsappLengthError'); // الطول غير صحيح
    }
    // ✅ تحقق من أن الباقي كله أرقام
    else if (!/^\d+$/.test(numberWithoutCode)) {
      return t('store.whatsappInvalidDigits'); // يجب أن يحتوي على أرقام فقط
    }
  } else {
    // تحقق عام للأرقام الدولية الأخرى
    if (cleanValue.length < 8 || cleanValue.length > 15) {
      return t('store.whatsappLengthError');
    } else if (!/^[\+]?[1-9][\d]{4,15}$/.test(cleanValue)) {
      return t('store.whatsappInvalidFormat');
    }
  }

  return undefined;
};

/**
 * دالة التحقق من صحة كامل الفورم
 */
export const validateForm = (
  data: { [key: string]: any },
  schema: ValidationSchema,
  t: TFunction
): ValidationResult => {
  const errors: { [key: string]: string } = {};

  for (const [fieldName, rule] of Object.entries(schema)) {
    const value = data[fieldName];
    const error = validateField(value, rule, t, fieldName);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * دالة للتحقق من عدم تكرار القيم
 */
export const validateUnique = (
  value: string | undefined,
  items: any[],
  fieldName: string,
  currentId?: string | number,
  t?: TFunction
): string | undefined => {
  if (!value || !value.trim()) {
    return undefined;
  }
  
  const existing = items.find(item => {
    const itemId = item._id || item.id;
    // إذا كان هذا هو نفس العنصر الذي نعدله، نتجاهله
    if (currentId && itemId === currentId) {
      return false;
    }
    return item[fieldName] === value.trim();
  });

  if (existing) {
    return t ? t('validation.alreadyExists', 'This value already exists') : 'This value already exists';
  }

  return undefined;
};

/**
 * دالة للتحقق من تطابق كلمات المرور
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
  t: TFunction
): string | undefined => {
  if (password !== confirmPassword) {
    return t('validation.passwordsNotMatch', 'Passwords do not match');
  }
  return undefined;
};

/**
 * دالة للتحقق من المقارنة بين القيم
 */
export const validateComparison = (
  value1: number,
  value2: number,
  operator: 'greater' | 'less' | 'equal' | 'greaterOrEqual' | 'lessOrEqual',
  t: TFunction
): string | undefined => {
  switch (operator) {
    case 'greater':
      if (value1 <= value2) {
        return t('validation.mustBeGreater', 'Value must be greater than the other value');
      }
      break;
    case 'less':
      if (value1 >= value2) {
        return t('validation.mustBeLess', 'Value must be less than the other value');
      }
      break;
    case 'greaterOrEqual':
      if (value1 < value2) {
        return t('validation.mustBeGreaterOrEqual', 'Value must be greater than or equal to the other value');
      }
      break;
  }
  return undefined;
};

// Pre-defined validation schemas for common use cases
export const COMMON_SCHEMAS = {
  // Schema for bilingual text (Arabic & English)
  bilingualText: (minLength = 2, maxLength = 100): ValidationSchema => ({
    nameAr: {
      required: true,
      type: 'arabicText',
      minLength,
      maxLength,
    },
    nameEn: {
      required: true,
      type: 'englishText',
      minLength,
      maxLength,
    },
  }),

  // Schema for bilingual description
  bilingualDescription: (minLength = 5, maxLength = 500): ValidationSchema => ({
    descriptionAr: {
      required: true,
      type: 'arabicText',
      minLength,
      maxLength,
    },
    descriptionEn: {
      required: true,
      type: 'englishText',
      minLength,
      maxLength,
    },
  }),

  // Schema for price validation
  price: (min = 0, max = 1000000, allowZero = false): ValidationSchema => ({
    price: {
      required: true,
      type: 'number',
      min,
      max,
      custom: allowZero ? undefined : (value: number) => value > 0,
    },
  }),

  // Schema for contact information
  contact: (): ValidationSchema => ({
    email: {
      required: true,
      type: 'email',
    },
    whatsappNumber: {
      required: true,
    },
  }),

  // Schema for user registration
  userRegistration: (): ValidationSchema => ({
    firstName: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50,
    },
    email: {
      required: true,
      type: 'email',
    },
    password: {
      required: true,
      type: 'string',
      minLength: 6,
    },
  }),
}; 