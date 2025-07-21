import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '../utils/storeUtils';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    amount: number;
    status: string;
    date: string;
  }>;
  revenueChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  productStats: {
    lowStock: number;
    outOfStock: number;
    totalVariants: number;
  };
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const storeId = getStoreId();
      
      // جلب البيانات من endpoints المتاحة فقط
      const [
        productsRes,
        customersRes,
        categoriesRes
      ] = await Promise.all([
        axios.get(`${BASE_URL}meta/products`),
        axios.get(`${BASE_URL}stores/${storeId}/customers`),
        axios.get(`${BASE_URL}categories/store/${storeId}`)
      ]);

      const products = productsRes.data.data || productsRes.data || [];
      const customers = customersRes.data.data || customersRes.data || [];
      const categories = categoriesRes.data.data || categoriesRes.data || [];

      // حساب الإحصائيات المتاحة
      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.visibility).length;
      const totalCustomers = customers.length;
      
      // محاكاة بيانات الطلبات حتى يتم إنشاء API
      const totalOrders = Math.floor(Math.random() * 1000) + 500;
      const pendingOrders = Math.floor(Math.random() * 50) + 10;
      const completedOrders = Math.floor(Math.random() * 800) + 400;
      const cancelledOrders = Math.floor(Math.random() * 30) + 5;
      
      // محاكاة الإيرادات
      const totalRevenue = Math.floor(Math.random() * 100000) + 50000;

      // حساب إحصائيات المنتجات
      const lowStock = products.filter((p: any) => p.availableQuantity <= (p.lowStockThreshold || 5)).length;
      const outOfStock = products.filter((p: any) => p.availableQuantity === 0).length;

      // إنشاء بيانات الرسم البياني للإيرادات (آخر 6 أشهر)
      const revenueChart = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthlyRevenue = Math.floor(Math.random() * 50000) + 10000;
        const monthlyOrders = Math.floor(Math.random() * 200) + 50;
        
        return {
          date: monthName,
          revenue: monthlyRevenue,
          orders: monthlyOrders
        };
      }).reverse();

      // حساب أفضل الفئات
      const topCategories = categories.slice(0, 5).map((cat: any) => ({
        name: cat.nameEn || cat.name,
        count: products.filter((p: any) => p.categoryId === cat._id).length,
        revenue: Math.floor(Math.random() * 10000) + 1000
      }));

      // محاكاة الطلبات الحديثة
      const recentOrders = Array.from({ length: 5 }, (_, i) => ({
        id: `order-${i + 1}`,
        customerName: `Customer ${i + 1}`,
        amount: Math.floor(Math.random() * 500) + 50,
        status: ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)],
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));

      const dashboardStats: DashboardStats = {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        activeProducts,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        monthlyRevenue: revenueChart[revenueChart.length - 1]?.revenue || 0,
        monthlyOrders: revenueChart[revenueChart.length - 1]?.orders || 0,
        topCategories,
        recentOrders,
        revenueChart,
        productStats: {
          lowStock,
          outOfStock,
          totalVariants: products.filter((p: any) => p.hasVariants).length
        }
      };

      setStats(dashboardStats);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err?.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};

export default useDashboardStats; 