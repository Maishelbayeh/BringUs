import React, { useState } from 'react';

interface SpecificationValue {
  valueAr: string;
  valueEn: string;
}

interface Specification {
  _id: string;
  titleAr: string;
  titleEn: string;
  values: SpecificationValue[];
}

interface SimpleSpecificationSelectorProps {
  specifications: Specification[];
  selectedSpecifications: { [key: string]: string };
  onSpecificationChange: (specId: string, valueId: string) => void;
  isRTL?: boolean;
  className?: string;
}

const SimpleSpecificationSelector: React.FC<SimpleSpecificationSelectorProps> = ({
  specifications,
  selectedSpecifications,
  onSpecificationChange,
  isRTL = false,
  className = ''
}) => {
  const [expandedSpec, setExpandedSpec] = useState<string | null>(null);

  const handleSpecClick = (specId: string) => {
    setExpandedSpec(expandedSpec === specId ? null : specId);
  };

  const handleValueSelect = (specId: string, value: SpecificationValue) => {
    onSpecificationChange(specId, isRTL ? value.valueAr : value.valueEn);
    setExpandedSpec(null); // إغلاق القائمة بعد الاختيار
  };

  const getSelectedValueText = (spec: Specification) => {
    const selectedValue = selectedSpecifications[spec._id];
    if (!selectedValue) return '';
    
    const value = spec.values.find(v => 
      v.valueAr === selectedValue || v.valueEn === selectedValue
    );
    return isRTL ? value?.valueAr : value?.valueEn;
  };

  if (!Array.isArray(specifications) || specifications.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <p className="text-sm">{isRTL ? 'لا توجد مواصفات متاحة' : 'No specifications available'}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
        {isRTL ? 'مواصفات المنتج' : 'Product Specifications'}
      </label>
      
      <div className="space-y-2">
        {specifications.map((spec) => {
          const isExpanded = expandedSpec === spec._id;
          const selectedValue = getSelectedValueText(spec);
          
          return (
            <div key={spec._id} className="relative">
              {/* Specification Button */}
              <button
                type="button"
                onClick={() => handleSpecClick(spec._id)}
                className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {isRTL ? spec.titleAr : spec.titleEn}
                  </span>
                  <div className="flex items-center space-x-2">
                    {selectedValue && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {selectedValue}
                      </span>
                    )}
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Dropdown Values */}
              {isExpanded && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="p-2 max-h-48 overflow-y-auto">
                    <div className="space-y-1">
                      {spec.values.map((value, index) => {
                        const isSelected = selectedSpecifications[spec._id] === (isRTL ? value.valueAr : value.valueEn);
                        
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleValueSelect(spec._id, value)}
                            className={`w-full px-3 py-2 text-left text-sm rounded-md transition-colors ${
                              isSelected
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'hover:bg-gray-50 text-gray-700'
                            } ${isRTL ? 'text-right' : 'text-left'}`}
                          >
                            {isRTL ? value.valueAr : value.valueEn}
                            {isSelected && (
                              <span className="ml-2 text-blue-600">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Clear Selection Option */}
                    {selectedValue && (
                      <button
                        type="button"
                        onClick={() => onSpecificationChange(spec._id, '')}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-2 border-t border-gray-200 pt-2"
                      >
                        {isRTL ? 'إلغاء الاختيار' : 'Clear Selection'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Specifications Summary */}
      {Object.keys(selectedSpecifications).length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-600 mb-1">
            {isRTL ? 'المواصفات المختارة:' : 'Selected:'}
          </div>
          <div className="flex flex-wrap gap-1">
            {specifications
              .filter(spec => selectedSpecifications[spec._id])
              .map(spec => (
                <span 
                  key={spec._id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {isRTL ? spec.titleAr : spec.titleEn}: {getSelectedValueText(spec)}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSpecificationSelector; 