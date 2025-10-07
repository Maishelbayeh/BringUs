import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '@/utils/storeUtils';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

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
const token = localStorage.getItem('token');
export default function usAffiliations() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isRTL } = useLanguage();

//------------------------------------------------fetchAffiliates------------------------------------------
  const fetchAffiliates = async () => {
    setLoading(true);
    setError(null);
    try {   
      const response = await axios.get(`${BASE_URL}affiliations/store/${getStoreId()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAffiliates(response.data.data || response.data);
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب المسوقين' : 'Error Fetching Affiliates',
        message: isRTL ? 'فشل في جلب بيانات المسوقين' : 'Failed to fetch affiliates data'
      });
      setError(errorMsg.message);
    } finally {
      setLoading(false);
    }
  };
  
//--------------------------------------createAffiliate----------------------------------------------------

  const createAffiliate = async (data: CreateAffiliateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}affiliations`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchAffiliates(); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إنشاء المسوق' : 'Error Creating Affiliate',
        message: isRTL ? 'فشل في إنشاء المسوق' : 'Failed to create affiliate'
      });
      setError(errorMsg.message);
      throw new Error(errorMsg.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAffiliate = async (data: UpdateAffiliateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BASE_URL}affiliations/${data._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchAffiliates(); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث المسوق' : 'Error Updating Affiliate',
        message: isRTL ? 'فشل في تحديث المسوق' : 'Failed to update affiliate'
      });
      setError(errorMsg.message);
      throw new Error(errorMsg.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAffiliate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${BASE_URL}affiliations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      await fetchAffiliates(); // Refresh the list
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حذف المسوق' : 'Error Deleting Affiliate',
        message: isRTL ? 'فشل في حذف المسوق' : 'Failed to delete affiliate'
      });
      setError(errorMsg.message);
      throw new Error(errorMsg.message);
    } finally {
      setLoading(false);
    }
  };

  const getAffiliateById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}affiliations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب بيانات المسوق' : 'Error Fetching Affiliate',
        message: isRTL ? 'فشل في جلب بيانات المسوق' : 'Failed to fetch affiliate data'
      });
      setError(errorMsg.message);
      throw new Error(errorMsg.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAffiliateData = async (id: string, updatedData: Partial<Affiliate>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BASE_URL}affiliations/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the specific affiliate in the local state
      setAffiliates(prev => prev.map(affiliate => 
        (affiliate._id === id || affiliate.id === id) 
          ? { ...affiliate, ...response.data.data || response.data }
          : affiliate
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث بيانات المسوق' : 'Error Updating Affiliate Data',
        message: isRTL ? 'فشل في تحديث بيانات المسوق' : 'Failed to update affiliate data'
      });
      setError(errorMsg.message);
      throw new Error(errorMsg.message);
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