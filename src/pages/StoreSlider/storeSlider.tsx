import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline'
import StoreSliderDrawer from './componant/StoreDrawer';
import { useTranslation } from 'react-i18next';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomButton from '@/components/common/CustomButton';
import PermissionModal from '../../components/common/PermissionModal';
import { useStoreSlider, StoreSlider } from '@/hooks/useStoreSlider';
import { BASE_URL } from '@/constants/api';
import StoreSliderComponent from '@/components/common/StoreSlider';


// Initial form state for StoreSlider - ثابت على نوع الصورة
const initialForm = {
  title: '',
  description: '',
  type: 'slider' as 'slider' | 'video', // ثابت على slider
  imageUrl: '',
  videoUrl: '',
  order: 0,
  isActive: true,
  store: '',
  selectedFile: null as File | null
};

const StoreSliderPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editSlider, setEditSlider] = useState<StoreSlider | null>(null);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState<StoreSlider | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [saving, setSaving] = useState(false);
  const [showSliderPreview, setShowSliderPreview] = useState(false);
  const storeId = localStorage.getItem('storeId') || '687505893fbf3098648bfe16';
  // Store Slider Hook
  const {
    loading,
    error,
    storeSliders,
    createStoreSlider,
    updateStoreSlider,
    deleteStoreSlider,

  } = useStoreSlider();

  // Filter sliders only (type === 'slider') based on search
  const sliders = storeSliders.filter(slider => slider.type === 'slider');
  const filteredSliders = sliders.filter(slider =>
    slider.title.toLowerCase().includes(search.toLowerCase()) ||
    (slider.description && slider.description.toLowerCase().includes(search.toLowerCase()))
  );



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
    // console.log('File selected:', file.name, file.type);
    const imageUrl = URL.createObjectURL(file);
    // console.log('Image URL created:', imageUrl);
    setForm({ ...form, imageUrl: imageUrl });
  };

  const handleFileChange = (file: File | null) => {
    console.log('handleFileChange called with:', file);
    if (file) {
      // حفظ الملف للرفع لاحقاً
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

  const handleEdit = (slider: StoreSlider) => {
    console.log('Editing slider:', slider);
    console.log('Slider type:', slider.type);
    
    const formData = {
      title: slider.title,
      description: slider.description || '',
      type: 'slider' as 'slider' | 'video', // ثابت على slider
      imageUrl: slider.imageUrl || '',
      videoUrl: slider.videoUrl || '',
      order: slider.order,
      isActive: slider.isActive,
      store: storeId,
      selectedFile: null
    };
    
    console.log('Setting form data:', formData);
    setForm(formData);
    setEditSlider(slider);
    setDrawerMode('edit');
    setShowDrawer(true);
  };

  const handleAdd = () => {
    setForm(initialForm);
    setEditSlider(null);
    setDrawerMode('add');
    setShowDrawer(true);
  };

  const handleDelete = (slider?: StoreSlider) => {
    const sliderToDelete = slider || editSlider;
    if (sliderToDelete) {
      setSliderToDelete(sliderToDelete);
      if (slider) {
        setShowDeleteModal(true);
      } else {
        setShowDrawer(false);
        setShowDeleteModal(true);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (sliderToDelete) {
      const success = await deleteStoreSlider(sliderToDelete._id);
      if (success) {
        setSliderToDelete(null);
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
      
      // إذا كان النوع slider وهناك ملف محدد، ارفع الصورة أولاً
      if (form.type === 'slider' && form.selectedFile) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(form.selectedFile);
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      // إرسال البيانات الفعلية من النموذج حسب النوع
      const dataToSend: any = {
        title: form.title,
        description: form.description,
        type: form.type,
        order: form.order,
        isActive: form.isActive
      };

      // إضافة رابط الصورة (النوع ثابت على slider)
      dataToSend.imageUrl = imageUrl;
      
      console.log('Data to send to backend:', dataToSend);
      
      if (drawerMode === 'edit' && editSlider) {
        console.log('Updating slider:', editSlider._id);
        await updateStoreSlider(editSlider._id, dataToSend);
      } else {
        console.log('Creating new slider');
        await createStoreSlider(dataToSend);
      }
      setShowDrawer(false);
      setEditSlider(null);
      setForm(initialForm);
      setFormErrors({});
    } catch (error) {
      console.error('Error saving slider:', error);
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
    
   
    
    // التحقق من الصورة (النوع ثابت على slider)
    if (!form.selectedFile && !form.imageUrl) {
      errors.imageUrl = isRTL ? 'الصورة مطلوبة' : 'Image is required';
    } else if (form.selectedFile && form.selectedFile.size > 10 * 1024 * 1024) {
      // التحقق من حجم الصورة (3 ميجابايت) - فقط إذا كانت الصورة موجودة
      errors.imageUrl = isRTL ? 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت' : 'Image size must be less than 10 MB';
    }
    
    // التحقق من الترتيب
    if (form.order < 0) {
      errors.order = isRTL ? 'الترتيب يجب أن يكون أكبر من أو يساوي صفر' : 'Order must be greater than or equal to 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // مراقبة تغييرات الـ form
  useEffect(() => {
    // console.log('Form state updated:', form);
  }, [form]);



  return (
    <div className="sm:p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.storeSlider') || 'Store Slider', href: '/store-slider' }
      ]} isRtl={isRTL} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <HeaderWithAction
        title={t('sideBar.storeSlider') || 'Store Slider'}
        addLabel={t('storeSlider.addButton') || 'Add Slider'}
        onAdd={handleAdd}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        count={filteredSliders.length}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('storeSlider.searchPlaceholder') || 'Search sliders...'}
      />

      {/* زر معاينة السلايدر */}
      {filteredSliders.length > 0 && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200  mx-auto">
          <div className="flex items-center justify-between ">
            <h3 style={isRTL ? { direction: 'rtl' } : { direction: 'ltr' }} className={`text-lg font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'} flex items-center gap-2`}>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {isRTL ? 'معاينة السلايدر' : 'Slider Preview'}
            </h3>
            <CustomButton
              color={showSliderPreview ? "gray-100" : "primary"}
              textColor={showSliderPreview ? "gray-700" : "white"}
              text={showSliderPreview ? (isRTL ? 'إخفاء المعاينة' : 'Hide Preview') : (isRTL ? 'عرض المعاينة' : 'Show Preview')}
              action={() => setShowSliderPreview(!showSliderPreview)}
              className="px-4 py-2 text-sm"
              icon={showSliderPreview ? (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            />
          </div>
          
          {/* معاينة السلايدر - مخفية افتراضياً */}
          {showSliderPreview && (
            <div className="rounded-lg mt-4">
              {(() => {
                const sliderImages = filteredSliders
                  .filter(slider => {
                    const hasImage = slider.imageUrl || slider.thumbnailUrl;
                    return slider.type === 'slider' && slider.isActive && hasImage;
                  })
                  .sort((a, b) => a.order - b.order)
                  .map(slider => slider.imageUrl || slider.thumbnailUrl!);

                return (
                  <div className="rounded-lg">
                    <StoreSliderComponent
                      images={sliderImages}
                      autoPlay={false}
                      showArrows={true}
                      showDots={true}
                      isRTL={isRTL}
                      className="w-full h-64"
                    />
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* قائمة السلايدرز */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 style={isRTL ? { direction: 'rtl' } : { direction: 'ltr' }} className={`text-lg font-semibold text-gray-700 mb-4 ${isRTL ? 'text-right' : 'text-left'} flex items-center gap-2`}>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {isRTL ? 'إدارة السلايدرز' : 'Manage Sliders'}
        </h3>
        
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
          style={isRTL ? { direction: 'rtl' } : { direction: 'ltr' }}
        >
        {loading ? (
          // Skeleton loading cards
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-stretch min-h-[280px] animate-pulse"
              style={isRTL ? { direction: 'rtl' } : { direction: 'ltr' }}
            >
              <div className="relative w-full h-40 rounded-t-lg overflow-hidden flex items-center justify-center bg-gray-200 border-b border-gray-200">
                {/* Skeleton for image */}
                <div className="w-full h-full bg-gray-400 animate-pulse"></div>
              </div>
              <div className="flex-1 flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 animate-pulse"></div>
                <div className="flex items-center justify-between">
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
        ) : filteredSliders.length === 0 ? (
          // رسالة عدم وجود بيانات
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium text-gray-900 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'لا توجد بيانات حالياً' : 'No Data Available'}
            </h3>
            <p className={`text-gray-500 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL 
                ? 'لم يتم إنشاء أي سلايدر بعد. ابدأ بإضافة سلايدر جديد.' 
                : 'No sliders have been created yet. Start by adding a new slider.'
              }
            </p>
            <CustomButton
              color="primary"
              textColor="white"
              text={t('storeSlider.addButton') || 'Add Slider'}
              action={handleAdd}
              className="px-6 py-2"
            />
          </div>
        ) : (
          filteredSliders.map((slider) => (
            <div
              key={slider._id}
              className="group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col items-stretch min-h-[280px]"
              onClick={() => handleEdit(slider)}
                style={isRTL ? { direction: 'rtl' } : { direction: 'ltr' }}
            >
              <div className="relative w-full h-40 rounded-t-lg overflow-hidden flex items-center justify-center bg-gray-50 border-b border-gray-200">
                {/* أيقونة الحذف */}
                <button
                  className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} z-10 bg-red-500 hover:bg-red-600 text-white rounded-md p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200`}
                  onClick={e => { e.stopPropagation(); handleDelete(slider); }}
                  title={t('common.delete')}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>

                {/* عرض الصورة أو الفيديو */}
                {slider.type === 'slider' ? (
                  <img
                    src={slider.imageUrl || slider.thumbnailUrl || 'https://via.placeholder.com/150'}
                    alt={slider.title}
                    className="w-full h-full object-cover transition group-hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎥</div>
                      <div className="text-sm text-gray-600">Video</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-800 truncate">{slider.title}</h2>
                  <span className={`px-2 py-1 text-xs rounded-md ${slider.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {slider.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{slider.description}</p>
                {/* <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Type: {slider.type}</span>
                  <span>Order: {slider.order}</span>
                </div> */}
                {/* <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Views: {slider.views}</span>
                  <span>Clicks: {slider.clicks}</span>
                </div> */}
              </div>
            </div>
          ))
        )}
        </div>
      </div>
      <StoreSliderDrawer
        open={showDrawer}
        onClose={() => { setShowDrawer(false); setEditSlider(null); setForm(initialForm); setFormErrors({}); }}
        onSave={handleSave}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        onFileChange={handleFileChange}
        errors={formErrors}
        isRTL={isRTL}
        mode="slider"
        saving={saving}
        renderFooter={(
          <div className={`flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl`}>
            <CustomButton
              color="white"
              textColor="primary"
              text={t('common.cancel')}
              action={() => { setShowDrawer(false); setEditSlider(null); setForm(initialForm); }}
              bordercolor="primary"
              disabled={saving}
            />
            <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {drawerMode === 'edit' && editSlider && (
                <CustomButton
                  color="red-100"
                  textColor="red-700"
                  text={t('common.delete', 'Delete')}
                  action={() => handleDelete(editSlider)}
                  className="min-w-[100px]"
                  disabled={saving}
                />
              )}
              <CustomButton
                color="primary"
                textColor="white"
                text={saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : t('common.save')}
                type="submit"
                onClick={() => handleSave(form)}
                className="min-w-[100px]"
                disabled={saving}
                icon={saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : undefined}
              />
            </div>
          </div>
        )}
      />
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('storeSlider.deleteConfirmTitle') || 'Confirm Delete Slider'}
        message={t('storeSlider.deleteConfirmMessage') || 'Are you sure you want to delete this slider?'}
        itemName={sliderToDelete ? sliderToDelete.title : ''}
        itemType={t('storeSlider.slider') || 'slider'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default StoreSliderPage; 
