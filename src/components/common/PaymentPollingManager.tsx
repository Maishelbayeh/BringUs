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
        console.log('📊 Step 1: Fetching subscription status...');
        await fetchSubscriptionStatus();
        console.log('✅ Subscription status fetched');
        
        // 2. Refresh store info (CRITICAL - to get updated subscription & status)
        const storeInfo = getStoreInfo();
        const storeId = localStorage.getItem('storeId');
        
        console.log('🏪 Store Info:', { slug: storeInfo?.slug, storeId });
        
        if (storeInfo?.slug) {
          console.log('📥 Step 2: Re-fetching store from backend...');
          const freshStoreData = await getStore(storeInfo.slug);
          
          if (freshStoreData) {
            console.log('✅ Fresh store data received:', {
              status: freshStoreData.status,
              hasSubscription: !!freshStoreData.subscription
            });
            
            // Force update localStorage with fresh data
            console.log('💾 Updating localStorage with fresh data...');
            localStorage.setItem('storeInfo', JSON.stringify({
              id: freshStoreData.id || freshStoreData._id,
              nameAr: freshStoreData.nameAr,
              nameEn: freshStoreData.nameEn,
              slug: freshStoreData.slug,
              status: freshStoreData.status, // This should now be 'active'
              settings: freshStoreData.settings,
              subscription: freshStoreData.subscription // Include subscription data
            }));
            
            // Clear any cached inactive status
            localStorage.removeItem('store_inactive_warning');
            
            // Trigger custom event to update StoreContext
            window.dispatchEvent(new CustomEvent('storeDataUpdated', {
              detail: { storeData: freshStoreData }
            }));
            
            console.log('✅ localStorage updated with status:', freshStoreData.status);
          } else {
            console.warn('⚠️ No store data returned from backend');
          }
        } else {
          console.warn('⚠️ No store slug found, skipping store refresh');
        }
        
        console.log('✅ All data refreshed successfully');
        console.log('📋 Final localStorage state:', {
          storeInfo: localStorage.getItem('storeInfo'),
          storeId: localStorage.getItem('storeId')
        });
        
      } catch (error) {
        console.error('❌ Error refreshing data:', error);
        // Still reload even if there's an error
      }

      // التحقق من وجود نافذة إعداد الاشتراك أو نافذة التحقق من الدفع مفتوحة
      // إذا كانت أي منهما مفتوحة، لن نعمل reload حتى يتم إغلاقها
      const hasAutoRenewalOpen = localStorage.getItem('auto_renewal_setup_open') === 'true';
      const hasVerificationModalOpen = localStorage.getItem('payment_verification_modal_open') === 'true';
      
      if (hasAutoRenewalOpen || hasVerificationModalOpen) {
        if (hasAutoRenewalOpen) {
          console.log('⏸️ Auto-renewal setup is open, delaying page reload...');
        }
        if (hasVerificationModalOpen) {
          console.log('⏸️ Payment verification modal is open, delaying page reload...');
        }
        console.log('🔄 Will reload after modal/setup is completed or cancelled');
        // لن نعمل reload هنا - سيتم عمله عند إغلاق النافذة
      } else {
        // Reload page to ensure all components are updated (topNav, sidebar, dashboard, etc.)
        console.log('⏳ Will reload page in 2 seconds...');
        setTimeout(() => {
          console.log('🔄 Reloading page to update all components (topNav, sidebar, dashboard)...');
          window.location.reload();
        }, 2000);
      }
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

