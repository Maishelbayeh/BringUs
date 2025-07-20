import React, { useState } from 'react';
import { CheckboxSpecificationSelector } from '../../components/common';

// بيانات تجريبية للمواصفات
const mockSpecifications = [
  {
    _id: '1',
    title: 'اللون',
    values: [
      { _id: '1_0', value: 'أحمر', title: 'اللون' },
      { _id: '1_1', value: 'أزرق', title: 'اللون' },
      { _id: '1_2', value: 'أخضر', title: 'اللون' },
      { _id: '1_3', value: 'أصفر', title: 'اللون' },
    ]
  },
  {
    _id: '2',
    title: 'الحجم',
    values: [
      { _id: '2_0', value: 'صغير', title: 'الحجم' },
      { _id: '2_1', value: 'متوسط', title: 'الحجم' },
      { _id: '2_2', value: 'كبير', title: 'الحجم' },
      { _id: '2_3', value: 'كبير جداً', title: 'الحجم' },
    ]
  },
  {
    _id: '3',
    title: 'المادة',
    values: [
      { _id: '3_0', value: 'قطن', title: 'المادة' },
      { _id: '3_1', value: 'حرير', title: 'المادة' },
      { _id: '3_2', value: 'صوف', title: 'المادة' },
      { _id: '3_3', value: 'بوليستر', title: 'المادة' },
    ]
  },
  {
    _id: '4',
    title: 'النوع',
    values: [
      { _id: '4_0', value: 'رجالي', title: 'النوع' },
      { _id: '4_1', value: 'نسائي', title: 'النوع' },
      { _id: '4_2', value: 'أطفال', title: 'النوع' },
    ]
  }
];

const CheckboxSpecificationTest: React.FC = () => {
  const [selectedSpecifications, setSelectedSpecifications] = useState<any[]>([]);

  const handleSelectionChange = (selected: any[]) => {
    setSelectedSpecifications(selected);
    //CONSOLE.log('Selected specifications:', selected);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">اختبار مكون اختيار المواصفات</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <CheckboxSpecificationSelector
          specifications={mockSpecifications}
          selectedSpecifications={selectedSpecifications}
          onSelectionChange={handleSelectionChange}
        />
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">البيانات المختارة:</h3>
        <pre className="bg-white p-4 rounded border overflow-auto">
          {JSON.stringify(selectedSpecifications, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CheckboxSpecificationTest; 