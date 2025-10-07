/**
 * Advertisement Form Validation
 */

export interface AdvertisementValidationErrors {
  title?: string;
  htmlContent?: string;
  image?: string;
}

export const validateAdvertisementForm = (
  formData: {
    title: string;
    htmlContent: string;
    image: string | null;
    mode: 'html' | 'image';
  },
  t: any
): AdvertisementValidationErrors => {
  const errors: AdvertisementValidationErrors = {};

  // Validate title
  if (!formData.title || !formData.title.trim()) {
    errors.title = t('validation.required', 'This field is required');
  } else if (formData.title.trim().length < 3) {
    errors.title = t('validation.minLength', 'Minimum 3 characters required');
  } else if (formData.title.trim().length > 100) {
    errors.title = t('validation.maxLength', 'Maximum 100 characters allowed');
  }

  // Validate content based on mode
  if (formData.mode === 'html') {
    if (!formData.htmlContent || !formData.htmlContent.trim()) {
      errors.htmlContent = t('advertisement.htmlRequired', 'HTML content is required');
    } else if (formData.htmlContent.trim().length < 10) {
      errors.htmlContent = t('advertisement.htmlMinLength', 'HTML content must be at least 10 characters');
    }
  } else if (formData.mode === 'image') {
    if (!formData.image) {
      errors.image = t('advertisement.imageRequired', 'Image is required');
    }
  }

  return errors;
};

export const validateAdvertisementField = (
  fieldName: keyof AdvertisementValidationErrors,
  value: any,
  mode: 'html' | 'image',
  t: any
): string | undefined => {
  switch (fieldName) {
    case 'title':
      if (!value || !value.trim()) {
        return t('validation.required', 'This field is required');
      }
      if (value.trim().length < 3) {
        return t('validation.minLength', 'Minimum 3 characters required');
      }
      if (value.trim().length > 100) {
        return t('validation.maxLength', 'Maximum 100 characters allowed');
      }
      break;

    case 'htmlContent':
      if (mode === 'html') {
        if (!value || !value.trim()) {
          return t('advertisement.htmlRequired', 'HTML content is required');
        }
        if (value.trim().length < 10) {
          return t('advertisement.htmlMinLength', 'HTML content must be at least 10 characters');
        }
      }
      break;

    case 'image':
      if (mode === 'image' && !value) {
        return t('advertisement.imageRequired', 'Image is required');
      }
      break;
  }

  return undefined;
};

