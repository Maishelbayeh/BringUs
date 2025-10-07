import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatSpecificationValues, getSpecificationDisplay } from '../../utils/specificationUtils';

/**
 * Example component demonstrating how specification values are displayed
 * with proper language support
 */
const SpecificationDisplayExample: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';

  // Example data from your API response
  const exampleProduct = {
    nameAr: "بيجامة ستاتية22",
    nameEn: "BAJAMA22",
    specificationValues: [
      {
        title: "SIZE",
        titleAr: "الحجم",
        titleEn: "Size",
        value: "سمول",
        valueAr: "صغير",
        valueEn: "Small"
      }
    ]
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isRTL ? 'عرض المواصفات' : 'Specification Display Example'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">
            {isRTL ? 'المنتج:' : 'Product:'} {isRTL ? exampleProduct.nameAr : exampleProduct.nameEn}
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">
              {isRTL ? 'المواصفات (طريقة قديمة):' : 'Specifications (Old Method):'}
            </h4>
            <p className="text-sm text-gray-700">
              {exampleProduct.specificationValues.map(spec => 
                `${spec.title}: ${spec.value}`
              ).join(', ')}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mt-2">
            <h4 className="font-medium mb-2">
              {isRTL ? 'المواصفات (طريقة جديدة):' : 'Specifications (New Method):'}
            </h4>
            <p className="text-sm text-gray-700">
              {formatSpecificationValues(exampleProduct.specificationValues, isRTL)}
            </p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">
            {isRTL ? 'تفاصيل المواصفة الواحدة:' : 'Individual Specification Details:'}
          </h4>
          {exampleProduct.specificationValues.map((spec, index) => {
            const display = getSpecificationDisplay(spec, isRTL);
            return (
              <div key={index} className="bg-green-50 p-3 rounded mb-2">
                <p className="text-sm">
                  <span className="font-medium">{isRTL ? 'العنوان:' : 'Title:'}</span> {display.title}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{isRTL ? 'القيمة:' : 'Value:'}</span> {display.value}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{isRTL ? 'النص الكامل:' : 'Full Text:'}</span> {display.fullText}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpecificationDisplayExample;

