// src/components/PaymentMethods/paymentValidation.ts

interface PaymentFormData {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  methodType: string;
  logoUrl?: string;
  logoFile?: File | null;
  qrCode?: {
    enabled: boolean;
    qrCodeUrl?: string;
    qrCodeImage?: string;
    qrCodeData?: string;
  };
  paymentImages?: Array<{
    imageUrl: string;
    imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other';
    altText?: string;
  }>;
}

interface ValidationErrors {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  methodType?: string;
  logoUrl?: string;
  logoFile?: string;
  qrCode?: string;
  paymentImages?: string;
}

export const validatePaymentForm = (
  data: PaymentFormData, 
  t: any,
  isEditMode: boolean = false
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate Arabic Title - Required
  if (!data.titleAr.trim()) {
    errors.titleAr = t('validation.required', 'This field is required');
  } else if (data.titleAr.trim().length < 2) {
    errors.titleAr = t('validation.minLength', { min: 2 });
  } else if (data.titleAr.trim().length > 100) {
    errors.titleAr = t('validation.maxLength', { max: 100 });
  } else if (!/^[\u0600-\u06FF\s]+$/.test(data.titleAr.trim())) {
    errors.titleAr = t('validation.arabicOnly', 'Please enter Arabic text only');
  }

  // Validate English Title - Required
  if (!data.titleEn.trim()) {
    errors.titleEn = t('validation.required', 'This field is required');
  } else if (data.titleEn.trim().length < 2) {
    errors.titleEn = t('validation.minLength', { min: 2 });
  } else if (data.titleEn.trim().length > 100) {
    errors.titleEn = t('validation.maxLength', { max: 100 });
  } else if (!/^[a-zA-Z\s]+$/.test(data.titleEn.trim())) {
    errors.titleEn = t('validation.englishOnly', 'Please enter English text only');
  }

  // Validate Arabic Description - Optional
  if (data.descriptionAr && data.descriptionAr.trim()) {
    if (data.descriptionAr.trim().length < 5) {
      errors.descriptionAr = t('validation.minLength', { min: 5 });
    } else if (data.descriptionAr.trim().length > 500) {
      errors.descriptionAr = t('validation.maxLength', { max: 500 });
    } else if (!/^[\u0600-\u06FF\s]+$/.test(data.descriptionAr.trim())) {
      errors.descriptionAr = t('validation.arabicOnly', 'Please enter Arabic text only');
    }
  }

  // Validate English Description - Optional
  if (data.descriptionEn && data.descriptionEn.trim()) {
    if (data.descriptionEn.trim().length < 5) {
      errors.descriptionEn = t('validation.minLength', { min: 5 });
    } else if (data.descriptionEn.trim().length > 500) {
      errors.descriptionEn = t('validation.maxLength', { max: 500 });
    } else if (!/^[a-zA-Z\s]+$/.test(data.descriptionEn.trim())) {
      errors.descriptionEn = t('validation.englishOnly', 'Please enter English text only');
    }
  }

  // Validate Method Type - Required
  if (!data.methodType || data.methodType === '') {
    errors.methodType = t('validation.required', 'This field is required');
  } else if (!['cash', 'card', 'digital_wallet', 'bank_transfer', 'qr_code', 'other', 'lahza'].includes(data.methodType)) {
    errors.methodType = t('validation.invalidMethodType', 'Please select a valid payment method type');
  }

  // Validate Logo URL (if provided)
  if (data.logoUrl && data.logoUrl.trim()) {
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
    if (!urlRegex.test(data.logoUrl.trim())) {
      errors.logoUrl = t('validation.invalidImageUrl', 'Please enter a valid image URL');
    }
  }

  // Validate Logo File (if uploaded)
  if (data.logoFile) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(data.logoFile.type)) {
      errors.logoFile = t('validation.invalidFileType', 'Please upload a valid image file (JPG, PNG, GIF, SVG, WebP)');
    } else if (data.logoFile.size > maxSize) {
      errors.logoFile = t('validation.fileTooLarge', 'File size must be less than 5MB');
    }
  }

  // Validate QR Code settings
  if (data.qrCode && data.qrCode.enabled) {
    if (!data.qrCode.qrCodeUrl && !data.qrCode.qrCodeData) {
      errors.qrCode = t('validation.qrCodeRequired', 'QR Code URL or data is required when QR code is enabled');
    }
    
    // if (data.qrCode.qrCodeUrl && data.qrCode.qrCodeUrl.trim()) {
    //   const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
    //   if (!urlRegex.test(data.qrCode.qrCodeUrl.trim())) {
    //     errors.qrCode = t('validation.invalidQrCodeUrl', 'Please enter a valid QR code image URL');
    //   }
    // }
  }

  // Validate Payment Images
  if (data.paymentImages && data.paymentImages.length > 0) {
    const validImageTypes = ['logo', 'banner', 'qr_code', 'payment_screenshot', 'other'];
    
    for (let i = 0; i < data.paymentImages.length; i++) {
      const image = data.paymentImages[i];
      
      if (!image.imageUrl || !image.imageUrl.trim()) {
        errors.paymentImages = t('validation.imageUrlRequired', 'Image URL is required for all payment images');
        break;
      }
      
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
      if (!urlRegex.test(image.imageUrl.trim())) {
        errors.paymentImages = t('validation.invalidImageUrl', 'Please enter a valid image URL');
        break;
      }
      
      if (!validImageTypes.includes(image.imageType)) {
        errors.paymentImages = t('validation.invalidImageType', 'Please select a valid image type');
        break;
      }
      
      if (image.altText && image.altText.length > 200) {
        errors.paymentImages = t('validation.altTextTooLong', 'Alt text cannot exceed 200 characters');
        break;
      }
    }
  }

  return errors;
};

