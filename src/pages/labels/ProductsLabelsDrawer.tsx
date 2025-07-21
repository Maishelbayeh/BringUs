import React, { useState, useEffect } from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';
import CustomSwitch from '../../components/common/CustomSwitch';
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
const ProductsLabelsDrawer: React.FC<Props> = ({ 
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
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    isActive: false,
   
    
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
      <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
        {/* <span>⚠</span> */}
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
                {spec ? t('productsLabels.editLabel') || 'تعديل التصنيف' : t('productsLabels.addLabel') || 'إضافة التصنيف'}
          </span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            {/* الاسم بالعربي */}
           
            <div >
              <CustomInput  
                label={isRTL ? t('productsLabels.nameAr') : t('productsLabels.nameEn')}
                value={form.nameAr}
                onChange={e => handleFormChange('nameAr', e.target.value)}
                placeholder={isRTL ? t('productsLabels.nameArPlaceholder') : t('productsLabels.nameEnPlaceholder')}
                required
                className={getErrorStyle('nameAr')}
              />
              {showError('nameAr')}
            </div>

            {/* الوصف الإنجليزي */}
            <div >
              <CustomInput
                label={isRTL ? t('productsLabels.nameEn') : t('productsLabels.nameAr')}
                value={form.nameEn}
                onChange={e => handleFormChange('nameEn', e.target.value)}
                placeholder={isRTL ? t('productsLabels.nameEnPlaceholder') : t('productsLabels.nameArPlaceholder')}
                required
                dir="ltr"
                className={getErrorStyle('nameEn')}
              />
              {showError('nameEn')}
         
            </div>
            <div className="md:col-span-2">
              <CustomTextArea
                label={isRTL ? t('productsLabels.descriptionAr') : t('productsLabels.descriptionEn')}
                value={form.descriptionAr}
                onChange={e => handleFormChange('descriptionAr', e.target.value)}
                placeholder={isRTL ? t('productsLabels.descriptionArPlaceholder') : t('productsLabels.descriptionEnPlaceholder')}
              
                className={getErrorStyle('descriptionAr')}
              />
              {showError('descriptionAr')}
            </div>
            <div className="md:col-span-2">
              <CustomTextArea
                      label={isRTL ? t('productsLabels.descriptionEn') : t('productsLabels.descriptionAr')}
                value={form.descriptionEn}
                onChange={e => handleFormChange('descriptionEn', e.target.value)}
                placeholder={isRTL ? t('productsLabels.descriptionEnPlaceholder') : t('productsLabels.descriptionArPlaceholder')}
               
                className={getErrorStyle('descriptionEn')}
              />
              {showError('descriptionEn')}
            </div>
           
           
            
            {/* حقل التفعيل - يظهر فقط في وضع التعديل */}
            {spec && (
              <div >
                <CustomSwitch
                  label={isRTL ? t('productsLabels.isActive') : 'Active?'}
                  name="isActive"
                  checked={form.isActive}
                  onChange={e => handleFormChange('isActive', e.target.checked)}
                
                />
              </div>
            )}

            
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

export default ProductsLabelsDrawer; 