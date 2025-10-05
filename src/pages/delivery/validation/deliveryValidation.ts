// src/components/DeliveryAreas/deliveryValidation.ts

interface DeliveryFormData {
  locationAr: string;
  locationEn: string;
  price: string;
  whatsappNumber: string;
}

interface ValidationErrors {
  locationAr?: string;
  locationEn?: string;
  price?: string;
  whatsappNumber?: string;
}

export const validateDeliveryForm = (
  data: DeliveryFormData, 
  t: any
): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validate Arabic Location
  if (!data.locationAr.trim()) {
    errors.locationAr = t('validation.required', 'This field is required');
  } else if (data.locationAr.trim().length < 2) {
    errors.locationAr = t('validation.minLength', { min: 2 });
  } else if (data.locationAr.trim().length > 50) {
    errors.locationAr = t('validation.maxLength', { max: 50 });
  } else if (!/^[\u0600-\u06FF\s]+$/.test(data.locationAr.trim())) {
    errors.locationAr = t('validation.arabicOnly', 'Please enter Arabic text only');
  }

  // Validate English Location
  if (!data.locationEn.trim()) {
    errors.locationEn = t('validation.required', 'This field is required');
  } else if (data.locationEn.trim().length < 2) {
    errors.locationEn = t('validation.minLength', { min: 2 });
  } else if (data.locationEn.trim().length > 50) {
    errors.locationEn = t('validation.maxLength', { max: 50 });
  } else if (!/^[a-zA-Z\s]+$/.test(data.locationEn.trim())) {
    errors.locationEn = t('validation.englishOnly', 'Please enter English text only');
  }

  // Validate Price
  if (!data.price.trim()) {
    errors.price = t('validation.required', 'This field is required');
  } else {
    const priceValue = parseFloat(data.price);
    if (isNaN(priceValue)) {
      errors.price = t('validation.invalidNumber', 'Please enter a valid number');
    } else if (priceValue < 0) {
      errors.price = t('validation.minValue', 'Price cannot be negative');
    } else if (priceValue > 10000) {
      errors.price = t('validation.maxValue', 'Price cannot exceed 10,000 ILS');
    } else if (priceValue === 0) {
      errors.price = t('validation.zeroNotAllowed', 'Price cannot be zero');
    }
  }

  // Validate WhatsApp Number
  if (!data.whatsappNumber.trim()) {
    errors.whatsappNumber = t('validation.required', 'This field is required');
  }
  // } else {
  //   const cleanNumber = data.whatsappNumber.replace(/[\s\-\(\)]/g, '');
    
  //   // Check for Palestinian numbers (+970)
  //   if (cleanNumber.startsWith('970') || cleanNumber.startsWith('+970')) {
  //     if (!/^(\+970|970)[5][0-9]{8}$/.test(cleanNumber)) {
  //       errors.whatsappNumber = t('validation.invalidWhatsApp', 'Please enter a valid Palestinian WhatsApp number');
  //     }
  //   }
  //   // Check for   numbers (+972) - including 1948 territories
  //   else if (cleanNumber.startsWith('972') || cleanNumber.startsWith('+972')) {
  //     //   mobile numbers can start with 50, 51, 52, 53, 54, 55, 58
  //     const  Pattern = /^(\+972|972)[5][0-8][0-9]{7}$/;
  //     if (! Pattern.test(cleanNumber)) {
  //       errors.whatsappNumber = t('validation.invalidWhatsApp', 'Please enter a valid   WhatsApp number');
  //     }
  //   }
  //   // Check for local   numbers (starting with 0)
  //   else if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
  //     // Local   mobile numbers: 050, 051, 052, 053, 054, 055, 058
  //     if (!/^0[5][0-8][0-9]{7}$/.test(cleanNumber)) {
  //       errors.whatsappNumber = t('validation.invalidWhatsApp', 'Please enter a valid   WhatsApp number');
  //     }
  //   }
  //   // Invalid format
  //   else {
  //     errors.whatsappNumber = t('validation.invalidWhatsApp', 'Please enter a valid Palestinian or   WhatsApp number');
  //   }
    
  //   if (cleanNumber.length < 9 || cleanNumber.length > 12) {
  //     errors.whatsappNumber = t('validation.whatsAppLength', 'WhatsApp number should be 9-12 digits');
  //   }
  // }

  return errors;
};

// Individual field validators for real-time validation
export const validateLocationAr = (value: string, t: any): string | undefined => {
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

export const validateLocationEn = (value: string, t: any): string | undefined => {
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

export const validatePrice = (value: string, t: any): string | undefined => {
  if (!value.trim()) {
    return t('validation.required', 'This field is required');
  }
  const priceValue = parseFloat(value);
  if (isNaN(priceValue)) {
    return t('validation.invalidNumber', 'Please enter a valid number');
  }
  if (priceValue < 0) {
    return t('validation.minValue', 'Price cannot be negative');
  }
  if (priceValue > 10000) {
    return t('validation.maxValue', 'Price cannot exceed 10,000 ILS');
  }
  if (priceValue === 0) {
    return t('validation.zeroNotAllowed', 'Price cannot be zero');
  }
  return undefined;
};

export const validateWhatsAppNumber = (value: string, t: any): string | undefined => {
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