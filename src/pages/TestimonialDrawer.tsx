import React, { useState } from 'react';
import CustomInput from '../components/common/CustomInput';
import CustomSelect from '../components/common/CustomSelect';
import CustomFileInput from '../components/common/CustomFileInput';
import CustomTextArea from '../components/common/CustomTextArea';
import CustomButton from '../components/common/CustomButton';
import CustomRadioGroup from '../components/common/CustomRadioGroup';

interface TestimonialDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: any) => void;
  onDelete: (id: number) => void;
  testimonial: any;
  isRtl: boolean;
  t: any;
}

const TestimonialDrawer: React.FC<TestimonialDrawerProps> = ({ open, onClose, onSave, onDelete, testimonial, isRtl, t }) => {
  const [image, setImage] = useState<string>(testimonial?.image || '');
  const [social, setSocial] = useState<string>(testimonial?.social || 'FACEBOOK');
  const [name, setName] = useState<string>(testimonial?.name || '');
  const [position, setPosition] = useState<string>(testimonial?.position || '');
  const [review, setReview] = useState<string>(testimonial?.review || '');
  const [active, setActive] = useState<boolean>(testimonial?.active ?? true);

  const handleImageChange = (file: File | File[] | null) => {
    if (file && !Array.isArray(file)) {
      const reader = new FileReader();
      reader.onload = (ev: any) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    } else if (Array.isArray(file) && file.length > 0) {
      const reader = new FileReader();
      reader.onload = (ev: any) => setImage(ev.target.result);
      reader.readAsDataURL(file[0]);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave({
      id: testimonial?.id,
      image,
      social,
      name,
      position,
      review,
      active,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">{t('testimonials.addEdit') || 'Add/Edit Testimonial'}</span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col gap-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col ">
              <CustomSelect
                label={t('testimonials.socialIcon') || 'Social Icon'}
                value={social}
                onChange={e => setSocial(e.target.value)}
                options={[
                  { value: 'FACEBOOK', label: 'Facebook' },
                  { value: 'INSTAGRAM', label: 'Instagram' },
                  { value: 'TWITTER', label: 'Twitter' },
                ]}
              />
              <CustomInput
                label={t('testimonials.reviewBy') || 'Review By'}
                value={name}
                onChange={e => setName(e.target.value)}
                labelAlign={isRtl ? 'right' : 'left'}
              />
              <CustomInput
                label={t('testimonials.reviewPosition') || 'Review Position'}
                value={position}
                onChange={e => setPosition(e.target.value)}
                labelAlign={isRtl ? 'right' : 'left'}
              />
            </div>
            <div className="flex flex-col ">
              <CustomRadioGroup
                label={t('testimonials.active') || 'Active'}
                name="active"
                value={active ? 'true' : 'false'}
                options={[
                  { value: 'true', label: t('common.active') || 'Active' },
                  { value: 'false', label: t('common.inactive') || 'Inactive' },
                ]}
                onChange={e => setActive(e.target.value === 'true')}
                labelAlign={isRtl ? 'right' : 'left'}
                isRTL={isRtl}
              />
              <CustomFileInput
                label={t('testimonials.picture') || 'Picture'}
                onChange={handleImageChange}
                
                isRTL={isRtl}
                // placeholder={t('testimonials.selectOrDrop') || 'Select a file or drop one here.'}
              />
            </div>
          </div>
          <CustomTextArea
            label={t('testimonials.review') || 'Review'}
            value={review}
            onChange={e => setReview(e.target.value)}
            
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </form>
        {/* Footer */}
        <div className={`flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl `}>
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel') || 'Cancel'}
            action={onClose}
            bordercolor="primary"
          />
          <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <CustomButton
              color="red-100"
              textColor="red-700"
              text={t('common.delete') || 'Delete'}
              action={testimonial?.id ? () => onDelete(testimonial.id) : undefined}
              disabled={!testimonial?.id}
            />
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