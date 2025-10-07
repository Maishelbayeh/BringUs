import React from 'react';
import { useTranslation } from 'react-i18next';
import ProductSpecificationDisplayTest from '../components/examples/ProductSpecificationDisplayTest';
import VariantsPopupSpecificationTest from '../components/examples/VariantsPopupSpecificationTest';
import RealDataSpecificationTest from '../components/examples/RealDataSpecificationTest';
import CompleteAPIDataTest from '../components/examples/CompleteAPIDataTest';
import ProductsFormSpecificationTest from '../components/examples/ProductsFormSpecificationTest';
import RealTimeBarcodeValidationTest from '../components/examples/RealTimeBarcodeValidationTest';
import POSErrorHandlingTest from '../components/examples/POSErrorHandlingTest';
import UseProductsErrorHandlingTest from '../components/examples/UseProductsErrorHandlingTest';
import DeleteFunctionsErrorHandlingTest from '../components/examples/DeleteFunctionsErrorHandlingTest';

/**
 * Comprehensive test page for specification display functionality
 */
const SpecificationDisplayTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isRTL ? 'اختبار عرض المواصفات' : 'Specification Display Test'}
          </h1>
          <p className="text-lg text-gray-600">
            {isRTL 
              ? 'اختبار شامل لعرض مواصفات المنتجات والمتغيرات باللغتين العربية والإنجليزية'
              : 'Comprehensive test for displaying product and variant specifications in Arabic and English'
            }
          </p>
        </div>

        <div className="space-y-8">
          {/* Delete Functions Error Handling Test */}
          <DeleteFunctionsErrorHandlingTest />
          
          {/* UseProducts Error Handling Test */}
          <UseProductsErrorHandlingTest />
          
          {/* POS Error Handling Test */}
          <POSErrorHandlingTest />
          
          {/* Real-Time Barcode Validation Test */}
          <RealTimeBarcodeValidationTest />
          
          {/* ProductsForm Specification Test */}
          <ProductsFormSpecificationTest />
          
          {/* Complete API Data Test */}
          <CompleteAPIDataTest />
          
          {/* Real Data Specification Test */}
          <RealDataSpecificationTest />
          
          {/* Product Specification Display Test */}
          <ProductSpecificationDisplayTest />
          
          {/* VariantsPopup Specification Display Test */}
          <VariantsPopupSpecificationTest />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            {isRTL ? 'تعليمات الاختبار:' : 'Test Instructions:'}
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              {isRTL 
                ? '1. استخدم أزرار التبديل لتغيير اللغة بين العربية والإنجليزية'
                : '1. Use the toggle buttons to switch between Arabic and English languages'
              }
            </p>
            <p>
              {isRTL 
                ? '2. تحقق من أن المواصفات تظهر باللغة الصحيحة'
                : '2. Verify that specifications display in the correct language'
              }
            </p>
            <p>
              {isRTL 
                ? '3. تأكد من أن النتائج المتوقعة والفعيلة متطابقة'
                : '3. Ensure that expected and actual results match'
              }
            </p>
            <p>
              {isRTL 
                ? '4. تحقق من أن عرض الجدول يعمل بشكل صحيح'
                : '4. Verify that table display works correctly'
              }
            </p>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isRTL ? 'معلومات التصحيح:' : 'Debug Information:'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">
                {isRTL ? 'إعدادات اللغة:' : 'Language Settings:'}
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>Current Language: {i18n.language}</li>
                <li>isRTL: {isRTL ? 'true' : 'false'}</li>
                <li>Direction: {isRTL ? 'RTL' : 'LTR'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">
                {isRTL ? 'مكونات الاختبار:' : 'Test Components:'}
              </h3>
              <ul className="space-y-1 text-gray-700">
                <li>ProductSpecificationDisplayTest</li>
                <li>VariantsPopupSpecificationTest</li>
                <li>formatSpecificationValues utility</li>
                <li>getSpecificationDisplay utility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationDisplayTest;
