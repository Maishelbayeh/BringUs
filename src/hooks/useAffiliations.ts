import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';
import { getStoreId } from '@/utils/storeUtils';
import useLanguage from './useLanguage';
import { useToastContext } from '../contexts/ToastContext';

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
  const { showError, showSuccess } = useToastContext();

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
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في جلب بيانات المسوقين')
        : (errorData?.message || errorData?.message_en || 'Failed to fetch affiliates data');
      const errorTitle = isRTL ? 'خطأ في جلب المسوقين' : 'Error Fetching Affiliates';
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
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
      
      // Show success message
      const successMessage = isRTL 
        ? (response.data?.messageAr || response.data?.message_ar || 'تم إنشاء المسوق بنجاح')
        : (response.data?.message || response.data?.message_en || 'Affiliate created successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      await fetchAffiliates(); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في إنشاء المسوق')
        : (errorData?.message || errorData?.message_en || 'Failed to create affiliate');
      const errorTitle = isRTL ? 'خطأ في إنشاء المسوق' : 'Error Creating Affiliate';
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      throw new Error(errorMessage);
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
      
      // Show success message
      const successMessage = isRTL 
        ? (response.data?.messageAr || response.data?.message_ar || 'تم تحديث المسوق بنجاح')
        : (response.data?.message || response.data?.message_en || 'Affiliate updated successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      await fetchAffiliates(); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في تحديث المسوق')
        : (errorData?.message || errorData?.message_en || 'Failed to update affiliate');
      const errorTitle = isRTL ? 'خطأ في تحديث المسوق' : 'Error Updating Affiliate';
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAffiliate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${BASE_URL}affiliations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Show success message
      const successMessage = isRTL 
        ? (response.data?.messageAr || response.data?.message_ar || 'تم حذف المسوق بنجاح')
        : (response.data?.message || response.data?.message_en || 'Affiliate deleted successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      await fetchAffiliates(); // Refresh the list
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في حذف المسوق')
        : (errorData?.message || errorData?.message_en || 'Failed to delete affiliate');
      const errorTitle = isRTL ? 'خطأ في حذف المسوق' : 'Error Deleting Affiliate';
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      throw new Error(errorMessage);
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
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في جلب بيانات المسوق')
        : (errorData?.message || errorData?.message_en || 'Failed to fetch affiliate data');
      const errorTitle = isRTL ? 'خطأ في جلب بيانات المسوق' : 'Error Fetching Affiliate';
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      throw new Error(errorMessage);
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
      
      // Show success message
      const successMessage = isRTL 
        ? (response.data?.messageAr || response.data?.message_ar || 'تم تحديث بيانات المسوق بنجاح')
        : (response.data?.message || response.data?.message_en || 'Affiliate data updated successfully');
      const successTitle = isRTL ? 'نجاح' : 'Success';
      showSuccess(successMessage, successTitle);
      
      // Update the specific affiliate in the local state
      setAffiliates(prev => prev.map(affiliate => 
        (affiliate._id === id || affiliate.id === id) 
          ? { ...affiliate, ...response.data.data || response.data }
          : affiliate
      ));
      
      return response.data;
    } catch (err: any) {
      const errorData = err?.response?.data;
      const errorMessage = isRTL 
        ? (errorData?.messageAr || errorData?.message_ar || 'فشل في تحديث بيانات المسوق')
        : (errorData?.message || errorData?.message_en || 'Failed to update affiliate data');
      const errorTitle = isRTL ? 'خطأ في تحديث بيانات المسوق' : 'Error Updating Affiliate Data';
      
      setError(errorMessage);
      showError(errorMessage, errorTitle);
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