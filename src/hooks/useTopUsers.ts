import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getAuthHeaders } from '../utils/apiUtils';

export interface TopUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalProductsSold: number;
  orderCount: number;
  totalRevenue: number;
}

interface UseTopUsersReturn {
  topUsers: TopUser[];
  loading: boolean;
  error: string | null;
  refreshTopUsers: () => Promise<void>;
}

const useTopUsers = (): UseTopUsersReturn => {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 جلب المستخدمين الأكثر مبيعاً...');
      
      const response = await axios.get<{
        success: boolean;
        data: TopUser[];
        message?: string;
      }>(`${BASE_URL}orders/analytics/top-users`, {
        headers: getAuthHeaders()
      });

      console.log('📥 استجابة API للمستخدمين الأكثر مبيعاً:', response.data);

      if (response.data.success) {
        console.log('✅ تم جلب المستخدمين الأكثر مبيعاً بنجاح:', response.data.data);
        setTopUsers(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'فشل في جلب المستخدمين الأكثر مبيعاً');
      }
    } catch (err: any) {
      console.error('❌ خطأ في جلب المستخدمين الأكثر مبيعاً:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          err?.message || 
                          'حدث خطأ أثناء جلب المستخدمين الأكثر مبيعاً';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTopUsers = useCallback(async () => {
    await fetchTopUsers();
  }, [fetchTopUsers]);

  useEffect(() => {
    fetchTopUsers();
  }, [fetchTopUsers]);

  return {
    topUsers,
    loading,
    error,
    refreshTopUsers
  };
};

export default useTopUsers;
