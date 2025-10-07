import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSpecificationDisplay, getSpecificationTitle, getSpecificationValue } from '../../utils/specificationUtils';

/**
 * Test component for specification display functionality
 */
const SpecificationDisplayTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [currentLanguage, setCurrentLanguage] = useState(isRTL);

  // Test data matching your API response structure
  const testSpecification = {
    "specificationId": "689db1c1caf6f986517d8dcd",
    "valueId": "689db1c1caf6f986517d8dcd_0",
    "value": "قصيرة",
    "title": "Longevity",
    "quantity": 5,
    "price": 0,
    "_id": "68d1137a148283dd7175e5b5",
    "id": "68d1137a148283dd7175e5b5",
    "titleAr": "المدة الزمنية",
    "titleEn": "Longevity",
    "valueAr": "قصيرة",
    "valueEn": "Short"
  };

  const toggleLanguage = () => {
    setCurrentLanguage(!currentLanguage);
  };

  const getDisplayResult = () => {
    return getSpecificationDisplay(testSpecification, currentLanguage);
  };

  const getTitleResult = () => {
    return getSpecificationTitle(testSpecification, currentLanguage);
  };

  const getValueResult = () => {
    return getSpecificationValue(testSpecification, currentLanguage);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isRTL ? 'اختبار عرض المواصفات' : 'Specification Display Test'}
        </h2>
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {currentLanguage ? 'Switch to English' : 'التبديل إلى العربية'}
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Current Language Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            {isRTL ? 'اللغة الحالية:' : 'Current Language:'}
          </h3>
          <p className="text-sm">
            {currentLanguage ? 'العربية (RTL)' : 'English (LTR)'}
          </p>
        </div>

        {/* Test Data */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'بيانات الاختبار:' : 'Test Data:'}
          </h3>
          <div className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
            <pre>{JSON.stringify(testSpecification, null, 2)}</pre>
          </div>
        </div>

        {/* Function Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Title Result */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-800 mb-2">
              {isRTL ? 'العنوان:' : 'Title:'}
            </h4>
            <p className="text-sm font-semibold">
              {getTitleResult()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {currentLanguage ? 'titleAr' : 'titleEn'}: {currentLanguage ? testSpecification.titleAr : testSpecification.titleEn}
            </p>
          </div>

          {/* Value Result */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-2">
              {isRTL ? 'القيمة:' : 'Value:'}
            </h4>
            <p className="text-sm font-semibold">
              {getValueResult()}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {currentLanguage ? 'valueAr' : 'valueEn'}: {currentLanguage ? testSpecification.valueAr : testSpecification.valueEn}
            </p>
          </div>

          {/* Full Text Result */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-medium text-purple-800 mb-2">
              {isRTL ? 'النص الكامل:' : 'Full Text:'}
            </h4>
            <p className="text-sm font-semibold">
              {getDisplayResult().fullText}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {isRTL ? 'المدة الزمنية: قصيرة' : 'Longevity: Short'}
            </p>
          </div>
        </div>

        {/* Expected vs Actual */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">
            {isRTL ? 'المتوقع مقابل الفعلي:' : 'Expected vs Actual:'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">
                {isRTL ? 'المتوقع:' : 'Expected:'}
              </h4>
              <p className="text-gray-700">
                {currentLanguage 
                  ? `${testSpecification.titleAr}: ${testSpecification.valueAr}` 
                  : `${testSpecification.titleEn}: ${testSpecification.valueEn}`
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">
                {isRTL ? 'الفعلي:' : 'Actual:'}
              </h4>
              <p className="text-gray-700">
                {getDisplayResult().fullText}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs ${
              getDisplayResult().fullText === (currentLanguage 
                ? `${testSpecification.titleAr}: ${testSpecification.valueAr}` 
                : `${testSpecification.titleEn}: ${testSpecification.valueEn}`
              )
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {getDisplayResult().fullText === (currentLanguage 
                ? `${testSpecification.titleAr}: ${testSpecification.valueAr}` 
                : `${testSpecification.titleEn}: ${testSpecification.valueEn}`
              ) 
                ? (isRTL ? '✅ صحيح' : '✅ Correct') 
                : (isRTL ? '❌ خطأ' : '❌ Incorrect')
              }
            </span>
          </div>
        </div>

        {/* Raw Function Output */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'مخرجات الدالة الخام:' : 'Raw Function Output:'}
          </h3>
          <div className="text-xs font-mono bg-white p-2 rounded">
            <pre>{JSON.stringify(getDisplayResult(), null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationDisplayTest;

