// src/validation/affiliatePaymentValidation.ts
// فاليديشن دفع المسوقين باستخدام النظام العام

import { ValidationSchema, COMMON_SCHEMAS } from '../utils/validation';

// Interface لبيانات فورم دفع المسوق
export interface AffiliatePaymentFormData {
  paid: string | number;
  paymentDate: string;
  paymentMethod: string;
  description: string;
  notes?: string;
  bankTransfer?: {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
  };
  paypal?: {
    paypalEmail?: string;
    paypalTransactionId?: string;
  };
}

// Schema للتحقق من صحة بيانات دفع المسوق
export const affiliatePaymentValidationSchema: ValidationSchema = {
  paid: {
    required: true,
    type: 'number',
    min: 0.01,
    max: 1000000,
    custom: (value: number, formData?: any) => {
      if (formData?.remaining && value > formData.remaining) {
        return false; // سيتم التعامل مع هذه الحالة في validateForm
      }
      return true;
    },
  },
  paymentDate: {
    required: true,
    type: 'string',
    custom: (value: string) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
  },
  paymentMethod: {
    required: true,
    type: 'string',
    custom: (value: string) => {
      const validMethods = ['bank_transfer', 'paypal', 'cash', 'check', 'credit_card'];
      return validMethods.includes(value);
    },
  },
  description: {
    required: true,
    type: 'arabicText',
    minLength: 5,
    maxLength: 500,
  },
  notes: {
    required: false,
    type: 'arabicText',
    maxLength: 1000,
  },
  'bankTransfer.bankName': {
    required: false,
    type: 'arabicText',
    minLength: 2,
    maxLength: 100,
    custom: (value: string, formData?: any) => {
      if (formData?.paymentMethod === 'bank_transfer') {
        return Boolean(value && value.trim().length > 0);
      }
      return true;
    },
  },
  'bankTransfer.accountNumber': {
    required: false,
    type: 'string',
    minLength: 5,
    maxLength: 50,
    custom: (value: string, formData?: any) => {
      if (formData?.paymentMethod === 'bank_transfer') {
        return Boolean(value && value.trim().length > 0);
      }
      return true;
    },
  },
  'bankTransfer.iban': {
    required: false,
    type: 'string',
    minLength: 15,
    maxLength: 34,
    custom: (value: string, formData?: any) => {
      if (formData?.paymentMethod === 'bank_transfer') {
        return Boolean(value && value.trim().length > 0);
      }
      return true;
    },
  },
  'bankTransfer.swiftCode': {
    required: false,
    type: 'string',
    minLength: 8,
    maxLength: 11,
  },
  'paypal.paypalEmail': {
    required: false,
    type: 'email',
    custom: (value: string, formData?: any) => {
      if (formData?.paymentMethod === 'paypal') {
        return Boolean(value && value.trim().length > 0);
      }
      return true;
    },
  },
  'paypal.paypalTransactionId': {
    required: false,
    type: 'string',
    maxLength: 100,
  },
};

// Schemas جاهزة للاستخدام المتكرر
export const AffiliatePaymentSchemas = {
  // Schema أساسي للدفع
  basic: {
    paid: affiliatePaymentValidationSchema.paid,
    paymentDate: affiliatePaymentValidationSchema.paymentDate,
    paymentMethod: affiliatePaymentValidationSchema.paymentMethod,
    description: affiliatePaymentValidationSchema.description,
  },
  
  // Schema لتفاصيل التحويل البنكي
  bankTransfer: {
    'bankTransfer.bankName': affiliatePaymentValidationSchema['bankTransfer.bankName'],
    'bankTransfer.accountNumber': affiliatePaymentValidationSchema['bankTransfer.accountNumber'],
    'bankTransfer.iban': affiliatePaymentValidationSchema['bankTransfer.iban'],
    'bankTransfer.swiftCode': affiliatePaymentValidationSchema['bankTransfer.swiftCode'],
  },
  
  // Schema لتفاصيل PayPal
  paypal: {
    'paypal.paypalEmail': affiliatePaymentValidationSchema['paypal.paypalEmail'],
    'paypal.paypalTransactionId': affiliatePaymentValidationSchema['paypal.paypalTransactionId'],
  },
  
  // Schema كامل
  full: affiliatePaymentValidationSchema,
};

// دالة فاليديشن مخصصة لدفع المسوق
export const validateAffiliatePayment = (
  data: AffiliatePaymentFormData,
  t: any,
  remainingBalance?: number
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  // التحقق من المبلغ
  if (!data.paid || parseFloat(String(data.paid)) <= 0) {
    errors.paid = t('affiliation.amountRequired') || 'المبلغ مطلوب';
  } else if (remainingBalance && parseFloat(String(data.paid)) > remainingBalance) {
    errors.paid = t('affiliation.amountExceedsBalance') || 'المبلغ يتجاوز الرصيد المتبقي';
  }

  // التحقق من تاريخ الدفع
  if (!data.paymentDate) {
    errors.paymentDate = t('affiliation.paymentDateRequired') || 'تاريخ الدفع مطلوب';
  } else {
    const paymentDate = new Date(data.paymentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (paymentDate < today) {
      errors.paymentDate = t('affiliation.paymentDateFuture') || 'تاريخ الدفع يجب أن يكون في المستقبل';
    }
  }

  // التحقق من طريقة الدفع
  if (!data.paymentMethod) {
    errors.paymentMethod = t('affiliation.paymentMethodRequired') || 'طريقة الدفع مطلوبة';
  }

  // التحقق من الوصف
  if (!data.description || data.description.trim().length < 5) {
    errors.description = t('affiliation.descriptionRequired') || 'الوصف مطلوب (5 أحرف على الأقل)';
  }

  // التحقق من تفاصيل التحويل البنكي
  if (data.paymentMethod === 'bank_transfer') {
    if (!data.bankTransfer?.bankName?.trim()) {
      errors.bankName = t('affiliation.bankNameRequired') || 'اسم البنك مطلوب';
    }
    if (!data.bankTransfer?.accountNumber?.trim()) {
      errors.accountNumber = t('affiliation.accountNumberRequired') || 'رقم الحساب مطلوب';
    }
    if (!data.bankTransfer?.iban?.trim()) {
      errors.iban = t('affiliation.ibanRequired') || 'IBAN مطلوب';
    }
  }

  // التحقق من تفاصيل PayPal
  if (data.paymentMethod === 'paypal') {
    if (!data.paypal?.paypalEmail?.trim()) {
      errors.paypalEmail = t('affiliation.paypalEmailRequired') || 'بريد PayPal مطلوب';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.paypal.paypalEmail)) {
        errors.paypalEmail = t('affiliation.paypalEmailInvalid') || 'بريد PayPal غير صحيح';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 