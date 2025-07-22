// src/validation/index.ts
// فهرس لجميع ملفات الفالديشين

// تصدير النظام العام
export * from '../utils/validation';
export * from '../hooks/useValidation';

// تصدير جميع schemas المخصصة
export * from './deliveryValidation';
export * from './paymentValidation';
export * from './categoryValidation';
export * from './unitsValidation';
export * from './specificationsValidation';
export * from './wholesalerValidation';
export * from './affiliateValidation';

// تجميع جميع الـ schemas في مكان واحد للسهولة
import { DeliverySchemas } from './deliveryValidation';
import { PaymentSchemas } from './paymentValidation';
import { CategorySchemas } from './categoryValidation';
import { UnitsSchemas } from './unitsValidation';
import { ProductSchemas } from './productValidation';
import { specificationValidationSchema } from './specificationsValidation';
import { wholesalerValidationSchema } from './wholesalerValidation';
import { affiliateValidationSchema } from './affiliateValidation';
import { COMMON_SCHEMAS } from '../utils/validation';

export const AllSchemas = {
  // Schemas العامة
  common: COMMON_SCHEMAS,
  
  // Schemas مخصصة
  delivery: DeliverySchemas,
  payment: PaymentSchemas,
  category: CategorySchemas,
  units: UnitsSchemas,
  products: ProductSchemas,
  specifications: specificationValidationSchema,
  wholesaler: wholesalerValidationSchema,
  affiliate: affiliateValidationSchema,
};

// تصدير الأنواع المهمة
export type {
  ValidationSchema,
  ValidationRule,
  ValidationResult,
} from '../utils/validation';

export type {
  UseValidationOptions,
  UseValidationReturn,
} from '../hooks/useValidation';

export type { DeliveryFormData } from './deliveryValidation';
export type { PaymentFormData } from './paymentValidation';
export type { CategoryFormData } from './categoryValidation';
export type { UnitsFormData } from './unitsValidation';
export type { SpecificationFormData } from './specificationsValidation';
export type { WholesalerFormData } from './wholesalerValidation';
export type { AffiliateFormData } from './affiliateValidation'; 