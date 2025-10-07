import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSpecificationValues, getSpecificationDisplay } from '../../utils/specificationUtils';

/**
 * Test component using complete real API data
 */
const CompleteAPIDataTest: React.FC = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [currentLanguage, setCurrentLanguage] = useState(isRTL);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Complete API data from your response
  const apiData = {
    "success": true,
    "data": [
      {
        "_id": "689db56ccaf6f986517d8eb9",
        "nameAr": "عطر فرزاتشي النسائي",
        "nameEn": "Bright Crystal Perfume",
        "specificationValues": [
          {
            "specificationId": "689db17bcaf6f986517d8db8",
            "valueId": "689db17bcaf6f986517d8db8_3",
            "value": "120مل",
            "title": "size",
            "quantity": 4,
            "price": 0,
            "_id": "68ca4ffa61ef1f9112668f5d",
            "id": "68ca4ffa61ef1f9112668f5d",
            "titleAr": "الحجم",
            "titleEn": "size",
            "valueAr": "120مل",
            "valueEn": "120ml"
          },
          {
            "specificationId": "689db17bcaf6f986517d8db8",
            "valueId": "689db17bcaf6f986517d8db8_0",
            "value": "30مل",
            "title": "size",
            "quantity": 5,
            "price": 0,
            "_id": "68ca4ffa61ef1f9112668f5e",
            "id": "68ca4ffa61ef1f9112668f5e",
            "titleAr": "الحجم",
            "titleEn": "size",
            "valueAr": "30مل",
            "valueEn": "30ml"
          },
          {
            "specificationId": "689db206caf6f986517d8de6",
            "valueId": "689db206caf6f986517d8de6_0",
            "value": "Bottle",
            "title": "Packaging",
            "quantity": 4,
            "price": 3,
            "_id": "68ca4ffa61ef1f9112668f5f",
            "id": "68ca4ffa61ef1f9112668f5f",
            "titleAr": "التغليف",
            "titleEn": "Packaging",
            "valueAr": "زجاجة",
            "valueEn": "Bottle"
          }
        ]
      },
      {
        "_id": "689dd0119b347d8b52a55755",
        "nameAr": "عطر ارماف الاصلي للرجال",
        "nameEn": "Club de Nuit Intense for Men",
        "specificationValues": [
          {
            "specificationId": "689db1c1caf6f986517d8dcd",
            "valueId": "689db1c1caf6f986517d8dcd_0",
            "value": "قصيرة",
            "title": "Longevity",
            "quantity": 5,
            "price": 0,
            "_id": "68d1137a148283dd7175e5b5",
            "id": "68d1137a148283dd7175e5b5",
            "titleAr": "مدة الثبات",
            "titleEn": "Longevity",
            "valueAr": "قصيرة",
            "valueEn": "short"
          },
          {
            "specificationId": "689db1c1caf6f986517d8dcd",
            "valueId": "689db1c1caf6f986517d8dcd_2",
            "value": "طويلة",
            "title": "Longevity",
            "quantity": 12,
            "price": 0,
            "_id": "68d1137a148283dd7175e5b6",
            "id": "68d1137a148283dd7175e5b6",
            "titleAr": "مدة الثبات",
            "titleEn": "Longevity",
            "valueAr": "طويلة",
            "valueEn": "long"
          },
          {
            "specificationId": "689db1c1caf6f986517d8dcd",
            "valueId": "689db1c1caf6f986517d8dcd_1",
            "value": "متوسطة",
            "title": "Longevity",
            "quantity": 10,
            "price": 0,
            "_id": "68d1137a148283dd7175e5b7",
            "id": "68d1137a148283dd7175e5b7",
            "titleAr": "مدة الثبات",
            "titleEn": "Longevity",
            "valueAr": "متوسطة",
            "valueEn": "medium"
          }
        ]
      },
      {
        "_id": "689de11a873f98525edb2e7c",
        "nameAr": "عطر فيرزاتشي مع بخاخ",
        "nameEn": "Perfume",
        "specificationValues": [
          {
            "specificationId": "689db17bcaf6f986517d8db8",
            "valueId": "689db17bcaf6f986517d8db8_0",
            "value": "30مل",
            "title": "الحجم",
            "quantity": 4,
            "price": 0,
            "_id": "68c00e949cd4514a30c0267e",
            "id": "68c00e949cd4514a30c0267e",
            "titleAr": "الحجم",
            "titleEn": "size",
            "valueAr": "30مل",
            "valueEn": "30ml"
          }
        ]
      },
      {
        "_id": "689de4f5873f98525edb39b6",
        "nameAr": "عطر كالو للأطفال",
        "nameEn": "Kalo Kids Perfume",
        "specificationValues": [
          {
            "specificationId": "689db28ccaf6f986517d8e05",
            "valueId": "689db28ccaf6f986517d8e05_0",
            "value": "زهور",
            "title": "المكونات الأساسية",
            "quantity": 3,
            "price": 0,
            "_id": "68c7dda06a99b507e3f6b348",
            "id": "68c7dda06a99b507e3f6b348",
            "titleAr": "المكونات الأساسية",
            "titleEn": "Main Notes",
            "valueAr": "زهور",
            "valueEn": "Floral"
          },
          {
            "specificationId": "689db28ccaf6f986517d8e05",
            "valueId": "689db28ccaf6f986517d8e05_1",
            "value": "فواكه",
            "title": "المكونات الأساسية",
            "quantity": 3,
            "price": 0,
            "_id": "68c7dda06a99b507e3f6b349",
            "id": "68c7dda06a99b507e3f6b349",
            "titleAr": "المكونات الأساسية",
            "titleEn": "Main Notes",
            "valueAr": "فواكه",
            "valueEn": "Fruits"
          },
          {
            "specificationId": "689db28ccaf6f986517d8e05",
            "valueId": "689db28ccaf6f986517d8e05_3",
            "value": "مسك",
            "title": "المكونات الأساسية",
            "quantity": 2,
            "price": 0,
            "_id": "68c7dda06a99b507e3f6b34a",
            "id": "68c7dda06a99b507e3f6b34a",
            "titleAr": "المكونات الأساسية",
            "titleEn": "Main Notes",
            "valueAr": "مسك",
            "valueEn": "Musk"
          },
          {
            "specificationId": "689db28ccaf6f986517d8e05",
            "valueId": "689db28ccaf6f986517d8e05_2",
            "value": "توابل",
            "title": "المكونات الأساسية",
            "quantity": 1,
            "price": 0,
            "_id": "68c7dda06a99b507e3f6b34b",
            "id": "68c7dda06a99b507e3f6b34b",
            "titleAr": "المكونات الأساسية",
            "titleEn": "Main Notes",
            "valueAr": "توابل",
            "valueEn": "Spices"
          },
          {
            "specificationId": "689db28ccaf6f986517d8e05",
            "valueId": "689db28ccaf6f986517d8e05_4",
            "value": "عنبر",
            "title": "المكونات الأساسية",
            "quantity": 11,
            "price": 0,
            "_id": "68c7dda06a99b507e3f6b34c",
            "id": "68c7dda06a99b507e3f6b34c",
            "titleAr": "المكونات الأساسية",
            "titleEn": "Main Notes",
            "valueAr": "عنبر",
            "valueEn": "Amber"
          }
        ]
      },
      {
        "_id": "68c7e0736a99b507e3f6b751",
        "nameAr": "عطر ايفوريا",
        "nameEn": "Euphoria Perfume",
        "specificationValues": [
          {
            "specificationId": "689db28ccaf6f986517d8e05",
            "valueId": "689db28ccaf6f986517d8e05_0",
            "value": "Floral",
            "title": "Main Notes",
            "quantity": 10,
            "price": 0,
            "_id": "68ca775d61ef1f911266a7ce",
            "id": "68ca775d61ef1f911266a7ce",
            "titleAr": "المكونات الأساسية",
            "titleEn": "Main Notes",
            "valueAr": "زهور",
            "valueEn": "Floral"
          },
          {
            "specificationId": "689db28ccaf6f986517d8e05",
            "valueId": "689db28ccaf6f986517d8e05_2",
            "value": "Spices",
            "title": "Main Notes",
            "quantity": 7,
            "price": 0,
            "_id": "68ca775d61ef1f911266a7cf",
            "id": "68ca775d61ef1f911266a7cf",
            "titleAr": "المكونات الأساسية",
            "titleEn": "Main Notes",
            "valueAr": "توابل",
            "valueEn": "Spices"
          },
          {
            "specificationId": "689db1c1caf6f986517d8dcd",
            "valueId": "689db1c1caf6f986517d8dcd_1",
            "value": "medium",
            "title": "Longevity",
            "quantity": 12,
            "price": 12,
            "_id": "68ca775d61ef1f911266a7d0",
            "id": "68ca775d61ef1f911266a7d0",
            "titleAr": "مدة الثبات",
            "titleEn": "Longevity",
            "valueAr": "متوسطة",
            "valueEn": "medium"
          },
          {
            "specificationId": "689db1c1caf6f986517d8dcd",
            "valueId": "689db1c1caf6f986517d8dcd_0",
            "value": "short",
            "title": "Longevity",
            "quantity": 15,
            "price": 10,
            "_id": "68ca775d61ef1f911266a7d1",
            "id": "68ca775d61ef1f911266a7d1",
            "titleAr": "مدة الثبات",
            "titleEn": "Longevity",
            "valueAr": "قصيرة",
            "valueEn": "short"
          }
        ]
      }
    ]
  };

  const toggleLanguage = () => {
    setCurrentLanguage(!currentLanguage);
  };

  const currentProduct = apiData.data[selectedProductIndex];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {isRTL ? 'اختبار البيانات الكاملة من API' : 'Complete API Data Test'}
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

        {/* Product Selection */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'اختيار المنتج:' : 'Select Product:'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {apiData.data.map((product, index) => (
              <button
                key={product._id}
                onClick={() => setSelectedProductIndex(index)}
                className={`p-2 text-sm rounded border ${
                  selectedProductIndex === index
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {currentLanguage ? product.nameAr : product.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Product Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            {isRTL ? 'معلومات المنتج المحدد:' : 'Selected Product Info:'}
          </h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">{isRTL ? 'الاسم العربي:' : 'Arabic Name:'}</span> {currentProduct.nameAr}</p>
            <p><span className="font-medium">{isRTL ? 'الاسم الإنجليزي:' : 'English Name:'}</span> {currentProduct.nameEn}</p>
            <p><span className="font-medium">{isRTL ? 'عدد المواصفات:' : 'Specifications Count:'}</span> {currentProduct.specificationValues.length}</p>
          </div>
        </div>

        {/* Raw Specification Data */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            {isRTL ? 'بيانات المواصفات الخام:' : 'Raw Specification Data:'}
          </h3>
          <div className="text-xs font-mono bg-white p-2 rounded overflow-x-auto max-h-40">
            <pre>{JSON.stringify(currentProduct.specificationValues, null, 2)}</pre>
          </div>
        </div>

        {/* Formatted Specifications */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 mb-2">
            {isRTL ? 'المواصفات المنسقة:' : 'Formatted Specifications:'}
          </h3>
          <p className="text-sm font-semibold bg-white p-2 rounded">
            {formatSpecificationValues(currentProduct.specificationValues, currentLanguage)}
          </p>
        </div>

        {/* Individual Specifications */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-semibold text-indigo-800 mb-2">
            {isRTL ? 'عرض المواصفات الفردية:' : 'Individual Specifications:'}
          </h3>
          <div className="space-y-2">
            {currentProduct.specificationValues.map((spec: any, index: number) => {
              const specDisplay = getSpecificationDisplay(spec, currentLanguage);
              return (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">{isRTL ? 'العنوان:' : 'Title:'}</span> {specDisplay.title}</p>
                    <p><span className="font-medium">{isRTL ? 'القيمة:' : 'Value:'}</span> {specDisplay.value}</p>
                    <p><span className="font-medium">{isRTL ? 'النص الكامل:' : 'Full Text:'}</span> {specDisplay.fullText}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table Display Simulation */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {isRTL ? 'محاكاة عرض الجدول:' : 'Table Display Simulation:'}
          </h3>
          <div className="bg-white rounded border p-3">
            <div className="flex flex-wrap gap-1">
              {formatSpecificationValues(currentProduct.specificationValues, currentLanguage).split(', ').map((spec: string, index: number) => (
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

        {/* Validation Results */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">
            {isRTL ? 'نتائج التحقق:' : 'Validation Results:'}
          </h3>
          <div className="space-y-2">
            {currentProduct.specificationValues.map((spec: any, index: number) => {
              const expected = currentLanguage 
                ? `${spec.titleAr}: ${spec.valueAr}` 
                : `${spec.titleEn}: ${spec.valueEn}`;
              const actual = getSpecificationDisplay(spec, currentLanguage).fullText;
              const isCorrect = actual === expected;
              
              return (
                <div key={index} className="bg-white p-2 rounded border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {isRTL ? `المواصفة ${index + 1}:` : `Specification ${index + 1}:`}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 mt-1">
                    <p><span className="font-medium">Expected:</span> {expected}</p>
                    <p><span className="font-medium">Actual:</span> {actual}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteAPIDataTest;

