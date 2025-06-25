import CustomFileInput from '@/components/common/CustomFileInput';
import CustomTextArea from '@/components/common/CustomTextArea';
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
        <CustomTextArea
          label={isRTL ? 'رابط الفيديو' : 'Video URL'}
         
          name="url"
          value={form.url}
          placeholder={isRTL ? 'ادخل رابط الفيديو' : 'Enter YouTube video URL'}
          rows={3}  
         
         
          onChange={onFormChange}
        />
        <CustomTextArea
          label={isRTL ? 'الوصف' : 'Description'}
          
          name="description"
          value={form.description}

          placeholder={isRTL ? 'ادخل الوصف' : 'Enter Description'}
          rows={3}
         
         
          onChange={onFormChange}
        />
      </div>
    );
  }
  // Default: slider mode
  return (
    <div className='flex flex-col gap-4'>
      <CustomTextArea
        label={isRTL ? 'الوصف' : 'Description'}

        name="description"
        value={form.description}
        placeholder={isRTL ? 'ادخل الوصف' : 'Enter Description'}
       
       
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