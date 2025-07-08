// src/components/PaymentMethods/paymentValidation.ts

interface PaymentFormData {
  title: string;
  titleAr: string;
  titleEn: string;
  description: string;
  descriptionAr: string;
  descriptionEn: string;
  methodType: string;
  processingFee: string;
  minimumAmount: string;
  maximumAmount: string;
  supportedCurrencies: string[];
  logoUrl?: string;
  file?: File | null;
}

interface ValidationErrors {
  title?: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  methodType?: string;
  processingFee?: string;
  minimumAmount?: string;
  maximumAmount?: string;
  supportedCurrencies?: string;
  logoUrl?: string;
  file?: string;
}

export const validatePaymentForm = (
  data: PaymentFormData, 
  t: any,
  isEditMode: boolean = false
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate Title (General) - Required
  if (!data.title.trim()) {
    errors.title = t('validation.required', 'This field is required');
  } else if (data.title.trim().length < 2) {
    errors.title = t('validation.minLength', { min: 2 });
  } else if (data.title.trim().length > 100) {
    errors.title = t('validation.maxLength', { max: 100 });
  }

  // Validate Arabic Title - Required
  if (!data.titleAr.trim()) {
    errors.titleAr = t('validation.required', 'This field is required');
  } else if (data.titleAr.trim().length < 2) {
    errors.titleAr = t('validation.minLength', { min: 2 });
  } else if (data.titleAr.trim().length > 50) {
    errors.titleAr = t('validation.maxLength', { max: 50 });
  } else if (!/^[\u0600-\u06FF\s]+$/.test(data.titleAr.trim())) {
    errors.titleAr = t('validation.arabicOnly', 'Please enter Arabic text only');
  }

  // Validate English Title - Required
  if (!data.titleEn.trim()) {
    errors.titleEn = t('validation.required', 'This field is required');
  } else if (data.titleEn.trim().length < 2) {
    errors.titleEn = t('validation.minLength', { min: 2 });
  } else if (data.titleEn.trim().length > 50) {
    errors.titleEn = t('validation.maxLength', { max: 50 });
  } else if (!/^[a-zA-Z\s]+$/.test(data.titleEn.trim())) {
    errors.titleEn = t('validation.englishOnly', 'Please enter English text only');
  }

  // Validate Description (General) - Required
  if (!data.description.trim()) {
    errors.description = t('validation.required', 'This field is required');
  } else if (data.description.trim().length < 5) {
    errors.description = t('validation.minLength', { min: 5 });
  } else if (data.description.trim().length > 500) {
    errors.description = t('validation.maxLength', { max: 500 });
  }

  // Validate Arabic Description - Required
  if (!data.descriptionAr.trim()) {
    errors.descriptionAr = t('validation.required', 'This field is required');
  } else if (data.descriptionAr.trim().length < 5) {
    errors.descriptionAr = t('validation.minLength', { min: 5 });
  } else if (data.descriptionAr.trim().length > 200) {
    errors.descriptionAr = t('validation.maxLength', { max: 200 });
  } else if (!/^[\u0600-\u06FF\s]+$/.test(data.descriptionAr.trim())) {
    errors.descriptionAr = t('validation.arabicOnly', 'Please enter Arabic text only');
  }

  // Validate English Description - Required
  if (!data.descriptionEn.trim()) {
    errors.descriptionEn = t('validation.required', 'This field is required');
  } else if (data.descriptionEn.trim().length < 5) {
    errors.descriptionEn = t('validation.minLength', { min: 5 });
  } else if (data.descriptionEn.trim().length > 200) {
    errors.descriptionEn = t('validation.maxLength', { max: 200 });
  } else if (!/^[a-zA-Z\s]+$/.test(data.descriptionEn.trim())) {
    errors.descriptionEn = t('validation.englishOnly', 'Please enter English text only');
  }

  // Validate Method Type - Required
  if (!data.methodType || data.methodType === '') {
    errors.methodType = t('validation.required', 'This field is required');
  } else if (!['cash', 'card', 'digital_wallet', 'bank_transfer', 'other'].includes(data.methodType)) {
    errors.methodType = t('validation.invalidMethodType', 'Please select a valid payment method type');
  }

  // Validate Processing Fee - Required with validation
  if (!data.processingFee.trim()) {
    errors.processingFee = t('validation.required', 'This field is required');
  } else {
    const feeValue = parseFloat(data.processingFee);
    if (isNaN(feeValue)) {
      errors.processingFee = t('validation.invalidNumber', 'Please enter a valid number');
    } else if (feeValue < 0) {
      errors.processingFee = t('validation.minValue', { min: 0 });
    } else if (feeValue > 100) {
      errors.processingFee = t('validation.maxValue', { max: 100 });
    }
  }

  // Validate Minimum Amount - Required with validation
  if (!data.minimumAmount.trim()) {
    errors.minimumAmount = t('validation.required', 'This field is required');
  } else {
    const minValue = parseFloat(data.minimumAmount);
    if (isNaN(minValue)) {
      errors.minimumAmount = t('validation.invalidNumber', 'Please enter a valid number');
    } else if (minValue < 0) {
      errors.minimumAmount = t('validation.minValue', { min: 0 });
    } else if (minValue > 100000) {
      errors.minimumAmount = t('validation.maxValue', { max: 100000 });
    }
  }

  // Validate Maximum Amount - Required with validation
  if (!data.maximumAmount.trim()) {
    errors.maximumAmount = t('validation.required', 'This field is required');
  } else {
    const maxValue = parseFloat(data.maximumAmount);
    if (isNaN(maxValue)) {
      errors.maximumAmount = t('validation.invalidNumber', 'Please enter a valid number');
    } else if (maxValue < 0) {
      errors.maximumAmount = t('validation.minValue', { min: 0 });
    } else if (maxValue > 1000000) {
      errors.maximumAmount = t('validation.maxValue', { max: 1000000 });
    }
  }

  // Validate Minimum vs Maximum Amount
  if (data.minimumAmount.trim() && data.maximumAmount.trim()) {
    const minValue = parseFloat(data.minimumAmount);
    const maxValue = parseFloat(data.maximumAmount);
    if (!isNaN(minValue) && !isNaN(maxValue) && minValue >= maxValue) {
      errors.maximumAmount = t('validation.maxGreaterThanMin', 'Maximum amount must be greater than minimum amount');
    }
  }

  // Validate Supported Currencies - Required
  if (data.supportedCurrencies.length === 0) {
    errors.supportedCurrencies = t('validation.required', 'This field is required');
  } else if (data.supportedCurrencies.length > 10) {
    errors.supportedCurrencies = t('validation.maxCurrencies', 'Maximum 10 currencies allowed');
  }

  // Validate Logo URL (if provided)
  if (data.logoUrl && data.logoUrl.trim()) {
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
    if (!urlRegex.test(data.logoUrl.trim())) {
      errors.logoUrl = t('validation.invalidImageUrl', 'Please enter a valid image URL');
    }
  }

  // Validate File (if uploaded)
  if (data.file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(data.file.type)) {
      errors.file = t('validation.invalidFileType', 'Please upload a valid image file (JPG, PNG, GIF, SVG, WebP)');
    } else if (data.file.size > maxSize) {
      errors.file = t('validation.fileTooLarge', 'File size must be less than 5MB');
    }
  }

  return errors;
};

