import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  isActive: boolean;
  expiresAt: string | null;
  plan: string;
  amount: number;
  currency: string;
}

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    isActive: false,
    expiresAt: null,
    plan: 'Free',
    amount: 0,
    currency: 'USD'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // جلب حالة الاشتراك من localStorage أو API
  useEffect(() => {
    const loadSubscriptionStatus = () => {
      try {
        const stored = localStorage.getItem('subscriptionStatus');
        if (stored) {
          setSubscriptionStatus(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading subscription status:', error);
      }
    };

    loadSubscriptionStatus();
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

  return {
    subscriptionStatus,
    updateSubscriptionStatus,
    isExpired,
    isExpiringSoon,
    isLoading,
    error
  };
};
