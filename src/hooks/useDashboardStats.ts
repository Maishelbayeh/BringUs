import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '../utils/storeUtils';
import { getAuthHeaders } from '../utils/apiUtils';
import { useStore } from './useStore';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  shippedOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  storeCurrency: string;
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
  const { getStore } = useStore();



  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const storeId = getStoreId();
      
      // جلب البيانات من endpoints المتاحة
      const [
        productsRes,
        customersRes,
        categoriesRes,
        ordersRes
      ] = await Promise.all([
        axios.get(`${BASE_URL}meta/products`, { headers: getAuthHeaders() }),
        axios.get(`${BASE_URL}stores/${storeId}/customers`, { headers: getAuthHeaders() }),
        axios.get(`${BASE_URL}categories/store/${storeId}`, { headers: getAuthHeaders() }),
        axios.get(`${BASE_URL}orders/store/${storeId}`, { headers: getAuthHeaders() })
      ]);

      const products = productsRes.data.data || productsRes.data || [];
      const customers = customersRes.data.data || customersRes.data || [];
      const categories = categoriesRes.data.data || categoriesRes.data || [];
      const orders = ordersRes.data.data || ordersRes.data || [];
      
      // جلب معلومات المتجر باستخدام useStore (سيتم تخزينها في localStorage تلقائياً)
      const store = await getStore(storeId);
      console.log('Store data:', store);
      console.log('Store currency:', store?.settings?.currency);

      // للتحقق من البيانات
      console.log('Orders data:', orders);
      if (orders.length > 0) {
        console.log('Sample order:', orders[0]);
        console.log('Sample order paid status:', orders[0].paid);
        console.log('Sample order items:', orders[0].items);
        console.log('Sample order total calculation:', orders[0].items?.reduce((sum: number, item: any) => sum + (item.total || 0), 0));
      }

      // حساب الإحصائيات المتاحة
      const totalProducts = products.length;
      const activeProducts = products.filter((p: any) => p.visibility).length;
      const totalCustomers = customers.length;
      
      // حساب إحصائيات الطلبات الحقيقية
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
      const shippedOrders = orders.filter((order: any) => order.status === 'shipped').length;
      const completedOrders = orders.filter((order: any) => order.status === 'delivered').length;
      const cancelledOrders = orders.filter((order: any) => order.status === 'cancelled').length;
      
      // حساب الإيرادات الحقيقية (من الطلبات المدفوعة فقط)
      const paidOrders = orders.filter((order: any) => order.paid === true);
      console.log('Paid orders count:', paidOrders.length);
      
      // حساب الإيرادات من الطلبات المدفوعة فقط
      const totalRevenue = paidOrders.reduce((sum: number, order: any) => {
        let orderTotal = 0;
        
        if (order.items && Array.isArray(order.items) && order.items.length > 0) {
          orderTotal = order.items.reduce((itemSum: number, item: any) => {
            const itemTotal = item.total || item.totalPrice || item.price || 0;
            return itemSum + itemTotal;
          }, 0);
        } else {
          orderTotal = order.total || order.price || 0;
        }
        
        return sum + orderTotal;
      }, 0);
      
      console.log('Total revenue (paid orders only):', totalRevenue);

      // حساب إحصائيات المنتجات
      const lowStock = products.filter((p: any) => p.availableQuantity <= (p.lowStockThreshold || 5)).length;
      const outOfStock = products.filter((p: any) => p.availableQuantity === 0).length;

      // إنشاء بيانات الرسم البياني للإيرادات (آخر 6 أشهر) من البيانات الحقيقية
      const revenueChart = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // فلترة الطلبات للشهر الحالي
        const monthOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.date);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
        
        const paidMonthOrders = monthOrders.filter((order: any) => order.paid === true);
        
        const monthlyRevenue = paidMonthOrders.reduce((sum: number, order: any) => {
          let orderTotal = 0;
          
          if (order.items && Array.isArray(order.items) && order.items.length > 0) {
            orderTotal = order.items.reduce((itemSum: number, item: any) => {
              const itemTotal = item.total || item.totalPrice || item.price || 0;
              return itemSum + itemTotal;
            }, 0);
          } else {
            // إذا لم تكن هناك items، استخدم order.total أو order.price
            orderTotal = order.total || order.price || 0;
          }
          
          return sum + orderTotal;
        }, 0);
        
        const monthlyOrders = monthOrders.length;
        
        return {
          date: monthName,
          revenue: monthlyRevenue,
          orders: monthlyOrders
        };
      }).reverse();

      // حساب أفضل الفئات من البيانات الحقيقية
      const topCategories = categories.slice(0, 5).map((cat: any) => {
        const categoryProducts = products.filter((p: any) => p.categoryId === cat._id);
        const categoryRevenue = orders
          .filter((order: any) => order.paid === true)
          .reduce((sum: number, order: any) => {
            // حساب الإيرادات من الطلبات المكتملة التي تحتوي على منتجات من هذه الفئة
            let orderTotal = 0;
            
            if (order.items && Array.isArray(order.items) && order.items.length > 0) {
              orderTotal = order.items.reduce((itemSum: number, item: any) => {
                const itemTotal = item.total || item.totalPrice || item.price || 0;
                return itemSum + itemTotal;
              }, 0);
            } else {
              // إذا لم تكن هناك items، استخدم order.total أو order.price
              orderTotal = order.total || order.price || 0;
            }
            
            return sum + orderTotal;
          }, 0);
        
        return {
          name: cat.nameEn || cat.name,
          count: categoryProducts.length,
          revenue: categoryRevenue
        };
      });

      // الطلبات الحديثة من البيانات الحقيقية
      const recentOrders = orders
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((order: any) => {
          const orderTotal = order.items && order.items.length > 0 
            ? order.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0)
            : 0;
          
          return {
            id: order.id || order.orderNumber || order._id,
            customerName: order.customer,
            amount: orderTotal,
            status: order.status,
            date: new Date(order.date).toLocaleDateString()
          };
        });

      const dashboardStats: DashboardStats = {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        activeProducts,
        pendingOrders,
        shippedOrders,
        completedOrders,
        cancelledOrders,
        monthlyRevenue: revenueChart[revenueChart.length - 1]?.revenue || 0,
        monthlyOrders: revenueChart[revenueChart.length - 1]?.orders || 0,
        storeCurrency: store?.settings?.currency || 'ILS',
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