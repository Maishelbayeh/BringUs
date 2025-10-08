// src/validation/wholesalerValidation.ts
import { ValidationSchema, PATTERNS, validateWhatsApp } from '../utils/validation';
import { TFunction } from 'i18next';

// Interface for the wholesaler form data
export interface WholesalerFormData {
  email: string;
  firstName: string;
  lastName: string;
  mobile: string;
  discount: number;
  status?: 'Active' | 'Inactive';
  address?: string;
}

// Validation schema for the wholesaler form
export const wholesalerValidationSchema: ValidationSchema = {
  email: {
    required: true,
    type: 'email',
  },
  firstName: {
    required: true,
    type: 'string', // Should we allow Arabic/English? Let's assume general string for now.
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
  discount: {
    required: true,
    type: 'number',
    min: 0,
    max: 100,
  },
  address: {
    required: true,
    type: 'string',
    maxLength: 500,
  },
};

/**
 * Validates the entire wholesaler form, including duplicate checks within the same store.
 */
export const validateWholesalerWithDuplicates = (
  form: WholesalerFormData & { id?: string | number; store?: { _id: string } },
  allWholesalers: any[],
  t: TFunction,
  storeId?: string
): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};

  // Email validation
  if (!form.email || form.email.trim() === '') {
    errors.email = t('validation.required');
  } else if (!PATTERNS.email.test(form.email)) {
    errors.email = t('validation.emailInvalid');
  }

  // First Name validation
  if (!form.firstName || form.firstName.trim() === '') {
    errors.firstName = t('validation.required');
  } else if (form.firstName.trim().length < 2) {
    errors.firstName = t('validation.minLength', { min: 2 });
  }

  // Last Name validation
  if (!form.lastName || form.lastName.trim() === '') {
    errors.lastName = t('validation.required');
  } else if (form.lastName.trim().length < 2) {
    errors.lastName = t('validation.minLength', { min: 2 });
  }

  // Mobile validation - استخدام validateWhatsApp المتطور
  if (!form.mobile || form.mobile.trim() === '') {
    errors.mobile = t('validation.required');
  } else {
    const mobileError = validateWhatsApp(form.mobile, t);
    if (mobileError) {
      errors.mobile = mobileError;
    }
  }

  // Discount validation
  if (form.discount === undefined || form.discount === null) {
    errors.discount = t('validation.required');
  } else if (form.discount < 0 || form.discount > 100) {
    errors.discount = t('validation.numberRange', { min: 0, max: 100 });
  }

  // Address validation
  if (!form.address || form.address.trim() === '') {
    errors.address = t('validation.required');
  } else if (form.address.trim().length > 500) {
    errors.address = t('validation.maxLength', { max: 500 });
  }

  // Duplicate email/mobile check within the same store (only if fields are not empty and not already having errors)
  const currentStoreId = form.store?._id || storeId;
  
  if (form.email && form.email.trim() !== '' && !errors.email && currentStoreId) {
    const emailDuplicate = allWholesalers.find(w => {
      // Skip self when editing
      if (w._id === form.id || w.id === form.id) {
        return false;
      }
      
      // Check if it's in the same store
      const wholesalerStoreId = w.store?._id || w.storeId;
      if (wholesalerStoreId !== currentStoreId) {
        return false; // Different store, no conflict
      }
      
      // Check for duplicate email
      return w.email?.trim().toLowerCase() === form.email.trim().toLowerCase();
    });
    
    if (emailDuplicate) {
      errors.email = t('validation.duplicateEmailInStore');
    }
  }

  if (form.mobile && form.mobile.trim() !== '' && !errors.mobile && currentStoreId) {
    const mobileDuplicate = allWholesalers.find(w => {
      // Skip self when editing
      if (w._id === form.id || w.id === form.id) {
        return false;
      }
      
      // Check if it's in the same store
      const wholesalerStoreId = w.store?._id || w.storeId;
      if (wholesalerStoreId !== currentStoreId) {
        return false; // Different store, no conflict
      }
      
      // Check for duplicate mobile
      return w.mobile?.trim() === form.mobile.trim();
    });
    
    if (mobileDuplicate) {
      errors.mobile = t('validation.duplicateMobileInStore');
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}; 