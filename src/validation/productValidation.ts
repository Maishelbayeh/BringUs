// src/validation/productValidation.ts
// فالديشين المنتجات باستخدام النظام العام

import { ValidationSchema, COMMON_SCHEMAS, PATTERNS, validateUnique } from '../utils/validation';
import { TFunction } from 'i18next';

// Interface لبيانات فورم المنتج
export interface ProductFormData {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price?: string | number;
  costPrice?: string | number;
  compareAtPrice?: string | number;
  categoryId?: string;
  unitId?: string;
  availableQuantity?: string | number;
  lowStockThreshold?: string | number;
  barcodes?: string[];
  productLabels?: string[];
  maintainStock?: string;
  visibility?: string | boolean;
  tags?: string[];
  selectedSpecifications?: string;
  colors?: any[];
  images?: string[];
  mainImage?: string | null;
}

// Schema للتحقق من صحة بيانات المنتج
export const productValidationSchema: ValidationSchema = {
  nameAr: {
    required: true,
    type: 'arabicText',
    minLength: 2,
    maxLength: 200,
  },
  nameEn: {
    required: true,
    type: 'englishText',
    minLength: 2,
    maxLength: 200,
  },
  descriptionAr: {
    required: false,
    type: 'arabicText',
    maxLength: 1000,
  },
  descriptionEn: {
    required: false,
    type: 'englishText',
    maxLength: 1000,
  },
  price: {
    required: true,
    type: 'number',
    min: 0.01,
    max: 1000000,
  },
  costPrice: {
    required: false,
    type: 'number',
    min: 0,
    max: 1000000,
  },
  compareAtPrice: {
    required: false,
    type: 'number',
    min: 0,
    max: 1000000,
  },
  categoryId: {
    required: true,
    type: 'string',
  },
  unitId: {
    required: true,
    type: 'string',
  },
  availableQuantity: {
    required: false,
    type: 'number',
    min: 0,
    max: 999999,
  },
  lowStockThreshold: {
    required: false,
    type: 'number',
    min: 1,
    max: 1000,
  },
};

// Schemas جاهزة للاستخدام المتكرر
export const ProductSchemas = {
  // Schema للأسماء ثنائية اللغة
  names: COMMON_SCHEMAS.bilingualText(2, 200),
  
  // Schema للأوصاف ثنائية اللغة (اختيارية)
  descriptions: {
    descriptionAr: {
      required: false,
      type: 'arabicText' as const,
      maxLength: 1000,
    },
    descriptionEn: {
      required: false,
      type: 'englishText' as const,
      maxLength: 1000,
    },
  },
  
  // Schema للأسعار
  pricing: {
    price: {
      required: true,
      type: 'number' as const,
      min: 0.01,
      max: 1000000,
    },
    costPrice: {
      required: false,
      type: 'number' as const,
      min: 0,
      max: 1000000,
    },
    compareAtPrice: {
      required: false,
      type: 'number' as const,
      min: 0,
      max: 1000000,
    },
  },
  
  // Schema للكمية والمخزون
  inventory: {
    availableQuantity: {
      required: false,
      type: 'number' as const,
      min: 0,
      max: 999999,
    },
    lowStockThreshold: {
      required: false,
      type: 'number' as const,
      min: 1,
      max: 1000,
    },
  },
  
  // Schema للمتطلبات الأساسية
  required: {
    categoryId: {
      required: true,
      type: 'string' as const,
    },
    unitId: {
      required: true,
      type: 'string' as const,
    },
  },
  
  // Schema كامل للمنتج
  full: productValidationSchema,
};

/**
 * دالة مساعدة للتحقق من تكرار اسم المنتج
 */
export const checkDuplicateProduct = (
  field: 'nameAr' | 'nameEn',
  value: string, 
  products: any[], 
  currentId?: string | number | null
): boolean => {
  if (!value || value.trim() === '') return false;
  
  return products.some(product => {
    // تجاهل المنتج الحالي عند التعديل
    if (currentId && (product.id === currentId || product._id === currentId)) {
      return false;
    }
    
    // التحقق من تطابق القيمة
    return product[field] && product[field].trim().toLowerCase() === value.trim().toLowerCase();
  });
};

/**
 * دالة مساعدة للتحقق من تكرار الباركود
 */
