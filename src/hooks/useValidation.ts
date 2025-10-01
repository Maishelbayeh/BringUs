// src/hooks/useValidation.ts
// Hook مخصص للفالديشين يتكامل مع النظام العام

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  validateForm,
  validateField,
  validateWhatsApp,
  validateUnique,
  validatePasswordMatch,
  validateComparison,
  ValidationSchema,
  ValidationResult,
  ValidationRule
} from '../utils/validation';

export interface UseValidationOptions {
  schema: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export interface UseValidationReturn {
  errors: { [key: string]: string };
  isValid: boolean;
  isFormValid: boolean;
  validateForm: (data: { [key: string]: any }) => ValidationResult;
  validateField: (fieldName: string, value: any, extraRule?: ValidationRule) => string | undefined;
  validateWhatsApp: (value: string) => string | undefined;
  validateUnique: (value: string | undefined, items: any[], fieldName: string, currentId?: string | number) => string | undefined;
  validatePasswordMatch: (password: string, confirmPassword: string) => string | undefined;
  validateComparison: (value1: number, value2: number, operator: 'greater' | 'less' | 'equal' | 'greaterOrEqual' | 'lessOrEqual') => string | undefined;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
  setError: (fieldName: string, message: string) => void;
  setErrors: (newErrors: { [key: string]: string }) => void;
  hasError: (fieldName: string) => boolean;
}

/**
 * Hook مخصص للفالديشين
 */
export const useValidation = ({
  schema,
  onValidationChange
}: UseValidationOptions): UseValidationReturn => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // تحديد ما إذا كان الفورم صحيح أم لا
  const isValid = Object.keys(errors).length === 0;

  // دالة التحقق من صحة الفورم كاملاً
  const validateFormData = useCallback((data: { [key: string]: any }): ValidationResult => {
    const result = validateForm(data, schema, t);
    setErrors(result.errors);
    setIsFormValid(result.isValid);
    
    if (onValidationChange) {
      onValidationChange(result.isValid);
    }
    
    return result;
  }, [schema, t, onValidationChange]);

  // دالة التحقق من صحة حقل واحد
  const validateSingleField = useCallback((
    fieldName: string, 
    value: any,
    extraRule?: ValidationRule
  ): string | undefined => {
    const rule = extraRule || schema[fieldName];
    if (!rule) return undefined;

    const error = validateField(value, rule, t);
    
    // تحديث الأخطاء
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });

    return error;
  }, [schema, t]);

  // دالة التحقق من رقم الواتساب
  const validateWhatsAppNumber = useCallback((value: string): string | undefined => {
    const error = validateWhatsApp(value, t);
    return error;
  }, [t]);

  // دالة التحقق من عدم التكرار
  const validateUniqueValue = useCallback((
    value: string | undefined,
    items: any[],
    fieldName: string,
    currentId?: string | number
  ): string | undefined => {
    if (!value) return undefined;
    return validateUnique(value, items, fieldName, currentId, t);
  }, [t]);

  // دالة التحقق من تطابق كلمات المرور
  const validatePasswordsMatch = useCallback((
    password: string,
    confirmPassword: string
  ): string | undefined => {
    return validatePasswordMatch(password, confirmPassword, t);
  }, [t]);

  // دالة التحقق من المقارنة بين القيم
  const validateNumberComparison = useCallback((
    value1: number,
    value2: number,
    operator: 'greater' | 'less' | 'equal' | 'greaterOrEqual' | 'lessOrEqual'
  ): string | undefined => {
    return validateComparison(value1, value2, operator, t);
  }, [t]);

  // دالة مسح خطأ حقل معين
  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // دالة مسح جميع الأخطاء
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // دالة تعيين خطأ لحقل معين
  const setError = useCallback((fieldName: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: message
    }));
  }, []);

  // دالة تعيين أخطاء متعددة
  const setErrorsMultiple = useCallback((newErrors: { [key: string]: string }) => {
    setErrors(newErrors);
  }, []);

  // دالة للتحقق من وجود خطأ في حقل معين
  const hasError = useCallback((fieldName: string): boolean => {
    return !!errors[fieldName];
  }, [errors]);

  // تحديث حالة صحة الفورم عند تغيير الأخطاء
  useEffect(() => {
    const newIsFormValid = Object.keys(errors).length === 0;
    if (newIsFormValid !== isFormValid) {
      setIsFormValid(newIsFormValid);
      if (onValidationChange) {
        onValidationChange(newIsFormValid);
      }
    }
  }, [errors, isFormValid, onValidationChange]);

  return {
    errors,
    isValid,
    isFormValid,
    validateForm: validateFormData,
    validateField: validateSingleField,
    validateWhatsApp: validateWhatsAppNumber,
    validateUnique: validateUniqueValue,
    validatePasswordMatch: validatePasswordsMatch,
    validateComparison: validateNumberComparison,
    clearError,
    clearAllErrors,
    setError,
    setErrors: setErrorsMultiple,
    hasError
  };
};

/**
 * Hook مبسط للفالديشين السريع
 */
export const useSimpleValidation = () => {
  const { t } = useTranslation();
  
  return {
    validateRequired: (value: any, fieldName?: string): string | undefined => {
      if (value === undefined || value === null || value === '') {
        return t('validation.required', 'This field is required');
      }
      if (typeof value === 'string' && !value.trim()) {
        return t('validation.required', 'This field is required');
      }
      return undefined;
    },
    
    validateMinLength: (value: string, minLength: number): string | undefined => {
      if (value && value.trim().length < minLength) {
        return t('validation.minLength', { min: minLength });
      }
      return undefined;
    },
    
    validateMaxLength: (value: string, maxLength: number): string | undefined => {
      if (value && value.trim().length > maxLength) {
        return t('validation.maxLength', { max: maxLength });
      }
      return undefined;
    },
    
    validateEmail: (value: string): string | undefined => {
      if (!value) return undefined;
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value.trim())) {
        return t('validation.emailInvalid', 'Please enter a valid email address');
      }
      return undefined;
    },
    
    validateNumber: (value: string | number, min?: number, max?: number): string | undefined => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) {
        return t('validation.invalidNumber', 'Please enter a valid number');
      }
      if (min !== undefined && numValue < min) {
        return t('validation.minValue', { min });
      }
      if (max !== undefined && numValue > max) {
        return t('validation.maxValue', { max });
      }
      return undefined;
    }
  };
};

// Hook للفالديشين المتقدم مع قواعد مخصصة
export const useAdvancedValidation = (customRules?: { [key: string]: ValidationRule }) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback((data: { [key: string]: any }, rules: { [key: string]: ValidationRule }) => {
    const combinedRules = { ...rules, ...customRules };
    const result = validateForm(data, combinedRules, t);
    setErrors(result.errors);
    return result;
  }, [t, customRules]);

  return {
    errors,
    validate,
    clearErrors: () => setErrors({}),
    isValid: Object.keys(errors).length === 0
  };
}; 