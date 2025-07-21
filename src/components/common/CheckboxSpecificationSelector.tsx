import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';


interface SpecificationValue {
  _id: string;
  value: string;
  title: string;
}

interface SpecificationTitle {
  _id: string;
  title: string;
  values: SpecificationValue[];
}

interface CheckboxSpecificationSelectorProps {
  specifications: SpecificationTitle[];
  selectedSpecifications: SpecificationValue[];
  onSelectionChange: (selected: SpecificationValue[]) => void;
  className?: string;
}

const CheckboxSpecificationSelector: React.FC<CheckboxSpecificationSelectorProps> = ({
  specifications,
  selectedSpecifications,
  onSelectionChange,
  className = ''
}) => {
  const [expandedTitles, setExpandedTitles] = useState<Set<string>>(new Set());
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  // Initialize selected values from props
  useEffect(() => {
    // console.log('🔍 CheckboxSpecificationSelector - selectedSpecifications:', selectedSpecifications);
    // console.log('🔍 CheckboxSpecificationSelector - specifications:', specifications);
    
    if (Array.isArray(selectedSpecifications) && selectedSpecifications.length > 0) {
      const selectedIds = new Set(selectedSpecifications.map(spec => spec._id));
      // console.log('🔍 CheckboxSpecificationSelector - Setting selectedIds:', selectedIds);
      // console.log('🔍 CheckboxSpecificationSelector - Selected specs details:', selectedSpecifications.map(spec => ({
      //   id: spec._id,
      //   title: spec.title,
      //   value: spec.value
      // })));
      
      // تحقق من تطابق الـ IDs
      const availableIds = specifications.flatMap(s => s.values.map(v => v._id));
      // console.log('🔍 CheckboxSpecificationSelector - Available IDs:', availableIds);
      // console.log('🔍 CheckboxSpecificationSelector - Matching IDs:', selectedSpecifications.filter(spec => availableIds.includes(spec._id)));
      
      setSelectedValues(selectedIds);
    } else {
     // console.log('🔍 CheckboxSpecificationSelector - No selectedSpecifications, clearing selectedValues');
      setSelectedValues(new Set());
    }
  }, [selectedSpecifications]);

  const toggleTitle = (titleId: string) => {
    const newExpanded = new Set(expandedTitles);
    if (newExpanded.has(titleId)) {
      newExpanded.delete(titleId);
    } else {
      newExpanded.add(titleId);
    }
    setExpandedTitles(newExpanded);
  };

  const toggleValue = (value: SpecificationValue) => {
    // console.log('🔍 toggleValue - value:', value);
    // console.log('🔍 toggleValue - current selectedValues:', selectedValues);
    
    const newSelected = new Set(selectedValues);
    if (newSelected.has(value._id)) {
      newSelected.delete(value._id);
    } else {
      newSelected.add(value._id);
    }
    setSelectedValues(newSelected);

    // Update parent component
    const updatedSelection = specifications
      .flatMap(spec => spec.values)
      .filter(val => newSelected.has(val._id));
    
    //  console.log('🔍 toggleValue - updatedSelection:', updatedSelection);
    onSelectionChange(updatedSelection);
  };

  const removeValue = (valueId: string) => {
    const newSelected = new Set(selectedValues);
    newSelected.delete(valueId);
    setSelectedValues(newSelected);

    // Update parent component
    const updatedSelection = specifications
      .flatMap(spec => spec.values)
      .filter(val => newSelected.has(val._id));
    onSelectionChange(updatedSelection);
  };

  const isTitleSelected = (title: SpecificationTitle) => {
    const selected = title.values.some(value => selectedValues.has(value._id));
    // console.log(`🔍 Title ${title.title} selected: ${selected}`);
    return selected;
  };

  const getSelectedCountForTitle = (title: SpecificationTitle) => {
    return title.values.filter(value => selectedValues.has(value._id)).length;
  };

  // console.log('🔍 CheckboxSpecificationSelector - Rendering with specifications:', specifications);
  // console.log('🔍 CheckboxSpecificationSelector - Rendering with selectedSpecifications:', selectedSpecifications);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Values Display */}
      {selectedSpecifications.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">المواصفات المختارة:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSpecifications.map((spec) => (
              <span
                key={spec._id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                <span className="text-xs text-primary">{spec.title}:</span>
                <span className="font-medium">{spec.value}</span>
                <button
                  type="button"
                  onClick={() => removeValue(spec._id)}
                  className="ml-1 text-primary hover:text-primary/80"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specification Titles */}
      {specifications.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>لا توجد مواصفات متاحة</p>
          <p className="text-xs mt-2">يتم جلب المواصفات من الخادم...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {specifications.map((title) => (
          <div key={title._id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center   cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTitleSelected(title)}
                  onChange={() => {
                    // Toggle all values for this title
                    const titleValues = title.values;
                    const allSelected = titleValues.every(value => selectedValues.has(value._id));
                    
                    const newSelected = new Set(selectedValues);
                    titleValues.forEach(value => {
                      if (allSelected) {
                        newSelected.delete(value._id);
                      } else {
                        newSelected.add(value._id);
                      }
                    });
                    
                    setSelectedValues(newSelected);
                    
                    // Update parent component
                    const updatedSelection = specifications
                      .flatMap(spec => spec.values)
                      .filter(val => newSelected.has(val._id));
                    onSelectionChange(updatedSelection);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className={`font-medium text-gray-900 mx-2`}>{title.title}</span>
                {getSelectedCountForTitle(title) > 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {getSelectedCountForTitle(title)} مختار
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => toggleTitle(title._id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedTitles.has(title._id) ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
              </button>
            </div>

            {/* Values for this title */}
            {expandedTitles.has(title._id) && (
              <div className="mt-3 ml-6 space-y-2">
                {title.values.map((value) => {
                  const isChecked = selectedValues.has(value._id);
                  console.log(`🔍 Checkbox for ${value._id}: ${value.value} - checked: ${isChecked}`);
                  return (
                    <label key={value._id} className="flex items-center   cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleValue(value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-gray-700 mx-2`}>{value.value}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* Summary */}
      {selectedSpecifications.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            تم اختيار {selectedSpecifications.length} مواصفة
          </p>
        </div>
      )}
      
      {/* Debug info - Commented out for production */}
      {/* <div className="mt-4 p-2 bg-yellow-100 rounded text-xs">
        <p><strong>Debug:</strong></p>
        <p>Specifications count: {specifications.length}</p>
        <p>Selected count: {selectedSpecifications.length}</p>
        <p>Expanded titles: {Array.from(expandedTitles).join(', ')}</p>
      </div> */}
    </div>
  );
};

export default CheckboxSpecificationSelector; 