// Individual field validators for real-time validation
export const validateTitle = (value: string, t: any): string | undefined => {
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

export const validateTitleAr = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  if (value.trim().length < 2) {
    return t('validation.minLength', { min: 2 });
  }
  if (value.trim().length > 50) {
    return t('validation.maxLength', { max: 50 });
  }
  if (!/^[\u0600-\u06FF\s]+$/.test(value.trim())) {
    return t('validation.arabicOnly', 'Please enter Arabic text only');
  }
  return undefined;
};

export const validateTitleEn = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  if (value.trim().length < 2) {
    return t('validation.minLength', { min: 2 });
  }
  if (value.trim().length > 50) {
    return t('validation.maxLength', { max: 50 });
  }
  if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
    return t('validation.englishOnly', 'Please enter English text only');
  }
  return undefined;
};

export const validateDescription = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  if (value.trim().length < 5) {
    return t('validation.minLength', { min: 5 });
  }
  if (value.trim().length > 500) {
    return t('validation.maxLength', { max: 500 });
  }
  return undefined;
};

export const validateDescriptionAr = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  if (value.trim().length < 5) {
    return t('validation.minLength', { min: 5 });
  }
  if (value.trim().length > 200) {
    return t('validation.maxLength', { max: 200 });
  }
  if (!/^[\u0600-\u06FF\s]+$/.test(value.trim())) {
    return t('validation.arabicOnly', 'Please enter Arabic text only');
  }
  return undefined;
};

