import React, { useState } from 'react';
import CustomSelect from '../common/CustomSelect';

interface Option {
  value: string;
  label: string;
}

const SearchableSelectTest: React.FC = () => {
  const [selectedValue, setSelectedValue] = useState('');

  // قائمة اختبار مع خيارات متنوعة
  const testOptions: Option[] = [
    { value: 'apple', label: 'تفاح' },
    { value: 'banana', label: 'موز' },
    { value: 'orange', label: 'برتقال' },
    { value: 'grape', label: 'عنب' },
    { value: 'strawberry', label: 'فراولة' },
    { value: 'mango', label: 'مانجو' },
    { value: 'pineapple', label: 'أناناس' },
    { value: 'watermelon', label: 'بطيخ' },
    { value: 'kiwi', label: 'كيوي' },
    { value: 'peach', label: 'خوخ' },
    { value: 'plum', label: 'برقوق' },
    { value: 'cherry', label: 'كرز' },
    { value: 'lemon', label: 'ليمون' },
    { value: 'lime', label: 'ليمون أخضر' },
    { value: 'coconut', label: 'جوز الهند' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
    console.log('Selected value:', e.target.value);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">اختبار CustomSelect مع البحث</h3>
      
      <CustomSelect
        label="اختر فاكهة"
        value={selectedValue}
        onChange={handleChange}
        options={testOptions}
        searchable={true}
        placeholder="ابحث عن فاكهة..."
      />

      {selectedValue && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            القيمة المختارة: <strong>{testOptions.find(opt => opt.value === selectedValue)?.label}</strong>
          </p>
          <p className="text-xs text-green-600 mt-1">
            Value: {selectedValue}
          </p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>تعليمات الاختبار:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>انقر على القائمة المنسدلة</li>
          <li>اكتب في حقل البحث</li>
          <li>اختر خياراً من النتائج المصفاة</li>
          <li>تحقق من أن القيمة المختارة تظهر أدناه</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchableSelectTest; 