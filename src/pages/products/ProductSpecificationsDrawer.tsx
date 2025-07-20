import React, { useState, useEffect, useRef } from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomButton from '../../components/common/CustomButton';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import CustomSwitch from '../../components/common/CustomSwitch';
import { useTranslation } from 'react-i18next';
import useCategories from '../../hooks/useCategories';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
    titleAr: '',
    titleEn: '',
    categoryId: '',
    sortOrder: 0,
    isActive: true,
    values: [] as Array<{ valueAr: string; valueEn: string; _id?: string }>
  });

  const [saving, setSaving] = useState(false);
  const valuesEndRef = useRef<HTMLDivElement>(null);
  const [lastAddedIndex, setLastAddedIndex] = useState<number>(-1);

  useEffect(() => {
    if (open && categories.length === 0) {
      fetchCategories();
    }
  }, [open, fetchCategories, categories.length]);

  useEffect(() => {
    if (spec) {
      setForm({
        id: spec._id || spec.id || '',
        titleAr: spec.titleAr || '',
        titleEn: spec.titleEn || '',
        categoryId: spec.category?._id || spec.category || '',
        sortOrder: spec.sortOrder || 0,
        isActive: spec.isActive !== undefined ? spec.isActive : true,
        values: spec.values?.map((value: any) => ({
          valueAr: value.valueAr || '',
          valueEn: value.valueEn || '',
          _id: value._id
        })) || []
      });
    } else {
      setForm({
        id: '',
        titleAr: '',
        titleEn: '',
        categoryId: '',
        sortOrder: 0,
        isActive: true,
        values: []
      });
    }
  }, [spec, open]);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (onFieldChange) {
      onFieldChange(field);
    }
  };

  const handleValueChange = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.map((val, i) => 
        i === index ? { ...val, [field]: value } : val
      )
    }));
  };

  const addValue = () => {
    setForm(prev => {
      const newIndex = prev.values.length;
      setLastAddedIndex(newIndex);
      return {
        ...prev,
        values: [...prev.values, { valueAr: '', valueEn: '' }]
      };
    });
  };

  // Scroll to bottom and focus on new value when added
  useEffect(() => {
    if (lastAddedIndex >= 0 && valuesEndRef.current) {
      // Scroll to the new value
      valuesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      
      // Focus on the Arabic input of the new value after a short delay
      setTimeout(() => {
        const arabicInput = document.querySelector(`input[name="valueAr-${lastAddedIndex}"]`) as HTMLInputElement;
        if (arabicInput) {
          arabicInput.focus();
        }
      }, 100);
      
      // Reset the last added index
      setLastAddedIndex(-1);
    }
  }, [lastAddedIndex]);

  const removeValue = (index: number) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
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
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-2 relative flex flex-col max-h-[90vh] overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
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
            {/* العنوان العربي */}
            <div>
              <CustomInput
                label={isRTL ? 'العنوان العربي' : 'Arabic Title'}
                value={form.titleAr}
                onChange={e => handleFormChange('titleAr', e.target.value)}
                placeholder={isRTL ? 'أدخل العنوان العربي للمواصفة' : 'Enter Arabic title for specification'}
                dir="rtl"
                className={getErrorStyle('titleAr')}
              />
              {showError('titleAr')}
            </div>

            {/* العنوان الإنجليزي */}
            <div>
              <CustomInput
                label={isRTL ? 'العنوان الإنجليزي' : 'English Title'}
                value={form.titleEn}
                onChange={e => handleFormChange('titleEn', e.target.value)}
                placeholder={isRTL ? 'أدخل العنوان الإنجليزي للمواصفة' : 'Enter English title for specification'}
                dir="ltr"
                className={getErrorStyle('titleEn')}
              />
              {showError('titleEn')}
            </div>

            {/* التصنيف */}
            <div>
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
            </div>

            {/* ترتيب الفرز */}
            <div>
              <CustomInput
                type="number"
                label={isRTL ? 'ترتيب الفرز' : 'Sort Order'}
                value={form.sortOrder}
                onChange={e => handleFormChange('sortOrder', parseInt(e.target.value) || 0)}
                placeholder={isRTL ? 'أدخل ترتيب الفرز' : 'Enter sort order'}
                className={getErrorStyle('sortOrder')}
              />
              {showError('sortOrder')}
            </div>

            {/* التفعيل */}
            <div className="md:col-span-2">
              <CustomSwitch
                label={isRTL ? 'مفعل' : 'Active'}
                name="isActive"
                checked={form.isActive}
                onChange={e => handleFormChange('isActive', e.target.checked)}
               
              />
              {showError('isActive')}
            </div>
          </div>

          {/* Values Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isRTL ? 'قيم المواصفة' : 'Specification Values'}
              </h3>
              <CustomButton
                color="primary"
                textColor="white"
                text={isRTL ? 'إضافة قيمة' : 'Add Value'}
                action={addValue}
                icon={<PlusIcon className="w-4 h-4" />}
                size="sm"
              />
            </div>

            {showError('values')}

            <div className="space-y-4">
              {form.values.map((value, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      {isRTL ? `القيمة ${index + 1}` : `Value ${index + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                      title={isRTL ? 'حذف القيمة' : 'Remove Value'}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <CustomInput
                        name={`valueAr-${index}`}
                        label={isRTL ? 'القيمة العربية' : 'Arabic Value'}
                        value={value.valueAr}
                        onChange={e => handleValueChange(index, 'valueAr', e.target.value)}
                        placeholder={isRTL ? 'أدخل القيمة العربية' : 'Enter Arabic value'}
                        dir="rtl"
                        className={getErrorStyle(`values.${index}.valueAr`)}
                      />
                      {showError(`values.${index}.valueAr`)}
                    </div>
                    
                    <div>
                      <CustomInput
                        name={`valueEn-${index}`}
                        label={isRTL ? 'القيمة الإنجليزية' : 'English Value'}
                        value={value.valueEn}
                        onChange={e => handleValueChange(index, 'valueEn', e.target.value)}
                        placeholder={isRTL ? 'أدخل القيمة الإنجليزية' : 'Enter English value'}
                        dir="ltr"
                        className={getErrorStyle(`values.${index}.valueEn`)}
                      />
                      {showError(`values.${index}.valueEn`)}
                    </div>
                  </div>
                </div>
              ))}
              {/* Invisible div for scroll target */}
              <div ref={valuesEndRef} />
            </div>

            {form.values.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>{isRTL ? 'لا توجد قيم مضافة بعد' : 'No values added yet'}</p>
                <p className="text-sm">{isRTL ? 'اضغط على "إضافة قيمة" لبدء إضافة القيم' : 'Click "Add Value" to start adding values'}</p>
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
            disabled={saving}
          />
          <div className="flex gap-2">
            {saving && (
              <div className="flex items-center gap-2 text-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">{isRTL ? 'جاري الحفظ...' : 'Saving...'}</span>
              </div>
            )}
            <CustomButton
              color="primary"
              textColor="white"
              text={t('common.save') || 'حفظ'}
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSpecificationsDrawer; 