import { useState, useEffect } from 'react';
import axios from 'axios';
import { PAYMENT_API_CONFIG } from '../constants/payment';

interface PaymentVerificationResult {
  success: boolean;
  status: 'pending' | 'success' | 'failed' | 'unknown';
  message: string;
  data?: any;
}

export const usePaymentVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResult | null>(null);

  const verifyPayment = async (reference: string): Promise<PaymentVerificationResult> => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
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
        message: 'Payment verification completed',
        data: response.data
      };

      // تحليل حالة الدفع من الاستجابة
      if (response.data.data) {
        const paymentData = response.data.data;
        
        if (paymentData.status === 'CAPTURED' || paymentData.status === 'SUCCESS') {
          result.status = 'success';
          result.message = 'Payment completed successfully';
        } else if (paymentData.status === 'PENDING' || paymentData.status === 'INITIATED') {
          result.status = 'pending';
          result.message = 'Payment is still pending';
        } else if (paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED' || paymentData.status === 'DECLINED') {
          result.status = 'failed';
          result.message = 'Payment failed or was cancelled';
        }
      }

      setVerificationResult(result);
      return result;

    } catch (error: any) {
      console.error('Payment verification error:', error);
      
      const result: PaymentVerificationResult = {
        success: false,
        status: 'unknown',
        message: `Verification failed: ${error.response?.data?.message || error.message}`
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
