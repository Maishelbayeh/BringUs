import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import TestimonialDrawer from './TestimonialDrawer';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '@/components/common/CustomBreadcrumb';
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp, FaYoutube, FaLinkedinIn, FaTiktok } from 'react-icons/fa';

export const socialIcons = {
  FACEBOOK: <FaFacebookF className="w-7 h-7 text-[#1877F3] bg-white rounded-full p-1 shadow" />,
  INSTAGRAM: <FaInstagram className="w-7 h-7 text-[#E4405F] bg-white rounded-full p-1 shadow" />,
  TWITTER: <FaTwitter className="w-7 h-7 text-[#1DA1F2] bg-white rounded-full p-1 shadow" />,
  WHATSAPP: <FaWhatsapp className="w-7 h-7 text-[#25D366] bg-white rounded-full p-1 shadow" />,
  YOUTUBE: <FaYoutube className="w-7 h-7 text-[#FF0000] bg-white rounded-full p-1 shadow" />,
  LINKEDIN: <FaLinkedinIn className="w-7 h-7 text-[#0077B5] bg-white rounded-full p-1 shadow" />,
  TIKTOK: <FaTiktok className="w-7 h-7 text-[#000000] bg-white rounded-full p-1 shadow" />,
};
///////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////
const Testimonial: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [testimonials] = useState(initialTestimonials);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  //------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (item: any) => {
    setEditing(item);
    setModalOpen(true);
  };
  //------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (id: number) => {
   //CONSOLE.log(id);
    setModalOpen(false);
  };
  //------------------------------------------- handleSave -------------------------------------------
  const handleSave = (item: any) => {
  //CONSOLE.log(item);
    setModalOpen(false);
  };
  //------------------------------------------- filteredTestimonials -------------------------------------------
  const filteredTestimonials = testimonials.filter((item: any) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.position.toLowerCase().includes(q) ||
      item.review.toLowerCase().includes(q)
    );
  });
  //------------------------------------------- return -------------------------------------------
  return (
    <div className="sm:p-4 w-full">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.testimonials') || 'Testimonials', href: '/testimonials' }
      ]} isRtl={isRtl} />
{/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('testimonials.title') || 'Testimonials'}
        addLabel={t('common.add') || 'Add New'}
        onAdd={handleAdd}
        isRtl={isRtl}
        showSearch={true}
        searchValue={search}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('testimonials.search') || 'Search testimonials...'}
        count={filteredTestimonials.length}
      />
      {/* ------------------------------------------- Testimonials ------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredTestimonials.map((item: any) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg flex flex-col cursor-pointer hover:shadow-2xl transition group overflow-hidden relative"
           onClick={() => handleEdit(item)}>
            <div className="relative w-full h-44 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'}`}>{socialIcons[item.social as keyof typeof socialIcons]}</div>
            </div>
            <div className="flex flex-col gap-1 p-4 flex-1">
              <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}> 
                <span className="font-bold text-lg text-primary">{item.name}</span>
                <span className="text-xs text-gray-400">{item.position}</span>
              </div>
              <div className={`text-gray-700 text-sm mt-1 mb-2 line-clamp-3 ${isRtl ? 'text-right' : 'text-left'}`}>{item.review}</div>
              <div className="mt-auto" dir={isRtl ? 'rtl' : 'ltr'}>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}` } >{item.active ? t('testimonials.active') || 'Active' : t('testimonials.inactive') || 'Inactive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* ------------------------------------------- TestimonialDrawer ------------------------------------------- */}
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