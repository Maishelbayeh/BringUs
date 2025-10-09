import { useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

export interface RawCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
  isGuest?: boolean;
  orderCount?: number;
  totalSpent?: number;
  status: 'active' | 'inactive' | 'banned';
  phone: string;
  avatar?: {
    url: string;
  };
  password?: string;
  addresses?: Address[];
}

export interface Address {
  type?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
  status: 'active' | 'inactive' | 'banned';
  phone: string;
  avatar?: {
    url: string;
  };
  addressSummary?: string;
  isGuest?: boolean;
  orderCount?: number;
  totalSpent?: number;
  lastOrderDate?: string;
}

export interface CustomersResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  statistics: {
    total: number;
    active: number;
    inactive: number;
    banned: number;
    emailVerified: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  storeName: string;
  storeUrl: string;
  currency: string;
  status: string;
  paymentStatus?: string; // للعملاء الضيوف
  paid?: boolean; // للعملاء المسجلين
  date?: string; // للعملاء المسجلين
  price?: number; // للعملاء الضيوف - السعر الإجمالي للطلب
  createdAt: string;
  updatedAt: string;
  itemsCount?: number; // للعملاء المسجلين
  items: Array<{
    id?: string; // للعملاء الضيوف
    image?: string; // للعملاء المسجلين
    name: string;
    quantity: number;
    price?: number; // للعملاء الضيوف
    pricePerUnit?: number; // للعملاء المسجلين
    totalPrice?: number; // للعملاء الضيوف
    total?: number; // للعملاء المسجلين
    variant?: any; // للعملاء الضيوف
    selectedSpecifications: Array<{
      specificationId: string;
      valueId: string;
      valueAr: string;
      valueEn: string;
      titleAr: string;
      titleEn: string;
      _id: string;
      id: string;
    }>;
    selectedColors: string[];
  }>;
  deliveryArea: {
    locationAr: string;
    locationEn: string;
    price: number;
    estimatedDays: number;
  };
  notes: {
    customer: string;
  };
  isGift: boolean;
  affiliateTracking?: {
    isAffiliateOrder: boolean;
    commissionEarned: number;
    commissionPercentage: number;
  };
  pricing?: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  }; // للعملاء المسجلين
  affiliate?: any; // للعملاء المسجلين
  actualDeliveryDate?: string; // للعملاء المسجلين
}

// للعملاء المسجلين
export interface CustomerOrdersResponse {
  success: boolean;
  data: Order[];
  count: number;
  total: number;
  customerStats: {
    totalSpending: number;
    averageSpending: number;
    lastOrderDate: string;
    totalOrders: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// للعملاء الضيوف
export interface GuestOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    statistics: {
      totalOrders: number;
      totalSpending: number;
      averageSpending: number;
      lastOrderDate: string;
      guestId: string;
    };
  };
}

export interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  statistics: CustomersResponse['statistics'] | null;
  pagination: CustomersResponse['pagination'] | null;
  fetchCustomers: (storeId: string, forceRefresh?: boolean, page?: number, limit?: number, search?: string) => Promise<Customer[] | void>;
  deleteCustomer: (storeId: string, id: string) => Promise<boolean>;
  updateCustomer: (storeId: string, id: string, data: Partial<Customer>) => Promise<boolean>;
  createCustomer: (storeId: string, data: Omit<Customer, '_id'>) => Promise<boolean>;
  fetchCustomerOrders: (customerId: string, storeId: string, page?: number, limit?: number) => Promise<Order[] | void>;
  fetchGuestOrders: (guestId: string, storeId: string, page?: number, limit?: number) => Promise<Order[] | void>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export const useCustomers = (): UseCustomersReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<CustomersResponse['statistics'] | null>(null);
  const [pagination, setPagination] = useState<CustomersResponse['pagination'] | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const token = localStorage.getItem('token');
  const { isRTL } = useLanguage();
  const fetchCustomers = useCallback(async (
    storeId: string,
    forceRefresh: boolean = false,
    // page = 1,
    // limit = 10,
    // search = ''
  ) => {
    console.log('Fetching customers...'); // Debug: to see when API is called
    if (hasLoaded && !forceRefresh && customers.length > 0) {
      return customers;
    }
    setLoading(true);
    setError(null);
    try {
      // const params = new URLSearchParams({
      //   page: page.toString(),
      //   limit: limit.toString(),
      //   ...(search && { search })
      // });
      const url = `${BASE_URL}stores/${storeId}/customers?includeGuests=true`;
        const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result: CustomersResponse = res.data;
      if (result.success) {
        // فلترة الحقول: لا تعرض email أو password، وأضف addressSummary، وفلتر role === 'client'
        const filtered: Customer[] = (result.data as RawCustomer[])
        
          .map(({ password, email, addresses, ...rest }) => {
            let addressSummary = '';
            if (addresses && addresses.length > 0) {
              const addr = addresses.find(a => a.isDefault) || addresses[0];
              addressSummary = [addr.street, addr.city, addr.country].filter(Boolean).join(', ');
            }
            return { ...rest, addressSummary };
          });
        setCustomers(filtered);
        setStatistics(result.statistics);
        setPagination(result.pagination);
        setHasLoaded(true);
        return filtered;
      } else {
        throw new Error('Failed to fetch customers');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب العملاء' : 'Error Fetching Customers',
        message: isRTL ? 'فشل في جلب قائمة العملاء' : 'Failed to fetch customers list'
      });
      setError(errorMsg.message);
      //CONSOLE.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [hasLoaded]);

  const deleteCustomer = async (storeId: string, id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`${BASE_URL}stores/${storeId}/customers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const result = response.data;
      if (result.success) {
        setCustomers(prev => prev.filter(customer => customer._id !== id));
        return true;
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حذف العميل' : 'Error Deleting Customer',
        message: isRTL ? 'فشل في حذف العميل' : 'Failed to delete customer'
      });
      setError(errorMsg.message);
      //CONSOLE.error('Error deleting customer:', err);
      return false;
    }
  };

  const updateCustomer = async (storeId: string, id: string, data: Partial<Customer>): Promise<boolean> => {
    try {
      //GET /api/stores/{storeId}/customers?includeGuests=true
      const response = await axios.put(`${BASE_URL}stores/${storeId}/customers/${id}`, data);
      const result = response.data;
      if (result.success) {
        setCustomers(prev => prev.map(customer => 
          customer._id === id ? { ...customer, ...data } : customer
        ));
        return true;
      } else {
        throw new Error('Failed to update customer');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث العميل' : 'Error Updating Customer',
        message: isRTL ? 'فشل في تحديث العميل' : 'Failed to update customer'
      });
      setError(errorMsg.message);
      //CONSOLE.error('Error updating customer:', err);
      return false;
    }
  };

  const createCustomer = async (storeId: string, data: Omit<Customer, '_id'>): Promise<boolean> => {
    try {
      const response = await axios.post(`${BASE_URL}stores/${storeId}/customers`, data);

      const result = response.data;
      if (result.success) {
        setCustomers(prev => [...prev, result.data]);
        return true;
      } else {
        throw new Error('Failed to create customer');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إنشاء العميل' : 'Error Creating Customer',
        message: isRTL ? 'فشل في إنشاء العميل' : 'Failed to create customer'
      });
      setError(errorMsg.message);
      //CONSOLE.error('Error creating customer:', err);
      return false;
    }
  };

  const fetchCustomerOrders = async (
    customerId: string,
    storeId: string,
    page = 1,
    limit = 10
  ): Promise<Order[] | void> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        storeId: storeId
      });
      
      const url = `${BASE_URL}orders/customer/${customerId}?${params}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const result: CustomerOrdersResponse = response.data;
      if (result.success) {
        return result.data;
      } else {
        throw new Error('Failed to fetch customer orders');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب طلبات العميل' : 'Error Fetching Customer Orders',
        message: isRTL ? 'فشل في جلب طلبات العميل' : 'Failed to fetch customer orders'
      });
      setError(errorMsg.message);
      console.error('Error fetching customer orders:', err);
      return [];
    }
  };

  const fetchGuestOrders = async (
    guestId: string,
    storeId: string,
    page = 1,
    limit = 10
  ): Promise<Order[] | void> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        storeId: storeId
      });
      
      const url = `${BASE_URL}orders/guest/${guestId}?${params}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const result: GuestOrdersResponse = response.data;
      if (result.success) {
        return result.data.orders;
      } else {
        throw new Error('Failed to fetch guest orders');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب طلبات الضيف' : 'Error Fetching Guest Orders',
        message: isRTL ? 'فشل في جلب طلبات الضيف' : 'Failed to fetch guest orders'
      });
      setError(errorMsg.message);
      console.error('Error fetching guest orders:', err);
      return [];
    }
  };

  return {
    customers,
    setCustomers,
    loading,
    error,
    statistics,
    pagination,
    fetchCustomers,
    deleteCustomer,
    updateCustomer,
    createCustomer,
    fetchCustomerOrders,
    fetchGuestOrders,
  };
}; 