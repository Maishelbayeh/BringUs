import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getAuthHeaders } from '../utils/apiUtils';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

export interface TopProduct {
  _id: string;
  productName: string;
  productNameAr: string;
  productSku: string;
  mainImage: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  orderCount: number;
  categories: Array<{
    _id: string;
    name: string;
    nameAr?: string;
  }>;
}

interface UseTopProductsReturn {
  topProducts: TopProduct[];
  loading: boolean;
  error: string | null;
  refreshTopProducts: () => Promise<void>;
}

const useTopProducts = (): UseTopProductsReturn => {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isRTL } = useLanguage();

  const fetchTopProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 جلب المنتجات الأكثر مبيعاً...');
      
      const response = await axios.get<{
        success: boolean;
        data: TopProduct[];
        message?: string;
      }>(`${BASE_URL}orders/analytics/top-products`, {
        headers: getAuthHeaders()
      });

      console.log('📥 استجابة API للمنتجات الأكثر مبيعاً:', response.data);

      if (response.data.success) {
        console.log('✅ تم جلب المنتجات الأكثر مبيعاً بنجاح:', response.data.data);
        setTopProducts(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'فشل في جلب المنتجات الأكثر مبيعاً');
      }
    } catch (err: any) {
      console.error('❌ خطأ في جلب المنتجات الأكثر مبيعاً:', err);
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب المنتجات' : 'Error Fetching Top Products',
        message: isRTL ? 'فشل في جلب المنتجات الأكثر مبيعاً' : 'Failed to fetch top products'
      });
      setError(errorMsg.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTopProducts = useCallback(async () => {
    await fetchTopProducts();
  }, [fetchTopProducts]);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  return {
    topProducts,
    loading,
    error,
    refreshTopProducts
  };
};

export default useTopProducts;
