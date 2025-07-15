import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

  // Initialize selected values from props
  useEffect(() => {
    const selectedIds = new Set(selectedSpecifications.map(spec => spec._id));
    setSelectedValues(selectedIds);
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
    return title.values.some(value => selectedValues.has(value._id));
  };

  const getSelectedCountForTitle = (title: SpecificationTitle) => {
    return title.values.filter(value => selectedValues.has(value._id)).length;
  };

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
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span className="text-xs text-blue-600">{spec.title}:</span>
                {spec.value}
                <button
                  type="button"
                  onClick={() => removeValue(spec._id)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Specification Titles */}
      <div className="space-y-2">
        {specifications.map((title) => (
          <div key={title._id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTitleSelected(title)}
                  onChange={() => toggleTitle(title._id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900">{title.title}</span>
                {getSelectedCountForTitle(title) > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {getSelectedCountForTitle(title)} مختار
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => toggleTitle(title._id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedTitles.has(title._id) ? '▼' : '▶'}
              </button>
            </div>

            {/* Values for this title */}
            {expandedTitles.has(title._id) && (
              <div className="mt-3 ml-6 space-y-2">
                {title.values.map((value) => (
                  <label key={value._id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedValues.has(value._id)}
                      onChange={() => toggleValue(value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{value.value}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {selectedSpecifications.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            تم اختيار {selectedSpecifications.length} مواصفة
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckboxSpecificationSelector; 