export const checkDuplicateBarcode = (
  barcode: string,
  products: any[],
  currentId?: string | number | null
): boolean => {
  if (!barcode || barcode.trim() === '') return false;
  
  return products.some(product => {
    // تجاهل المنتج الحالي عند التعديل
    if (currentId && (product.id === currentId || product._id === currentId)) {
      return false;
    }
    
    // التحقق من وجود الباركود في مصفوفة الباركود للمنتج
    const productBarcodes = Array.isArray(product.barcodes) ? product.barcodes : [];
    return productBarcodes.includes(barcode.trim());
  });
};

/**
 * دالة للتحقق من صحة الباركود
 */
export const validateBarcode = (barcode: string, t: TFunction): string | undefined => {
  if (!barcode || barcode.trim() === '') {
    return undefined; // الباركود اختياري
  }
  
  const trimmedBarcode = barcode.trim();
  
  // التحقق من أن الباركود يحتوي على أرقام فقط أو أرقام وحروف
  if (!/^[a-zA-Z0-9]+$/.test(trimmedBarcode)) {
    return t('validation.barcodeInvalid', { defaultValue: 'Barcode can only contain letters and numbers' });
  }
  
  // التحقق من طول الباركود
  if (trimmedBarcode.length < 3) {
    return t('validation.barcodeMinLength', { defaultValue: 'Barcode must be at least 3 characters long' });
  }
  
  if (trimmedBarcode.length > 50) {
    return t('validation.barcodeMaxLength', { defaultValue: 'Barcode cannot exceed 50 characters' });
  }
  
  return undefined;
};



/**
 * دالة فالديشين شاملة للمنتج مع دعم التحقق من التكرار
 */
