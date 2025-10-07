import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSpecificationValues, getSpecificationDisplay } from '../../utils/specificationUtils';

/**
 * Test component using real API data structure
 */
const RealDataSpecificationTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [currentLanguage, setCurrentLanguage] = useState(isRTL);

  // Real API data structure from your example
  const realApiData = {
    "specificationValues": [
      {
        "specificationId": "689db17bcaf6f986517d8db8",
        "valueId": "689db17bcaf6f986517d8db8_0",
        "value": "30مل",
        "title": "الحجم",
        "titleAr": "الحجم",
        "titleEn": "Size",
        "valueAr": "30مل",
        "valueEn": "30ml",
        "quantity": 4,
        "price": 0
      }
    ]
  };

  const toggleLanguage = () => {
    setCurrentLanguage(!currentLanguage);
  };

  const getFormattedSpecifications = () => {
    return formatSpecificationValues(realApiData.specificationValues, currentLanguage);
  };

  const getIndividualSpecification = () => {
    return getSpecificationDisplay(realApiData.specificationValues[0], currentLanguage);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isRTL ? 'اختبار البيانات الحقيقية' : 'Real Data Test'}
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

        {/* Raw API Data */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'بيانات API الخام:' : 'Raw API Data:'}
          </h3>
          <div className="text-xs font-mono bg-white p-2 rounded overflow-x-auto">
            <pre>{JSON.stringify(realApiData, null, 2)}</pre>
          </div>
        </div>

        {/* Expected Results */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            {isRTL ? 'النتائج المتوقعة:' : 'Expected Results:'}
          </h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">{isRTL ? 'العربية:' : 'Arabic:'}</span> الحجم: 30مل</p>
            <p><span className="font-medium">{isRTL ? 'الإنجليزية:' : 'English:'}</span> Size: 30ml</p>
          </div>
        </div>

        {/* Actual Results */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">
            {isRTL ? 'النتائج الفعلية:' : 'Actual Results:'}
          </h3>
          <div className="text-sm space-y-2">
            <p><span className="font-medium">{isRTL ? 'المواصفات المنسقة:' : 'Formatted Specifications:'}</span></p>
            <p className="bg-white p-2 rounded font-semibold">
              {getFormattedSpecifications()}
            </p>
            
            <p><span className="font-medium">{isRTL ? 'عرض المواصفة الواحدة:' : 'Individual Specification:'}</span></p>
            {(() => {
              const specDisplay = getIndividualSpecification();
              return (
                <div className="bg-white p-2 rounded space-y-1">
                  <p><span className="font-medium">Title:</span> {specDisplay.title}</p>
                  <p><span className="font-medium">Value:</span> {specDisplay.value}</p>
                  <p><span className="font-medium">Full Text:</span> {specDisplay.fullText}</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Validation */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">
            {isRTL ? 'التحقق من الصحة:' : 'Validation:'}
          </h3>
          <div className="space-y-2">
            {(() => {
              const expected = currentLanguage 
                ? 'الحجم: 30مل' 
                : 'Size: 30ml';
              const actual = getFormattedSpecifications();
              const isCorrect = actual === expected;
              
              return (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                    </span>
                    <span className="text-sm">
                      {isRTL ? 'النتيجة صحيحة' : 'Result is correct'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="font-medium">Expected:</span> {expected}</p>
                    <p><span className="font-medium">Actual:</span> {actual}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'معلومات التصحيح:' : 'Debug Information:'}
          </h3>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Current Language:</span> {currentLanguage ? 'Arabic' : 'English'}</p>
            <p><span className="font-medium">titleAr:</span> {realApiData.specificationValues[0].titleAr}</p>
            <p><span className="font-medium">titleEn:</span> {realApiData.specificationValues[0].titleEn}</p>
            <p><span className="font-medium">valueAr:</span> {realApiData.specificationValues[0].valueAr}</p>
            <p><span className="font-medium">valueEn:</span> {realApiData.specificationValues[0].valueEn}</p>
            <p><span className="font-medium">Selected Title:</span> {getSpecificationDisplay(realApiData.specificationValues[0], currentLanguage).title}</p>
            <p><span className="font-medium">Selected Value:</span> {getSpecificationDisplay(realApiData.specificationValues[0], currentLanguage).value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealDataSpecificationTest;

