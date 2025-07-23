import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '@/utils/storeUtils';

export interface Affiliate {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  mobile: string;
  address: string;
  affiliateLink?: string;
  affiliateCode?: string;
  percent: number;
  status: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
  };
  settings: {
    notifications?: {
      email: boolean;
      sms: boolean;
    };
    autoPayment: boolean;
    paymentThreshold: number;
    paymentMethod: string;
  };
  notes: string;
  totalSales?: number;
  totalCommission?: number;
  totalPaid?: number;
  balance?: number;
  totalOrders?: number;
  totalCustomers?: number;
  conversionRate?: number;
  isVerified?: boolean;
  lastActivity?: string;
  registrationDate?: string;
  fullName?: string;
  remainingBalance?: number;
  commissionRate?: string;
  performanceScore?: number;
  _id?: string;
  id?: string;
}

export interface CreateAffiliateData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
  address: string;
  affiliateLink?: string;
  percent: number;
  status: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
  };
  settings: {
    autoPayment: boolean;
    paymentThreshold: number;
    paymentMethod: string;
  };
  notes: string;
}

export interface UpdateAffiliateData extends Partial<CreateAffiliateData> {
  _id: string;
}

export default function usAffiliations() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

//------------------------------------------------fetchAffiliates------------------------------------------
  const fetchAffiliates = async () => {
    setLoading(true);
    setError(null);
    try {   
      const response = await axios.get(`${BASE_URL}affiliations/store/${getStoreId()}`);
      setAffiliates(response.data.data || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'خطأ في جلب بيانات المسوقين');
    } finally {
      setLoading(false);
    }
  };
  
//--------------------------------------createAffiliate----------------------------------------------------

  const createAffiliate = async (data: CreateAffiliateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}affiliations`, data);
      await fetchAffiliates(); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في إنشاء المسوق';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAffiliate = async (data: UpdateAffiliateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BASE_URL}affiliations/${data._id}`, data);
      await fetchAffiliates(); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في تحديث المسوق';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAffiliate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${BASE_URL}affiliations/${id}`);
      await fetchAffiliates(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في حذف المسوق';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getAffiliateById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}affiliations/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في جلب بيانات المسوق';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAffiliateData = async (id: string, updatedData: Partial<Affiliate>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BASE_URL}affiliations/${id}`, updatedData);
      
      // Update the specific affiliate in the local state
      setAffiliates(prev => prev.map(affiliate => 
        (affiliate._id === id || affiliate.id === id) 
          ? { ...affiliate, ...response.data.data || response.data }
          : affiliate
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في تحديث بيانات المسوق';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates();
  }, []);

  return {
    affiliates,
    loading,
    error,
    fetchAffiliates,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
    getAffiliateById,
    updateAffiliateData
  };
} 