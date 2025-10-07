/**
 * Utility functions for handling error messages with language support
 */

/**
 * Get error message in the appropriate language
 * @param error - Error object or response data
 * @param isRTL - Whether the current language is RTL (Arabic)
 * @param fallbackMessage - Fallback message if no specific message is found
 * @returns Object with title and message in appropriate language
 */
export const getErrorMessage = (
  error: any, 
  isRTL: boolean = false, 
  fallbackMessage: { title: string; message: string } = { 
    title: 'Error', 
    message: 'An error occurred' 
  }
) => {
  const errorData = error?.response?.data || error;
  
  let title = '';
  let message = '';
  
  if (errorData) {
    // Check for Arabic message first if RTL
    if (isRTL && errorData.messageAr) {
      message = errorData.messageAr;
      title = errorData.titleAr || (isRTL ? 'خطأ' : 'Error');
    } else if (errorData.message) {
      message = errorData.message;
      title = errorData.title || (isRTL ? 'خطأ' : 'Error');
    } else {
      // Use fallback messages
      title = isRTL ? fallbackMessage.title : fallbackMessage.title;
      message = isRTL ? fallbackMessage.message : fallbackMessage.message;
    }
  } else {
    title = isRTL ? fallbackMessage.title : fallbackMessage.title;
    message = isRTL ? fallbackMessage.message : fallbackMessage.message;
  }
  
  return { title, message };
};

/**
 * Get success message in the appropriate language
 * @param isRTL - Whether the current language is RTL (Arabic)
 * @param title - Success title
 * @param message - Success message
 * @returns Object with title and message in appropriate language
 */
export const getSuccessMessage = (
  isRTL: boolean = false,
  title: string = 'Success',
  message: string = 'Operation completed successfully'
) => {
  return {
    title: isRTL ? title : title,
    message: isRTL ? message : message
  };
};

/**
 * Common error messages for different scenarios
 */
export const ERROR_MESSAGES = {
  INVALID_TOKEN: {
    title: { en: 'Authentication Error', ar: 'خطأ في المصادقة' },
    message: { en: 'Invalid or expired token', ar: 'رمز مميز غير صالح أو منتهي الصلاحية' }
  },
  NETWORK_ERROR: {
    title: { en: 'Network Error', ar: 'خطأ في الشبكة' },
    message: { en: 'Unable to connect to server', ar: 'غير قادر على الاتصال بالخادم' }
  },
  SUBSCRIPTION_SETUP_ERROR: {
    title: { en: 'Setup Error', ar: 'خطأ في الإعداد' },
    message: { en: 'Failed to setup subscription', ar: 'فشل في إعداد الاشتراك' }
  },
  SUBSCRIPTION_SETUP_SUCCESS: {
    title: { en: 'Setup Successful', ar: 'تم الإعداد بنجاح' },
    message: { en: 'Subscription setup completed successfully', ar: 'تم إعداد الاشتراك بنجاح' }
  }
};

/**
 * Get predefined error message
 * @param errorType - Type of error from ERROR_MESSAGES
 * @param isRTL - Whether the current language is RTL (Arabic)
 * @returns Object with title and message
 */
export const getPredefinedErrorMessage = (errorType: keyof typeof ERROR_MESSAGES, isRTL: boolean = false) => {
  const error = ERROR_MESSAGES[errorType];
  return {
    title: isRTL ? error.title.ar : error.title.en,
    message: isRTL ? error.message.ar : error.message.en
  };
};

