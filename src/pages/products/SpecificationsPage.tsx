import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import { SpecificationSelector } from '../../components/common';
import useProductSpecifications from '../../hooks/useProductSpecifications';

const SpecificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  
  const { specifications, fetchSpecifications, loading } = useProductSpecifications();
  const [selectedSpecifications, setSelectedSpecifications] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSpecifications();
  }, [fetchSpecifications]);

  const handleSpecificationChange = (specId: string, value: string) => {
    setSelectedSpecifications(prev => {
      const updated = { ...prev };
      if (value) {
        updated[specId] = value;
      } else {
        delete updated[specId];
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    setSelectedSpecifications({});
  };

  const handleSelectAll = () => {
    const allSelected: { [key: string]: string } = {};
    specifications.forEach(spec => {
      if (spec.values.length > 0) {
        allSelected[spec._id] = isRTL ? spec.values[0].valueAr : spec.values[0].valueEn;
      }
    });
    setSelectedSpecifications(allSelected);
  };

  return (
    <div className="sm:p-4 w-full">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.products') || 'Products', href: '/products' },
        { name: isRTL ? 'مواصفات المنتج' : 'Product Specifications', href: '/specifications' }
      ]} isRtl={isRTL} />
      
      <HeaderWithAction
        title={isRTL ? 'مواصفات المنتج' : 'Product Specifications'}
        addLabel={isRTL ? 'إضافة مواصفة' : 'Add Specification'}
        onAdd={() => {/* TODO: Add specification */}}
        isRtl={isRTL}
        count={specifications.length}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="mt-6">
          {/* Action Buttons */}
          <div className={`flex gap-3 mb-6 ${isRTL ? 'justify-end' : 'justify-start'}`}>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {isRTL ? 'اختيار الكل' : 'Select All'}
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              {isRTL ? 'إلغاء الكل' : 'Clear All'}
            </button>
          </div>

          {/* Specifications Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <SpecificationSelector
              specifications={specifications}
              selectedSpecifications={selectedSpecifications}
              onSpecificationChange={handleSpecificationChange}
              isRTL={isRTL}
            />
          </div>

          {/* Selected Specifications Summary */}
          {Object.keys(selectedSpecifications).length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className={`text-lg font-semibold text-gray-800 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'ملخص المواصفات المختارة' : 'Selected Specifications Summary'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specifications
                  .filter(spec => selectedSpecifications[spec._id])
                  .map(spec => {
                    const selectedValue = selectedSpecifications[spec._id];
                                         const value = spec.values.find((v: any) => 
                       v.valueAr === selectedValue || v.valueEn === selectedValue
                     );
                    
                    return (
                      <div key={spec._id} className="bg-gray-50 rounded-lg p-4">
                        <div className={`text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? spec.titleAr : spec.titleEn}
                        </div>
                        <div className={`text-lg font-semibold text-blue-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {isRTL ? value?.valueAr : value?.valueEn}
                        </div>
                        <button
                          onClick={() => handleSpecificationChange(spec._id, '')}
                          className={`mt-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                          {isRTL ? 'إلغاء الاختيار' : 'Remove'}
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Export/Use Buttons */}
              <div className={`flex gap-3 mt-6 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                <button
                  onClick={() => {
                    //CONSOLE.log('Selected Specifications:', selectedSpecifications);
                    // TODO: Export or use specifications
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {isRTL ? 'استخدام المواصفات' : 'Use Specifications'}
                </button>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(selectedSpecifications, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'selected-specifications.json';
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  {isRTL ? 'تصدير JSON' : 'Export JSON'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecificationsPage; 