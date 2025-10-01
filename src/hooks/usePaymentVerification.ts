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

export const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);
  const { language } = useLanguage();

  const verifyPayment = async (reference: string): Promise<PaymentVerificationResult> => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Console log the payment verification request details
      console.log('🔍 Payment Verification Request Details:');
      console.log('📋 Reference:', reference);
      console.log('🔑 Using Secret Key:', PAYMENT_API_CONFIG.SECRET_KEY);
      console.log('🌐 Request URL:', `${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.VERIFY}/${reference}`);

      const response = await axios.get(`${PAYMENT_API_CONFIG.BASE_URL}${PAYMENT_API_CONFIG.ENDPOINTS.VERIFY}/${reference}`, {
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_CONFIG.SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Payment verification response:', response.data);

      const result: PaymentVerificationResult = {
        success: true,
        status: 'unknown',
        message: language === 'ARABIC' ? 'تم إكمال التحقق من الدفع' : 'Payment verification completed',
        data: response.data
      };

      // تحليل حالة الدفع من الاستجابة
      if (response.data.data) {
        const paymentData = response.data.data;
        
        if (paymentData.status === 'CAPTURED' || paymentData.status === 'SUCCESS') {
          result.status = 'success';
          result.message = language === 'ARABIC' ? 'تم إكمال الدفع بنجاح' : 'Payment completed successfully';
        } else if (paymentData.status === 'PENDING' || paymentData.status === 'INITIATED') {
          result.status = 'pending';
          result.message = language === 'ARABIC' ? 'الدفع لا يزال معلقاً' : 'Payment is still pending';
        } else if (paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED' || paymentData.status === 'DECLINED') {
          result.status = 'failed';
          result.message = language === 'ARABIC' ? 'فشل الدفع أو تم إلغاؤه' : 'Payment failed or was cancelled';
        }
      }

      setVerificationResult(result);
      console.log('Payment verification result:', result);
      return result;

    } catch (error: any) {
      console.error('Payment verification error:', error);
      
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
    const reference = urlParams.get('reference') || urlParams.get('tap_id');
    
    if (!reference) {
      return null;
    }

    // حفظ reference في localStorage إذا لم يكن موجوداً
    if (!localStorage.getItem('reference')) {
      localStorage.setItem('reference', reference);
    }

    return await verifyPayment(reference);
  };

  return {
    verifyPayment,
    checkPaymentFromURL,
    isVerifying,
    verificationResult
  };
};
