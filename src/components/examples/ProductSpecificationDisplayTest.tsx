import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSpecificationValues, getSpecificationDisplay } from '../../utils/specificationUtils';

/**
 * Test component for product specification display functionality
 */
const ProductSpecificationDisplayTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [currentLanguage, setCurrentLanguage] = useState(isRTL);

  // Test data matching your API response structure
  const testProduct = {
    nameAr: "بيجامة ستاتية22",
    nameEn: "BAJAMA22",
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

  const getFormattedSpecifications = () => {
    return formatSpecificationValues(testProduct.specificationValues, currentLanguage);
  };

  const getIndividualSpecification = () => {
    return getSpecificationDisplay(testProduct.specificationValues[0], currentLanguage);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isRTL ? 'اختبار عرض مواصفات المنتج' : 'Product Specification Display Test'}
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

        {/* Product Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'معلومات المنتج:' : 'Product Information:'}
          </h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">{isRTL ? 'الاسم العربي:' : 'Arabic Name:'}</span> {testProduct.nameAr}</p>
            <p><span className="font-medium">{isRTL ? 'الاسم الإنجليزي:' : 'English Name:'}</span> {testProduct.nameEn}</p>
          </div>
        </div>

        {/* Specification Values Raw Data */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'بيانات المواصفات الخام:' : 'Raw Specification Data:'}
          </h3>
          <div className="text-xs font-mono bg-white p-2 rounded overflow-x-auto">
            <pre>{JSON.stringify(testProduct.specificationValues, null, 2)}</pre>
          </div>
        </div>

        {/* Formatted Specifications */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            {isRTL ? 'المواصفات المنسقة:' : 'Formatted Specifications:'}
          </h3>
          <p className="text-sm font-semibold bg-white p-2 rounded">
            {getFormattedSpecifications()}
          </p>
        </div>

        {/* Individual Specification Display */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">
            {isRTL ? 'عرض المواصفة الواحدة:' : 'Individual Specification Display:'}
          </h3>
          {(() => {
            const specDisplay = getIndividualSpecification();
            return (
              <div className="text-sm space-y-1">
                <p><span className="font-medium">{isRTL ? 'العنوان:' : 'Title:'}</span> {specDisplay.title}</p>
                <p><span className="font-medium">{isRTL ? 'القيمة:' : 'Value:'}</span> {specDisplay.value}</p>
                <p><span className="font-medium">{isRTL ? 'النص الكامل:' : 'Full Text:'}</span> {specDisplay.fullText}</p>
              </div>
            );
          })()}
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
                  ? `${testProduct.specificationValues[0].titleAr}: ${testProduct.specificationValues[0].valueAr}` 
                  : `${testProduct.specificationValues[0].titleEn}: ${testProduct.specificationValues[0].valueEn}`
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">
                {isRTL ? 'الفعلي:' : 'Actual:'}
              </h4>
              <p className="text-gray-700">
                {getFormattedSpecifications()}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs ${
              getFormattedSpecifications() === (currentLanguage 
                ? `${testProduct.specificationValues[0].titleAr}: ${testProduct.specificationValues[0].valueAr}` 
                : `${testProduct.specificationValues[0].titleEn}: ${testProduct.specificationValues[0].valueEn}`
              )
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {getFormattedSpecifications() === (currentLanguage 
                ? `${testProduct.specificationValues[0].titleAr}: ${testProduct.specificationValues[0].valueAr}` 
                : `${testProduct.specificationValues[0].titleEn}: ${testProduct.specificationValues[0].valueEn}`
              ) 
                ? (isRTL ? '✅ صحيح' : '✅ Correct') 
                : (isRTL ? '❌ خطأ' : '❌ Incorrect')
              }
            </span>
          </div>
        </div>

        {/* Table Display Simulation */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'محاكاة عرض الجدول:' : 'Table Display Simulation:'}
          </h3>
          <div className="bg-white rounded border p-3">
            <div className="flex flex-wrap gap-1">
              {getFormattedSpecifications().split(', ').map((spec: string, index: number) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSpecificationDisplayTest;

