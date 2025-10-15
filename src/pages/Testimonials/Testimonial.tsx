import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TestimonialDrawer from './TestimonialDrawer';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '@/components/common/CustomBreadcrumb';
import PermissionModal from '@/components/common/PermissionModal';
import { useTestimonials, type Testimonial } from '@/hooks/useTestimonials';
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

export const platformOptions = [
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'TikTok', label: 'TikTok' },
];
const Testimonial: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

  // Testimonials Hook
  const {
    loading,
    error,
    testimonials,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  } = useTestimonials();

  // Load testimonials on component mount
  useEffect(() => {
    getAllTestimonials();
  }, [getAllTestimonials]);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Testimonial) => {
    setEditing(item);
    setModalOpen(true);
  };

  const handleDelete = (item: Testimonial) => {
    setTestimonialToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (testimonialToDelete) {
      try {
        await deleteTestimonial(testimonialToDelete._id);
        setTestimonialToDelete(null);
        setShowDeleteModal(false);
        // إغلاق الدراور إذا كان مفتوحاً
        setModalOpen(false);
        setEditing(null);
      } catch (error) {
        console.error('Error deleting testimonial:', error);
      }
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (editing) {
        await updateTestimonial(editing._id, formData);
      } else {
        await createTestimonial(formData);
      }
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const filteredTestimonials = testimonials.filter((item: Testimonial) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.personName.toLowerCase().includes(q) ||
      item.personTitle.toLowerCase().includes(q) ||
      item.comment.toLowerCase().includes(q)
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
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8" style={
          isRtl ? { direction: 'rtl' } : { direction: 'ltr' }
        }>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden animate-pulse">
              <div className="w-full h-44 bg-gray-300"></div>
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Testimonials Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8"
        style={
          isRtl ? { direction: 'rtl' } : { direction: 'ltr' }
        }
        >
          {filteredTestimonials.map((item: Testimonial) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-lg flex flex-col cursor-pointer hover:shadow-2xl transition group overflow-hidden relative"
             onClick={() => handleEdit(item)}>
              <div className="relative w-full h-44 overflow-hidden">
                <img src={item.image} alt={item.personName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'}`}>
                  {socialIcons[item.platform as keyof typeof socialIcons]}
                </div>
              </div>
              <div className="flex flex-col gap-1 p-4 flex-1">
                <div className={`flex items-center gap-2`}> 
                  <span className="font-bold text-lg text-primary">{item.personName}</span>
                  <span className="text-xs text-gray-400">{item.personTitle}</span>
                </div>
                <div className={`text-gray-700 text-sm mt-1 mb-2 line-clamp-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {item.comment}
                </div>
                <div className="mt-auto" dir={isRtl ? 'rtl' : 'ltr'}>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.active ? t('testimonials.active') || 'Active' : t('testimonials.inactive') || 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTestimonials.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isRtl ? 'لا توجد آراء عملاء' : 'No Testimonials'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isRtl ? 'ابدأ بإضافة آراء العملاء لبناء الثقة مع عملائك' : 'Start by adding customer testimonials to build trust with your customers'}
          </p>
        </div>
      )}
      {/* TestimonialDrawer */}
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

      {/* PermissionModal for Delete Confirmation */}
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('testimonials.deleteConfirmTitle') || 'Confirm Delete Testimonial'}
        message={t('testimonials.deleteConfirmMessage') || 'Are you sure you want to delete this testimonial?'}
        itemName={testimonialToDelete ? testimonialToDelete.personName : ''}
        itemType={t('testimonials.testimonial') || 'testimonial'}
        severity="danger"
      />
    </div>
  );
};

export default Testimonial; 