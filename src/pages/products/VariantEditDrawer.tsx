import React, { useEffect, useState } from 'react';
import { CheckboxSpecificationSelector } from '../../components/common';

interface VariantEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  variant: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isRTL: boolean;
  isLoading?: boolean;
  specifications?: any[];
}

const VariantEditDrawer: React.FC<VariantEditDrawerProps> = ({
  isOpen,
  onClose,
  variant,
  onFormChange,
  onSubmit,
  isRTL,
  isLoading = false,
  specifications = []
}) => {
  // state للمواصفات المختارة
  const [selectedSpecifications, setSelectedSpecifications] = useState<any[]>([]);

  // تحويل مواصفات المنتجات إلى التنسيق المطلوب للمكون
  const formattedSpecifications = Array.isArray(specifications) ? specifications.map((spec: any) => ({
    _id: spec._id,
    title: isRTL ? spec.titleAr : spec.titleEn,
    values: spec.values.map((value: any, index: number) => {
      // إنشاء valueId بنفس الطريقة المستخدمة في البيانات المخزنة
      // البحث عن القيمة في البيانات المخزنة لتطابق valueId
      const storedValue = variant?.specificationValues?.find((sv: any) => 
        sv.specificationId === spec._id && 
        sv.value === (isRTL ? value.valueAr : value.valueEn)
      );
      
      // إذا وجدت قيمة مخزنة، استخدم valueId الخاص بها
      // وإلا استخدم التنسيق المولد
      const valueId = storedValue ? storedValue.valueId : `${spec._id}_${index}`;
      
      return {
        _id: valueId, // استخدام valueId من البيانات المخزنة أو المولد
        value: isRTL ? value.valueAr : value.valueEn,
        title: isRTL ? spec.titleAr : spec.titleEn,
        specificationId: spec._id,
        valueId: valueId
      };
    })
  })) : [];

  // تحويل البيانات من النموذج إلى التنسيق المطلوب
  useEffect(() => {
    console.log('🔍 VariantEditDrawer - variant:', variant);
    console.log('🔍 VariantEditDrawer - variant.specificationValues:', variant?.specificationValues);
    console.log('🔍 VariantEditDrawer - formattedSpecifications:', formattedSpecifications);
    
    if (variant && variant.specificationValues) {
      try {
        let parsed;
        if (typeof variant.specificationValues === 'string') {
          parsed = JSON.parse(variant.specificationValues);
        } else {
          parsed = variant.specificationValues;
        }
        
        console.log('🔍 VariantEditDrawer - parsed specificationValues:', parsed);
        
        if (Array.isArray(parsed)) {
          // Ensure each specification has the required fields and create proper _id for CheckboxSpecificationSelector
          const validSpecs = parsed
            .filter((spec: any) => 
              spec && 
              spec.specificationId && 
              spec.valueId && 
              spec.value && 
              spec.title
            )
            .map((spec: any) => {
              // استخدام valueId من البيانات المخزنة مباشرة كـ _id
              return {
                _id: spec.valueId, // استخدام valueId مباشرة
                specificationId: spec.specificationId,
                valueId: spec.valueId,
                value: spec.value,
                title: spec.title
              };
            });
          console.log('🔍 VariantEditDrawer - valid specs:', validSpecs);
          console.log('🔍 VariantEditDrawer - formattedSpecifications values:', formattedSpecifications.flatMap(s => s.values.map((v: any) => ({ _id: v._id, value: v.value }))));
          
          // تحقق من تطابق الـ IDs
          const selectedIds = validSpecs.map(s => s._id);
          const availableIds = formattedSpecifications.flatMap(s => s.values.map((v: any) => v._id));
          console.log('🔍 VariantEditDrawer - Selected IDs:', selectedIds);
          console.log('🔍 VariantEditDrawer - Available IDs:', availableIds);
          console.log('🔍 VariantEditDrawer - Matching IDs:', selectedIds.filter(id => availableIds.includes(id)));
          
          setSelectedSpecifications(validSpecs);
        } else {
          setSelectedSpecifications([]);
        }
      } catch (error) {
        console.error('Error parsing specificationValues:', error);
        setSelectedSpecifications([]);
      }
    } else {
      setSelectedSpecifications([]);
    }
  }, [variant, formattedSpecifications]);

  // معالج تغيير المواصفات
  const handleSpecificationChange = (selected: any[]) => {
    console.log('🔍 VariantEditDrawer - handleSpecificationChange called with:', selected);
    
    // Transform the selected specifications to match the expected format
    const transformedSpecs = selected.map((spec: any) => {
      // البحث عن المواصفة في formattedSpecifications للحصول على specificationId
      const foundSpec = formattedSpecifications
        .flatMap(s => s.values)
        .find(v => v._id === spec._id);
      
      const specificationId = foundSpec ? foundSpec.specificationId : spec._id.split('_')[0];
      const valueId = spec._id; // استخدام _id كـ valueId
      
      return {
        _id: valueId, // Keep _id for CheckboxSpecificationSelector
        specificationId,
        valueId,
        value: spec.value,
        title: spec.title
      };
    });
    
    console.log('🔍 VariantEditDrawer - transformed specs:', transformedSpecs);
    setSelectedSpecifications(transformedSpecs);
    
    // تحديث النموذج - إرسال المصفوفة مباشرة بدلاً من JSON string
    // But remove _id when sending to form to avoid MongoDB conflicts
    const formSpecs = transformedSpecs.map((spec: any) => ({
      specificationId: spec.specificationId,
      valueId: spec.valueId,
      value: spec.value,
      title: spec.title
    }));
    
    onFormChange({
      target: {
        name: 'specificationValues',
        value: formSpecs
      }
    } as any);
  };

  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className={`relative w-full max-w-md h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isRTL ? 'ml-auto' : 'mr-auto'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {isRTL ? 'تعديل المتغير' : 'Edit Variant'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title={isRTL ? 'إغلاق' : 'Close'}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'الاسم بالعربية' : 'Arabic Name'}
                  </label>
                  <input
                    type="text"
                    name="nameAr"
                    value={variant.nameAr || ''}
                    onChange={onFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'الاسم بالإنجليزية' : 'English Name'}
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    value={variant.nameEn || ''}
                    onChange={onFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'الوصف بالعربية' : 'Arabic Description'}
                  </label>
                  <textarea
                    name="descriptionAr"
                    value={variant.descriptionAr || ''}
                    onChange={onFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'الوصف بالإنجليزية' : 'English Description'}
                  </label>
                  <textarea
                    name="descriptionEn"
                    value={variant.descriptionEn || ''}
                    onChange={onFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'السعر' : 'Price'}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={variant.price || ''}
                    onChange={onFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'سعر التكلفة' : 'Cost Price'}
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={variant.costPrice || ''}
                    onChange={onFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? 'سعر الجملة' : 'Wholesale Price'}
                  </label>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={variant.compareAtPrice || ''}
                    onChange={onFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الكمية المتوفرة' : 'Available Quantity'}
                </label>
                <input
                  type="number"
                  name="availableQuantity"
                  value={variant.availableQuantity || ''}
                  onChange={onFormChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'المواصفات' : 'Specifications'}
                </label>
                {formattedSpecifications.length > 0 ? (
                  <div>
                    <CheckboxSpecificationSelector
                      specifications={formattedSpecifications}
                      selectedSpecifications={selectedSpecifications}
                      onSelectionChange={handleSpecificationChange}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Available specs: {formattedSpecifications.length}</p>
                      <p>Selected specs: {selectedSpecifications.length}</p>
                      <p>Selected IDs: {selectedSpecifications.map((s: any) => s._id).join(', ')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-lg">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm">{isRTL ? 'لا توجد مواصفات متاحة' : 'No specifications available'}</p>
                    <p className="text-xs mt-1 text-gray-400">
                      {isRTL ? 'يتم جلب المواصفات من الخادم...' : 'Loading specifications from server...'}
                    </p>
                  </div>
                )}
                {/* Debug info */}
              
              </div>
            </form>
          </div>
        </div>

        {/* Footer with Buttons - Fixed at bottom */}
        <div className="flex-shrink-0 border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                onSubmit(e);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantEditDrawer; 