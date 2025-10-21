import React, { useEffect } from 'react';
import usePaymentPolling from '../../hooks/usePaymentPolling';
import { useToast } from '../../hooks/useToast';
import { useSubscription } from '../../hooks/useSubscription';
import { useStore } from '../../hooks/useStore';
import useLanguage from '../../hooks/useLanguage';
import { getStoreInfo } from '../../utils/storeUtils';

/**
 * مكون لإدارة المراقبة التلقائية للدفع
 * يتحقق تلقائياً من وجود دفعة قيد المعالجة ويستأنف المراقبة
 * يعرض إشعارات عند نجاح أو فشل الدفع
 */
const PaymentPollingManager: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const { fetchSubscriptionStatus } = useSubscription();
  const { getStore } = useStore();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';

  const {
    pollStatus,
    result,
    checkAndResumePolling
  } = usePaymentPolling({
    onSuccess: async (result) => {
      console.log('🎉 Payment successful callback triggered');
      
      // Show success message
      const message = isRTL ? result.messageAr : result.message;
      showSuccess(
        isRTL ? 'نجح الدفع!' : 'Payment Successful!',
        message || (isRTL ? 'تم تفعيل الاشتراك بنجاح' : 'Subscription activated successfully')
      );

      // Refresh all data before reload
      try {
        console.log('🔄 Refreshing store info and subscription status...');
        
        // 1. Refresh subscription status
        await fetchSubscriptionStatus();
        
        // 2. Refresh store info (to get updated subscription data)
        const storeInfo = getStoreInfo();
        if (storeInfo?.slug) {
          await getStore(storeInfo.slug);
          
          // Trigger custom event to update StoreContext
          window.dispatchEvent(new Event('storeDataUpdated'));
        }
        
        console.log('✅ All data refreshed successfully');
      } catch (error) {
        console.error('⚠️ Error refreshing data:', error);
      }

      // Reload page to ensure all components are updated (topNav, sidebar, dashboard, etc.)
      setTimeout(() => {
        console.log('🔄 Reloading page to update all components (topNav, sidebar, dashboard)...');
        window.location.reload();
      }, 2000);
    },
    onFailure: (result) => {
      console.log('❌ Payment failed callback triggered');
      
      // Show error message
      const message = isRTL ? result.messageAr : result.message;
      showError(
        isRTL ? 'فشل الدفع' : 'Payment Failed',
        message || (isRTL ? 'فشلت عملية الدفع أو تم إلغاؤها' : 'Payment failed or was cancelled')
      );

      // Redirect to subscription page after 3 seconds
      setTimeout(() => {
        window.location.href = '/subscription';
      }, 3000);
    },
    onError: (error) => {
      console.log('⚠️ Payment polling error (will retry):', error);
      // Don't show error notifications for temporary network errors
      // Polling will continue automatically
    }
  });

  /**
   * Check for pending payments when component mounts
   */
  useEffect(() => {
    console.log('🔍 PaymentPollingManager mounted - checking for pending payments...');
    checkAndResumePolling();
  }, [checkAndResumePolling]);

  /**
   * Show processing indicator when polling is active
   */
  if (pollStatus === 'polling') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Spinner */}
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          
          {/* Message */}
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <p className="font-semibold text-sm">
              {isRTL ? 'جاري معالجة الدفع...' : 'Processing payment...'}
            </p>
            <p className="text-xs opacity-90">
              {isRTL 
                ? 'يرجى الانتظار، جاري التحقق من حالة الدفع...'
                : 'Please wait, checking payment status...'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything when idle, success, or failed
  // (Success/failure messages are shown via toast notifications)
  return null;
};

export default PaymentPollingManager;

