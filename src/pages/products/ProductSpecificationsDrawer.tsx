import React, { useState, useEffect } from 'react';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomButton from '../../components/common/CustomButton';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (spec: any) => void;
  spec: any;
}

const ProductSpecificationsDrawer: React.FC<Props> = ({ open, onClose, onSave, spec }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [description, setDescription] = useState('');

  useEffect(() => {
    setDescription(spec?.description || '');
  }, [spec, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onSave({ ...spec, description });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md mx-2 relative flex flex-col ${isArabic ? 'text-right' : 'text-left'}`}
        dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">{spec ? t('products.editSpec') || 'تعديل الصفة' : t('products.addSpec') || 'إضافة صفة جديدة'}</span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col p-4">
          <CustomTextArea
            label={t('products.specDescription')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('products.specDescriptionPlaceholder')}
            rows={5}
            dir={isArabic ? 'rtl' : 'ltr'}
            labelAlign={isArabic ? 'right' : 'left'}
          />
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