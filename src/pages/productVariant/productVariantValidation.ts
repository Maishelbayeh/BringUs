// src/pages/productVariant/productVariantValidation.ts

interface ProductVariantFormData {
  productId: number;
  name: string;
  price: number;
}

interface ValidationErrors {
  productId?: string;
  name?: string;
  price?: string;
}

export const validateProductVariantForm = (
  data: ProductVariantFormData, 
  t: any,
  _isEditMode: boolean = false
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate Product Selection - Required
  if (!data.productId || data.productId === 0) {
    errors.productId = t('validation.required', 'This field is required');
  }

  // Validate Name - Required
  if (!data.name.trim()) {
    errors.name = t('validation.required', 'This field is required');
  } else if (data.name.trim().length < 2) {
    errors.name = t('validation.minLength', { min: 2 });
  } else if (data.name.trim().length > 100) {
    errors.name = t('validation.maxLength', { max: 100 });
  }

  // Validate Price - Required with validation
  if (data.price === undefined || data.price === null) {
    errors.price = t('validation.required', 'This field is required');
  } else if (isNaN(data.price)) {
    errors.price = t('validation.invalidNumber', 'Please enter a valid number');
  } else if (data.price < 0) {
    errors.price = t('validation.minValue', { min: 0 });
  } else if (data.price > 1000000) {
    errors.price = t('validation.maxValue', { max: 1000000 });
  } else if (data.price === 0) {
    errors.price = t('validation.zeroNotAllowed', 'Price cannot be zero');
  }

  return errors;
};

// Individual field validators for real-time validation
export const validateProductId = (value: number, t: any): string | undefined => {
  if (!value || value === 0) {
    return t('validation.required', 'This field is required');
  }
  return undefined;
};

export const validateName = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  if (value.trim().length < 2) {
    return t('validation.minLength', { min: 2 });
  }
  if (value.trim().length > 100) {
    return t('validation.maxLength', { max: 100 });
  }
  return undefined;
};

export const validatePrice = (value: number, t: any): string | undefined => {
  if (value === undefined || value === null) {
    return t('validation.required', 'This field is required');
  }
  if (isNaN(value)) {
    return t('validation.invalidNumber', 'Please enter a valid number');
  }
  if (value < 0) {
    return t('validation.minValue', { min: 0 });
  }
  if (value > 1000000) {
    return t('validation.maxValue', { max: 1000000 });
  }
  if (value === 0) {
    return t('validation.zeroNotAllowed', 'Price cannot be zero');
  }
  return undefined;
};
