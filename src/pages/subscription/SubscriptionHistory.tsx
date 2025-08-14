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
  
  const [history, setHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRenewPopup, setShowRenewPopup] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    filteredCount: 0
  });

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
  }, [storeId]);

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

        {/* Renew Subscription Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowRenewPopup(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <CreditCardIcon className="w-5 h-5" />
            {t('subscriptionHistory.renewSubscription')}
          </button>
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
