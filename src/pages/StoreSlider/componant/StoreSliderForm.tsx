import CustomFileInput from '@/components/common/CustomFileInput';
import CustomTextArea from '@/components/common/CustomTextArea';
import CustomInput from '@/components/common/CustomInput';
import CustomNumberInput from '@/components/common/CustomNumberInput';
import CustomSwitch from '@/components/common/CustomSwitch';
import React from 'react';

interface StoreSliderFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (file: File | null) => void;
  errors: {[key: string]: string};
  isRTL: boolean;
  mode?: 'slider' | 'video';
}

const StoreSliderForm: React.FC<StoreSliderFormProps> = ({ form, onFormChange, onFileChange, errors, isRTL}) => {
  console.log('StoreSliderForm render - form.type:', form.type);
  console.log('StoreSliderForm render - form:', form);
  
  // Default values in case form is incomplete
  const safeForm = {
    title: form?.title || '',
    description: form?.description || '',
    type: form?.type || 'slider',
    imageUrl: form?.imageUrl || '',
    videoUrl: form?.videoUrl || '',
    order: form?.order || 0,
    isActive: form?.isActive !== undefined ? form.isActive : true,
    ...form
  };
  
  return (
    <div className='flex flex-col gap-4'>
      {/* Title */}
      <CustomInput
        label={isRTL ? 'العنوان' : 'Title'}
        name="title"
        value={safeForm.title}
        placeholder={isRTL ? 'ادخل العنوان' : 'Enter title'}
        onChange={onFormChange}
        required
        error={errors.title}
      />

      {/* Type Selection - مخفي لأن النوع ثابت */}
      <input type="hidden" name="type" value={safeForm.type} />

      {/* Description */}
      <CustomTextArea
        label={isRTL ? 'الوصف' : 'Description'}
        name="description"
        value={safeForm.description}
        placeholder={isRTL ? 'ادخل الوصف (اختياري)' : 'Enter description (optional)'}
        rows={3}
        onChange={onFormChange}
        error={errors.description}
      />

      {/* Conditional fields based on type */}
      {safeForm.type === 'slider' ? (
        <CustomFileInput 
          label={isRTL ? 'الصورة' : 'Image'} 
          id="image" 
          value={safeForm.imageUrl} 
          onChange={(files) => {
            if (Array.isArray(files)) {
              onFileChange(files[0] || null);
            } else {
              onFileChange(files);
            }
          }} 
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          error={errors.imageUrl}
        />
      ) : (
        <CustomInput
          label={isRTL ? 'رابط الفيديو' : 'Video URL'}
          name="videoUrl"
          value={safeForm.videoUrl}
          placeholder={isRTL ? 'ادخل رابط YouTube' : 'Enter YouTube URL'}
          onChange={onFormChange}
          required
          error={errors.videoUrl}
        />
      )}

      {/* Order */}
      <CustomNumberInput
        label={isRTL ? 'الترتيب' : 'Order'}
        name="order"
        value={safeForm.order}
        onChange={(value) => onFormChange({ target: { name: 'order', value } } as any)}
        min={0}
        error={errors.order}
      />

      {/* Active Status */}
      <CustomSwitch
        label={isRTL ? 'مفعل' : 'Active'}
        name="isActive"
        
        checked={safeForm.isActive}
        onChange={(e) => {
          onFormChange({ target: { name: 'isActive', value: e.target.checked } } as any);
        }}
      />
    </div>
  );
};

export default StoreSliderForm; 