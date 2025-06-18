import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CustomTextArea from '../../components/common/CustomTextArea';
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

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({ ...spec, description });
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} style={{ display: open ? 'block' : 'none' }}>
      <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" onClick={onClose}></div>
      <div className={`fixed top-0 ${isArabic ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-lg transition-transform duration-300 ${open ? 'translate-x-0' : isArabic ? '-translate-x-full' : 'translate-x-full'}`} style={{ zIndex: 100 }} dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-primary">{spec ? t('products.editSpec') || 'تعديل الصفة' : t('products.addSpec') || 'إضافة صفة جديدة'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-primary">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4 pb-24">
          <CustomTextArea
            label={t('products.specDescription')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('products.specDescriptionPlaceholder')}
            rows={5}
            dir={isArabic ? 'rtl' : 'ltr'}
            labelAlign={isArabic ? 'right' : 'left'}
          />
        </div>
        <div className={`flex justify-end gap-2 p-4 border-t bg-white fixed bottom-0 ${isArabic ? 'left-0' : 'right-0'} max-w-md w-full z-50`}>
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">{t('common.cancel') || 'إلغاء'}</button>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark">{t('common.save') || 'حفظ'}</button>
        </div>
      </div>
    </div>
  );
};

export default ProductSpecificationsDrawer; 