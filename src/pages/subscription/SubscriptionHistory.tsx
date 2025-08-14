import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CreditCardIcon,
  CalendarIcon,
  CurrencyDollarIcon,
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

  // تعريف أعمدة الجدول
  const columns = [
    {
      key: 'action',
      label: { en: 'Action', ar: 'الإجراء' },
      type: 'status' as const,
      render: (value: string, item: SubscriptionHistoryItem) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getActionColor(value)}`}>
          {getActionText(value)}
        </span>
      )
    },
    {
      key: 'planName',
      label: { en: 'Plan Name', ar: 'اسم الخطة' },
      type: 'text' as const,
      render: (value: string, item: SubscriptionHistoryItem) => (
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
      render: (value: string, item: SubscriptionHistoryItem) => (
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
      render: (value: string, item: SubscriptionHistoryItem) => (
        <div className="text-sm text-gray-900">
          {formatDate(item.details.startDate)}
        </div>
      )
    },
    {
      key: 'endDate',
      label: { en: 'End Date', ar: 'تاريخ الانتهاء' },
      type: 'date' as const,
      render: (value: string, item: SubscriptionHistoryItem) => (
        <div className="text-sm text-gray-900">
          {formatDate(item.details.endDate)}
        </div>
      )
    },
    {
      key: 'performedAt',
      label: { en: 'Performed At', ar: 'تاريخ التنفيذ' },
      type: 'date' as const,
      render: (value: string, item: SubscriptionHistoryItem) => (
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
        `http://localhost:5001/api/subscription/stores/${storeId}/history?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data: SubscriptionHistoryResponse = response.data.data;
      setHistory(data.history);
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
    fetchSubscriptionStatus();
    setSubscriptionStatus(fetchSubscriptionStatus());
  }, [storeId]);

const autoRenew = subscriptionStatus?.autoRenew;
const subscriptionEndDate = subscriptionStatus?.endDate;

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
console.log(isExpiringSoon);
  // دالة لإلغاء تفعيل التجديد التلقائي
  const handleDisableAutoRenewal = async () => {
    if (!storeId) return;
    
    // رسالة تأكيد
    const confirmMessage = isRTL 
      ? 'هل أنت متأكد من إلغاء التجديد التلقائي؟ لن يتم تجديد الاشتراك تلقائياً عند انتهاء الصلاحية.'
      : 'Are you sure you want to disable auto-renewal? Your subscription will not renew automatically when it expires.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setIsDisablingAutoRenew(true);
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/subscription/stores/${storeId}/disable-auto-renewal`,
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
        fetchSubscriptionStatus();
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

  // معالجة تغيير الصفحة
  const handlePageChange = (newPage: number) => {
    fetchHistory(newPage);
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
      isRTL ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
      <div className="">
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
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-2 text-primary" />
            {isRTL ? 'حالة الاشتراك' : 'Subscription Status'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${autoRenew ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isRTL ? 'التجديد التلقائي:' : 'Auto-Renewal:'}
              </span>
              <span className={`text-sm font-medium ${autoRenew ? 'text-green-600' : 'text-red-600'}`}>
                {autoRenew 
                  ? (isRTL ? 'مفعل' : 'Enabled')
                  : (isRTL ? 'معطل' : 'Disabled')
                }
              </span>
            </div>
            {daysUntilExpiry !== null && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {isRTL ? 'الأيام المتبقية:' : 'Days Remaining:'}
                </span>
                <span className={`text-sm font-medium ${
                  daysUntilExpiry <= 5 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {daysUntilExpiry}
                </span>
              </div>
            )}
            {subscriptionEndDate && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
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
        <div className="mb-6 flex flex-wrap gap-3">
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
              onClick={handleDisableAutoRenewal}
              disabled={isDisablingAutoRenew}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisablingAutoRenew ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {isRTL ? 'إلغاء التجديد التلقائي' : 'Disable Auto-Renewal'}
            </button>
          )}

          {/* Renew Subscription Button - Show when expiring soon or auto-renewal is disabled */}
          {(  isExpiringSoon) && (
            <button
              onClick={() => setShowRenewPopup(true)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                isExpiringSoon 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
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
      </div>
    </div>
  );
};

export default SubscriptionHistory;
