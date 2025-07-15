import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@heroicons/react/24/outline';

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

interface SpecificationSelectorProps {
  specifications: Specification[];
  selectedSpecifications: { [key: string]: string }; // { specId: selectedValueId }
  onSpecificationChange: (specId: string, valueId: string) => void;
  isRTL?: boolean;
  className?: string;
}

const SpecificationSelector: React.FC<SpecificationSelectorProps> = ({
  specifications,
  selectedSpecifications,
  onSpecificationChange,
  isRTL = false,
  className = ''
}) => {
  const [expandedSpecs, setExpandedSpecs] = useState<{ [key: string]: boolean }>({});

  const toggleSpec = (specId: string) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [specId]: !prev[specId]
    }));
  };

  const handleValueSelect = (specId: string, value: SpecificationValue) => {
    onSpecificationChange(specId, value.valueAr || value.valueEn);
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
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>{isRTL ? 'لا توجد مواصفات متاحة' : 'No specifications available'}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className={`text-lg font-semibold text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
        {isRTL ? 'مواصفات المنتج' : 'Product Specifications'}
      </h3>
      
      <div className="space-y-3">
        {specifications.map((spec) => {
          const isExpanded = expandedSpecs[spec._id];
          const selectedValue = getSelectedValueText(spec);
          
          return (
            <div key={spec._id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header - Specification Title */}
              <button
                onClick={() => toggleSpec(spec._id)}
                className={`w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-800">
                    {isRTL ? spec.titleAr : spec.titleEn}
                  </span>
                  {selectedValue && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {selectedValue}
                    </span>
                  )}
                </div>
                {isRTL ? (
                  isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>

              {/* Values - Collapsible Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-white">
                  <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {spec.values.map((value, index) => {
                        const isSelected = selectedSpecifications[spec._id] === (isRTL ? value.valueAr : value.valueEn);
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleValueSelect(spec._id, value)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? value.valueAr : value.valueEn}
                            </span>
                            {isSelected && (
                              <CheckIcon className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Clear Selection Button */}
                    {selectedValue && (
                      <button
                        onClick={() => onSpecificationChange(spec._id, '')}
                        className="mt-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md transition-colors"
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

      {/* Summary */}
      {Object.keys(selectedSpecifications).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className={`font-medium text-blue-800 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'المواصفات المختارة:' : 'Selected Specifications:'}
          </h4>
          <div className="space-y-1">
            {specifications
              .filter(spec => selectedSpecifications[spec._id])
              .map(spec => (
                <div key={spec._id} className={`text-sm text-blue-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="font-medium">{isRTL ? spec.titleAr : spec.titleEn}:</span>{' '}
                  <span>{getSelectedValueText(spec)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecificationSelector; 