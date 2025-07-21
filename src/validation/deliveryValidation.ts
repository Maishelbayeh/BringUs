// src/validation/deliveryValidation.ts
// فالديشين التوصيل باستخدام النظام العام

import { ValidationSchema, COMMON_SCHEMAS } from '../utils/validation';

// Interface لبيانات فورم التوصيل
export interface DeliveryFormData {
  locationAr: string;
  locationEn: string;
  price: string | number;
  whatsappNumber: string;
}

// Schema للتحقق من صحة بيانات التوصيل
export const deliveryValidationSchema: ValidationSchema = {
  locationAr: {
    required: true,
    type: 'arabicText',
    minLength: 2,
    maxLength: 50,
  },
  locationEn: {
    required: true,
    type: 'englishText',
    minLength: 2,
    maxLength: 50,
  },
  price: {
    required: true,
    type: 'number',
    min: 0,
    max: 10000,
    custom: (value: number) => value > 0, // لا يسمح بالصفر
  },
  whatsappNumber: {
    required: true,
    type: 'string', // سيتم استخدام validateWhatsApp منفصلاً
  },
};

// Schemas جاهزة للاستخدام المتكرر
export const DeliverySchemas = {
  // Schema للموقع ثنائي اللغة
  location: COMMON_SCHEMAS.bilingualText(2, 50),
  
  // Schema للسعر
  price: COMMON_SCHEMAS.price(0, 10000, false), // لا يسمح بالصفر
  
  // Schema للاتصال
  contact: COMMON_SCHEMAS.contact(),
  
  // Schema كامل للتوصيل
  full: deliveryValidationSchema,
}; 