import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SpecificationSelector from '../common/SpecificationSelector';

/**
 * Test component for ProductsForm specification display functionality
 */
const ProductsFormSpecificationTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [currentLanguage, setCurrentLanguage] = useState(isRTL);

  // Mock specifications data matching your API structure
  const mockSpecifications = [
    {
      _id: "689db17bcaf6f986517d8db8",
      titleAr: "الحجم",
      titleEn: "Size",
      values: [
        { valueAr: "120مل", valueEn: "120ml" },
        { valueAr: "30مل", valueEn: "30ml" },
        { valueAr: "60مل", valueEn: "60ml" }
      ],
      store: "689cf88b3b39c7069a48cd0f",
      isActive: true,
      sortOrder: 1
    },
    {
      _id: "689db1c1caf6f986517d8dcd",
      titleAr: "مدة الثبات",
      titleEn: "Longevity",
      values: [
        { valueAr: "قصيرة", valueEn: "short" },
        { valueAr: "متوسطة", valueEn: "medium" },
        { valueAr: "طويلة", valueEn: "long" }
      ],
      store: "689cf88b3b39c7069a48cd0f",
      isActive: true,
      sortOrder: 2
    },
    {
      _id: "689db206caf6f986517d8de6",
      titleAr: "التغليف",
      titleEn: "Packaging",
      values: [
        { valueAr: "زجاجة", valueEn: "Bottle" },
        { valueAr: "عبوة", valueEn: "Package" },
        { valueAr: "صندوق", valueEn: "Box" }
      ],
      store: "689cf88b3b39c7069a48cd0f",
      isActive: true,
      sortOrder: 3
    }
  ];

  const [selectedSpecifications, setSelectedSpecifications] = useState<any[]>([]);

  const toggleLanguage = () => {
    setCurrentLanguage(!currentLanguage);
  };

  const handleSpecificationChange = (specifications: any[]) => {
    console.log('🔍 Specification change:', specifications);
    setSelectedSpecifications(specifications);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isRTL ? 'اختبار مواصفات نموذج المنتج' : 'ProductsForm Specification Test'}
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

        {/* Expected Results */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            {isRTL ? 'النتائج المتوقعة:' : 'Expected Results:'}
          </h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">{isRTL ? 'العربية:' : 'Arabic:'}</span></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>الحجم: 120مل, 30مل, 60مل</li>
              <li>مدة الثبات: قصيرة, متوسطة, طويلة</li>
              <li>التغليف: زجاجة, عبوة, صندوق</li>
            </ul>
            <p><span className="font-medium">{isRTL ? 'الإنجليزية:' : 'English:'}</span></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Size: 120ml, 30ml, 60ml</li>
              <li>Longevity: short, medium, long</li>
              <li>Packaging: Bottle, Package, Box</li>
            </ul>
          </div>
        </div>

        {/* SpecificationSelector Component */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">
            {isRTL ? 'مكون اختيار المواصفات:' : 'SpecificationSelector Component:'}
          </h3>
          <div className="bg-white p-4 rounded border">
            <SpecificationSelector
              specifications={mockSpecifications}
              selectedSpecifications={selectedSpecifications}
              onSpecificationChange={handleSpecificationChange}
              isRTL={currentLanguage}
            />
          </div>
        </div>

        {/* Selected Specifications Display */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">
            {isRTL ? 'المواصفات المختارة:' : 'Selected Specifications:'}
          </h3>
          {selectedSpecifications.length > 0 ? (
            <div className="space-y-2">
              {selectedSpecifications.map((spec, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">{isRTL ? 'المواصفة:' : 'Specification:'}</span> {spec.specId}</p>
                    <p><span className="font-medium">{isRTL ? 'القيمة:' : 'Value:'}</span> {spec.value}</p>
                    <p><span className="font-medium">{isRTL ? 'الكمية:' : 'Quantity:'}</span> {spec.quantity}</p>
                    <p><span className="font-medium">{isRTL ? 'السعر:' : 'Price:'}</span> {spec.price}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              {isRTL ? 'لم يتم اختيار أي مواصفات' : 'No specifications selected'}
            </p>
          )}
        </div>

        {/* Debug Information */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'معلومات التصحيح:' : 'Debug Information:'}
          </h3>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Current Language:</span> {currentLanguage ? 'Arabic' : 'English'}</p>
            <p><span className="font-medium">Selected Count:</span> {selectedSpecifications.length}</p>
            <p><span className="font-medium">Specifications Available:</span> {mockSpecifications.length}</p>
            <div className="mt-2">
              <p className="font-medium">Raw Selected Data:</p>
              <pre className="bg-white p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(selectedSpecifications, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'تعليمات الاختبار:' : 'Test Instructions:'}
          </h3>
          <div className="text-sm space-y-1">
            <p>1. {isRTL ? 'استخدم أزرار التبديل لتغيير اللغة' : 'Use toggle buttons to change language'}</p>
            <p>2. {isRTL ? 'اختر مواصفات مختلفة من القائمة' : 'Select different specifications from the list'}</p>
            <p>3. {isRTL ? 'تحقق من أن القيم تظهر باللغة الصحيحة' : 'Verify that values display in the correct language'}</p>
            <p>4. {isRTL ? 'استخدم زر الملخص لعرض المواصفات المختارة' : 'Use the summary button to view selected specifications'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsFormSpecificationTest;

