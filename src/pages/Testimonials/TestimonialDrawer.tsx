import React, { useState, useEffect } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomSelect from '../../components/common/CustomSelect';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomButton from '../../components/common/CustomButton';
import CustomSwitch from '../../components/common/CustomSwitch';
import { socialIcons, platformOptions } from './Testimonial';
import { type Testimonial } from '@/hooks/useTestimonials';

interface TestimonialDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  onDelete: (item: Testimonial) => void;
  testimonial: Testimonial | null;
  isRtl: boolean;
  t: any;
}

const TestimonialDrawer: React.FC<TestimonialDrawerProps> = ({ open, onClose, onSave, onDelete, testimonial, isRtl, t }) => {
  const [formData, setFormData] = useState({
    platform: 'FACEBOOK',
    image: '',
    personName: '',
    personTitle: '',
    comment: '',
    active: true,
  });

  // Update form data when testimonial changes
  useEffect(() => {
    if (testimonial) {
      setFormData({
        platform: testimonial.platform,
        image: testimonial.image,
        personName: testimonial.personName,
        personTitle: testimonial.personTitle,
        comment: testimonial.comment,
        active: testimonial.active,
      });
    } else {
      setFormData({
        platform: 'FACEBOOK',
        image: '',
        personName: '',
        personTitle: '',
        comment: '',
        active: true,
      });
    }
  }, [testimonial]);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File | File[] | null) => {
    if (file && !Array.isArray(file)) {
      const reader = new FileReader();
      reader.onload = (ev: any) => handleFormChange('image', ev.target.result);
      reader.readAsDataURL(file);
    } else if (Array.isArray(file) && file.length > 0) {
      const reader = new FileReader();
      reader.onload = (ev: any) => handleFormChange('image', ev.target.result);
      reader.readAsDataURL(file[0]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">
            {testimonial ? t('testimonials.edit') || 'Edit Testimonial' : t('testimonials.add') || 'Add Testimonial'}
          </span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <CustomSelect
                label={t('testimonials.platform') || 'Platform'}
                value={formData.platform}
                onChange={e => handleFormChange('platform', e.target.value)}
                options={platformOptions}
              />
              
              <CustomInput
                label={t('testimonials.personName') || 'Person Name'}
                value={formData.personName}
                onChange={e => handleFormChange('personName', e.target.value)}
                placeholder={t('testimonials.enterPersonName') || 'Enter person name'}
                required
              />
              
              <CustomInput
                label={t('testimonials.personTitle') || 'Person Title'}
                value={formData.personTitle}
                onChange={e => handleFormChange('personTitle', e.target.value)}
                placeholder={t('testimonials.enterPersonTitle') || 'Enter person title'}
               
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <CustomSwitch
                label={t('testimonials.active') || 'Active'}
                name="active"
                checked={formData.active}
                onChange={(e) => handleFormChange('active', e.target.checked)}
              />
              
              <CustomFileInput
                label={t('testimonials.picture') || 'Picture'}
                onChange={handleImageChange}
                value={formData.image}
                isRTL={isRtl}
              />
            </div>
          </div>
          
          <CustomTextArea
            label={t('testimonials.comment') || 'Comment'}
            value={formData.comment}
            onChange={e => handleFormChange('comment', e.target.value)}
            placeholder={t('testimonials.enterComment') || 'Enter comment'}
            rows={4}
            required
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </form>
        
        {/* Footer */}
        <div className={`flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl`}>
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel') || 'Cancel'}
            action={onClose}
            bordercolor="primary"
          />
          <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {testimonial && (
              <CustomButton
                color="red-100"
                textColor="red-700"
                text={t('common.delete') || 'Delete'}
                action={() => onDelete(testimonial)}
              />
            )}
            <CustomButton
              color="primary"
              textColor="white"
              text={t('common.save') || 'Save'}
              type="submit"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialDrawer; 