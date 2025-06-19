import React, { useState } from 'react';
import CustomInput from '../components/common/CustomInput';
import CustomSelect from '../components/common/CustomSelect';

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
  const [image, setImage] = useState(testimonial?.image || '');
  const [social, setSocial] = useState(testimonial?.social || 'FACEBOOK');
  const [name, setName] = useState(testimonial?.name || '');
  const [position, setPosition] = useState(testimonial?.position || '');
  const [review, setReview] = useState(testimonial?.review || '');
  const [active, setActive] = useState(testimonial?.active ?? true);

  // رفع صورة وهمي (بدون رفع فعلي)
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev: any) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-primary text-xl">×</button>
        <h2 className="text-2xl font-bold text-center mb-4">{t('testimonials.addEdit') || 'Add/Edit Testimonial'}</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1">{t('testimonials.picture') || 'Picture'}</label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition mb-2">
            <input type="file" accept="image/*" className="hidden" id="testimonial-image-upload" onChange={handleImageChange} />
            <label htmlFor="testimonial-image-upload" className="block cursor-pointer">
              {image ? <img src={image} alt="preview" className="w-24 h-24 object-cover rounded mx-auto" /> : <span className="text-gray-400">{t('testimonials.dragDrop') || 'Drag and Drop'}<br />{t('testimonials.selectOrDrop') || 'Select a file or drop one here.'}</span>}
            </label>
          </div>
        </div>
        <div className="mb-3">
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
        </div>
        <div className="mb-3">
          <CustomInput
            label={t('testimonials.reviewBy') || 'Review By'}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <CustomInput
            label={t('testimonials.reviewPosition') || 'Review Position'}
            value={position}
            onChange={e => setPosition(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <CustomInput
            label={t('testimonials.review') || 'Review'}
            value={review}
            onChange={e => setReview(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className={`block font-semibold mb-1 ${isRtl ? 'text-right' : 'text-left'}`}>{t('testimonials.active') || 'Active'}</label>
          <div className={`flex gap-4 mt-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <button type="button" className={`px-4 py-1 rounded ${!active ? 'bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-500'}`} onClick={() => setActive(false)}>{t('common.no') || 'No'}</button>
            <button type="button" className={`px-4 py-1 rounded ${active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`} onClick={() => setActive(true)}>{t('common.yes') || 'Yes'}</button>
          </div>
        </div>
        <div className={`flex justify-between mt-6 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">{t('common.cancel') || 'Cancel'}</button>
          {testimonial?.id && <button onClick={() => onDelete(testimonial.id)} className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200">{t('common.delete') || 'Delete'}</button>}
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark">{t('common.applyChanges') || 'Apply Changes'}</button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialDrawer; 