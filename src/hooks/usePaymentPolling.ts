import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { PAYMENT_API_CONFIG } from '../constants/payment';
import useLanguage from './useLanguage';

interface PollResult {
  success: boolean;
  status: 'pending' | 'success' | 'failed' | 'error';
  shouldContinuePolling: boolean;
  message: string;
  messageAr: string;
  paymentStatus?: string;
  subscriptionActivated?: boolean;
  alreadyActivated?: boolean;
  subscription?: any;
  plan?: any;
  data?: any;
}

interface UsePaymentPollingOptions {
  onSuccess?: (result: PollResult) => void;
  onFailure?: (result: PollResult) => void;
  onError?: (error: any) => void;
}

const POLL_INTERVAL = 10 * 1000; // 10 seconds
const MAX_POLLING_TIME = 5 * 60 * 1000; // 5 minutes
const MAX_POLLING_AGE = 30 * 60 * 1000; // 30 minutes - age limit for old payments

/**
 * Hook للمراقبة التلقائية لحالة الدفع
 * يتحقق من حالة الدفع كل 10 ثواني حتى يتم تفعيل الاشتراك
 * يعمل حتى لو أغلق المستخدم نافذة الدفع
 */
export function usePaymentPolling(options?: UsePaymentPollingOptions) {
  const [pollStatus, setPollStatus] = useState<'idle' | 'polling' | 'success' | 'failed'>('idle');
  const [result, setResult] = useState<PollResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  
  const { language } = useLanguage();

  /**
   * إيقاف المراقبة
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPollingRef.current = false;
    console.log('⏹️ Payment polling stopped');
  }, []);

  /**
   * مسح بيانات الدفع من localStorage
   */
  const clearPaymentData = useCallback(() => {
    localStorage.removeItem('payment_reference');
    localStorage.removeItem('payment_planId');
    localStorage.removeItem('payment_storeId');
    localStorage.removeItem('payment_started_at');
    console.log('🧹 Payment data cleared from localStorage');
  }, []);

  /**
   * التحقق من حالة الدفع مرة واحدة
   */
  const pollPaymentStatus = useCallback(async (
    storeId: string,
    reference: string,
    planId: string
  ): Promise<PollResult | null> => {
    try {
      setAttempts(prev => {
        const newCount = prev + 1;
        console.log(`🔄 Polling attempt #${newCount} - Reference: ${reference}`);
        return newCount;
      });

      const endpoint = PAYMENT_API_CONFIG.ENDPOINTS.POLL
        .replace(':storeId', storeId)
        .replace(':reference', reference);
      const backendUrl = `${PAYMENT_API_CONFIG.BACKEND_URL}${endpoint}?planId=${planId}`;

      console.log('🔍 Polling payment:', {
        url: backendUrl,
        reference,
        planId,
        storeId
      });

      const response = await axios.get<PollResult>(backendUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      const data = response.data;
      console.log('📊 Poll result:', data);

      setResult(data);
      return data;

    } catch (error: any) {
      console.error('❌ Polling error:', error);
      
      // Don't stop polling on network errors - keep trying
      const errorResult: PollResult = {
        success: false,
        status: 'error',
        shouldContinuePolling: true, // Continue polling on errors
        message: 'Network error, retrying...',
        messageAr: 'خطأ في الشبكة، جاري المحاولة مرة أخرى...'
      };
      
      setResult(errorResult);
      
      if (options?.onError) {
        options.onError(error);
      }
      
      return errorResult;
    }
  }, [options]);

  /**
   * معالجة نتيجة المراقبة
   */
  const handlePollingResponse = useCallback((data: PollResult) => {
    const { status, shouldContinuePolling } = data;

    // Stop polling if backend says so
    if (!shouldContinuePolling) {
      stopPolling();
    }

    switch (status) {
      case 'success':
        console.log('✅ Payment successful and subscription activated!');
        setPollStatus('success');
        clearPaymentData();
        
        if (options?.onSuccess) {
          options.onSuccess(data);
        }
        break;

      case 'failed':
        console.log('❌ Payment failed');
        setPollStatus('failed');
        clearPaymentData();
        
        if (options?.onFailure) {
          options.onFailure(data);
        }
        break;

      case 'pending':
        console.log('⏳ Payment still pending, will retry...');
        // Continue polling
        break;

      case 'error':
        console.log('⚠️ Temporary error, will retry...');
        // Continue polling
        break;
    }
  }, [stopPolling, clearPaymentData, options]);

  /**
   * بدء المراقبة
   */
  const startPolling = useCallback((
    storeId: string,
    reference: string,
    planId: string
  ) => {
    // Prevent multiple polling instances
    if (isPollingRef.current) {
      console.log('⚠️ Polling already in progress');
      return;
    }

    console.log('🔄 Starting payment polling...', {
      reference,
      planId,
      storeId
    });

    isPollingRef.current = true;
    setPollStatus('polling');
    setAttempts(0);

    // Poll immediately
    pollPaymentStatus(storeId, reference, planId).then(data => {
      if (data) {
        handlePollingResponse(data);
      }
    });

    // Then poll every 10 seconds
    intervalRef.current = setInterval(async () => {
      const data = await pollPaymentStatus(storeId, reference, planId);
      if (data) {
        handlePollingResponse(data);
      }
    }, POLL_INTERVAL);

    // Safety timeout: stop after 5 minutes
    timeoutRef.current = setTimeout(() => {
      console.log('⏱️ Polling timeout reached (5 minutes)');
      stopPolling();
      setPollStatus('idle');
    }, MAX_POLLING_TIME);

  }, [pollPaymentStatus, handlePollingResponse, stopPolling]);

  /**
   * التحقق من وجود payment قيد الانتظار واستئناف المراقبة
   */
  const checkAndResumePolling = useCallback(() => {
    const reference = localStorage.getItem('payment_reference');
    const planId = localStorage.getItem('payment_planId');
    const storeId = localStorage.getItem('payment_storeId');
    const startedAt = localStorage.getItem('payment_started_at');

    if (!reference || !planId || !storeId) {
      console.log('ℹ️ No pending payment found');
      return false;
    }

    // Check if payment is not too old (within last 30 minutes)
    if (startedAt) {
      const paymentAge = Date.now() - new Date(startedAt).getTime();
      
      if (paymentAge > MAX_POLLING_AGE) {
        console.log('⏱️ Payment too old, clearing data...');
        clearPaymentData();
        return false;
      }
    }

    console.log('🔄 Resuming payment polling...', {
      reference,
      planId,
      storeId,
      age: startedAt ? `${Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)}s` : 'unknown'
    });

    startPolling(storeId, reference, planId);
    return true;

  }, [startPolling, clearPaymentData]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    pollStatus,
    result,
    attempts,
    startPolling,
    stopPolling,
    checkAndResumePolling,
    clearPaymentData,
    isPolling: isPollingRef.current,
    language
  };
}

export default usePaymentPolling;

