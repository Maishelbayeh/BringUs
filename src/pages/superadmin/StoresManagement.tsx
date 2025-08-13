import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Store, 
  Person, 
  Email, 
  Phone, 
  LocationOn, 
  CalendarToday,
  Update
} from '@mui/icons-material';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import { CustomTable } from '../../components/common/CustomTable';
import { useSuperAdmin } from '../../hooks/useSuperAdmin';
import { useToastContext } from '@/contexts/ToastContext';
import useLanguage from '@/hooks/useLanguage';

import StoreStatusModal from './StoreStatusModal';
import AddSubscriptionPlanModal from './AddSubscriptionPlanModal';

interface StoreOwner {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    isActive: boolean;
  };
  status: string;
  permissions: string[];
  isPrimaryOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  _id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  logo: {
    public_id: string;
    url: string;
  };
  slug: string;
  status: 'active' | 'inactive';
  settings: {
    currency: string;
    mainColor: string;
    language: string;
    storeDiscount: number;
    timezone: string;
    taxRate: number;
    shippingEnabled: boolean;
    storeSocials: any;
  };
  whatsappNumber: string;
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  owners: StoreOwner[];
  createdAt: string;
  updatedAt: string;
}

const StoresManagement: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  
  const { getAllStores, updateStoreStatus } = useSuperAdmin();
  const { showSuccess, showError } = useToastContext();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // جلب المتاجر
  const fetchStores = useCallback(async () => {
    // تجنب إعادة الجلب إذا كان هناك طلب قيد التنفيذ
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const allStores = await getAllStores();
      setStores(allStores);
      setFilteredStores(allStores);
      setIsInitialized(true);
    } catch (error: any) {
      console.error('❌ خطأ في جلب المتاجر:', error);
      showError(t('stores.fetchError'), t('general.error'));
    } finally {
      setIsLoading(false);
    }
  }, [getAllStores, showError, t, isLoading]);

  useEffect(() => {
    if (!isInitialized) {
      fetchStores();
    }
  }, [isInitialized]); // جلب البيانات مرة واحدة فقط عند تحميل الصفحة

  // عرض شعار المتجر
  const renderStoreLogo = ( item: Store) => {
    if (item.logo && item.logo.url) {
      return (
        <div className="flex items-center justify-center">
          <img 
            src={item.logo.url} 
            alt={isRTL ? item.nameAr : item.nameEn}
            className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.png';
            }}
          />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center">
        <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
          <Store className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    );
  };

  // عرض اسم المتجر
  const renderStoreName = ( item: Store) => (
    <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
      <span className="font-medium text-gray-900">
        {isRTL ? item.nameAr : item.nameEn}
      </span>
      <span className="text-xs text-gray-500">
        {isRTL ? item.descriptionAr : item.descriptionEn}
      </span>
    </div>
  );

  // عرض حالة المتجر
  const renderStoreStatus = (value: any) => {
    const statusColors: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };
    
    const statusLabels: { [key: string]: string } = {
      active: t('stores.status.active'),
      inactive: t('stores.status.inactive')
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[value] || value}
      </span>
    );
  };

  // عرض معلومات الاتصال
  const renderContactInfo = ( item: Store) => (
    <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center gap-1 mb-1">
        <Email className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-600">{item.contact.email}</span>
      </div>
      <div className="flex items-center gap-1">
        <Phone className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-600">{item.contact.phone}</span>
      </div>
    </div>
  );

  // عرض العنوان
  const renderAddress = ( item: Store) => (
    <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="flex items-center gap-1 mb-1">
        <LocationOn className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-600">
          {item.contact?.address?.street}, {item.contact?.address?.city}
        </span>
      </div>
      <span className="text-xs text-gray-500">
        {item.contact?.address?.state}, {item.contact?.address?.country}
      </span>
    </div>
  );

  // عرض الملاك
  const renderOwners = ( item: Store) => {
    const primaryOwner = item.owners.find(owner => owner.isPrimaryOwner);
    const otherOwners = item.owners.filter(owner => !owner.isPrimaryOwner);
    
    return (
      <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
        {primaryOwner && (
          <div className="mb-1">
            <div className="flex items-center gap-1">
              <Person className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600">
                {primaryOwner?.userId?.firstName} {primaryOwner?.userId?.lastName}
              </span>
              <span className="text-xs text-blue-500">(مالك رئيسي)</span>
            </div>
            <span className="text-xs text-gray-500">{primaryOwner?.userId?.email}</span>
          </div>
        )}
        {otherOwners.length > 0 && (
          <div>
            <span className="text-xs text-gray-500">
              +{otherOwners.length} مالك إضافي
            </span>
          </div>
        )}
      </div>
    );
  };

  // عرض تاريخ الإنشاء
  const renderCreatedAt = (value: any) => {
    const date = new Date(value);
    return (
      <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center gap-1 mb-1">
          <CalendarToday className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600">
            {date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {date.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    );
  };

  // عرض آخر تحديث
  const renderUpdatedAt = (value: any) => {
    const date = new Date(value);
    return (
      <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center gap-1 mb-1">
          <Update className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600">
            {date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {date.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    );
  };

  // معالجة تعديل حالة المتجر
  const handleEditStatus = (store: Store) => {
    setSelectedStore(store);
    setShowStatusModal(true);
  };

  // تأكيد تحديث الحالة
  const handleStatusUpdate = async (status: 'active' | 'inactive') => {
    if (selectedStore) {
      try {
        const success = await updateStoreStatus(selectedStore._id, status);
        if (success) {
          setShowStatusModal(false);
          setSelectedStore(null);
          
          // تحديث البيانات محلياً بدلاً من إعادة جلبها
          setStores(prevStores => 
            prevStores.map(store => 
              store._id === selectedStore._id 
                ? { ...store, status } 
                : store
            )
          );
          setFilteredStores(prevStores => 
            prevStores.map(store => 
              store._id === selectedStore._id 
                ? { ...store, status } 
                : store
            )
          );
          
          // إعادة تعيين الكاش في useSuperAdmin
          // سيتم إعادة تعيين الكاش تلقائياً عند الطلب التالي
          
          showSuccess(t('stores.statusUpdateSuccess'), t('general.success'));
        }
      } catch (error) {
        console.error('❌ خطأ في تحديث حالة المتجر:', error);
        showError(t('stores.statusUpdateError'), t('general.error'));
      }
    }
  };

  // معالجة إضافة خطة اشتراك جديدة
  const handleAddSubscriptionPlan = () => {
    setShowAddPlanModal(true);
  };

  // معالجة نجاح إضافة الخطة
  const handlePlanAdded = () => {
    showSuccess('Subscription plan added successfully', t('general.success'));
  };

  // تعريف أعمدة الجدول
  const columns: any[] = [
    {
      key: 'logo',
      label: t('stores.columns.logo'),
      render: renderStoreLogo,
      sortable: false,
      filterable: false,
      width: '60px',
      hidden: false,
      hideable: true
    },
    {
      key: 'name',
      label: t('stores.columns.name'),
      render: renderStoreName,
      sortable: true,
      filterable: true,
      hidden: false,
      hideable: true
    },
    {
      key: 'status',
      label: t('stores.columns.status'),
      render: renderStoreStatus,
      sortable: true,
      filterable: true,
      hidden: false,
      hideable: true
    },
    {
      key: 'contact',
      label: t('stores.columns.contact'),
      render: renderContactInfo,
      sortable: false,
      filterable: false,
      hidden: true,
      hideable: true
    },
    {
      key: 'address',
      label: t('stores.columns.address'),
      render: renderAddress,
      sortable: false,
      filterable: false,
      hidden: true,
      hideable: true
    },
    {
      key: 'owners',
      label: t('stores.columns.owners'),
      render: renderOwners,
      sortable: false,
      filterable: false,
      hidden: true,
      hideable: true
    },
    {
      key: 'createdAt',
      label: t('stores.columns.createdAt'),
      render: renderCreatedAt,
      sortable: true,
      filterable: false,
      hidden: false,
      hideable: true
    },
    {
      key: 'updatedAt',
      label: t('stores.columns.updatedAt'),
      render: renderUpdatedAt,
      sortable: true,
      filterable: false,
      hidden: true,
      hideable: true
    },
    // {
    //   key: 'actions',
    //   label: t('general.edit'),
    //   render: (value: any, item: Store) => (
    //     <div className="flex items-center justify-center gap-2">
    //       <button
    //         onClick={() => handleEditStatus(item)}
    //         className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
    //         title={t('stores.editStatus')}
    //       >
    //         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    //           <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    //         </svg>
    //       </button>
    //     </div>
    //   ),
    //   sortable: false,
    //   filterable: false,
    //   hidden: false,
    //   hideable: false,
    //   showControls: false
    // }
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="">
        {/* Breadcrumb */}
        <CustomBreadcrumb
          items={[
            { name: t('sideBar.dashboard'), href: '/' },
            { name: t('stores.management'), href: '/superadmin/stores' }
          ]}
          isRtl={isRTL}
        />

        {/* Header */}
        <HeaderWithAction
          title={t('stores.management')}
          addLabel=""
          
          isRtl={isRTL}
          count={stores.length}
          loading={isLoading}
        />

        {/* Add Subscription Plan Button */}
        <div className="mb-6">
          <button
            onClick={handleAddSubscriptionPlan}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('subscriptionPlans.addNewPlan')}
          </button>
        </div>

        {/* Table */}
        <div className="">
                     <CustomTable
             columns={columns}
             data={stores}
             onEdit={handleEditStatus}
             // onDelete={() => {}}
             onFilteredDataChange={isInitialized ? setFilteredStores : undefined}
             showColumnToggle={true}
             showHiddenColumnsBar={true}
           />
        </div>

        {/* Status Update Modal */}
        <StoreStatusModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onConfirm={handleStatusUpdate}
          currentStatus={selectedStore?.status || 'active'}
          storeName={selectedStore ? (isRTL ? selectedStore.nameAr : selectedStore.nameEn) : ''}
        />

        {/* Add Subscription Plan Modal */}
        <AddSubscriptionPlanModal
          isOpen={showAddPlanModal}
          onClose={() => setShowAddPlanModal(false)}
          onSuccess={handlePlanAdded}
        />
      </div>
    </div>
  );
};

export default StoresManagement; 