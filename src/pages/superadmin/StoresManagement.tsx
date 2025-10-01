import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs, { Dayjs } from 'dayjs';
import { 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import { CustomTable } from '../../components/common/CustomTable';
import { useToastContext } from '@/contexts/ToastContext';
import useLanguage from '@/hooks/useLanguage';
import axios from 'axios';

import AddSubscriptionPlanModal from './AddSubscriptionPlanModal';
import CustomSelect from './dropdown';
import DateField from './customcalender';

interface StoreSubscription {
  _id: string;
  nameAr: string;
  nameEn?: string;
  status: 'active' | 'inactive';
  subscription?: {
    isSubscribed: boolean;
    planId: string | null;
    startDate: string | null;
    endDate: string | null;
    lastPaymentDate: string | null;
    nextPaymentDate: string | null;
    autoRenew: boolean;
    referenceId: string | null;
    paymentMethod: any;
    amount: number;
    currency: string;
    trialEndDate: string | null;
  };
  createdAt: string;
}

const StoresManagement: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { showSuccess, showError } = useToastContext();
  
  const [stores, setStores] = useState<StoreSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    sort: 'createdAt',
    order: 'desc'
  });

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreSubscription | null>(null);
  const [extendForm, setExtendForm] = useState({
    endDate: null as Dayjs | null,
    reason: ''
  });
  const [trialForm, setTrialForm] = useState({
    days: 30
  });
  const [isExtending, setIsExtending] = useState(false);
  const [isExtendingTrial, setIsExtendingTrial] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5001/api/subscription-plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPlans(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching subscription plans:', error);
      showError(t('general.error'), error.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  };

  // جلب المتاجر
  const fetchStores = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sort: filters.sort,
        order: filters.order,
        ...(filters.status && { status: filters.status }),
        ...(filters.plan && { plan: filters.plan }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      });

      const response = await axios.get<{ success: boolean; data: StoreSubscription[]; pagination: any }>(
        `http://localhost:5001/api/subscription/stores?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setStores(response.data.data);
        // Only log if data exists
        if (response.data.data && response.data.data.length > 0) {
          console.log(response.data.data[0].nameAr);
        }
        setPagination(response.data.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      showError(t('general.error'), error.response?.data?.message || 'Failed to fetch stores');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {   
    fetchStores(1);
    fetchPlans();
  }, [filters, debouncedSearchTerm]);

  // معالجة تغيير الصفحة
  const handlePageChange = (newPage: number) => {
    fetchStores(newPage);
  };

  // معالجة تغيير الفلاتر
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // معالجة البحث
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isRTL ? 'ar-EG' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  };

  // معالجة إضافة خطة اشتراك جديدة
  const handleAddSubscriptionPlan = () => {
    setShowAddPlanModal(true);
  };

  // معالجة نجاح إضافة الخطة
  const handlePlanAdded = () => {
    showSuccess('Subscription plan added successfully', t('general.success'));
  };

  // معالجة فتح modal تمديد الاشتراك
  const handleOpenExtendModal = (store: StoreSubscription) => {
    setSelectedStore(store);
    setExtendForm({
      endDate: store.subscription?.endDate ? dayjs(store.subscription.endDate) : null,
      reason: ''
    });
    setShowExtendModal(true);
  };

  // معالجة إغلاق modal تمديد الاشتراك
  const handleCloseExtendModal = () => {
    setShowExtendModal(false);
    setSelectedStore(null);
    setExtendForm({ endDate: null, reason: '' });
  };

  // معالجة تمديد تاريخ انتهاء الاشتراك
  const handleExtendEndDate = async () => {
    if (!selectedStore || !extendForm.endDate) {
      showError(t('general.error'), isRTL ? 'يرجى إدخال تاريخ صحيح' : 'Please enter a valid date');
      return;
    }

    setIsExtending(true);
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/subscription/stores/${selectedStore._id}/end-date`,
        {
          endDate: extendForm.endDate.toISOString(),
          reason: extendForm.reason || 'Admin extension'
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        showSuccess(
          isRTL ? 'تم تمديد تاريخ انتهاء الاشتراك بنجاح' : 'Subscription end date extended successfully',
          t('general.success')
        );
        handleCloseExtendModal();
        // Refresh stores data
        fetchStores(pagination.page);
      }
    } catch (error: any) {
      console.error('Error extending subscription end date:', error);
      showError(
        t('general.error'), 
        error.response?.data?.message || (isRTL ? 'فشل في تمديد تاريخ انتهاء الاشتراك' : 'Failed to extend subscription end date')
      );
    } finally {
      setIsExtending(false);
    }
  };

  // معالجة فتح modal تمديد التجربة
  const handleOpenTrialModal = (store: StoreSubscription) => {
    setSelectedStore(store);
    setTrialForm({ days: 30 });
    setShowTrialModal(true);
  };

  // معالجة إغلاق modal تمديد التجربة
  const handleCloseTrialModal = () => {
    setShowTrialModal(false);
    setSelectedStore(null);
    setTrialForm({ days: 30 });
  };

  // معالجة تمديد فترة التجربة
  const handleExtendTrial = async () => {
    if (!selectedStore || !trialForm.days || trialForm.days <= 0) {
      showError(t('general.error'), isRTL ? 'يرجى إدخال عدد أيام صحيح' : 'Please enter a valid number of days');
      return;
    }

    setIsExtendingTrial(true);
    try {
      const response = await axios.post(
        `http://localhost:5001/api/subscription/stores/${selectedStore._id}/trial`,
        {
          days: trialForm.days
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        showSuccess(
          isRTL ? `تم تمديد فترة التجربة بنجاح لمدة ${trialForm.days} يوم` : `Trial period extended successfully for ${trialForm.days} days`,
          t('general.success')
        );
        handleCloseTrialModal();
        // Refresh stores data
        fetchStores(pagination.page);
      }
    } catch (error: any) {
      console.error('Error extending trial period:', error);
      showError(
        t('general.error'), 
        error.response?.data?.message || (isRTL ? 'فشل في تمديد فترة التجربة' : 'Failed to extend trial period')
      );
    } finally {
      setIsExtendingTrial(false);
    }
  };

  // تعريف أعمدة الجدول
  const columns = [
    {
      key: 'name',
      label: { en: 'Store Name', ar: 'اسم المتجر' },
      type: 'text' as const,
      render: ( item: any) => {
        const originalItem = item.originalData as StoreSubscription;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <BuildingStorefrontIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {isRTL ? (originalItem.nameAr || 'N/A') : (originalItem.nameEn || originalItem.nameAr || 'N/A')}
              </div>
              <div className="text-xs text-gray-500">
                ID: {originalItem._id ? originalItem._id.slice(-8) : 'N/A'}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: { en: 'Status', ar: 'الحالة' },
      type: 'status' as const,
      render: ( item: any) => {
        const originalItem = item.originalData as StoreSubscription;
        const status = originalItem.status || 'unknown';
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            status === 'active' 
              ? 'text-green-600 bg-green-50 border border-green-200' 
              : 'text-red-600 bg-red-50 border border-red-200'
          }`}>
            {status === 'active' 
              ? (isRTL ? 'نشط' : 'Active') 
              : (isRTL ? 'غير نشط' : 'Inactive')
            }
          </span>
        );
      }
    },
    {
      key: 'subscription',
      label: { en: 'Subscription', ar: 'الاشتراك' },
      type: 'text' as const,
      render: ( item: any) => {
        const originalItem = item.originalData as StoreSubscription;
        const subscription = originalItem.subscription;
        if (!subscription) {
          return (
            <div className="text-sm text-gray-500">
              {isRTL ? 'لا يوجد اشتراك' : 'No Subscription'}
            </div>
          );
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="w-4 h-4 text-gray-400" />
              <span className={`text-sm font-medium ${
                subscription.isSubscribed ? 'text-green-600' : 'text-gray-500'
              }`}>
                {subscription.isSubscribed 
                  ? (isRTL ? 'مشترك' : 'Subscribed') 
                  : (isRTL ? 'غير مشترك' : 'Not Subscribed')
                }
                 {subscription.isSubscribed && (
              <div className="text-xs text-gray-500">
                {subscription.currency} {subscription.amount}
              </div>
            )}
              </span>
            </div>
           
          </div>
        );
      }
    },
    {
      key: 'trialEndDate',
      label: { en: 'Trial End', ar: 'انتهاء التجربة' },
      type: 'date' as const,
      render: ( item: any) => {
        const originalItem = item.originalData as StoreSubscription;
        const trialEndDate = originalItem.subscription?.trialEndDate;
        if (!trialEndDate) {
          return (
            <div className="text-sm text-gray-500">
              {isRTL ? 'لا يوجد' : 'N/A'}
            </div>
          );
        }

        const endDate = new Date(trialEndDate);
        const now = new Date();
        const isExpired = endDate < now;
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <div 
            className="flex items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            onClick={() => handleOpenTrialModal(originalItem)}
            title={isRTL ? 'انقر لتمديد فترة التجربة' : 'Click to extend trial period'}
          >
            <ClockIcon className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-yellow-500'}`} />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(trialEndDate)}
              </div>
              <div className={`text-xs ${isExpired ? 'text-red-600' : 'text-yellow-600'}`}>
                {isExpired 
                  ? (isRTL ? 'منتهي' : 'Expired')
                  : (isRTL ? `${daysLeft} يوم متبقي` : `${daysLeft} days left`)
                }
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'subscriptionEndDate',
      label: { en: 'Subscription End', ar: 'انتهاء الاشتراك' },
      type: 'date' as const,
      render: ( item: any) => {
        const originalItem = item.originalData as StoreSubscription;
        const endDate = originalItem.subscription?.endDate;
        if (!endDate) {
          return (
            <div className="text-sm text-gray-500">
              {isRTL ? 'لا يوجد' : 'N/A'}
            </div>
          );
        }

        const subscriptionEnd = new Date(endDate);
        const now = new Date();
        const isExpired = subscriptionEnd < now;
        const daysLeft = Math.ceil((subscriptionEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-blue-500'}`} />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(endDate)}
                </div>
                <div className={`text-xs ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                  {isExpired 
                    ? (isRTL ? 'منتهي' : 'Expired')
                    : (isRTL ? `${daysLeft} يوم متبقي` : `${daysLeft} days left`)
                  }
                </div>
              </div>
            </div>
            <button
              onClick={() => handleOpenExtendModal(originalItem)}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              {isRTL ? 'تمديد' : 'Extend'}
            </button>
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      label: { en: 'Created At', ar: 'تاريخ الإنشاء' },
      type: 'date' as const,
      render: ( item: any) => {
        const originalItem = item.originalData as StoreSubscription;
        return (
          <div className="text-sm text-gray-900 flex justify-center ">
            {originalItem.createdAt ? formatDate(originalItem.createdAt) : 'N/A'}
          </div>
        );
      }
    }
  ];

  // تحويل البيانات لتتناسب مع CustomTable
  const tableData = stores.map(item => ({
    name: isRTL ? (item.nameAr || 'N/A') : (item.nameEn || item.nameAr || 'N/A'),
    status: item.status || 'unknown',
    subscription: item.subscription?.isSubscribed ? 'subscribed' : 'not_subscribed',
    trialEndDate: item.subscription?.trialEndDate || '',
    subscriptionEndDate: item.subscription?.endDate || '',
    createdAt: item.createdAt || '',
    // إضافة البيانات الأصلية للوصول إليها في render functions
    originalData: item
  }));
 
 // Only log if tableData has elements
 if (tableData.length > 0) {
   console.log('🔍 StoresManagement - first item name:', tableData[0].name);
 }
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className={`${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Breadcrumb */}
        <CustomBreadcrumb
          items={[
            { name: t('sideBar.dashboard'), href: '/' },
            { name: t('stores.management'), href: '/superadmin/stores' }
          ]}
          isRtl={isRTL}
        />

        {/* Header */}
        <div className={`mb-6 ${isRTL ? 'rtl' : 'ltr'}`}>
          <h1 className={`text-2xl font-bold text-gray-900 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <BuildingStorefrontIcon className="w-8 h-8 text-primary" />
            {isRTL ? 'إدارة المتاجر والاشتراكات' : 'Stores & Subscriptions Management'}
          </h1>
          <p className={`text-gray-600 mt-2 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            {isRTL ? 'عرض وإدارة جميع المتاجر وحالات اشتراكاتها' : 'View and manage all stores and their subscription status'}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Results Info */}
          {debouncedSearchTerm && (
            <div className={`mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm text-blue-800">
                {isRTL 
                  ? `تم العثور على ${pagination.total} متجر${pagination.total !== 1 ? 'ات' : ''} لـ "${debouncedSearchTerm}"`
                  : `Found ${pagination.total} store${pagination.total !== 1 ? 's' : ''} for "${debouncedSearchTerm}"`
                }
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className={`relative flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              {isSearching ? (
                <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5`}>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              ) : (
                <MagnifyingGlassIcon className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
              )}
              <input
                type="text"
                placeholder={isRTL ? 'البحث في اسم المتجر...' : 'Search by store name...'}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={`flex w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${isRTL ? 'text-right pr-8' : 'text-left pl-8'}`}
              />
              {searchTerm && !isSearching && (
                <button
                  onClick={() => handleSearch('')}
                  className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600`}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

                         {/* Status Filter */}
             <div>
               <CustomSelect
                 value={filters.status}
                 onChange={(e) => handleFilterChange('status', e.target.value)}
                 isRTL={isRTL}
                 options={[
                   { value: '', label: isRTL ? 'جميع الحالات' : 'All Status' },
                   { value: 'active', label: isRTL ? 'نشط' : 'Active' },
                   { value: 'inactive', label: isRTL ? 'غير نشط' : 'Inactive' }
                 ]}
               />
             </div>

            

                                                   {/* Plan Filter */}
              <div>
                <CustomSelect
                  value={filters.plan}
                  onChange={(e) => handleFilterChange('plan', e.target.value)}
                  isRTL={isRTL}
                  options={[
                    { value: '', label: isRTL ? 'جميع الخطط' : 'All Plans' },
                    ...plans.map((plan: any) => ({
                      value: plan._id,
                      label: isRTL ? plan.nameAr : plan.name
                    }))
                  ]}
                />
              </div>

                                                   {/* Sort */}
              <div>
                <CustomSelect
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setFilters(prev => ({ ...prev, sort, order }));
                  }}
                  isRTL={isRTL}
                  options={[
                    { value: 'createdAt-desc', label: isRTL ? 'الأحدث أولاً' : 'Newest First' },
                    { value: 'createdAt-asc', label: isRTL ? 'الأقدم أولاً' : 'Oldest First' },
                    { value: 'nameAr-asc', label: isRTL ? 'الاسم أ-ي' : 'Name A-Z' },
                    { value: 'nameAr-desc', label: isRTL ? 'الاسم ي-أ' : 'Name Z-A' }
                  ]}
                />
              </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div>
                <p className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right' : 'text-left' }`}>{isRTL ? 'إجمالي المتاجر' : 'Total Stores'}</p>
                <p className={`text-2xl font-bold text-gray-900 ${isRTL ? 'text-right' : 'text-left' }`}>{pagination.total}</p>
              </div>
              <BuildingStorefrontIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className={`flex items-center justify-between  ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div>
                <p className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right' : 'text-left' }`}>{isRTL ? 'متاجر نشطة' : 'Active Stores'}</p>
                <p className={`text-2xl font-bold text-green-600 ${isRTL ? 'text-right' : 'text-left' }`}>
                  {stores.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className={`flex items-center justify-between   ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div>
                <p className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right' : 'text-left' }`}>{isRTL ? 'مشتركين' : 'Subscribed'}</p>
                <p className={`text-2xl font-bold text-blue-600 ${isRTL ? 'text-right' : 'text-left' }`}>
                  {stores.filter(s => s.subscription?.isSubscribed).length}
                </p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className={`flex items-center justify-between  ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div>
                <p className={`text-sm font-medium text-gray-600 ${isRTL ? 'text-right' : 'text-left' }`}>{isRTL ? 'في التجربة' : 'On Trial'}</p>
                <p className={`text-2xl font-bold text-yellow-600 ${isRTL ? 'text-right' : 'text-left' }`}>
                  {stores.filter(s => {
                    const trialEnd = s.subscription?.trialEndDate;
                    return trialEnd && new Date(trialEnd) > new Date();
                  }).length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Add Subscription Plan Button */}
        <div className={`mb-6 flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
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
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : stores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {isRTL ? 'لا توجد متاجر' : 'No stores found'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isRTL ? 'جرب تغيير الفلاتر أو البحث' : 'Try adjusting your filters or search'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-8">
            <CustomTable
              columns={columns}
              data={tableData}
              showColumnToggle={true}
              showHiddenColumnsBar={true}
            />
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'السابق' : 'Previous'}
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                {isRTL 
                  ? `الصفحة ${pagination.page} من ${pagination.pages}`
                  : `Page ${pagination.page} of ${pagination.pages}`
                }
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        )}

        {/* Add Subscription Plan Modal */}
        <AddSubscriptionPlanModal
          isOpen={showAddPlanModal}
          onClose={() => setShowAddPlanModal(false)}
          onSuccess={handlePlanAdded}
        />

        {/* Extend Subscription Modal */}
        {showExtendModal && selectedStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <h3 className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'تمديد تاريخ انتهاء الاشتراك' : 'Extend Subscription End Date'}
                </h3>
                <button
                  onClick={handleCloseExtendModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 ">
                <p className={`text-sm text-gray-600 mb-2 ${isRTL ? 'text-right justify-end' : 'text-left justify-start' }`}>
                  {isRTL ? 'المتجر' : 'Store:'}
                </p>
                <p className={`font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? selectedStore.nameAr : (selectedStore.nameEn || selectedStore.nameAr)}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <DateField
                    label={isRTL ? 'تاريخ انتهاء الاشتراك الجديد' : 'New End Date' }
                    value={extendForm.endDate?.toISOString()}
                    onChange={(date) => setExtendForm(prev => ({ ...prev, endDate: date }))}
                    mode="edit"
                    minDate={dayjs()}
                    isRTL={isRTL}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? 'السبب (اختياري)' : 'Reason (Optional)'}
                  </label>
                  <textarea
                    value={extendForm.reason}
                    onChange={(e) => setExtendForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder={isRTL ? 'أدخل سبب التمديد...' : 'Enter extension reason...'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${isRTL ? 'text-right' : 'text-left'}`}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseExtendModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={isExtending}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleExtendEndDate}
                  disabled={isExtending || !extendForm.endDate}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExtending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isRTL ? 'جاري التمديد...' : 'Extending...'}
                    </>
                  ) : (
                    <>
                      <PlusIcon className="w-4 h-4" />
                      {isRTL ? 'تمديد' : 'Extend'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
                 )}

         {/* Extend Trial Modal */}
         {showTrialModal && selectedStore && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
               <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                 <h3 className="text-lg font-semibold text-gray-900">
                   {isRTL ? 'تمديد فترة التجربة' : 'Extend Trial Period'}
                 </h3>
                 <button
                   onClick={handleCloseTrialModal}
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <XMarkIcon className="w-6 h-6" />
                 </button>
               </div>

               <div className="mb-4">
                 <p className="text-sm text-gray-600 mb-2">
                   {isRTL ? 'المتجر:' : 'Store:'}
                 </p>
                 <p className="font-medium text-gray-900">
                   {isRTL ? selectedStore.nameAr : (selectedStore.nameEn || selectedStore.nameAr)}
                 </p>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     {isRTL ? 'عدد الأيام للتمديد' : 'Number of Days to Extend'}
                   </label>
                   <input
                     type="number"
                     value={trialForm.days}
                     onChange={(e) => setTrialForm(prev => ({ ...prev, days: parseInt(e.target.value) || 0 }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                     min="1"
                     max="365"
                     placeholder={isRTL ? 'أدخل عدد الأيام...' : 'Enter number of days...'}
                   />
                   <p className="text-xs text-gray-500 mt-1">
                     {isRTL ? 'الحد الأقصى: 365 يوم' : 'Maximum: 365 days'}
                   </p>
                 </div>

                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                   <div className="flex items-center gap-2">
                     <ClockIcon className="w-4 h-4 text-yellow-600" />
                     <p className="text-sm text-yellow-800">
                       {isRTL 
                         ? `سيتم تمديد فترة التجربة لمدة ${trialForm.days} يوم من تاريخ انتهاء التجربة الحالي`
                         : `Trial period will be extended by ${trialForm.days} days from the current trial end date`
                       }
                     </p>
                   </div>
                 </div>
               </div>

               <div className="flex gap-3 mt-6">
                 <button
                   onClick={handleCloseTrialModal}
                   className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                   disabled={isExtendingTrial}
                 >
                   {isRTL ? 'إلغاء' : 'Cancel'}
                 </button>
                 <button
                   onClick={handleExtendTrial}
                   disabled={isExtendingTrial || !trialForm.days || trialForm.days <= 0}
                   className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   {isExtendingTrial ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       {isRTL ? 'جاري التمديد...' : 'Extending...'}
                     </>
                   ) : (
                     <>
                       <PlusIcon className="w-4 h-4" />
                       {isRTL ? 'تمديد التجربة' : 'Extend Trial'}
                     </>
                   )}
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

export default StoresManagement; 