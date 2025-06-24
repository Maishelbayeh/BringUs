import React from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomTextArea from '@/components/common/CustomTextArea';
import { useTranslation } from 'react-i18next';

interface SubcategoriesFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRTL: boolean;
}

const SubcategoriesForm: React.FC<SubcategoriesFormProps> = ({ form, onFormChange, onImageChange, isRTL }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CustomInput label={t('subcategories.nameAr')} name="nameAr" value={form.nameAr} onChange={onFormChange} required />
      <CustomInput label={t('subcategories.nameEn')} name="nameEn" value={form.nameEn} onChange={onFormChange} required  />
      <CustomTextArea label={t('subcategories.descriptionAr')} name="descriptionAr" value={form.descriptionAr} onChange={onFormChange}   />
      <CustomTextArea label={t('subcategories.descriptionEn')} name="descriptionEn" value={form.descriptionEn} onChange={onFormChange}   />
      <div className="sm:col-span-2">
        <CustomFileInput label={isRTL ? t('subcategories.image') : t('subcategories.image') || 'Image'} id="image" value={form.image} onChange={file => onImageChange({ target: { files: file ? [file] : [] } } as any)} />
      </div>
    </div>
  );
};

export default SubcategoriesForm; 