import { ValidationSchema, PATTERNS, validateWhatsApp } from '../utils/validation';
import { TFunction } from 'i18next';

/**
 * Interface for Affiliate form data
 */
export interface AffiliateFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  percent: number;
  status: string;
  address: string;
  link?: string;
}

/**
 * Validation schema for affiliate form
 */
export const affiliateValidationSchema: ValidationSchema = {
  email: {
    required: true,
    type: 'email',
  },
  password: {
    required: true,
    type: 'string',
    minLength: 6,
    maxLength: 50,
  },
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
  mobile: {
    required: true,
    type: 'phone', // Using the international phone validation
  },
  percent: {
    required: true,
    type: 'number',
    min: 0,
    max: 100,
  },
  status: {
    required: true,
    type: 'string',
  },
  address: {
    required: true,
    type: 'string',
    maxLength: 500,
  },
  link: {
    required: false,
    type: 'string',
    maxLength: 500,
  },
};

/**
 * Helper function to check for duplicate email/mobile in affiliates
 */
const checkDuplicateAffiliate = (
  form: AffiliateFormData & { id?: string | number },
  affiliates: any[],
  field: 'email' | 'mobile'
): boolean => {
  return affiliates.some(affiliate => 
    affiliate.id !== form.id && 
    affiliate[field]?.trim().toLowerCase() === form[field]?.trim().toLowerCase()
  );
};

/**
 * Validates the entire affiliate form, including duplicate checks.
 */
export const validateAffiliateWithDuplicates = (
  form: AffiliateFormData & { id?: string | number },
  allAffiliates: any[],
  t: TFunction,
  isEdit: boolean = false
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  // Email validation
  if (!form.email || form.email.trim() === '') {
    errors.email = t('validation.required');
  } else if (!PATTERNS.email.test(form.email)) {
    errors.email = t('validation.emailInvalid');
  }

  // Password validation (only required for new affiliates)
  if (!isEdit) {
    // Creating new affiliate - password is required
    if (!form.password || form.password.trim() === '') {
      errors.password = t('validation.required');
    } else if (form.password.trim().length < 6) {
      errors.password = t('validation.minLength', { min: 6 });
    } else if (form.password.trim().length > 50) {
      errors.password = t('validation.maxLength', { max: 50 });
    }
  } else {
    // Editing existing affiliate - password is optional
    // Only validate if password is provided
    if (form.password && form.password.trim() !== '') {
      if (form.password.trim().length < 6) {
        errors.password = t('validation.minLength', { min: 6 });
      } else if (form.password.trim().length > 50) {
        errors.password = t('validation.maxLength', { max: 50 });
      }
    }
  }

  // First Name validation
  if (!form.firstName || form.firstName.trim() === '') {
    errors.firstName = t('validation.required');
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = t('validation.minLength', { min: 2 });
  } else if (form.firstName.trim().length > 50) {
    errors.firstName = t('validation.maxLength', { max: 50 });
  }

  // Last Name validation
  if (!form.lastName || form.lastName.trim() === '') {
    errors.lastName = t('validation.required');
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = t('validation.minLength', { min: 2 });
  } else if (form.lastName.trim().length > 50) {
    errors.lastName = t('validation.maxLength', { max: 50 });
  }

  // Mobile validation - using advanced WhatsApp validation
  if (!form.mobile || form.mobile.trim() === '') {
    errors.mobile = t('validation.required');
  } else {
    const whatsappError = validateWhatsApp(form.mobile, t);
    if (whatsappError) {
      errors.mobile = whatsappError;
    }
  }

  // Percent validation
  if (form.percent === undefined || form.percent === null || String(form.percent) === '' || String(form.percent) === '') {
    errors.percent = t('validation.required');
  } else if (form.percent < 0 || form.percent > 100) {
    errors.percent = t('validation.numberRange', { min: 0, max: 100 });
  }

  // Status validation
  if (!form.status || form.status.trim() === '') {
    errors.status = t('validation.required');
  }

  // Address validation
  if (!form.address || form.address.trim() === '') {
    errors.address = t('validation.required');
  } else if (form.address.trim().length > 500) {
    errors.address = t('validation.maxLength', { max: 500 });
  }

  // Link validation (optional)
  if (form.link && form.link.trim() !== '' && form.link.trim().length > 500) {
    errors.link = t('validation.maxLength', { max: 500 });
  }

  // Duplicate email/mobile check (only if fields are not empty and not already having errors)
  if (form.email && form.email.trim() !== '' && !errors.email) {
    if (checkDuplicateAffiliate(form, allAffiliates, 'email')) {
      errors.email = t('validation.duplicateEmail');
    }
  }

  if (form.mobile && form.mobile.trim() !== '' && !errors.mobile) {
    if (checkDuplicateAffiliate(form, allAffiliates, 'mobile')) {
      errors.mobile = t('validation.duplicateMobile');
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 