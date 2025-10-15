import { useState } from 'react';
import axios from 'axios';
import { PAYMENT_API_CONFIG } from '../constants/payment';
import useLanguage from './useLanguage';

interface PaymentVerificationResult {
  success: boolean;
  status: 'pending' | 'success' | 'failed' | 'unknown';
  message: string;
  data?: any;
}

/**
 * Activate subscription after successful payment (frontend fallback)
 * This is used when webhook doesn't work (e.g., on localhost)
 */
const activateSubscriptionAfterPayment = async (storeId: string, reference: string) => {
  try {
    console.log('🔄 Activating subscription via frontend...');
    
    // Get saved plan ID from localStorage
    const planId = localStorage.getItem('subscription_plan_id');
    
    if (!planId) {
      console.warn('⚠️ No plan ID found in localStorage, skipping subscription activation');
      return;
    }

    // Call backend subscription activation endpoint
    const activateUrl = `https://bringus-backend.onrender.com/api/subscription/stores/${storeId}`;
    const subscriptionData = {
      planId: planId,
      referenceId: reference,
      autoRenew: false
    };

    console.log('📤 Activating subscription:', subscriptionData);

    const response = await axios.post(activateUrl, subscriptionData, {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });

    if (response.data.success) {
      console.log('✅ Subscription activated successfully via frontend!');
      localStorage.setItem('subscription_active', 'true');
      localStorage.setItem('subscription_activation_date', new Date().toISOString());
    } else {
      console.error('❌ Subscription activation failed:', response.data.message);
    }

  } catch (error: any) {
    console.error('❌ Error activating subscription:', error);
    console.error('Error details:', error.response?.data);
  }
};

export const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const { language } = useLanguage();

  const verifyPayment = async (reference: string): Promise<PaymentVerificationResult> => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Get storeId from localStorage or context
      const storeId = localStorage.getItem('storeId') || '';
      
      // Use backend API endpoint
      const endpoint = PAYMENT_API_CONFIG.ENDPOINTS.VERIFY.replace(':storeId', storeId);
      const backendUrl = `${PAYMENT_API_CONFIG.BACKEND_URL}${endpoint}`;

      console.log('🔍 Payment Verification Request:', {
        url: backendUrl,
        reference
      });

      const response = await axios.post(backendUrl, 
        { reference },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        }
      );

      console.log('✅ Payment verification response:', response.data);

      const result: PaymentVerificationResult = {
        success: response.data.success,
        status: 'unknown',
        message: language === 'ARABIC' ? 'تم إكمال التحقق من الدفع' : 'Payment verification completed',
        data: response.data.data
      };

      // تحليل حالة الدفع من الاستجابة
      if (response.data.success && response.data.data) {
        const paymentData = response.data.data;
        const paymentStatus = paymentData.status?.toUpperCase();
        
        if (paymentStatus === 'CAPTURED' || paymentStatus === 'SUCCESS') {
          result.status = 'success';
          result.message = language === 'ARABIC' ? 'تم إكمال الدفع بنجاح' : 'Payment completed successfully';
          
          // Save payment success state to localStorage
          localStorage.setItem('subscription_payment_status', 'success');
          localStorage.setItem('subscription_payment_verified', 'true');
          localStorage.setItem('subscription_payment_verified_date', new Date().toISOString());
          
          // Clear the initiated flag
          localStorage.removeItem('subscription_payment_initiated');
          
          // **NEW: Activate subscription via frontend (fallback for when webhook doesn't work on localhost)**
          await activateSubscriptionAfterPayment(storeId, reference);
          
        } else if (paymentStatus === 'PENDING' || paymentStatus === 'INITIATED') {
          result.status = 'pending';
          result.message = language === 'ARABIC' ? 'الدفع لا يزال معلقاً' : 'Payment is still pending';
        } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'DECLINED') {
          result.status = 'failed';
          result.message = language === 'ARABIC' ? 'فشل الدفع أو تم إلغاؤه' : 'Payment failed or was cancelled';
          
          // Save failed status
          localStorage.setItem('subscription_payment_status', 'failed');
          localStorage.removeItem('subscription_payment_initiated');
        }
      }

      setVerificationResult(result);
      console.log('💾 Payment verification result saved:', result);
      return result;

    } catch (error: any) {
      console.error('❌ Payment verification error:', error);
      
      const result: PaymentVerificationResult = {
        success: false,
        status: 'unknown',
        message: language === 'ARABIC' 
          ? `فشل التحقق: ${error.response?.data?.message || error.message}`
          : `Verification failed: ${error.response?.data?.message || error.message}`
      };

      setVerificationResult(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  };

  const checkPaymentFromURL = async (): Promise<PaymentVerificationResult | null> => {
    // التحقق من وجود reference في URL
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference') || urlParams.get('tap_id') || urlParams.get('trxref');
    
    console.log('🔍 checkPaymentFromURL - Looking for reference:', { reference });
    
    if (!reference) {
      console.log('⚠️ No payment reference found in URL');
      return null;
    }

    // حفظ reference في localStorage
    localStorage.setItem('payment_reference', reference);
    if (!localStorage.getItem('reference')) {
      localStorage.setItem('reference', reference);
    }

    console.log('✅ Found payment reference, starting verification:', reference);
    return await verifyPayment(reference);
  };

  return {
    verifyPayment,
    checkPaymentFromURL,
    isVerifying,
    verificationResult
  };
};
