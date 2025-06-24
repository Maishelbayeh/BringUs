import CustomFileInput from '@/components/common/CustomFileInput';
import CustomInput from '@/components/common/CustomInput';
import React from 'react';


interface StoreSliderFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRTL: boolean;
  mode?: 'slider' | 'video';
}

const StoreSliderForm: React.FC<StoreSliderFormProps> = ({ form, onFormChange, onImageChange, isRTL, mode = 'slider' }) => {
  if (mode === 'video') {
    return (
      <div className='flex flex-col gap-4'>
        <CustomInput
          label={isRTL ? 'رابط الفيديو' : 'Video URL'}
          id="image"
          name="image"
          value={form.image}
          required
          placeholder={isRTL ? 'ادخل رابط الفيديو' : 'Enter YouTube video URL'}
          type="text"
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          labelAlign={isRTL ? 'right' : 'left'}
          onChange={onFormChange}
        />
        <CustomInput
          label={isRTL ? 'الوصف' : 'Description'}
          id="description"
          name="description"
          value={form.description}
          required
          placeholder={isRTL ? 'ادخل الوصف' : 'Enter Description'}
          type="text"
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          labelAlign={isRTL ? 'right' : 'left'}
          onChange={onFormChange}
        />
      </div>
    );
  }
  // Default: slider mode
  return (
    <div className='flex flex-col gap-4'>
      <CustomInput
        label={isRTL ? 'الوصف' : 'Description'}
        id="description"
        name="description"
        value={form.description}
        required
        placeholder={isRTL ? 'ادخل الوصف' : 'Enter Description'}
        type="text"
        style={{ textAlign: isRTL ? 'right' : 'left' }}
        labelAlign={isRTL ? 'right' : 'left'}
        onChange={onFormChange}
      />
      <CustomFileInput label={isRTL ? 'الصورة' : 'Image'} 
      id="image" value={form.image} 
      onChange={file => onImageChange({ target: { files: file ? [file] : [] } } as any)} 
       style={{ textAlign: isRTL ? 'right' : 'left' }}  />
    </div>
  );
};

export default StoreSliderForm; 