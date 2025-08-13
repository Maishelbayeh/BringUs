import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../hooks/useSubscription';

interface SubscriptionDetailsProps {
  isRTL: boolean;
}

const SubscriptionDetails: React.FC<SubscriptionDetailsProps> = ({ isRTL }) => {
  const { t } = useTranslation();
  const { subscriptionStatus, isExpired, isExpiringSoon } = useSubscription();

  const getStatusColor = () => {
    if (isExpired()) return 'text-red-600 bg-red-50 border-red-200';
    if (isExpiringSoon()) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusText = () => {
    if (isExpired()) return isRTL ? 'منتهي الصلاحية' : 'Expired';
    if (isExpiringSoon()) return isRTL ? 'ينتهي قريباً' : 'Expiring Soon';
    return isRTL ? 'نشط' : 'Active';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return isRTL ? 'غير محدد' : 'Not set';
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${isRTL ? 'text-right' : 'text-left'}`}>
      <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {isRTL ? 'تفاصيل الاشتراك' : 'Subscription Details'}
      </h3>
      
      <div className="space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'الحالة' : 'Status'}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Plan */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'الخطة' : 'Plan'}
          </span>
          <span className="text-sm text-gray-900">
            {subscriptionStatus.plan}
          </span>
        </div>

        {/* Amount */}
        {subscriptionStatus.amount > 0 && (
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'المبلغ' : 'Amount'}
            </span>
            <span className="text-sm text-gray-900">
              {subscriptionStatus.amount} {subscriptionStatus.currency}
            </span>
          </div>
        )}

        {/* Expiry Date */}
        {subscriptionStatus.expiresAt && (
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
            </span>
            <span className={`text-sm ${isExpired() ? 'text-red-600' : isExpiringSoon() ? 'text-yellow-600' : 'text-gray-900'}`}>
              {formatDate(subscriptionStatus.expiresAt)}
            </span>
          </div>
        )}

        {/* Warning Messages */}
        {isExpired() && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL 
                ? 'انتهت صلاحية اشتراكك. يرجى تجديد الاشتراك للاستمرار في استخدام جميع الميزات.'
                : 'Your subscription has expired. Please renew your subscription to continue using all features.'
              }
            </p>
          </div>
        )}

        {isExpiringSoon() && !isExpired() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className={`text-sm text-yellow-700 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL 
                ? 'اشتراكك سينتهي قريباً. يرجى تجديد الاشتراك لتجنب انقطاع الخدمة.'
                : 'Your subscription will expire soon. Please renew your subscription to avoid service interruption.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
