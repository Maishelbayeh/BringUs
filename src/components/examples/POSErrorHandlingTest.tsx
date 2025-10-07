import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Test component for POS error handling with language support
 */
const POSErrorHandlingTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  
  const [testError, setTestError] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Simulate API error responses
  const simulateAPIErrors = () => {
    const apiErrors = [
      {
        success: false,
        message: "Insufficient stock. Available: 3",
        messageAr: "المخزون غير كافي. المتوفر: 3"
      },
      {
        success: false,
        message: "Product not found",
        messageAr: "المنتج غير موجود"
      },
      {
        success: false,
        message: "Invalid quantity",
        messageAr: "الكمية غير صحيحة"
      },
      {
        success: false,
        message: "Payment failed",
        messageAr: "فشل في الدفع"
      }
    ];

    const randomError = apiErrors[Math.floor(Math.random() * apiErrors.length)];
    setTestError(randomError);
    
    // Show the error message in the correct language
    const errorMessage = isRTL && randomError.messageAr ? randomError.messageAr : randomError.message;
    setToastMessage(errorMessage);
    setShowToast(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => setShowToast(false), 3000);
  };

  const clearError = () => {
    setTestError(null);
    setShowToast(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isRTL ? 'اختبار معالجة الأخطاء في نقطة البيع' : 'POS Error Handling Test'}
      </h2>
      
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            {isRTL ? 'تعليمات الاختبار:' : 'Test Instructions:'}
          </h3>
          <div className="text-sm space-y-1">
            <p>1. {isRTL ? 'انقر على "محاكاة خطأ API" لمحاكاة أخطاء API' : 'Click "Simulate API Error" to simulate API errors'}</p>
            <p>2. {isRTL ? 'لاحظ كيف يتم عرض الرسائل باللغة الصحيحة' : 'Notice how messages are displayed in the correct language'}</p>
            <p>3. {isRTL ? 'جرب تغيير اللغة لرؤية الرسائل بالعربية والإنجليزية' : 'Try changing language to see messages in Arabic and English'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            {isRTL ? 'أدوات الاختبار:' : 'Test Controls:'}
          </h3>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={simulateAPIErrors}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {isRTL ? 'محاكاة خطأ API' : 'Simulate API Error'}
            </button>
            
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isRTL ? 'مسح الخطأ' : 'Clear Error'}
            </button>
          </div>
        </div>

        {/* Current Error Display */}
        {testError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">
              {isRTL ? 'الخطأ الحالي:' : 'Current Error:'}
            </h3>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">{isRTL ? 'الرسالة الإنجليزية:' : 'English Message:'}</span>
                <span className="ml-2 text-red-700">{testError.message}</span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">{isRTL ? 'الرسالة العربية:' : 'Arabic Message:'}</span>
                <span className="ml-2 text-red-700">{testError.messageAr}</span>
              </div>
              
              <div className="text-sm">
                <span className="font-medium">{isRTL ? 'الرسالة المعروضة:' : 'Displayed Message:'}</span>
                <span className="ml-2 text-red-700 font-semibold">
                  {isRTL && testError.messageAr ? testError.messageAr : testError.message}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Handling Logic Demo */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'منطق معالجة الأخطاء:' : 'Error Handling Logic:'}
          </h3>
          
          <div className="text-sm space-y-2">
            <div className="bg-white p-3 rounded border">
              <code className="text-xs">
                {`// Handle API error messages with language support
const errorMessage = isRTL && result.messageAr ? result.messageAr : result.message;
const errorTitle = isRTL ? 'فشل في إنشاء الطلب' : 'Failed to Create Order';

showToast('error', errorTitle, errorMessage);`}
              </code>
            </div>
            
            <div className="text-xs text-gray-600">
              <p><strong>{isRTL ? 'المنطق:' : 'Logic:'}</strong></p>
              <p>1. {isRTL ? 'إذا كانت اللغة العربية (isRTL = true) و messageAr موجود، استخدم messageAr' : 'If Arabic language (isRTL = true) and messageAr exists, use messageAr'}</p>
              <p>2. {isRTL ? 'وإلا استخدم message العادي' : 'Otherwise use regular message'}</p>
              <p>3. {isRTL ? 'اعرض الرسالة في toast notification' : 'Display message in toast notification'}</p>
            </div>
          </div>
        </div>

        {/* Toast Notification Demo */}
        {showToast && (
          <div className={`fixed top-4 z-50 max-w-sm w-full transition-all duration-500 ease-in-out ${
            isRTL ? 'left-4' : 'right-4'
          }`}>
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 shadow-red-100 rounded-xl shadow-2xl p-5 backdrop-blur-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className={`w-0 flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                  <p className="text-base font-semibold text-red-900">
                    {isRTL ? 'فشل في إنشاء الطلب' : 'Failed to Create Order'}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-red-700">
                    {toastMessage}
                  </p>
                </div>
                <div className={`flex-shrink-0 flex ${isRTL ? 'mr-4' : 'ml-4'}`}>
                  <button
                    onClick={() => setShowToast(false)}
                    className="inline-flex rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors text-red-500 hover:text-red-600 hover:bg-red-100 focus:ring-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Language Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            {isRTL ? 'معلومات اللغة:' : 'Language Information:'}
          </h3>
          
          <div className="text-sm space-y-1">
            <p><strong>{isRTL ? 'اللغة الحالية:' : 'Current Language:'}</strong> {i18n.language}</p>
            <p><strong>{isRTL ? 'اتجاه النص:' : 'Text Direction:'}</strong> {isRTL ? 'RTL (من اليمين لليسار)' : 'LTR (Left to Right)'}</p>
            <p><strong>{isRTL ? 'سيتم عرض الرسائل بـ:' : 'Messages will be displayed in:'}</strong> {isRTL ? 'العربية' : 'English'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSErrorHandlingTest;

