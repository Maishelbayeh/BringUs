import React, { useState, useEffect } from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomButton from '../../components/common/CustomButton';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import { useTranslation } from 'react-i18next';
import useCategories from '../../hooks/useCategories';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (spec: any) => void;
  spec: any;
  validationErrors?: { [key: string]: string };
  onFieldChange?: (field: string) => void;
}

const ProductSpecificationsDrawer: React.FC<Props> = ({ 
  open, 
  onClose, 
  onSave, 
  spec, 
  validationErrors = {},
  onFieldChange 
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const { categories, fetchCategories } = useCategories();
  
  const [form, setForm] = useState({
    id: '',
    descriptionAr: '',
    descriptionEn: '',
    categoryId: '',
    sortOrder: 0
  });

  useEffect(() => {
    if (open && categories.length === 0) {
      fetchCategories();
    }
  }, [open, fetchCategories, categories.length]);

  useEffect(() => {
    if (spec) {
      setForm({
        id: spec._id || spec.id || '',
        descriptionAr: spec.descriptionAr || '',
        descriptionEn: spec.descriptionEn || '',
        categoryId: spec.category?._id || spec.category || '',
        sortOrder: spec.sortOrder || 0
      });
    } else {
      setForm({
        id: '',
        descriptionAr: '',
        descriptionEn: '',
        categoryId: '',
        sortOrder: 0
      });
    }
  }, [spec, open]);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (onFieldChange) {
      onFieldChange(field);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const getErrorStyle = (field: string) => {
    return validationErrors[field] ? 'border-red-500 focus:border-red-500' : '';
  };

  const showError = (field: string) => {
    return validationErrors[field] ? (
      <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
        <span>⚠</span>
        <span>{validationErrors[field]}</span>
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
            {spec ? t('products.editSpec') || 'تعديل مواصفة المنتج' : t('products.addSpec') || 'إضافة مواصفة جديدة'}
          </span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* الوصف العربي */}
            <div className="md:col-span-2">
              <CustomTextArea
                label={isRTL ? 'الوصف العربي' : 'Arabic Description'}
                value={form.descriptionAr}
                onChange={e => handleFormChange('descriptionAr', e.target.value)}
                placeholder={isRTL ? 'أدخل الوصف العربي للمواصفة' : 'Enter Arabic description for specification'}
                rows={3}
                dir="rtl"
                className={getErrorStyle('descriptionAr')}
              />
              {showError('descriptionAr')}
            </div>

            {/* الوصف الإنجليزي */}
            <div className="md:col-span-2">
              <CustomTextArea
                label={isRTL ? 'الوصف الإنجليزي' : 'English Description'}
                value={form.descriptionEn}
                onChange={e => handleFormChange('descriptionEn', e.target.value)}
                placeholder={isRTL ? 'أدخل الوصف الإنجليزي للمواصفة' : 'Enter English description for specification'}
                rows={3}
                dir="ltr"
                className={getErrorStyle('descriptionEn')}
              />
              {showError('descriptionEn')}
            </div>

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
            text={t('common.save') || 'حفظ'}
            type="submit"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSpecificationsDrawer; 