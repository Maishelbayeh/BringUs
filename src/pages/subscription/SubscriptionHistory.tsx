import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCardIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import { useToastContext } from '@/contexts/ToastContext';
import useLanguage from '@/hooks/useLanguage';
import SubscriptionRenewalPopup from '@/components/common/SubscriptionRenewalPopup';
import { useUserStore } from '@/hooks/useUserStore';
import { CustomTable } from '../../components/common/CustomTable';
import axios from 'axios';
import { useStore } from '@/hooks/useStore';

interface SubscriptionHistoryItem {
  _id: string;
  action: string;
  description: string;
  details: {
    planId: string;
    planName: string;
    planNameAr: string;
    planType: string;
    duration: number;
    price: number;
    currency: string;
    referenceId: string;
    autoRenew: boolean;
    startDate: string;
    endDate: string;
  };
  performedBy: string;
  performedAt: string;
  previousState: any;
  newState: any;
}

interface SubscriptionHistoryResponse {
  storeId: string;
  storeName: string;
  history: SubscriptionHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    filteredCount: number;
  };
}

const SubscriptionHistory: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { showSuccess, showError } = useToastContext();
  const { storeId, userId } = useUserStore();
  const { fetchSubscriptionStatus } = useStore();
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRenewPopup, setShowRenewPopup] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);      
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    filteredCount: 0
  });
  const [isDisablingAutoRenew, setIsDisablingAutoRenew] = useState(false);
  const [showDisableConfirmPopup, setShowDisableConfirmPopup] = useState(false);

  // تعريف أعمدة الجدول
  const columns = [
    {
      key: 'action',
      label: { en: 'Action', ar: 'الإجراء' },
      type: 'status' as const,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getActionColor(value)}`}>
          {getActionText(value)}
        </span>
      )
    },
    {
      key: 'planName',
      label: { en: 'Plan Name', ar: 'اسم الخطة' },
      type: 'text' as const,
      render: ( item: SubscriptionHistoryItem) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {isRTL ? item.details.planNameAr : item.details.planName}
          </div>
          <div className="text-sm text-gray-500">
            {item.details.planType}
          </div>
        </div>
      )
    },
    {
      key: 'price',
      label: { en: 'Price', ar: 'السعر' },
      type: 'text' as const,
      render: ( item: SubscriptionHistoryItem) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {getCurrencySymbol(item.details.currency)}{item.details.price}
          </div>
          <div className="text-sm text-gray-500">
            {item.details.currency}
          </div>
        </div>
      )
    },
    {
      key: 'startDate',
      label: { en: 'Start Date', ar: 'تاريخ البداية' },
      type: 'date' as const,
      render: ( item: SubscriptionHistoryItem) => (
        <div className="text-sm text-gray-900">
          {formatDate(item.details.startDate)}
        </div>
      )
    },
    {
      key: 'endDate',
      label: { en: 'End Date', ar: 'تاريخ الانتهاء' },
      type: 'date' as const,
      render: ( item: SubscriptionHistoryItem) => (
        <div className="text-sm text-gray-900">
          {formatDate(item.details.endDate)}
        </div>
      )
    },
    {
      key: 'performedAt',
      label: { en: 'Performed At', ar: 'تاريخ التنفيذ' },
      type: 'date' as const,
      render: ( item: SubscriptionHistoryItem) => (
        <div className="text-sm text-gray-900">
          {formatDate(item.performedAt)}
        </div>
      )
    }
  ];

  // جلب تاريخ الاشتراكات
  const fetchHistory = async (page = 1) => {
    if (!storeId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://https://bringus-backend.onrender.com/api/subscription/stores/${storeId}/history?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
             const data: SubscriptionHistoryResponse = response.data.data;
             const filteredHistory = data.history.filter(item => 
               item.action !== 'auto_renewal_enabled' &&
               item.action !== 'auto_renewal_disabled'
             );
             setHistory(filteredHistory);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Error fetching subscription history:', error);
      showError(t('general.error'), error.response?.data?.message || 'Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const loadSubscriptionStatus = async () => {
      try {
        const status = await fetchSubscriptionStatus();
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Error loading subscription status:', error);
      }
    };
    loadSubscriptionStatus();
  }, [storeId]);

const autoRenew = subscriptionStatus?.subscription?.autoRenew;
const subscriptionEndDate = subscriptionStatus?.subscription?.endDate;

// حساب الأيام المتبقية حتى انتهاء الاشتراك
const getDaysUntilExpiry = () => {
  if (!subscriptionEndDate) return null;
  const endDate = new Date(subscriptionEndDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

    const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 5;
  // دالة لإلغاء تفعيل التجديد التلقائي
  const handleDisableAutoRenewal = async () => {
    if (!storeId) return;
    
    setIsDisablingAutoRenew(true);
    try {
      const response = await axios.patch(
        `https://https://bringus-backend.onrender.com/api/subscription/stores/${storeId}/disable-auto-renewal`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
             if (response.data.success) {
         showSuccess(
           t('subscriptionHistory.autoRenewalDisabled'),
           t('subscriptionHistory.autoRenewalDisabledMessage')
         );
         // تحديث حالة الاشتراك
         const updatedStatus = await fetchSubscriptionStatus();
         setSubscriptionStatus(updatedStatus);
         setShowDisableConfirmPopup(false);
       } else {
        showError(
          t('subscriptionHistory.error'),
          response.data.message || t('subscriptionHistory.disableAutoRenewalError')
        );
      }
    } catch (error: any) {
      console.error('Error disabling auto-renewal:', error);
      showError(
        t('subscriptionHistory.error'),
        error.response?.data?.message || t('subscriptionHistory.disableAutoRenewalError')
      );
    } finally {
      setIsDisablingAutoRenew(false);
    }
  };



  // تحويل البيانات لتتناسب مع CustomTable
  const tableData = history.map(item => ({
    action: item.action,
    planName: item.details.planName,
    price: item.details.price,
    startDate: item.details.startDate,
    endDate: item.details.endDate,
    performedAt: item.performedAt,
    // إضافة البيانات الأصلية للوصول إليها في render functions
    details: item.details,
    _id: item._id
  }));

  // الحصول على نص الإجراء مترجم
  const getActionText = (action: string) => {
    const actionMap: { [key: string]: string } = {
      subscription_renewed: t('subscriptionHistory.subscription_renewed'),
      subscription_activated: t('subscriptionHistory.subscription_activated'),
      subscription_expired: t('subscriptionHistory.subscription_expired'),
      subscription_cancelled: t('subscriptionHistory.subscription_cancelled')
    };
    return actionMap[action] || action;
  };

  // الحصول على لون الإجراء
  const getActionColor = (action: string) => {
    const colorMap: { [key: string]: string } = {
      subscription_renewed: 'text-green-600 bg-green-50 border-green-200',
      subscription_activated: 'text-blue-600 bg-blue-50 border-blue-200',
      subscription_expired: 'text-red-600 bg-red-50 border-red-200',
      subscription_cancelled: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colorMap[action] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isRTL ? 'ar-EG' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        calendar: 'gregory'
      }
    );
  };

  // الحصول على رمز العملة
  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      ILS: '₪',
      JOD: 'د.أ'
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="min-h-screen p-4">
      <div className={`${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Breadcrumb */}
        <CustomBreadcrumb
          items={[
            { name: t('sideBar.dashboard'), href: '/' },
            { name: t('subscriptionHistory.title'), href: '/subscription-history' }
          ]}
          isRtl={isRTL}
        />

        {/* Header */}
        <HeaderWithAction
          title={t('subscriptionHistory.title')}
          addLabel=""
          isRtl={isRTL}
          count={pagination.total}
          loading={isLoading}
        />

        {/* Subscription Status Summary */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 flex flex-col ">
          <h3 className={`text-lg font-semibold text-gray-800 mb-3 flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <CreditCardIcon className="w-5 h-5 mr-2 text-primary" />
            {isRTL ? 'حالة الاشتراك' : 'Subscription Status'}
          </h3>
          <div className={` gap-4 flex ${isRTL ? 'flex-row-reverse ' : 'flex-row   '}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}  `}>
              <div className={`w-3 h-3 rounded-full ${autoRenew ? 'bg-green-500' : 'bg-red-500'} ${isRTL ? ' flex flex-row-reverse' : 'flex flex-row'}`}></div>
              <span className={`text-sm text-gray-600 ${isRTL ? 'flex flex-row-reverse' : 'flex flex-row'}`}>
                {isRTL ? 'التجديد التلقائي:' : 'Auto-Renewal:'}
              </span>
              <span className={`text-sm font-medium ${autoRenew ? 'text-green-600' : 'text-red-600'} ${isRTL ? 'flex flex-row-reverse' : 'flex flex-row'}`}>
                {autoRenew 
                  ? (isRTL ? 'مفعل' : 'Enabled')
                  : (isRTL ? 'معطل' : 'Disabled')
                }
              </span>
            </div>
            {daysUntilExpiry !== null && (
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}  `}>
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className={`text-sm text-gray-600 ${isRTL ? 'flex flex-row-reverse' : 'flex flex-row'}`}>
                  {isRTL ? 'الأيام المتبقية:' : 'Days Remaining:'}
                </span>
                <span className={`text-sm font-medium ${isRTL ? 'flex flex-row-reverse' : 'flex flex-row'} ${
                  daysUntilExpiry <= 5 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {daysUntilExpiry}
                </span>
              </div>
            )}
            {subscriptionEndDate && (
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}  `}>
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className={`text-sm text-gray-600 ${isRTL ? 'flex flex-row-reverse' : 'flex flex-row'}`}>
                  {isRTL ? 'تاريخ الانتهاء:' : 'End Date:'}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {formatDate(subscriptionEndDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Action Buttons */}
        <div className={`mb-6 flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Auto-Renewal Status Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${autoRenew ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {autoRenew 
                ? (isRTL ? 'التجديد التلقائي مفعل' : 'Auto-Renewal Enabled')
                : (isRTL ? 'التجديد التلقائي معطل' : 'Auto-Renewal Disabled')
              }
            </span>
          </div>

          {/* Days Until Expiry Display */}
          {daysUntilExpiry !== null && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              daysUntilExpiry <= 5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isRTL 
                  ? `${daysUntilExpiry} يوم متبقي`
                  : `${daysUntilExpiry} days remaining`
                }
              </span>
            </div>
          )}

                     {/* Disable Auto-Renewal Button */}
           {autoRenew && (
             <button
               onClick={() => setShowDisableConfirmPopup(true)}
               className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
               {isRTL ? 'إلغاء التجديد التلقائي' : 'Disable Auto-Renewal'}
             </button>
           )}

                     {/* Renew Subscription Button - Show only when auto-renewal is disabled */}
           {isExpiringSoon && (
             <button
               onClick={() => setShowRenewPopup(true)}
               className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
             >
               <CreditCardIcon className="w-5 h-5" />
               {t('subscriptionHistory.renewSubscription')}
             </button>
           )}
        </div>

        {/* History Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t('subscriptionHistory.noHistory')}
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <CustomTable
              columns={columns}
              data={tableData}
              showColumnToggle={true}
              showHiddenColumnsBar={true}
            />
          </div>
        )}

                 {/* Renew Subscription Popup */}
         <SubscriptionRenewalPopup
           isOpen={showRenewPopup}
           onClose={() => setShowRenewPopup(false)}
           isRTL={isRTL}
           storeId={storeId}
           userId={userId}
         />

         {/* Disable Auto-Renewal Confirmation Popup */}
         {showDisableConfirmPopup && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${isRTL ? 'rtl' : 'ltr'}`}>
               {/* Header */}
               <div className="flex items-center justify-between p-6 border-b border-gray-200">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                     <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                     </svg>
                   </div>
                   <div>
                     <h3 className="text-lg font-semibold text-gray-900">
                       {isRTL ? 'تأكيد إلغاء التجديد التلقائي' : 'Confirm Auto-Renewal Disable'}
                     </h3>
                     <p className="text-sm text-gray-500">
                       {isRTL ? 'إجراء مهم' : 'Important Action'}
                     </p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowDisableConfirmPopup(false)}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

               {/* Content */}
               <div className="p-6">
                 <div className="mb-4">
                   <p className="text-gray-700 leading-relaxed">
                     {isRTL 
                       ? 'هل أنت متأكد من إلغاء التجديد التلقائي؟'
                       : 'Are you sure you want to disable auto-renewal?'
                     }
                   </p>
                   <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                     <div className="flex items-start gap-2">
                       <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                       </svg>
                       <div>
                         <p className="text-sm text-yellow-800 font-medium">
                           {isRTL ? 'تنبيه مهم:' : 'Important Notice:'}
                         </p>
                         <p className="text-sm text-yellow-700 mt-1">
                           {isRTL 
                             ? 'لن يتم تجديد الاشتراك تلقائياً عند انتهاء الصلاحية. ستحتاج إلى تجديده يدوياً.'
                             : 'Your subscription will not renew automatically when it expires. You will need to renew it manually.'
                           }
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Footer */}
               <div className="flex gap-3 p-6 border-t border-gray-200">
                 <button
                   onClick={() => setShowDisableConfirmPopup(false)}
                   className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                 >
                   {isRTL ? 'إلغاء' : 'Cancel'}
                 </button>
                 <button
                   onClick={handleDisableAutoRenewal}
                   disabled={isDisablingAutoRenew}
                   className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                 >
                   {isDisablingAutoRenew ? (
                     <>
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                       {isRTL ? 'جاري الإلغاء...' : 'Disabling...'}
                     </>
                   ) : (
                     <>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                       {isRTL ? 'إلغاء التجديد التلقائي' : 'Disable Auto-Renewal'}
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

export default SubscriptionHistory;
