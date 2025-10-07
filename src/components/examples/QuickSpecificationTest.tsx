import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSpecificationValues, getSpecificationDisplay } from '../../utils/specificationUtils';

/**
 * Quick test component to verify specification display with real API data
 */
const QuickSpecificationTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';

  // Your exact API data structure
  const testData = [
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
  ];

  const [currentLanguage, setCurrentLanguage] = useState(isRTL);

  const toggleLanguage = () => {
    setCurrentLanguage(!currentLanguage);
  };

  return (
    <div className="p-4 bg-white border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {isRTL ? 'اختبار سريع للمواصفات' : 'Quick Specification Test'}
        </h3>
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          {currentLanguage ? 'EN' : 'AR'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Current Language */}
        <div className="text-sm">
          <span className="font-medium">
            {isRTL ? 'اللغة:' : 'Language:'}
          </span>
          <span className="ml-2">
            {currentLanguage ? 'العربية' : 'English'}
          </span>
        </div>

        {/* Expected vs Actual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-sm mb-1">
              {isRTL ? 'المتوقع:' : 'Expected:'}
            </h4>
            <p className="text-sm">
              {currentLanguage ? 'الحجم: 30مل' : 'Size: 30ml'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium text-sm mb-1">
              {isRTL ? 'الفعلي:' : 'Actual:'}
            </h4>
            <p className="text-sm">
              {formatSpecificationValues(testData, currentLanguage)}
            </p>
          </div>
        </div>

        {/* Individual Specification */}
        <div className="bg-blue-50 p-3 rounded">
          <h4 className="font-medium text-sm mb-1">
            {isRTL ? 'عرض المواصفة الواحدة:' : 'Individual Specification:'}
          </h4>
          {(() => {
            const specDisplay = getSpecificationDisplay(testData[0], currentLanguage);
            return (
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Title:</span> {specDisplay.title}</p>
                <p><span className="font-medium">Value:</span> {specDisplay.value}</p>
                <p><span className="font-medium">Full:</span> {specDisplay.fullText}</p>
              </div>
            );
          })()}
        </div>

        {/* Validation */}
        <div className="text-center">
          {(() => {
            const expected = currentLanguage ? 'الحجم: 30مل' : 'Size: 30ml';
            const actual = formatSpecificationValues(testData, currentLanguage);
            const isCorrect = actual === expected;
            
            return (
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                isCorrect 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isCorrect ? '✅ Correct' : '❌ Incorrect'}
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default QuickSpecificationTest;