export const validateDescriptionEn = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  if (value.trim().length < 5) {
    return t('validation.minLength', { min: 5 });
  }
  if (value.trim().length > 200) {
    return t('validation.maxLength', { max: 200 });
  }
  if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
    return t('validation.englishOnly', 'Please enter English text only');
  }
  return undefined;
};

export const validateMethodType = (value: string, t: any): string | undefined => {
  if (!value) {
    return t('validation.required', 'This field is required');
  }
  if (!['cash', 'card', 'digital_wallet', 'bank_transfer', 'other'].includes(value)) {
    return t('validation.invalidMethodType', 'Please select a valid payment method type');
  }
  return undefined;
};

export const validateProcessingFee = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  const feeValue = parseFloat(value);
  if (isNaN(feeValue)) {
    return t('validation.invalidNumber', 'Please enter a valid number');
  }
  if (feeValue < 0) {
    return t('validation.minValue', { min: 0 });
  }
  if (feeValue > 100) {
    return t('validation.maxValue', { max: 100 });
  }
  return undefined;
};

export const validateMinimumAmount = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  const minValue = parseFloat(value);
  if (isNaN(minValue)) {
    return t('validation.invalidNumber', 'Please enter a valid number');
  }
  if (minValue < 0) {
    return t('validation.minValue', { min: 0 });
  }
  if (minValue > 100000) {
    return t('validation.maxValue', { max: 100000 });
  }
  return undefined;
};

export const validateMaximumAmount = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  const maxValue = parseFloat(value);
  if (isNaN(maxValue)) {
    return t('validation.invalidNumber', 'Please enter a valid number');
  }
  if (maxValue < 0) {
    return t('validation.minValue', { min: 0 });
  }
  if (maxValue > 1000000) {
    return t('validation.maxValue', { max: 1000000 });
  }
  return undefined;
};

export const validateSupportedCurrencies = (currencies: string[], t: any): string | undefined => {
  if (currencies.length === 0) {
    return t('validation.required', 'This field is required');
  }
  if (currencies.length > 10) {
    return t('validation.maxCurrencies', 'Maximum 10 currencies allowed');
  }
  return undefined;
};

export const validateLogoUrl = (url: string, t: any): string | undefined => {
  if (url && url.trim()) {
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
    if (!urlRegex.test(url.trim())) {
      return t('validation.invalidImageUrl', 'Please enter a valid image URL');
    }
  }
  return undefined;
};

export const validateFile = (file: File | null, t: any): string | undefined => {
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return t('validation.invalidFileType', 'Please upload a valid image file (JPG, PNG, GIF, SVG, WebP)');
    }
    if (file.size > maxSize) {
      return t('validation.fileTooLarge', 'File size must be less than 5MB');
    }
  }
  return undefined;
}; 