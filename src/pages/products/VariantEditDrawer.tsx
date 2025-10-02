import React, { useEffect, useState } from 'react';
import { CheckboxSpecificationSelector } from '../../components/common';
import CustomColorPicker from '../../components/common/CustomColorPicker';
import CustomInput from '../../components/common/CustomInput';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomSwitch from '../../components/common/CustomSwitch';
// import MultiSelect from '../../components/common/MultiSelect';
import { createImageValidationFunction } from '../../validation/imageValidation';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  // Create image validation function
  const imageValidator = createImageValidationFunction(t);
  
  // state للمواصفات المختارة
  const [selectedSpecifications, setSelectedSpecifications] = useState<any[]>([]);
  const [variantColors, setVariantColors] = useState<{ id: string; colors: string[] }[]>(variant?.colors || []);

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

  // إزالة جميع console.log من body الرئيسي للـ component
  // نقل الطباعة إلى useEffect واحد فقط للديباغ عند تغيير variant أو formattedSpecifications
  useEffect(() => {
    // يمكنك إبقاء هذا الجزء للديباغ عند الحاجة فقط
    // إذا لم تعد بحاجة للطباعة، احذف هذا useEffect بالكامل
    console.log('🔍 VariantEditDrawer - variant:', variant);
    console.log('🔍 VariantEditDrawer - variant.specificationValues:', variant?.specificationValues);
    console.log('🔍 VariantEditDrawer - formattedSpecifications:', formattedSpecifications);
  }, [variant, formattedSpecifications]);

  // في useEffect الخاص بتحليل المواصفات، أبقي فقط الطباعة المهمة
  // useEffect(() => {
  //   if (variant && variant.specificationValues) {
  //     try {
  //       let parsed;
  //       if (typeof variant.specificationValues === 'string') {
  //         parsed = JSON.parse(variant.specificationValues);
  //       } else {
  //         parsed = variant.specificationValues;
  //       }
  //       // يمكنك إبقاء هذا للديباغ عند الحاجة فقط
  //       // console.log('🔍 VariantEditDrawer - parsed specificationValues:', parsed);
  //       if (Array.isArray(parsed)) {
  //         const validSpecs = parsed
  //           .filter((spec: any) => 
  //             spec && 
  //             spec.specificationId && 
  //             spec.valueId && 
  //             spec.value && 
  //             spec.title
  //           )
  //           .map((spec: any) => {
  //             return {
  //               _id: spec.valueId,
  //               specificationId: spec.specificationId,
  //               valueId: spec.valueId,
  //               value: spec.value,
  //               title: spec.title
  //             };
  //           });
  //         // يمكنك إبقاء هذا للديباغ عند الحاجة فقط
  //         // console.log('🔍 VariantEditDrawer - valid specs:', validSpecs);
  //         setSelectedSpecifications(validSpecs);
  //       } else {
  //         setSelectedSpecifications([]);
  //       }
  //     } catch (error) {
  //       console.error('Error parsing specificationValues:', error);
  //       setSelectedSpecifications([]);
  //     }
  //   } else {
  //     setSelectedSpecifications([]);
  //   }
  // }, [variant, formattedSpecifications]);

  // Helper: always ensure colors are array of objects {id, colors}
  function normalizeColors(input: any): { id: string; colors: string[] }[] {
    if (!Array.isArray(input)) return [];
    return input.map((item: any, idx: number) => {
      if (item && typeof item === 'object' && Array.isArray(item.colors)) {
        return item;
      } else if (Array.isArray(item)) {
        return { id: String(idx) + '-' + Date.now(), colors: item };
      } else {
        return { id: String(idx) + '-' + Date.now(), colors: [] };
      }
    });
  }

  // عند فتح drawer أو تغيير variant، حول الألوان للشكل المطلوب
  useEffect(() => {
    setVariantColors(normalizeColors(variant?.colors));
  }, [variant]);

  // معالج تغيير المواصفات
  const handleSpecificationChange = (selected: any[]) => {
    // يمكنك إبقاء هذا للديباغ عند الحاجة فقط
    // console.log('🔍 VariantEditDrawer - handleSpecificationChange called with:', selected);
    
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
    
    // يمكنك إبقاء هذا للديباغ عند الحاجة فقط
    // console.log('🔍 VariantEditDrawer - transformed specs:', transformedSpecs);
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

  const handleColorsChange = (e: React.ChangeEvent<{ name: string; value: { id: string; colors: string[] }[] }>) => {
    setVariantColors(e.target.value);
    onFormChange({
      target: {
        name: 'colors',
        value: e.target.value
      }
    } as any);
  };

  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-3xl h-[85vh] bg-white shadow-2xl rounded-2xl flex flex-col transition-all duration-300 p-0 ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-primary">
            {isRTL ? 'تعديل المتغير' : 'Edit Variant'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-gray-100 hover:bg-primary/10 transition text-xl"
            style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}
            title={isRTL ? 'إغلاق' : 'Close'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[70vh] space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
            {/* ==================== Basic Information Section ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className={`w-5 h-5  text-blue-500 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomInput
                  label={isRTL ? 'اسم المتغير بالعربية' : 'Variant Name (Arabic)'}
                    name="nameAr"
                    value={variant.nameAr || ''}
                    onChange={onFormChange}
                    required
                  />
                <CustomInput
                  label={isRTL ? 'اسم المتغير بالإنجليزية' : 'Variant Name (English)'}
                    name="nameEn"
                    value={variant.nameEn || ''}
                    onChange={onFormChange}
                    required
                  />
                <div className="md:col-span-2">
                  <CustomTextArea
                    label={isRTL ? 'وصف المتغير بالعربية' : 'Variant Description (Arabic)'}
                    name="descriptionAr"
                    value={variant.descriptionAr || ''}
                    onChange={onFormChange}
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <CustomTextArea
                    label={isRTL ? 'وصف المتغير بالإنجليزية' : 'Variant Description (English)'}
                    name="descriptionEn"
                    value={variant.descriptionEn || ''}
                    onChange={onFormChange}
                    rows={2}
                  />
                </div>
                </div>
              </div>

            {/* ==================== Pricing Section ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {isRTL ? 'الأسعار' : 'Pricing'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomInput
                  label={isRTL ? 'السعر' : 'Price'}
                    name="price"
                    value={variant.price || ''}
                    onChange={onFormChange}
                  type="number"
                    required
                  />
                <CustomInput
                  label={isRTL ? 'سعر التكلفة' : 'Cost Price'}
                    name="costPrice"
                    value={variant.costPrice || ''}
                    onChange={onFormChange}
                  type="number"
                />
                <CustomInput
                  label={isRTL ? 'سعر الجملة' : 'Wholesale Price'}
                    name="compareAtPrice"
                    value={variant.compareAtPrice || ''}
                    onChange={onFormChange}
                  type="number"
                  />
                </div>
              </div>

            {/* ==================== Quantity Section ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 12a2 2 0 100-4 2 2 0 000 4zm1 2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2z" />
                </svg>
                  {isRTL ? 'الكمية المتوفرة' : 'Available Quantity'}
              </h3>
              <CustomInput
                label={isRTL ? 'الكمية المتوفرة' : 'Available Quantity'}
                  name="availableQuantity"
                  value={variant.availableQuantity || ''}
                  onChange={onFormChange}
                type="number"
                  min="0"
                />
              </div>

            {/* ==================== Specifications Section ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-indigo-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {isRTL ? 'مواصفات المتغير' : 'Variant Specifications'}
              </h3>
                {formattedSpecifications.length > 0 ? (
                    <CheckboxSpecificationSelector
                      specifications={formattedSpecifications}
                      selectedSpecifications={selectedSpecifications}
                      onSelectionChange={handleSpecificationChange}
                    />
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
            </div>

            {/* ==================== Colors Section ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-pink-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                {isRTL ? 'الألوان' : 'Colors'}
              </h3>
              <CustomColorPicker
                label={isRTL ? 'الألوان' : 'Colors'}
                name="colors"
                value={variantColors}
                onChange={handleColorsChange}
                isRTL={isRTL}
              />
            </div>

            {/* ==================== Media Section ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {isRTL ? 'الوسائط' : 'Media'}
              </h3>
              <div className="space-y-4">
                <CustomFileInput
                  label={isRTL ? 'الصورة الرئيسية' : 'Main Image'}
                  id="mainImage"
                  value={variant.mainImage ? [variant.mainImage] : []}
                  onChange={file => onFormChange({ target: { name: 'mainImage', value: file } } as any)}
                  multiple={false}
                  isRTL={isRTL}
                  beforeChangeValidate={imageValidator}
                />
                <CustomFileInput
                  label={isRTL ? 'الصور الإضافية' : 'Additional Images'}
                  id="images"
                  value={variant.images || []}
                  onChange={files => onFormChange({ target: { name: 'images', value: files } } as any)}
                  multiple={true}
                  isRTL={isRTL}
                  beforeChangeValidate={imageValidator}
                />
                <CustomInput
                  label={isRTL ? 'رابط فيديو المتغير' : 'Variant Video URL'}
                  name="videoUrl"
                  value={variant.videoUrl || ''}
                  onChange={onFormChange}
                />
              </div>
            </div>

            {/* ==================== Barcode Section (Optional) ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isRTL ? 'الباركود' : 'Barcode'}
              </h3>
              <CustomInput
                label={isRTL ? 'باركود المتغير' : 'Variant Barcode'}
                name="barcode"
                value={variant.barcode || ''}
                onChange={onFormChange}
              />
            </div>

            {/* ==================== Settings Section (Optional) ==================== */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isRTL ? 'الإعدادات' : 'Settings'}
              </h3>
              <CustomSwitch
                label={isRTL ? 'ظهور المتغير' : 'Variant Visibility'}
                name="visibility"
                checked={variant.visibility === 'Y'}
                onChange={onFormChange}
                
              />
              <CustomSwitch
                label={isRTL ? 'تحكم بالمخزون' : 'Maintain Stock'}
                name="maintainStock"
                checked={variant.maintainStock === 'Y'}
                onChange={onFormChange}
              
              />
              </div>
            </form>
        </div>

        {/* Footer with Buttons - Fixed at bottom */}
        <div className="flex justify-between gap-3 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          <div></div>
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
                    <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isLoading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default VariantEditDrawer; 