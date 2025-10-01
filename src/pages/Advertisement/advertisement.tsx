import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomTable } from '../../components/common/CustomTable';
import CustomButton from '../../components/common/CustomButton';
import AdvertisementForm from './AdvertisementForm';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '@/components/common/PermissionModal';
import { useAdvertisements } from '../../hooks/useAdvertisements';
import { useStoreUrls } from '@/hooks/useStoreUrls';

const AdvertisementPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-EG' || i18n.language === 'ARABIC';
  const { storeSlug } = useStoreUrls();
  // TODO: Replace with actual storeId from context/auth if needed
  const storeId = localStorage.getItem('storeId') || '';
  const token = localStorage.getItem('token') || '';

  const {
    advertisements,
    loading,
    error,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    getAdvertisements,
  } = useAdvertisements(storeId, token);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formHtml, setFormHtml] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [mode, setMode] = useState<'html' | 'image'>('html');
  const [image, setImage] = useState<string | null>(null);

  // جلب البيانات عند التحميل
  useEffect(() => {
    getAdvertisements();
  }, [getAdvertisements]);

  // Function to safely render HTML
  const renderHtml = (html: string) => {
    try {
      return { __html: html };
    } catch (error) {
      //CONSOLE.error('Error rendering HTML:', error);
      return { __html: '<p style="color: red;">Error rendering HTML</p>' };
    }
  };

  // تجهيز البيانات للجدول
  const data = advertisements.map(ad => ({
    id: ad._id,
    html: ad.htmlContent,
    status: ad.isActive ? 'Active' : 'Inactive',
    raw: ad,
  }));

  const columns = [
    {
      key: 'preview',
      label: { en: t('advertisement.preview'), ar: t('advertisement.preview') },
      render: (_: any, row: any) => {
        if (row.raw && row.raw.backgroundImageUrl) {
          return (
            <div className="flex justify-center items-center">
              <img src={row.raw.backgroundImageUrl} alt="Advertisement" style={{ maxWidth: '300px', maxHeight: '120px', borderRadius: '8px' }} />
            </div>
          );
        } else {
          return (
            <div className="border rounded-lg p-4 bg-white min-h-[60px] max-w-md overflow-x-auto shadow-sm">
              <div 
                className="max-w-none"
                style={{ 
                  fontSize: '14px',
                  lineHeight: '1.5',
                  color: '#333',
                  wordBreak: 'break-word'
                }}
                dangerouslySetInnerHTML={renderHtml(row.html)} 
              />
            </div>
          );
        }
      },
      align: 'center' as const,
    },
    {
      key: 'status',
      label: { en: t('advertisement.status', 'Status'), ar: t('advertisement.status', 'الحالة') },
      render: (value: string) => {
        const isActive = value === 'Active' || value === t('advertisement.active', 'Active');
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {isActive ? t('advertisement.active', 'Active') : t('advertisement.inactive', 'Inactive')}
          </span>
        );
      },
      align: 'center' as const,
    },
  ];

  const handleAdd = () => {
    setFormHtml('');
    setFormTitle('');
    setFormStatus('Active');
    setEditIndex(null);
    setMode('html');
    setImage(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormHtml(item.html);
    setFormTitle(item.raw?.title || '');
    setFormStatus(item.status);
    setEditIndex(data.findIndex((d) => d.id === item.id));
    if (item.raw?.backgroundImageUrl) {
      setMode('image');
      setImage(item.raw.backgroundImageUrl);
    } else {
      setMode('html');
      setImage(null);
    }
    setDrawerOpen(true);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setPermissionModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete && itemToDelete.id) {
      try {
        await deleteAdvertisement(String(itemToDelete.id));
        await getAdvertisements();
        setItemToDelete(null);
      } catch (error) {
        //CONSOLE.error('Delete error:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setFormLoading(true);
    
    let imageUrl = image;

    try {
      // 1. If mode is image and image is base64, upload it first
      if (mode === 'image' && image && image.startsWith('data:')) {
        const formData = new FormData();
        // Convert base64 to Blob
        const res = await fetch(image);
        const blob = await res.blob();
        formData.append('file', blob, 'advertisement-image.png');

        // Upload to backend
        //https://bringus-backend.onrender.com/api/advertisements/upload-image
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://bringus-backend.onrender.com/api/'}advertisements/upload-image`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data.url) {
          imageUrl = uploadData.data.url;
        } else {
          throw new Error('Image upload failed');
        }
      }

      // 2. Now create/update the advertisement with the correct payload
      const payload = {
        htmlContent: mode === 'html' ? formHtml : '',
        backgroundImageUrl: mode === 'image' ? (imageUrl || '') : '',
        isActive: formStatus === 'Active',
        title: formTitle,
      };

      if (editIndex !== null && data[editIndex] && data[editIndex].id) {
        await updateAdvertisement(String(data[editIndex].id), payload);
      } else {
        await createAdvertisement(payload);
      }
      
      // Refresh data and close drawer
      await getAdvertisements();
      setDrawerOpen(false);
      setEditIndex(null);
      setFormHtml('');
      setFormTitle('');
      setFormStatus('Active');
      setMode('html');
      setImage(null);
    } catch (error) {
      //CONSOLE.error('Submit error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="sm:p-4" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: `/${storeSlug}/` },
        { name: t('sideBar.advertisement') || 'Advertisement', href: `/${storeSlug}/advertisement` }
      ]} isRtl={isRTL} />
      <HeaderWithAction
        title={t('sideBar.advertisement') || 'Advertisement'}
        addLabel={t('common.add') || 'Add'}
        onAdd={handleAdd}
        isRtl={i18n.language === 'ARABIC'}
        count={data.length}
      />
      {loading && <div className="text-center py-4">{t('common.loading', 'Loading...')}</div>}
      {error && <div className="text-center text-red-500 py-2">{error}</div>}
      <CustomTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />
      
      {/* Permission Modal */}
      <PermissionModal
        isOpen={permissionModalOpen}
        onClose={() => {
          setPermissionModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemType={t('advertisement.advertisement', 'advertisement')}
        itemName={itemToDelete?.html ? itemToDelete.html.substring(0, 50) + '...' : ''}
        isRTL={isRTL}
        severity="danger"
        requirePermission={true}
      />
      
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
              <span className="text-xl font-bold text-primary">
                {editIndex !== null ? t('advertisement.edit', 'Edit Advertisement') : t('advertisement.add', 'Add Advertisement')}
              </span>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="text-primary hover:text-red-500 text-2xl"
                disabled={formLoading}
              >
                ×
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              <AdvertisementForm
                formHtml={formHtml}
                setFormHtml={setFormHtml}
                formStatus={formStatus}
                setFormStatus={setFormStatus}
                isRTL={isRTL}
                t={t}
                handleSubmit={handleSubmit}
                renderHtml={renderHtml}
                formTitle={formTitle}
                setFormTitle={setFormTitle}
                image={image}
                setImage={setImage}
                mode={mode}
                setMode={setMode}
              />
              
              {/* Footer */}
              <div className={`flex justify-between gap-2 px-6 py-4 border-t bg-white rounded-b-2xl`}>
                <CustomButton
                  color="primary"
                  textColor="white"
                  text={formLoading ? t('common.loading', 'Loading...') : (editIndex !== null ? t("deliveryDetails.updateArea") : t("deliveryDetails.createArea"))}
                  action={() => {}}
                  type="submit"
                  disabled={formLoading}
                />
                <CustomButton
                  color="white"
                  textColor="primary"
                  text={t("deliveryDetails.cancel")}
                  action={() => setDrawerOpen(false)}
                  disabled={formLoading}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementPage; 