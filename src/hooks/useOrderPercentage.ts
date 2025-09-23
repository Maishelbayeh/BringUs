import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getAuthHeaders } from '../utils/apiUtils';

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
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          err?.message || 
                          'حدث خطأ أثناء جلب نسبة الطلبات';
      setError(errorMessage);
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