export const validateProductWithDuplicates = (
  form: ProductFormData & { id?: string | number },
  products: any[],
  t: TFunction
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};
  
  console.log('validateProductWithDuplicates called with form:', form);

  // فالديشين الحقول الأساسية
  if (!form.nameAr || form.nameAr.trim() === '') {
    errors.nameAr = t('validation.required', { defaultValue: 'This field is required' });
  } else if (!PATTERNS.arabicText.test(form.nameAr)) {
    errors.nameAr = t('validation.arabicOnly', { defaultValue: 'Arabic text only' });
  } else if (form.nameAr.trim().length < 2) {
    errors.nameAr = t('validation.minLength', { defaultValue: 'Minimum length is {{min}} characters', min: 2 });
  } else if (form.nameAr.trim().length > 200) {
    errors.nameAr = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 200 });
  }

  if (!form.nameEn || form.nameEn.trim() === '') {
    errors.nameEn = t('validation.required', { defaultValue: 'This field is required' });
  } else if (!PATTERNS.englishText.test(form.nameEn)) {
    errors.nameEn = t('validation.englishOnly', { defaultValue: 'English text only' });
  } else if (form.nameEn.trim().length < 2) {
    errors.nameEn = t('validation.minLength', { defaultValue: 'Minimum length is {{min}} characters', min: 2 });
  } else if (form.nameEn.trim().length > 200) {
    errors.nameEn = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 200 });
  }

  // فالديشين السعر
  if (!form.price || form.price === '') {
    errors.price = t('validation.required', { defaultValue: 'This field is required' });
  } else {
    const price = typeof form.price === 'string' ? parseFloat(form.price) : form.price;
    if (isNaN(price) || price <= 0) {
      errors.price = t('validation.pricePositive', { defaultValue: 'Price must be greater than 0' });
    } else if (price > 1000000) {
      errors.price = t('validation.maxValue', { defaultValue: 'Maximum value is {{max}}', max: 1000000 });
    }
  }

  // فالديشين الفئة
  if (!form.categoryId || form.categoryId === '') {
    errors.categoryId = t('validation.required', { defaultValue: 'Please select a category' });
  }

  // فالديشين الوحدة
  if (!form.unitId || form.unitId === '') {
    errors.unitId = t('validation.required', { defaultValue: 'Please select a unit' });
  }

  // فالديشين الأوصاف (اختياري)
  if (form.descriptionAr && form.descriptionAr.trim() !== '') {
    if (!PATTERNS.arabicText.test(form.descriptionAr)) {
      errors.descriptionAr = t('validation.arabicOnly', { defaultValue: 'Arabic text only' });
    } else if (form.descriptionAr.trim().length > 1000) {
      errors.descriptionAr = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 1000 });
    }
  }

  if (form.descriptionEn && form.descriptionEn.trim() !== '') {
    if (!PATTERNS.englishText.test(form.descriptionEn)) {
      errors.descriptionEn = t('validation.englishOnly', { defaultValue: 'English text only' });
    } else if (form.descriptionEn.trim().length > 1000) {
      errors.descriptionEn = t('validation.maxLength', { defaultValue: 'Maximum length is {{max}} characters', max: 1000 });
    }
  }

  // فالديشين سعر التكلفة
  if (form.costPrice !== undefined && form.costPrice !== null && form.costPrice !== '') {
    const costPrice = typeof form.costPrice === 'string' ? parseFloat(form.costPrice) : form.costPrice;
    if (isNaN(costPrice) || costPrice < 0) {
      errors.costPrice = t('validation.costPricePositive', { defaultValue: 'Cost price must be 0 or greater' });
    } else if (costPrice > 1000000) {
      errors.costPrice = t('validation.maxValue', { defaultValue: 'Maximum value is {{max}}', max: 1000000 });
    }
  }

  // فالديشين سعر المقارنة
  if (form.compareAtPrice !== undefined && form.compareAtPrice !== null && form.compareAtPrice !== '') {
    const compareAtPrice = typeof form.compareAtPrice === 'string' ? parseFloat(form.compareAtPrice) : form.compareAtPrice;
    if (isNaN(compareAtPrice) || compareAtPrice < 0) {
      errors.compareAtPrice = t('validation.compareAtPricePositive', { defaultValue: 'Compare at price must be 0 or greater' });
    } else if (compareAtPrice > 1000000) {
      errors.compareAtPrice = t('validation.maxValue', { defaultValue: 'Maximum value is {{max}}', max: 1000000 });
    }
  }

  // فالديشين الكمية المتاحة
  if (form.availableQuantity !== undefined && form.availableQuantity !== null && form.availableQuantity !== '') {
    const quantity = typeof form.availableQuantity === 'string' ? parseInt(form.availableQuantity) : form.availableQuantity;
    if (isNaN(quantity) || quantity < 0) {
      errors.availableQuantity = t('validation.quantityPositive', { defaultValue: 'Available quantity must be 0 or greater' });
    } else if (quantity > 999999) {
      errors.availableQuantity = t('validation.maxValue', { defaultValue: 'Maximum value is {{max}}', max: 999999 });
    }
  }

  // فالديشين حد التنبيه للمخزون
  if (form.lowStockThreshold !== undefined && form.lowStockThreshold !== null && form.lowStockThreshold !== '') {
    const threshold = typeof form.lowStockThreshold === 'string' ? parseInt(form.lowStockThreshold) : form.lowStockThreshold;
    if (isNaN(threshold) || threshold < 1) {
      errors.lowStockThreshold = t('validation.thresholdPositive', { defaultValue: 'Low stock threshold must be at least 1' });
    } else if (threshold > 1000) {
      errors.lowStockThreshold = t('validation.maxValue', { defaultValue: 'Maximum value is {{max}}', max: 1000 });
    }
  }

  // فالديشين مقارنة الأسعار
  if (form.price && form.costPrice) {
    const price = typeof form.price === 'string' ? parseFloat(form.price) : form.price;
    const costPrice = typeof form.costPrice === 'string' ? parseFloat(form.costPrice) : form.costPrice;
    const compareAtPrice = form.compareAtPrice ? 
      (typeof form.compareAtPrice === 'string' ? parseFloat(form.compareAtPrice) : form.compareAtPrice) : undefined;
    
  }

  // فالديشين الباركود (إذا كان موجود)
  if (form.barcodes && Array.isArray(form.barcodes)) {
    form.barcodes.forEach((barcode, index) => {
      const barcodeError = validateBarcode(barcode, t);
      if (barcodeError) {
        errors[`barcode_${index}`] = barcodeError;
      }
      
      // التحقق من التكرار
      if (checkDuplicateBarcode(barcode, products, form.id)) {
        errors[`barcode_${index}`] = t('validation.duplicateBarcode', { defaultValue: 'This barcode already exists' });
      }
    });
  }

  // فالديشين عدم التكرار للأسماء
  if (form.nameAr && checkDuplicateProduct('nameAr', form.nameAr, products, form.id)) {
    errors.nameAr = t('validation.duplicateNameAr', { defaultValue: 'Arabic name already exists' });
  }

  if (form.nameEn && checkDuplicateProduct('nameEn', form.nameEn, products, form.id)) {
    errors.nameEn = t('validation.duplicateNameEn', { defaultValue: 'English name already exists' });
  }

  const result = {
    isValid: Object.keys(errors).length === 0,
    errors
  };
  
  console.log('validateProductWithDuplicates result:', result);
  
  return result;
}; 