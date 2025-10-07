import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSpecificationDisplay } from '../../utils/specificationUtils';

/**
 * Test component for VariantsPopup specification display functionality
 */
const VariantsPopupSpecificationTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [currentLanguage, setCurrentLanguage] = useState(isRTL);

  // Test data matching your API response structure
  const testVariant = {
    nameAr: "بيجامة ستاتية22 - متغير",
    nameEn: "BAJAMA22 - Variant",
    specificationValues: [
      {
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
      }
    ]
  };

  const toggleLanguage = () => {
    setCurrentLanguage(!currentLanguage);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isRTL ? 'اختبار عرض مواصفات المتغيرات' : 'Variant Specification Display Test'}
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

        {/* Variant Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'معلومات المتغير:' : 'Variant Information:'}
          </h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">{isRTL ? 'الاسم العربي:' : 'Arabic Name:'}</span> {testVariant.nameAr}</p>
            <p><span className="font-medium">{isRTL ? 'الاسم الإنجليزي:' : 'English Name:'}</span> {testVariant.nameEn}</p>
          </div>
        </div>

        {/* Specification Values Raw Data */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'بيانات المواصفات الخام:' : 'Raw Specification Data:'}
          </h3>
          <div className="text-xs font-mono bg-white p-2 rounded overflow-x-auto">
            <pre>{JSON.stringify(testVariant.specificationValues, null, 2)}</pre>
          </div>
        </div>

        {/* VariantsPopup Style Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            {isRTL ? 'عرض متغيرات المنتج (نمط VariantsPopup):' : 'Variant Display (VariantsPopup Style):'}
          </h3>
          <div className="space-y-2">
            {testVariant.specificationValues.map((spec: any, index: number) => {
              const specDisplay = getSpecificationDisplay(spec, currentLanguage);
              return (
                <div key={index} className="bg-white p-3 rounded border">
                  <span className={`text-sm font-medium text-purple-800 ${currentLanguage ? 'text-right' : 'text-left'}`}>
                    {specDisplay.fullText}
                  </span>
                </div>
              );
            })}
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
                  ? `${testVariant.specificationValues[0].titleAr}: ${testVariant.specificationValues[0].valueAr}` 
                  : `${testVariant.specificationValues[0].titleEn}: ${testVariant.specificationValues[0].valueEn}`
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">
                {isRTL ? 'الفعلي:' : 'Actual:'}
              </h4>
              <p className="text-gray-700">
                {getSpecificationDisplay(testVariant.specificationValues[0], currentLanguage).fullText}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs ${
              getSpecificationDisplay(testVariant.specificationValues[0], currentLanguage).fullText === (currentLanguage 
                ? `${testVariant.specificationValues[0].titleAr}: ${testVariant.specificationValues[0].valueAr}` 
                : `${testVariant.specificationValues[0].titleEn}: ${testVariant.specificationValues[0].valueEn}`
              )
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {getSpecificationDisplay(testVariant.specificationValues[0], currentLanguage).fullText === (currentLanguage 
                ? `${testVariant.specificationValues[0].titleAr}: ${testVariant.specificationValues[0].valueAr}` 
                : `${testVariant.specificationValues[0].titleEn}: ${testVariant.specificationValues[0].valueEn}`
              ) 
                ? (isRTL ? '✅ صحيح' : '✅ Correct') 
                : (isRTL ? '❌ خطأ' : '❌ Incorrect')
              }
            </span>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">
            {isRTL ? 'معلومات التصحيح:' : 'Debug Information:'}
          </h3>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Current Language:</span> {currentLanguage ? 'Arabic' : 'English'}</p>
            <p><span className="font-medium">Specification Title (Ar):</span> {testVariant.specificationValues[0].titleAr}</p>
            <p><span className="font-medium">Specification Title (En):</span> {testVariant.specificationValues[0].titleEn}</p>
            <p><span className="font-medium">Specification Value (Ar):</span> {testVariant.specificationValues[0].valueAr}</p>
            <p><span className="font-medium">Specification Value (En):</span> {testVariant.specificationValues[0].valueEn}</p>
            <p><span className="font-medium">Display Title:</span> {getSpecificationDisplay(testVariant.specificationValues[0], currentLanguage).title}</p>
            <p><span className="font-medium">Display Value:</span> {getSpecificationDisplay(testVariant.specificationValues[0], currentLanguage).value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantsPopupSpecificationTest;

