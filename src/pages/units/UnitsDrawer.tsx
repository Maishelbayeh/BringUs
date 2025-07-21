import React, { useState, useEffect } from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';
import CustomSwitch from '../../components/common/CustomSwitch';
import { useTranslation } from 'react-i18next';
import useCategories from '../../hooks/useCategories';
import useUnits from '../../hooks/useUnits';
import { useValidation } from '../../hooks/useValidation';
import { unitsValidationSchema, validateUnitsWithDuplicates } from '../../validation/unitsValidation';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  spec: any;
}

const UnitsDrawer: React.FC<Props> = ({ 
  open, 
  onClose, 
  onSaveSuccess,
  spec, 
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const { categories, fetchCategories } = useCategories();
  const { units, saveUnit } = useUnits();
  
  const { errors, setErrors, clearAllErrors } = useValidation({
    schema: unitsValidationSchema
  });
  
  const [form, setForm] = useState({
    id: '',
    nameAr: '',
    descriptionAr: '',
    descriptionEn: '',
    nameEn: '',
    isActive: false,
    sortOrder: 0,
    symbol: ''
  });

  useEffect(() => {
    if (open && categories.length === 0) {
      fetchCategories();
    }
  }, [open, fetchCategories, categories.length]);

  useEffect(() => {
    if (spec) {
      // وضع التعديل - نعرض القيمة الحالية
      setForm({
        id: spec._id || spec.id || '',
        nameAr: spec.nameAr || '',
        nameEn: spec.nameEn || '',
        descriptionAr: spec.descriptionAr || '',
        descriptionEn: spec.descriptionEn || '',
        isActive: spec.isActive || false,
        sortOrder: spec.sortOrder || 0,
        symbol: spec.symbol || ''
      });
    } else {
      // وضع الإضافة - نضع isActive كـ true تلقائياً
      setForm({
        id: '',
        nameAr: '',
        nameEn: '',
        descriptionAr: '',
        descriptionEn: '',
        isActive: true, // تلقائياً مفعل في الإضافة
        sortOrder: 0,
        symbol: ''
      });
    }
  }, [spec, open]);

  const handleFormChange = (field: string, value: any) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    
    // Real-time validation
    const validationResult = validateUnitsWithDuplicates(
      { ...newForm, id: spec?._id },
      units,
      t
    );
    setErrors(validationResult.errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationResult = validateUnitsWithDuplicates(
      { ...form, id: spec?._id },
      units,
      t
    );

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }

    try {
      await saveUnit(form, spec?._id);
      clearAllErrors();
      onSaveSuccess();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const getErrorStyle = (field: string) => {
    return errors[field] ? 'border-red-500 focus:border-red-500' : '';
  };

  const showError = (field: string) => {
    return errors[field] ? (
      <div className="text-red-500 text-sm mt-1">
        <span>{errors[field]}</span>
      </div>
    ) : null;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col max-h-[90vh] overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {spec ? t('units.editUnit') || 'تعديل الوحدة' : t('units.addUnit') || 'إضافة وحدة جديدة'}
          </span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* الاسم بالعربي */}
           
            <div >
              <CustomInput  
                label={isRTL ? 'الاسم بالعربية' : 'Arabic name'}
                value={form.nameAr}
                onChange={e => handleFormChange('nameAr', e.target.value)}
                placeholder={isRTL ? 'أدخل الاسم بالعربية' : 'Enter Arabic name'}
                required
                className={getErrorStyle('nameAr')}
              />
              {showError('nameAr')}
            </div>

            {/* الوصف الإنجليزي */}
            <div >
              <CustomInput
                label={isRTL ? 'الاسم بالانجليزية' : 'English name'}
                value={form.nameEn}
                onChange={e => handleFormChange('nameEn', e.target.value)}
                placeholder={isRTL ? 'أدخل الاسم بالانجليزية' : 'Enter English name'}
                required
                dir="ltr"
                className={getErrorStyle('nameEn')}
              />
              {showError('nameEn')}
         
            </div>
            <div className="md:col-span-2">
              <CustomTextArea
                label={isRTL ? 'الوصف بالعربية' : 'Arabic description'}
                value={form.descriptionAr}
                onChange={e => handleFormChange('descriptionAr', e.target.value)}
                placeholder={isRTL ? 'أدخل الوصف بالعربية' : 'Enter Arabic description'}
              
                className={getErrorStyle('descriptionAr')}
              />
              {showError('descriptionAr')}
            </div>
            <div className="md:col-span-2">
              <CustomTextArea
                      label={isRTL ? 'الوصف بالانجليزية' : 'English description'}
                value={form.descriptionEn}
                onChange={e => handleFormChange('descriptionEn', e.target.value)}
                placeholder={isRTL ? 'أدخل الوصف بالانجليزية' : 'Enter English description'}
               
                className={getErrorStyle('descriptionEn')}
              />
              {showError('descriptionEn')}
            </div>
           
            <div >
              <CustomInput
                type="number"
                label={isRTL ? t('units.sortOrder') : 'Sort Order'}
                value={form.sortOrder}
                onChange={e => handleFormChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder={isRTL ? 'أدخل ترتيب الفرز' : 'Enter sort order'}
                className={getErrorStyle('sortOrder')}
              />
            </div>
            <div>
              <CustomInput
                label={isRTL ? t('units.symbol') : 'Symbol'}
                value={form.symbol}
                onChange={e => handleFormChange('symbol', e.target.value)}
                placeholder={isRTL ? 'أدخل الرمز' : 'Enter symbol'}
                required
                className={getErrorStyle('symbol')}
              />
              {showError('symbol')}
            </div>
            {/* حقل التفعيل - يظهر فقط في وضع التعديل */}
            {spec && (
              <div >
                <CustomSwitch
                  label={isRTL ? t('units.isActive') : 'Active?'}
                  name="isActive"
                  checked={form.isActive}
                  onChange={e => handleFormChange('isActive', e.target.checked)}
                  
                />
              </div>
            )}

            {/* التصنيف */}
            {/* <div>
              <CustomSelect
                label={isRTL ? 'التصنيف (اختياري)' : 'Category (Optional)'}
                value={form.categoryId}
                onChange={e => handleFormChange('categoryId', e.target.value)}
                options={[
                  { value: '', label: isRTL ? 'اختر التصنيف (اختياري)' : 'Select Category (Optional)' },
                  ...categories.map((cat: any) => ({
                    value: cat._id || cat.id,
                    label: isRTL ? cat.nameAr : cat.nameEn
                  }))
                ]}
                className={getErrorStyle('categoryId')}
              />
              {showError('categoryId')}
            </div> */}

            {/* ترتيب الفرز */}
            {/* <div>
              <CustomInput
                type="number"
                label={isRTL ? 'ترتيب الفرز' : 'Sort Order'}
                value={form.sortOrder}
                onChange={e => handleFormChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder={isRTL ? 'أدخل ترتيب الفرز' : 'Enter sort order'}
                className={getErrorStyle('sortOrder')}
              />
              {showError('sortOrder')}
            </div> */}

            {/* التفعيل */}
            {/* <div className="md:col-span-2">
              <CustomInput
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={e => handleFormChange('isActive', e.target.checked)}
                label={isRTL ? 'مفعل' : 'Active'}
                className={`w-5 h-5 text-primary accent-primary mt-6 ${getErrorStyle('isActive')}`}
              />
              {showError('isActive')}
            </div> */}
          </div>
        </form>
        
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel') || 'إلغاء'}
            action={onClose}
            bordercolor="primary"
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={spec ? t('common.update') || 'تعديل' : t('common.save') || 'حفظ'}
            type="submit"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default UnitsDrawer; 