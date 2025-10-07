import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Test component for delete functions error handling with language support
 */
const DeleteFunctionsErrorHandlingTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  
  const [testError, setTestError] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Simulate API error responses for different delete operations
  const simulateAPIErrors = (type: 'label' | 'specification' | 'unit') => {
    const apiErrors = {
      label: {
        success: false,
        error: "Cannot delete product label",
        message: "Cannot delete product label. It is being used by 3 product(s)",
        messageAr: "لا يمكن حذف تسمية المنتج. يتم استخدامها من قبل 3 منتج",
        details: {
          connectedProducts: 3,
          productIds: [
            "689db56ccaf6f986517d8eb9",
            "689dd0119b347d8b52a55755",
            "689de11a873f98525edb2e7c"
          ]
        }
      },
      specification: {
        success: false,
        error: "Cannot delete specification",
        message: "Cannot delete specification. It is being used by 7 product(s)",
        messageAr: "لا يمكن حذف المواصفة. يتم استخدامها من قبل 7 منتج",
        details: {
          connectedProducts: 7,
          productIds: [
            "689db56ccaf6f986517d8eb9",
            "689dd0119b347d8b52a55755",
            "689de11a873f98525edb2e7c",
            "689de4f5873f98525edb39b6",
            "68c7e0736a99b507e3f6b751",
            "68ca4ffa61ef1f9112668f5d",
            "68ca4ffa61ef1f9112668f5e"
          ]
        }
      },
      unit: {
        success: false,
        error: "Cannot delete unit",
        message: "Cannot delete unit. It is being used by 5 product(s)",
        messageAr: "لا يمكن حذف الوحدة. يتم استخدامها من قبل 5 منتج",
        details: {
          connectedProducts: 5,
          productIds: [
            "689db56ccaf6f986517d8eb9",
            "689dd0119b347d8b52a55755",
            "689de11a873f98525edb2e7c",
            "689de4f5873f98525edb39b6",
            "68c7e0736a99b507e3f6b751"
          ]
        }
      }
    };

    const randomError = apiErrors[type];
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
        {isRTL ? 'اختبار معالجة أخطاء حذف البيانات' : 'Delete Functions Error Handling Test'}
      </h2>
      
      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            {isRTL ? 'تعليمات الاختبار:' : 'Test Instructions:'}
          </h3>
          <div className="text-sm space-y-1">
            <p>1. {isRTL ? 'انقر على أي من أزرار "محاكاة خطأ" لمحاكاة أخطاء API' : 'Click any "Simulate Error" button to simulate API errors'}</p>
            <p>2. {isRTL ? 'لاحظ كيف يتم عرض الرسائل باللغة الصحيحة' : 'Notice how messages are displayed in the correct language'}</p>
            <p>3. {isRTL ? 'جرب تغيير اللغة لرؤية الرسائل بالعربية والإنجليزية' : 'Try changing language to see messages in Arabic and English'}</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">
            {isRTL ? 'أدوات الاختبار:' : 'Test Controls:'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => simulateAPIErrors('label')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {isRTL ? 'محاكاة خطأ تسمية المنتج' : 'Simulate Label Error'}
            </button>
            
            <button
              onClick={() => simulateAPIErrors('specification')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {isRTL ? 'محاكاة خطأ المواصفة' : 'Simulate Specification Error'}
            </button>
            
            <button
              onClick={() => simulateAPIErrors('unit')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {isRTL ? 'محاكاة خطأ الوحدة' : 'Simulate Unit Error'}
            </button>
            
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors md:col-span-3"
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
                <span className="font-medium">{isRTL ? 'نوع الخطأ:' : 'Error Type:'}</span>
                <span className="ml-2 text-red-700">{testError.error}</span>
              </div>
              
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
              
              {/* Detailed Information */}
              {testError.details && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {isRTL ? 'التفاصيل:' : 'Details:'}
                  </h4>
                  
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">{isRTL ? 'عدد المنتجات المتصلة:' : 'Connected Products:'}</span>
                      <span className="ml-2 text-red-600 font-semibold">{testError.details.connectedProducts}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium">{isRTL ? 'معرفات المنتجات:' : 'Product IDs:'}</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {testError.details.productIds.map((id: string, index: number) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* API Endpoints */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            {isRTL ? 'نقاط نهاية API:' : 'API Endpoints:'}
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="bg-white p-3 rounded border">
              <code className="text-xs">
                <strong>DELETE</strong> /api/meta/product-labels/LABEL_ID?storeId=STORE_ID
              </code>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <code className="text-xs">
                <strong>DELETE</strong> /api/meta/product-specifications/SPEC_ID?storeId=STORE_ID
              </code>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <code className="text-xs">
                <strong>DELETE</strong> /api/meta/units/UNIT_ID?storeId=STORE_ID
              </code>
            </div>
          </div>
        </div>

        {/* Error Handling Logic Demo */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'منطق معالجة الأخطاء:' : 'Error Handling Logic:'}
          </h3>
          
          <div className="text-sm space-y-2">
            <div className="bg-white p-3 rounded border">
              <code className="text-xs">
                {`// Handle API error messages with language support
const isRTL = t('common.language') === 'ar' || t('common.language') === 'ARABIC';
const errorMsg = getErrorMessage(err, isRTL, {
  title: isRTL ? 'خطأ في حذف البيانات' : 'Error Deleting Data',
  message: isRTL ? 'فشل في حذف البيانات' : 'Failed to delete data'
});

showError(errorMsg.message, t('general.error'));`}
              </code>
            </div>
            
            <div className="text-xs text-gray-600">
              <p><strong>{isRTL ? 'المنطق:' : 'Logic:'}</strong></p>
              <p>1. {isRTL ? 'تحديد اللغة الحالية (isRTL)' : 'Detect current language (isRTL)'}</p>
              <p>2. {isRTL ? 'استخدام getErrorMessage للتعامل مع الرسائل' : 'Use getErrorMessage to handle messages'}</p>
              <p>3. {isRTL ? 'عرض الرسالة باللغة الصحيحة' : 'Display message in correct language'}</p>
            </div>
          </div>
        </div>

        {/* Error Types */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">
            {isRTL ? 'أنواع الأخطاء:' : 'Error Types:'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-800 mb-1">Product Label</h4>
              <p className="text-gray-600">EN: "Cannot delete product label. It is being used by 3 product(s)"</p>
              <p className="text-gray-600">AR: "لا يمكن حذف تسمية المنتج. يتم استخدامها من قبل 3 منتج"</p>
              <div className="mt-2 text-xs text-gray-500">
                <strong>Details:</strong> Shows connected product count and IDs
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-800 mb-1">Specification</h4>
              <p className="text-gray-600">EN: "Cannot delete specification. It is being used by 7 product(s)"</p>
              <p className="text-gray-600">AR: "لا يمكن حذف المواصفة. يتم استخدامها من قبل 7 منتج"</p>
              <div className="mt-2 text-xs text-gray-500">
                <strong>Details:</strong> Shows connected product count and IDs
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-800 mb-1">Unit</h4>
              <p className="text-gray-600">EN: "Cannot delete unit. It is being used by 5 product(s)"</p>
              <p className="text-gray-600">AR: "لا يمكن حذف الوحدة. يتم استخدامها من قبل 5 منتج"</p>
              <div className="mt-2 text-xs text-gray-500">
                <strong>Details:</strong> Shows connected product count and IDs
              </div>
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
                    {isRTL ? 'خطأ في حذف البيانات' : 'Error Deleting Data'}
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
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">
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

export default DeleteFunctionsErrorHandlingTest;
