/**
 * Utility functions for handling specification values with language support
 */

/**
 * Get the appropriate title for a specification based on language
 * @param spec - Specification object
 * @param isRTL - Whether the current language is RTL (Arabic)
 * @returns The appropriate title string
 */
export const getSpecificationTitle = (spec: any, isRTL: boolean = false): string => {
  if (!spec) return '';
  
  if (isRTL) {
    // For Arabic: try titleAr first, then fallback to title
    return spec.titleAr || spec.title || '';
  } else {
    // For English: try titleEn first, then fallback to title
    return spec.titleEn || spec.title || '';
  }
};

/**
 * Get the appropriate value for a specification based on language
 * @param spec - Specification object
 * @param isRTL - Whether the current language is RTL (Arabic)
 * @returns The appropriate value string
 */
export const getSpecificationValue = (spec: any, isRTL: boolean = false): string => {
  if (!spec) return '';
  
  if (isRTL) {
    // For Arabic: try valueAr first, then fallback to value
    return spec.valueAr || spec.value || '';
  } else {
    // For English: try valueEn first, then fallback to value
    return spec.valueEn || spec.value || '';
  }
};

/**
 * Format specification values for display
 * @param specificationValues - Array of specification values
 * @param isRTL - Whether the current language is RTL (Arabic)
 * @returns Formatted string of specification values
 */
export const formatSpecificationValues = (specificationValues: any[], isRTL: boolean = false): string => {
  if (!Array.isArray(specificationValues) || specificationValues.length === 0) {
    return isRTL ? 'لا توجد مواصفات' : 'No Specifications';
  }

  return specificationValues.map((spec: any) => {
    const title = getSpecificationTitle(spec, isRTL);
    const value = getSpecificationValue(spec, isRTL);
    
    if (title && value) {
      return `${title}: ${value}`;
    }
    
    return title || value || '';
  }).filter(spec => spec.trim() !== '').join(', ');
};

/**
 * Get specification display object with language-specific values
 * @param spec - Specification object
 * @param isRTL - Whether the current language is RTL (Arabic)
 * @returns Object with title and value for display
 */
export const getSpecificationDisplay = (spec: any, isRTL: boolean = false) => {
  return {
    title: getSpecificationTitle(spec, isRTL),
    value: getSpecificationValue(spec, isRTL),
    fullText: `${getSpecificationTitle(spec, isRTL)}: ${getSpecificationValue(spec, isRTL)}`
  };
};