// Individual field validators for real-time validation
export const validateTitleAr = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  if (value.trim().length < 2) {
    return t('validation.minLength', { min: 2 });
  }
  if (value.trim().length > 100) {
    return t('validation.maxLength', { max: 100 });
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
  if (value.trim().length > 100) {
    return t('validation.maxLength', { max: 100 });
  }
  if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
    return t('validation.englishOnly', 'Please enter English text only');
  }
  return undefined;
};

export const validateDescriptionAr = (value: string, t: any): string | undefined => {
  if (value && value.trim()) {
    if (value.trim().length < 5) {
      return t('validation.minLength', { min: 5 });
    }
    if (value.trim().length > 500) {
      return t('validation.maxLength', { max: 500 });
    }
    if (!/^[\u0600-\u06FF\s]+$/.test(value.trim())) {
      return t('validation.arabicOnly', 'Please enter Arabic text only');
    }
  }
  return undefined;
};

export const validateDescriptionEn = (value: string, t: any): string | undefined => {
  if (value && value.trim()) {
    if (value.trim().length < 5) {
      return t('validation.minLength', { min: 5 });
    }
    if (value.trim().length > 500) {
      return t('validation.maxLength', { max: 500 });
    }
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
      return t('validation.englishOnly', 'Please enter English text only');
    }
  }
  return undefined;
};

export const validateMethodType = (value: string, t: any): string | undefined => {
  if (!value) {
    return t('validation.required', 'This field is required');
  }
  if (!['cash', 'card', 'digital_wallet', 'bank_transfer', 'qr_code', 'other', 'lahza'].includes(value)) {
    return t('validation.invalidMethodType', 'Please select a valid payment method type');
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

export const validateLogoFile = (file: File | null, t: any): string | undefined => {
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

export const validateQrCode = (qrCode: {
  enabled: boolean;
  qrCodeUrl?: string;
  qrCodeImage?: string;
  qrCodeData?: string;
}, t: any): string | undefined => {
  if (qrCode.enabled) {
    if (!qrCode.qrCodeUrl && !qrCode.qrCodeData) {
      return t('validation.qrCodeRequired', 'QR Code URL or data is required when QR code is enabled');
    }
    
    if (qrCode.qrCodeUrl && qrCode.qrCodeUrl.trim()) {
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
      if (!urlRegex.test(qrCode.qrCodeUrl.trim())) {
        return t('validation.invalidQrCodeUrl', 'Please enter a valid QR code image URL');
      }
    }
  }
  return undefined;
};

export const validatePaymentImages = (images: Array<{
  imageUrl: string;
  imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other';
  altText?: string;
}>, t: any): string | undefined => {
  if (images && images.length > 0) {
    const validImageTypes = ['logo', 'banner', 'qr_code', 'payment_screenshot', 'other'];
    
    for (const image of images) {
      if (!image.imageUrl || !image.imageUrl.trim()) {
        return t('validation.imageUrlRequired', 'Image URL is required for all payment images');
      }
      
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|svg|webp)$/i;
      if (!urlRegex.test(image.imageUrl.trim())) {
        return t('validation.invalidImageUrl', 'Please enter a valid image URL');
      }
      
      if (!validImageTypes.includes(image.imageType)) {
        return t('validation.invalidImageType', 'Please select a valid image type');
      }
      
      if (image.altText && image.altText.length > 200) {
        return t('validation.altTextTooLong', 'Alt text cannot exceed 200 characters');
      }
    }
  }
  return undefined;
}; 