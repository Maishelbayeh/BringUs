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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                      {t('subscriptionHistory.action')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                      {t('subscriptionHistory.planName')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                      {t('subscriptionHistory.price')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                      {t('subscriptionHistory.startDate')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                      {t('subscriptionHistory.endDate')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                      {t('subscriptionHistory.performedAt')}
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                      {t('subscriptionHistory.referenceId')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getActionColor(item.action)}`}>
                          {getActionText(item.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {isRTL ? item.details.planNameAr : item.details.planName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.details.planType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getCurrencySymbol(item.details.currency)}{item.details.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.details.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.details.startDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.details.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.performedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {item.details.referenceId}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRTL ? 'التالي' : 'Previous'}
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRTL ? 'السابق' : 'Next'}
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {isRTL ? 'عرض' : 'Showing'} <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> {isRTL ? 'إلى' : 'to'} <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> {isRTL ? 'من' : 'of'} <span className="font-medium">{pagination.total}</span> {isRTL ? 'نتيجة' : 'results'}
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRTL ? '→' : '←'}
                      </button>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-primary border-primary text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRTL ? '←' : '→'}
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
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
