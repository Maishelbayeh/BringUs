import { useState, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { handleApiError } from '../utils/handleApiError';

export interface RawCustomer {
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
  role: string;
  status: 'active' | 'inactive' | 'banned';
  phone: string;
  avatar?: {
    url: string;
  };
  addressSummary?: string;
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
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export const useCustomers = (): UseCustomersReturn => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<CustomersResponse['statistics'] | null>(null);
  const [pagination, setPagination] = useState<CustomersResponse['pagination'] | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchCustomers = useCallback(async (
    storeId: string,
    forceRefresh: boolean = false,
    page = 1,
    limit = 10,
    search = ''
  ) => {
    if (hasLoaded && !forceRefresh && customers.length > 0) {
      return customers;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });
      const url = `${BASE_URL}stores/${storeId}/customers?${params}`;
      const res = await axios.get(url);
      const result: CustomersResponse = res.data;
      if (result.success) {
        // فلترة الحقول: لا تعرض email أو password، وأضف addressSummary، وفلتر role === 'client'
        const filtered: Customer[] = (result.data as RawCustomer[])
          .filter(c => c.role === 'client')
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
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      //CONSOLE.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, customers]);

  const deleteCustomer = async (storeId: string, id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`${BASE_URL}stores/${storeId}/customers/${id}`);
      const result = response.data;
      if (result.success) {
        setCustomers(prev => prev.filter(customer => customer._id !== id));
        return true;
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      //CONSOLE.error('Error deleting customer:', err);
      return false;
    }
  };

  const updateCustomer = async (storeId: string, id: string, data: Partial<Customer>): Promise<boolean> => {
    try {
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
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
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
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      //CONSOLE.error('Error creating customer:', err);
      return false;
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
  };
}; 