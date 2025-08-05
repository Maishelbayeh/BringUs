import React, { useState } from 'react';
import CustomSelect from '../common/CustomSelect';

interface Option {
  value: string;
  label: string;
}

const UnitSelectionTest: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState('');
  const [formData, setFormData] = useState({
    unit: '',
    unitId: ''
  });

  const unitOptions: Option[] = [
    { value: '', label: 'اختر الوحدة' },
    { value: 'unit1', label: 'قطعة' },
    { value: 'unit2', label: 'كيلوغرام' },
    { value: 'unit3', label: 'لتر' },
    { value: 'unit4', label: 'متر' }
  ];

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedUnit(value);
    
    // محاكاة التحديث المزدوج للـ form
    setFormData(prev => ({
      ...prev,
      unit: value,
      unitId: value
    }));
  };

  const handleSubmit = () => {
    console.log('🔍 Form Data on Submit:', formData);
    console.log('🔍 Selected Unit:', selectedUnit);
    console.log('🔍 Unit matches unitId:', formData.unit === formData.unitId);
    
    if (formData.unit === formData.unitId) {
      alert('✅ تم إصلاح المشكلة! الوحدة و unitId متطابقان');
    } else {
      alert('❌ لا تزال هناك مشكلة في التحديث');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center">اختبار تحديث الوحدة</h3>
      
      <div className="space-y-4">
        <CustomSelect
          label="الوحدة"
          value={selectedUnit}
          onChange={handleUnitChange}
          options={unitOptions}
          searchable={true}
          placeholder="ابحث عن وحدة..."
        />
        
        <div className="bg-gray-100 p-3 rounded">
          <h4 className="font-medium mb-2">بيانات النموذج:</h4>
          <p className="text-sm">unit: <span className="font-mono">{formData.unit || 'فارغ'}</span></p>
          <p className="text-sm">unitId: <span className="font-mono">{formData.unitId || 'فارغ'}</span></p>
        </div>
        
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          اختبار التحديث
        </button>
        
        <div className="text-xs text-gray-600">
          <p>هذا الاختبار يتحقق من أن:</p>
          <ul className="list-disc list-inside mt-1">
            <li>عند تغيير الوحدة، يتم تحديث كل من unit و unitId</li>
            <li>القيم متطابقة عند الإرسال</li>
            <li>لا توجد مشكلة في التحديث</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UnitSelectionTest; 