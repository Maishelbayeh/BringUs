import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, PlusIcon, MinusIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

interface SelectedSpecification {
  specId: string;
  valueId: string;
  value: string;
  quantity: number;
  price: number;
}

interface SpecificationSelectorProps {
  specifications: Specification[];
  selectedSpecifications: SelectedSpecification[];
  onSpecificationChange: (specifications: SelectedSpecification[]) => void;
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
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);

  const toggleSpec = (specId: string) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [specId]: !prev[specId]
    }));
  };

  const handleValueSelect = (spec: Specification, value: SpecificationValue) => {
    const valueId = `${spec._id}_${spec.values.findIndex(v => v === value)}`;
    const valueText = isRTL ? value.valueAr : value.valueEn;
    
    // Check if this specific value is already selected
    const existingValueIndex = selectedSpecifications.findIndex(s => 
      s.specId === spec._id && s.valueId === valueId
    );
    
    let updatedSpecifications: SelectedSpecification[];
    
    if (existingValueIndex >= 0) {
      // Remove this specific value if already selected
      updatedSpecifications = selectedSpecifications.filter((_, index) => index !== existingValueIndex);
    } else {
      // Add new value for this specification
      updatedSpecifications = [...selectedSpecifications, {
        specId: spec._id,
        valueId,
        value: valueText,
        quantity: 0,
        price: 0
      }];
    }
    
    onSpecificationChange(updatedSpecifications);
  };

  const handleQuantityChange = (specId: string, valueId: string, newQuantity: number) => {
    const updatedSpecifications = selectedSpecifications.map(spec => 
      spec.specId === specId && spec.valueId === valueId
        ? { ...spec, quantity: Math.max(0, newQuantity) }
        : spec
    );
    onSpecificationChange(updatedSpecifications);
  };


  const removeSpecification = (specId: string, valueId: string) => {
    const updatedSpecifications = selectedSpecifications.filter(spec => 
      !(spec.specId === specId && spec.valueId === valueId)
    );
    onSpecificationChange(updatedSpecifications);
  };

  const getSelectedValues = (specId: string): SelectedSpecification[] => {
    return selectedSpecifications.filter(s => s.specId === specId);
  };

  const isValueSelected = (specId: string, value: SpecificationValue, spec: Specification): boolean => {
    const valueId = `${specId}_${spec.values.findIndex(v => v === value)}`;
    return selectedSpecifications.some(s => s.specId === specId && s.valueId === valueId);
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
    <div className={`space-y-6 ${className}`}>
      {/* Header with Summary Button */}
      <div className={`flex items-center justify-end ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      
        
        {selectedSpecifications.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSummaryPopup(true)}
            className={`flex items-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
            title={isRTL ? 'عرض ملخص المواصفات' : 'View Specifications Summary'}
          >
            <EyeIcon className="w-4 h-4" />
            <span>{isRTL ? 'ملخص المواصفات' : 'Summary'}</span>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {specifications.map((spec) => {
          const isExpanded = expandedSpecs[spec._id];
          const selectedValues = getSelectedValues(spec._id);
          
          return (
            <div key={spec._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Header - Specification Title */}
              <button
                type="button"
                onClick={() => toggleSpec(spec._id)}
                className={`w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 ${
                  isRTL ? 'text-right' : 'text-left'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${isRTL ? 'ml-2' : 'mr-2'} w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full`}></div>
                  <span className="font-medium text-gray-800">
                    {isRTL ? spec.titleAr : spec.titleEn}
                  </span>
                  {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedValues.map((selected, index) => (
                        <span key={index} className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                          {selected.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {isRTL ? (
                  isExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-600" /> : <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  isExpanded ? <ChevronUpIcon className="w-5 h-5 text-gray-600" /> : <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Values - Collapsible Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-white">
                  <div className="p-6">
                    {/* Values Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {spec.values.map((value, index) => {
                        const isSelected = isValueSelected(spec._id, value, spec);
                        
                        return (
                          <button
                            type="button"
                            key={index}
                            onClick={() => handleValueSelect(spec, value)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group ${
                              isSelected
                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                            }`}
                          >
                            <span className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? value.valueAr : value.valueEn}
                            </span>
                            {isSelected && (
                              <CheckIcon className="w-5 h-5 text-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quantity and Price Section for Selected Values */}
                    {selectedValues.length > 0 && (
                      <div className={`${isRTL ? 'mr-6' : 'ml-6'} bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`font-medium text-blue-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'تفاصيل القيم المختارة:' : 'Selected Values Details:'}
                          </h4>
                        </div>
                        
                        <div className="space-y-4">
                          {selectedValues.map((selectedValue) => (
                            <div key={selectedValue.valueId} className="bg-white rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className={`font-medium text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                                  {selectedValue.value}
                                </h5>
                                <button
                                  type="button"
                                  onClick={() => removeSpecification(spec._id, selectedValue.valueId)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                  title={isRTL ? 'إزالة القيمة' : 'Remove value'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Quantity Section */}
                                <div className="space-y-2">
                                  <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'الكمية المتاحة:' : 'Available Quantity:'}
                                  </label>
                                  <div className="flex items-center ">
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(spec._id, selectedValue.valueId, selectedValue.quantity - 1)}
                                      disabled={selectedValue.quantity <= 0}
                                      className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      <MinusIcon className="w-4 h-4 text-gray-600" />
                                    </button>
                                    
                                    <input
                                      type="number"
                                      value={selectedValue.quantity}
                                      onChange={(e) => handleQuantityChange(spec._id, selectedValue.valueId, parseInt(e.target.value) || 0)}
                                      className="mx-2 w-20 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      min="0"
                                      placeholder="0"
                                    />
                                    
                                    <button
                                      type="button"
                                      onClick={() => handleQuantityChange(spec._id, selectedValue.valueId, selectedValue.quantity + 1)}
                                      className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                      <PlusIcon className="w-4 h-4 text-gray-600" />
                                    </button>
                                  </div>
                                </div>

                                {/* Price Section 
                                <div className="space-y-2">
                                  <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {isRTL ? 'السعر الإضافي:' : 'Additional Price:'}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={selectedValue.price}
                                      onChange={(e) => handlePriceChange(spec._id, selectedValue.valueId, parseFloat(e.target.value) || 0)}
                                      className="w-full h-10 pl-8 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      min="0"
                                      step="0.01"
                                      placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">$</span>
                                    </div>
                                  </div>
                                </div>*/}
                              </div>

                              {/* Individual Summary
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {isRTL ? 'المجموع لهذه القيمة:' : 'Total for this value:'}
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    {selectedValue.quantity} × ${selectedValue.price.toFixed(2)} = ${(selectedValue.quantity * selectedValue.price).toFixed(2)}
                                  </span>
                                </div>
                              </div> */}
                            </div>
                          ))}
                        </div>

                        {/* Specification Summary Card */}
                        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">
                                {isRTL ? 'المواصفة:' : 'Specification:'}
                              </p>
                              <p className="font-medium text-gray-800">
                                {isRTL ? spec.titleAr : spec.titleEn}
                              </p>
                              <p className="text-sm text-gray-600">
                                {isRTL ? 'القيم المختارة:' : 'Selected values:'} {selectedValues.map(v => v.value).join(', ')}
                              </p>
                            </div>
                            {/* <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {isRTL ? 'المجموع:' : 'Total:'}
                              </p>
                              <p className="font-medium text-blue-600">
                                ${selectedValues.reduce((total, val) => total + (val.quantity * val.price), 0).toFixed(2)}
                              </p>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>



      {/* Summary Popup Modal */}
      {selectedSpecifications.length > 0 && showSummaryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <h3 className={`text-xl font-semibold text-gray-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'ملخص المواصفات المختارة' : 'Selected Specifications Summary'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSummaryPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={isRTL ? 'إغلاق' : 'Close'}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-3">
                {specifications.map((spec) => {
                  const specValues = selectedSpecifications.filter(s => s.specId === spec._id);
                  if (specValues.length === 0) return null;
                  
                  return (
                    <div key={spec._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className={`${isRTL ? 'text-right' : 'text-left'} mb-3`}>
                        <p className="font-medium text-gray-800 text-lg">
                          {isRTL ? spec.titleAr : spec.titleEn}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {specValues.map((selected) => (
                          <div key={selected.valueId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                              <p className="text-sm font-medium text-gray-800">
                                {selected.value}
                              </p>
                              <p className="text-xs text-gray-600">
                                {isRTL ? 'الكمية:' : 'Quantity:'} {selected.quantity} 
                                {/* | {isRTL ? 'السعر الإضافي:' : 'Additional Price:'} ${selected.price.toFixed(2)} */}
                              </p>
                            </div>
                            {/* <div className="text-right">
                              <p className="font-medium text-blue-600">
                                ${(selected.quantity * selected.price).toFixed(2)}
                              </p>
                            </div> */}
                          </div>
                        ))}
                      </div>
                      {/* <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {isRTL ? 'مجموع المواصفة:' : 'Specification total:'}
                          </span>
                          <span className="font-medium text-blue-600">
                            ${specValues.reduce((total, val) => total + (val.quantity * val.price), 0).toFixed(2)}
                          </span>
                        </div>
                      </div> */}
                    </div>
                  );
                })}
              </div>
              
              {/* Total 
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-lg">
                    {isRTL ? 'المجموع الكلي:' : 'Total Additional Cost:'}
                  </span>
                  <span className="font-bold text-blue-600 text-xl">
                    ${selectedSpecifications.reduce((total, spec) => total + (spec.quantity * spec.price), 0).toFixed(2)}
                  </span>
                </div>
              </div>*/}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowSummaryPopup(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecificationSelector; 