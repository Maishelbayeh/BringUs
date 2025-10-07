import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getAuthHeaders } from '../utils/apiUtils';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

export interface OrderPercentageData {
  totalOrders: number;
  guestOrders: number;
  loggedUserOrders: number;
  percentages: {
    guest: number;
    loggedUsers: number;
  };
}

interface UseOrderPercentageReturn {
  orderPercentage: OrderPercentageData | null;
  loading: boolean;
  error: string | null;
  refreshOrderPercentage: () => Promise<void>;
}

const useOrderPercentage = (): UseOrderPercentageReturn => {
  const [orderPercentage, setOrderPercentage] = useState<OrderPercentageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isRTL } = useLanguage();

  const fetchOrderPercentage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 جلب نسبة الطلبات (ضيوف مقابل مسجلين)...');
      
      const response = await axios.get<{
        success: boolean;
        data: OrderPercentageData;
        message?: string;
      }>(`${BASE_URL}orders/analytics/order-percentage`, {
        headers: getAuthHeaders()
      });

      console.log('📥 استجابة API لنسبة الطلبات:', response.data);

      if (response.data.success) {
        console.log('✅ تم جلب نسبة الطلبات بنجاح:', response.data.data);
        setOrderPercentage(response.data.data);
      } else {
        throw new Error(response.data.message || 'فشل في جلب نسبة الطلبات');
      }
    } catch (err: any) {
      console.error('❌ خطأ في جلب نسبة الطلبات:', err);
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب نسبة الطلبات' : 'Error Fetching Order Percentage',
        message: isRTL ? 'فشل في جلب نسبة الطلبات' : 'Failed to fetch order percentage'
      });
      setError(errorMsg.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOrderPercentage = useCallback(async () => {
    await fetchOrderPercentage();
  }, [fetchOrderPercentage]);

  useEffect(() => {
    fetchOrderPercentage();
  }, [fetchOrderPercentage]);

  return {
    orderPercentage,
    loading,
    error,
    refreshOrderPercentage
  };
};

export default useOrderPercentage;
