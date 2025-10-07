import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomTable } from '../../components/common/CustomTable';
import AdvertisementDrawer from './AdvertisementDrawer';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '@/components/common/PermissionModal';
import { useAdvertisements } from '../../hooks/useAdvertisements';
import { useStoreUrls } from '@/hooks/useStoreUrls';
import { 
  validateAdvertisementForm, 
  validateAdvertisementField, 
  AdvertisementValidationErrors 
} from '../../validation/advertisementValidation';

const AdvertisementPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-EG' || i18n.language === 'ARABIC';
  const { storeSlug } = useStoreUrls();
  // TODO: Replace with actual storeId from context/auth if needed
  const storeId = localStorage.getItem('storeId') || '';
  const token = localStorage.getItem('token') || '';

  const {
    advertisements,
    // error,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    getAdvertisements,
    // toggleActiveStatus,
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
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<AdvertisementValidationErrors>({});

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
      render: (_value: any, row: any) => {
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
    setErrors({});
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
    setErrors({});
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

  // Handle field change with validation
  const handleFieldChange = (fieldName: string, value: any) => {
    const error = validateAdvertisementField(
      fieldName as keyof AdvertisementValidationErrors,
      value,
      mode,
      t as any
    );
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName as keyof AdvertisementValidationErrors] = error;
      } else {
        delete newErrors[fieldName as keyof AdvertisementValidationErrors];
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const formData = {
      title: formTitle,
      htmlContent: formHtml,
      image,
      mode,
    };
    
    const validationErrors = validateAdvertisementForm(formData, t as any);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
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
      setErrors({});
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
      {/* {loading && <div className="text-center py-4">{t('common.loading', 'Loading...')}</div>} */}
      {/* {error && <div className="text-center text-red-500 py-2">{error}</div>} */}
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
      
      {/* Advertisement Drawer */}
      <AdvertisementDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditIndex(null);
          setFormHtml('');
          setFormTitle('');
          setFormStatus('Active');
          setMode('html');
          setImage(null);
          setImageUploading(false);
          setErrors({});
        }}
        onSave={handleSubmit}
        formHtml={formHtml}
        setFormHtml={setFormHtml}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        isRTL={isRTL}
        renderHtml={renderHtml}
        image={image}
        setImage={setImage}
        mode={mode}
        setMode={setMode}
        editMode={editIndex !== null}
        saving={formLoading}
        isImageUploading={imageUploading}
        setImageUploading={setImageUploading}
        errors={errors}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
};

export default AdvertisementPage; 