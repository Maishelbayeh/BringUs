import React from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, getPredefinedErrorMessage } from '../../utils/errorUtils';

/**
 * Example component demonstrating error handling with language support
 */
const ErrorHandlingExample: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';

  // Example error responses from API
  const exampleErrors = [
    {
      success: false,
      message: "Invalid token",
      messageAr: "رمز مميز غير صالح"
    },
    {
      success: false,
      message: "Network error",
      messageAr: "خطأ في الشبكة"
    },
    {
      success: false,
      message: "Subscription not found",
      messageAr: "الاشتراك غير موجود"
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isRTL ? 'مثال على معالجة الأخطاء' : 'Error Handling Example'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">
            {isRTL ? 'أخطاء من API:' : 'API Errors:'}
          </h3>
          
          {exampleErrors.map((error, index) => {
            const errorMsg = getErrorMessage(error, isRTL, {
              title: isRTL ? 'خطأ' : 'Error',
              message: isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'
            });
            
            return (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
                <h4 className="font-medium text-red-800 mb-2">
                  {isRTL ? 'مثال' : 'Example'} {index + 1}:
                </h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">{isRTL ? 'العنوان:' : 'Title:'}</span> {errorMsg.title}</p>
                  <p><span className="font-medium">{isRTL ? 'الرسالة:' : 'Message:'}</span> {errorMsg.message}</p>
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">{isRTL ? 'الرسالة الأصلية:' : 'Original Message:'}</span> {error.message}
                  </p>
                  {error.messageAr && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">{isRTL ? 'الرسالة العربية:' : 'Arabic Message:'}</span> {error.messageAr}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-2">
            {isRTL ? 'رسائل محددة مسبقاً:' : 'Predefined Messages:'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-medium text-blue-800 mb-2">
                {isRTL ? 'خطأ في المصادقة' : 'Authentication Error'}
              </h5>
              {(() => {
                const authError = getPredefinedErrorMessage('INVALID_TOKEN', isRTL);
                return (
                  <div className="text-sm">
                    <p><span className="font-medium">{isRTL ? 'العنوان:' : 'Title:'}</span> {authError.title}</p>
                    <p><span className="font-medium">{isRTL ? 'الرسالة:' : 'Message:'}</span> {authError.message}</p>
                  </div>
                );
              })()}
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h5 className="font-medium text-green-800 mb-2">
                {isRTL ? 'نجح الإعداد' : 'Setup Success'}
              </h5>
              {(() => {
                const successMsg = getPredefinedErrorMessage('SUBSCRIPTION_SETUP_SUCCESS', isRTL);
                return (
                  <div className="text-sm">
                    <p><span className="font-medium">{isRTL ? 'العنوان:' : 'Title:'}</span> {successMsg.title}</p>
                    <p><span className="font-medium">{isRTL ? 'الرسالة:' : 'Message:'}</span> {successMsg.message}</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingExample;

