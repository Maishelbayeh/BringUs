import React, { useState } from 'react';
import CustomSelect from '../common/CustomSelect';

interface Option {
  value: string;
  label: string;
}

const SearchableSelectExample: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  // Example options for categories
  const categoryOptions: Option[] = [
    { value: 'electronics', label: 'الإلكترونيات' },
    { value: 'clothing', label: 'الملابس' },
    { value: 'books', label: 'الكتب' },
    { value: 'home', label: 'المنزل والحديقة' },
    { value: 'sports', label: 'الرياضة' },
    { value: 'beauty', label: 'الجمال والعناية' },
    { value: 'toys', label: 'الألعاب' },
    { value: 'automotive', label: 'السيارات' },
    { value: 'health', label: 'الصحة والعافية' },
    { value: 'food', label: 'الطعام والمشروبات' },
  ];

  // Example options for products (more items to demonstrate search)
  const productOptions: Option[] = [
    { value: 'iphone-15', label: 'iPhone 15 Pro Max' },
    { value: 'samsung-s24', label: 'Samsung Galaxy S24 Ultra' },
    { value: 'macbook-pro', label: 'MacBook Pro 16-inch' },
    { value: 'dell-xps', label: 'Dell XPS 13' },
    { value: 'sony-wh1000', label: 'Sony WH-1000XM5 Headphones' },
    { value: 'airpods-pro', label: 'Apple AirPods Pro' },
    { value: 'ipad-pro', label: 'iPad Pro 12.9-inch' },
    { value: 'surface-pro', label: 'Microsoft Surface Pro 9' },
    { value: 'gopro-hero', label: 'GoPro Hero 11 Black' },
    { value: 'canon-eos', label: 'Canon EOS R5' },
    { value: 'nike-airmax', label: 'Nike Air Max 270' },
    { value: 'adidas-ultraboost', label: 'Adidas Ultraboost 22' },
    { value: 'puma-rsx', label: 'Puma RS-X' },
    { value: 'converse-chuck', label: 'Converse Chuck Taylor' },
    { value: 'vans-oldskool', label: 'Vans Old Skool' },
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProduct(e.target.value);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">أمثلة على CustomSelect مع البحث</h2>
      
      <div className="space-y-6">
        {/* Regular Select (Non-searchable) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">قائمة منسدلة عادية (بدون بحث)</h3>
          <CustomSelect
            label="اختر الفئة"
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={categoryOptions}
            placeholder="اختر فئة من القائمة"
          />
          {selectedCategory && (
            <p className="mt-2 text-sm text-gray-600">
              الفئة المختارة: <span className="font-medium">{categoryOptions.find(opt => opt.value === selectedCategory)?.label}</span>
            </p>
          )}
        </div>

        {/* Searchable Select */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">قائمة منسدلة مع إمكانية البحث</h3>
          <CustomSelect
            label="اختر المنتج"
            value={selectedProduct}
            onChange={handleProductChange}
            options={productOptions}
            searchable={true}
            placeholder="ابحث عن منتج..."
          />
          {selectedProduct && (
            <p className="mt-2 text-sm text-gray-600">
              المنتج المختار: <span className="font-medium">{productOptions.find(opt => opt.value === selectedProduct)?.label}</span>
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">كيفية الاستخدام:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• للقائمة العادية: استخدم <code className="bg-blue-100 px-1 rounded">searchable={false}</code> أو لا تضف الخاصية</li>
            <li>• للقائمة مع البحث: استخدم <code className="bg-blue-100 px-1 rounded">searchable={true}</code></li>
            <li>• يمكنك تخصيص النص الافتراضي باستخدام <code className="bg-blue-100 px-1 rounded">placeholder</code></li>
            <li>• البحث يعمل على النص العربي والإنجليزي</li>
            <li>• يمكن إغلاق القائمة بالنقر خارجها</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchableSelectExample; 