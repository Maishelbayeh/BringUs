// src/validation/paymentValidation.ts
// فالديشين طرق الدفع باستخدام النظام العام

import { ValidationSchema, COMMON_SCHEMAS } from '../utils/validation';

// Interface لبيانات فورم طرق الدفع
export interface PaymentFormData {
  title: string;
  titleAr: string;
  titleEn: string;
  description: string;
  descriptionAr: string;
  descriptionEn: string;
  methodType: string;
  processingFee: string | number;
  minimumAmount: string | number;
  maximumAmount: string | number;
  supportedCurrencies: string[];
  logoUrl?: string;
  file?: File | null;
}

// Schema للتحقق من صحة بيانات طرق الدفع
export const paymentValidationSchema: ValidationSchema = {
  title: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
  },
  titleAr: {
    required: true,
    type: 'arabicText',
    minLength: 2,
    maxLength: 50,
  },
  titleEn: {
    required: true,
    type: 'englishText',
    minLength: 2,
    maxLength: 50,
  },
  description: {
    required: true,
    type: 'string',
    minLength: 5,
    maxLength: 500,
  },
  descriptionAr: {
    required: true,
    type: 'arabicText',
    minLength: 5,
    maxLength: 200,
  },
  descriptionEn: {
    required: true,
    type: 'englishText',
    minLength: 5,
    maxLength: 200,
  },
  methodType: {
    required: true,
    type: 'string',
    custom: (value: string) => ['cash', 'card', 'digital_wallet', 'bank_transfer', 'other'].includes(value),
  },
  processingFee: {
    required: true,
    type: 'number',
    min: 0,
    max: 100,
  },
  minimumAmount: {
    required: true,
    type: 'number',
    min: 0,
    max: 100000,
  },
  maximumAmount: {
    required: true,
    type: 'number',
    min: 0,
    max: 1000000,
  },
  supportedCurrencies: {
    required: true,
    custom: (value: string[]) => Array.isArray(value) && value.length > 0 && value.length <= 10,
  },
  logoUrl: {
    required: false,
    type: 'url',
  },
  file: {
    required: false,
    type: 'file',
  },
};

// Schemas جاهزة للاستخدام المتكرر
export const PaymentSchemas = {
  // Schema للعناوين ثنائية اللغة
  titles: {
    ...COMMON_SCHEMAS.bilingualText(2, 50),
    title: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 100,
    },
  },
  
  // Schema للأوصاف ثنائية اللغة
  descriptions: {
    ...COMMON_SCHEMAS.bilingualDescription(5, 200),
    description: {
      required: true,
      type: 'string' as const,
      minLength: 5,
      maxLength: 500,
    },
  },
  
  // Schema للمبالغ المالية
  amounts: {
    processingFee: {
      required: true,
      type: 'number' as const,
      min: 0,
      max: 100,
    },
    minimumAmount: {
      required: true,
      type: 'number' as const,
      min: 0,
      max: 100000,
    },
    maximumAmount: {
      required: true,
      type: 'number' as const,
      min: 0,
      max: 1000000,
    },
  },
  
  // Schema كامل لطرق الدفع
  full: paymentValidationSchema,
}; 