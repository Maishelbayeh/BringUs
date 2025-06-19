import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import TestimonialDrawer from './TestimonialDrawer';
import HeaderWithAction from '../components/common/HeaderWithAction';

const socialIcons = {
  FACEBOOK: <svg className="w-7 h-7 text-[#1877F3] bg-white rounded-full p-1 shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>,
  INSTAGRAM: <svg className="w-7 h-7 text-[#E4405F] bg-white rounded-full p-1 shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.334 3.608 1.385 2.557 2.436 2.351 3.548 2.293 4.829 2.235 6.109 2.223 6.518 2.223 12c0 5.482.012 5.891.07 7.171.058 1.281.264 2.393 1.315 3.444 1.051 1.051 2.163 1.257 3.444 1.315C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.393-.264 3.444-1.315 1.051-1.051 1.257-2.163 1.315-3.444.058-1.28.07-1.689.07-7.171 0-5.482-.012-5.891-.07-7.171-.058-1.281-.264-2.393-1.315-3.444C19.341.334 18.229.128 16.948.07 15.668.012 15.259 0 12 0z"/><path d="M12 5.838A6.162 6.162 0 0 0 5.838 12 6.162 6.162 0 0 0 12 18.162 6.162 6.162 0 0 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.324A4.162 4.162 0 1 1 16.162 12 4.162 4.162 0 0 1 12 16.162z"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>,
  TWITTER: <svg className="w-7 h-7 text-[#1DA1F2] bg-white rounded-full p-1 shadow" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.142 0 14.307-7.721 13.995-14.646A9.936 9.936 0 0 0 24 4.557z"/></svg>,
};

const initialTestimonials = [
  {
    id: 1,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    social: 'FACEBOOK',
    name: 'John Doe',
    position: 'Store Owner',
    review: 'Great system for managing my store and increasing sales!',
    active: true,
  },
  {
    id: 2,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    social: 'INSTAGRAM',
    name: 'Jane Smith',
    position: 'Marketing Manager',
    review: 'Easy to use and helped us reach more customers.',
    active: true,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=256&h=256&q=80',
    social: 'TWITTER',
    name: 'Ali Ahmad',
    position: 'Distributor',
    review: 'The best platform for distributors and retailers!',
    active: false,
  },
  {
    id: 4,
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    social: 'FACEBOOK',
    name: 'Mohammed Saleh',
    position: 'Sales Rep',
    review: 'Very powerful and easy to use.',
    active: true,
  },
];

const Testimonial: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setModalOpen(true);
  };
  const handleDelete = (id: number) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    setModalOpen(false);
  };
  const handleSave = (item: any) => {
    if (item.id) {
      setTestimonials(prev => prev.map(t => t.id === item.id ? item : t));
    } else {
      setTestimonials(prev => [...prev, { ...item, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 w-full">
      <HeaderWithAction
        title={t('testimonials.title') || 'Testimonials'}
        addLabel={t('common.add') || 'Add New'}
        onAdd={handleAdd}
        isRtl={isRtl}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {testimonials.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg flex flex-col cursor-pointer hover:shadow-2xl transition group overflow-hidden relative" onClick={() => handleEdit(item)}>
            <div className="relative w-full h-44 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'}`}>{socialIcons[item.social as keyof typeof socialIcons]}</div>
            </div>
            <div className="flex flex-col gap-1 p-4 flex-1">
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}> 
                <span className="font-bold text-lg text-primary">{item.name}</span>
                <span className="text-xs text-gray-400">{item.position}</span>
              </div>
              <div className="text-gray-700 text-sm mt-1 mb-2 line-clamp-3">{item.review}</div>
              <div className="mt-auto">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.active ? t('testimonials.active') || 'Active' : t('testimonials.inactive') || 'Inactive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modalOpen && (
        <TestimonialDrawer
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
          testimonial={editing}
          isRtl={isRtl}
          t={t}
        />
      )}
    </div>
  );
};

export default Testimonial; 