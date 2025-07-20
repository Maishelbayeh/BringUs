import React, { useState, useEffect } from 'react';
import { Dialog } from '@mui/material';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import StoreSliderDrawer from './componant/StoreDrawer';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import { useStoreSlider, StoreSlider } from '@/hooks/useStoreSlider';
import { BASE_URL } from '@/constants/api';

//-------------------------------------------- initialForm -------------------------------------------
const initialForm = { 
  title: '', 
  description: '', 
  type: 'video' as 'slider' | 'video',
  imageUrl: '',
  videoUrl: '',
  order: 0,
  isActive: true,
  store: '',
  selectedFile: null as File | null
};

//-------------------------------------------- StoreVideoPage -------------------------------------------
const StoreVideoPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editVideo, setEditVideo] = useState<StoreSlider | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<StoreSlider | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [saving, setSaving] = useState(false);
  const [openVideo, setOpenVideo] = useState<string | null>(null);
  const storeId = localStorage.getItem('storeId') || '687505893fbf3098648bfe16';

  // Store Slider Hook
  const {
    loading,
    error,
    storeSliders,
    getAllStoreSliders,
    createStoreSlider,
    updateStoreSlider,
    deleteStoreSlider,
  } = useStoreSlider();

  // Filter videos only (type === 'video')
  const videos = storeSliders.filter(slider => slider.type === 'video');
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(search.toLowerCase()) ||
    (video.description && video.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Load videos on component mount
  useEffect(() => {
    getAllStoreSliders();
  }, [getAllStoreSliders]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    console.log('Form change:', e.target.name, e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('No file selected');
      setForm({ ...form, imageUrl: '' });
      return;
    }
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    setForm({ ...form, imageUrl: imageUrl });
  };

  const handleFileChange = (file: File | null) => {
    console.log('handleFileChange called with:', file);
    if (file) {
      setForm({ ...form, selectedFile: file, imageUrl: URL.createObjectURL(file) });
    } else {
      console.log('No file selected, clearing imageUrl');
      setForm({ ...form, selectedFile: null, imageUrl: '' });
    }
  };

  // دالة رفع الصورة إلى الباك إند
  const uploadImage = async (file: File): Promise<string> => {
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('storeId', storeId);
    
    console.log('Uploading image with storeId:', storeId);
    
    const response = await fetch(`${BASE_URL}store-sliders/upload-image?storeId=${storeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    
    console.log('Image uploaded successfully:', data);
    return data.imageUrl;
  };

  const handleEdit = (video: StoreSlider) => {
    console.log('Editing video:', video);
    
    const formData = {
      title: video.title,
      description: video.description || '',
      type: 'video' as 'slider' | 'video', // ثابت على video
      imageUrl: video.imageUrl || '',
      videoUrl: video.videoUrl || '',
      order: video.order,
      isActive: video.isActive,
      store: storeId,
      selectedFile: null
    };
    
    console.log('Setting form data:', formData);
    setForm(formData);
    setEditVideo(video);
    setDrawerMode('edit');
    setShowDrawer(true);
  };

  const handleAdd = () => {
    setForm(initialForm);
    setEditVideo(null);
    setDrawerMode('add');
    setShowDrawer(true);
  };

  const handleDelete = (video?: StoreSlider) => {
    const videoToDelete = video || editVideo;
    if (videoToDelete) {
      setVideoToDelete(videoToDelete);
      if (video) {
        setShowDeleteModal(true);
      } else {
        setShowDrawer(false);
        setShowDeleteModal(true);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (videoToDelete) {
      const success = await deleteStoreSlider(videoToDelete._id);
      if (success) {
        setVideoToDelete(null);
        setShowDeleteModal(false);
      }
    }
  };

  const handleSave = async (formData: any) => {
    console.log('handleSave called with formData:', formData);
    console.log('Current form state:', form);
    
    // التحقق من صحة البيانات
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      return;
    }
    
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      
      // إذا كان هناك ملف محدد، ارفع الصورة أولاً
      if (form.selectedFile) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(form.selectedFile);
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      // إرسال البيانات الفعلية من النموذج
      const dataToSend: any = {
        title: form.title,
        description: form.description,
        type: 'video', // ثابت على video
        videoUrl: form.videoUrl,
        imageUrl: imageUrl,
        order: form.order,
        isActive: form.isActive
      };
      
      console.log('Data to send to backend:', dataToSend);
      
      if (drawerMode === 'edit' && editVideo) {
        console.log('Updating video:', editVideo._id);
        await updateStoreSlider(editVideo._id, dataToSend);
      } else {
        console.log('Creating new video');
        await createStoreSlider(dataToSend);
      }
      setShowDrawer(false);
      setEditVideo(null);
      setForm(initialForm);
      setFormErrors({});
    } catch (error) {
      console.error('Error saving video:', error);
    } finally {
      setSaving(false);
    }
  };


  // دالة validation للفورم
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    // التحقق من العنوان
    if (!form.title.trim()) {
      errors.title = isRTL ? 'العنوان مطلوب' : 'Title is required';
    }
    
    // التحقق من الوصف
    if (!form.description.trim()) {
      errors.description = isRTL ? 'الوصف مطلوب' : 'Description is required';
    }
    
    // التحقق من رابط الفيديو
    if (!form.videoUrl.trim()) {
      errors.videoUrl = isRTL ? 'رابط الفيديو مطلوب' : 'Video URL is required';
    }
    
    // التحقق من الترتيب
    if (form.order < 0) {
      errors.order = isRTL ? 'الترتيب يجب أن يكون أكبر من أو يساوي صفر' : 'Order must be greater than or equal to 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // دالة لاستخراج YouTube ID من الرابط
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // دالة لفتح الفيديو
  const openVideoModal = (video: StoreSlider) => {
    if (video.videoUrl) {
      const youtubeId = getYouTubeId(video.videoUrl);
      if (youtubeId) {
        setOpenVideo(youtubeId);
      } else {
        // إذا لم يكن YouTube، افتح الرابط في نافذة جديدة
        window.open(video.videoUrl, '_blank');
      }
    }
  };

  return (
    <div className="sm:p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.storeVideos') || 'Store Videos', href: '/store-videos' }
      ]} isRtl={isRTL} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <HeaderWithAction
        title={t('sideBar.storeVideos') || 'Store Videos'}
        addLabel={t('storeVideos.addButton') || 'Add Video'}
        onAdd={handleAdd}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        count={filteredVideos.length}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('storeVideos.searchPlaceholder') || 'Search videos...'}
      />
      

      
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {loading ? (
          // Skeleton loading cards
          Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition group flex flex-col overflow-hidden cursor-pointer animate-pulse"
            >
              {/* Skeleton for video thumbnail */}
              <div className="relative w-full aspect-video bg-gray-300 flex items-center justify-center">
                <div className="w-full h-full bg-gray-400 animate-pulse"></div>
              </div>
              
              {/* Skeleton for video info */}
              <div className="p-3 flex flex-col gap-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-full animate-pulse"></div>
                <div className="flex items-center justify-between mt-2">
                  <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredVideos.map((video) => {
            const youtubeId = getYouTubeId(video.videoUrl || '');
            const thumbnailUrl = youtubeId 
              ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
              : video.imageUrl || 'https://via.placeholder.com/300x200?text=Video';
            
            return (
              <div
                key={video._id}
                className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition group flex flex-col overflow-hidden cursor-pointer"
                onClick={() => handleEdit(video)}
              >
                {/* زر الإعدادات دائماً ظاهر */}
                <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                  <button
                    className="bg-primary/90 hover:bg-primary text-white rounded-full p-1.5 shadow hover:scale-110 transition-transform duration-200"
                    onClick={e => { e.stopPropagation(); handleEdit(video); }}
                    title={t('storeVideos.edit')}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    className="bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow hover:scale-110 transition-transform duration-200"
                    onClick={e => { e.stopPropagation(); handleDelete(video); }}
                    title={t('common.delete')}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {/* صورة الفيديو مع زر التشغيل */}
                <div className="relative w-full aspect-video bg-black flex items-center justify-center"
                  onClick={e => { e.stopPropagation(); openVideoModal(video); }}
                >
                  <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                    title={t('storeVideos.play')}
                  >
                    <svg width={64} height={64} viewBox="0 0 64 64" className="drop-shadow-lg">
                      <circle cx="32" cy="32" r="32" fill="rgba(0,0,0,0.5)" />
                      <polygon points="26,20 50,32 26,44" fill="white" />
                    </svg>
                  </button>
                </div>
                
                {/* معلومات الفيديو */}
                <div className="p-3 flex flex-col gap-1">
                  <h3 className="text-base font-bold text-primary hover:underline truncate">
                    {video.title}
                  </h3>
                  {video.description && (
                    <span className="text-xs text-gray-500 truncate">{video.description}</span>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
                    <span>Order: {video.order}</span>
                    <span className={`px-2 py-1 rounded-full ${video.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {video.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Views: {video.views || 0}</span>
                    <span>Clicks: {video.clicks || 0}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal لفتح الفيديو */}
      <Dialog open={!!openVideo} onClose={() => setOpenVideo(null)} maxWidth="md" fullWidth>
        <div className="bg-black">
          {openVideo && (
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${openVideo}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full aspect-video"
            />
          )}
        </div>
      </Dialog>

      {/* StoreSliderDrawer */}
      <StoreSliderDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setEditVideo(null); setForm(initialForm); setFormErrors({}); }}
        onSave={handleSave}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        onFileChange={handleFileChange}
        errors={formErrors}
        isRTL={isRTL}
        mode="video"
        saving={saving}
      />

      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('storeVideos.deleteConfirmTitle') || 'Confirm Delete Video'}
        message={t('storeVideos.deleteConfirmMessage') || 'Are you sure you want to delete this video?'}
        itemName={videoToDelete ? videoToDelete.title : ''}
        itemType={t('storeVideos.video') || 'video'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default StoreVideoPage; 