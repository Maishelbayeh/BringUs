import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

interface SubscriptionStatus {
  isActive: boolean;
  expiresAt: string | null;
  plan: string;
  amount: number;
  currency: string;
  daysUntilExpiry?: number;
}

interface ApiSubscriptionResponse {
  storeId: string;
  storeName: string;
  isSubscriptionActive: boolean;
  shouldBeDeactivated: boolean;
  daysUntilExpiry: number;
  subscription: {
    paymentMethod: any;
    amount: number;
    autoRenew: boolean;
    currency: string;
    endDate: string;
    isSubscribed: boolean;
    lastPaymentDate: string;
    nextPaymentDate: string;
    planId: string;
    referenceId: string;
    startDate: string;
    trialEndDate: string;
  };
  status: string;
}

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    expiresAt: null,
    plan: 'Free',
    amount: 0,
    currency: 'USD',
    daysUntilExpiry: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, _setError] = useState<string>('');

  // جلب حالة الاشتراك من API
  const fetchSubscriptionStatus = async () => {
    setIsLoading(true);
    try {
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        console.log('No store ID found, skipping subscription fetch');
        return;
      }

      const response = await axios.get<{ success: boolean; data: ApiSubscriptionResponse }>(
        `${BASE_URL}subscription/stores/${storeId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        const newStatus: SubscriptionStatus = {
          isActive: data.isSubscriptionActive,
          expiresAt: data.subscription.endDate,
          plan: 'Premium', // You might want to fetch plan details separately
          amount: data.subscription.amount,
          currency: data.subscription.currency,
          daysUntilExpiry: data.daysUntilExpiry
        };
        
        setSubscriptionStatus(newStatus);
        localStorage.setItem('subscriptionStatus', JSON.stringify(newStatus));
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // Fallback to localStorage if API fails
      const stored = localStorage.getItem('subscriptionStatus');
      if (stored) {
        setSubscriptionStatus(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // جلب حالة الاشتراك من localStorage أو API
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  // تحديث حالة الاشتراك
  const updateSubscriptionStatus = (status: SubscriptionStatus) => {
    setSubscriptionStatus(status);
    localStorage.setItem('subscriptionStatus', JSON.stringify(status));
  };

  // التحقق من انتهاء صلاحية الاشتراك
  const isExpired = () => {
    if (!subscriptionStatus.expiresAt) return false;
    return new Date(subscriptionStatus.expiresAt) < new Date();
  };

  // التحقق من قرب انتهاء الصلاحية (خلال 7 أيام)
  const isExpiringSoon = () => {
    if (!subscriptionStatus.expiresAt) return false;
    const expiryDate = new Date(subscriptionStatus.expiresAt);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return expiryDate <= sevenDaysFromNow;
  };

  // الحصول على عدد الأيام المتبقية
  const getDaysUntilExpiry = () => {
    return subscriptionStatus.daysUntilExpiry || 0;
  };

  return {
    subscriptionStatus,
    updateSubscriptionStatus,
    isExpired,
    isExpiringSoon,
    getDaysUntilExpiry,
    fetchSubscriptionStatus,
    isLoading,
    error
  };
};
