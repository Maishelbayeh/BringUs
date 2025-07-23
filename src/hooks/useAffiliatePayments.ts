import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../constants/api';

export interface PaymentData {
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  notes: string;
  bankTransfer?: {
    bankName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    beneficiaryName: string;
  };
  paypal?: {
    paypalEmail: string;
    paypalTransactionId: string;
  };
}

export interface Payment {
  _id: string;
  store: string;
  affiliate: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  description: string;
  notes: string;
  bankTransfer?: {
    bankName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    beneficiaryName: string;
  };
  paypal?: {
    paypalEmail: string;
    paypalTransactionId: string;
  };
  paymentStatus: string;
  processedBy: string;
  previousBalance: number;
  newBalance: number;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export default function useAffiliatePayments(affiliateId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      // Get storeId from localStorage
      const storeId = localStorage.getItem('storeId');
      const response = await axios.get(`${BASE_URL}affiliations/${id}/payments`, {
        params: {
          storeId: storeId
        }
      });
      setPayments(response.data.data || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'خطأ في جلب بيانات المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (data: PaymentData) => {
    if (!affiliateId) {
      throw new Error('Affiliate ID is required');
    }

    setLoading(true);
    setError(null);
    try {
      // Get storeId from localStorage
      const storeId = localStorage.getItem('storeId');
      
      // Add store ID to the payment data
      const paymentDataWithStore = {
        ...data,
        store: storeId
      };
      
      const response = await axios.post(`${BASE_URL}affiliations/${affiliateId}/payments`, paymentDataWithStore);
      await fetchPayments(affiliateId); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في إنشاء الدفع';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePayment = async (paymentId: string, data: Partial<PaymentData>) => {
    if (!affiliateId) {
      throw new Error('Affiliate ID is required');
    }

    setLoading(true);
    setError(null);
    try {
      // Get storeId from localStorage
      const storeId = localStorage.getItem('storeId');
      
      // Add store ID to the payment data
      const paymentDataWithStore = {
        ...data,
        store: storeId
      };
      
      const response = await axios.put(`${BASE_URL}affiliations/${affiliateId}/payments/${paymentId}`, paymentDataWithStore);
      await fetchPayments(affiliateId); // Refresh the list
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في تحديث الدفع';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async (paymentId: string) => {
    if (!affiliateId) {
      throw new Error('Affiliate ID is required');
    }

    setLoading(true);
    setError(null);
    try {
      // Get storeId from localStorage
      const storeId = localStorage.getItem('storeId');
      
      await axios.delete(`${BASE_URL}affiliations/${affiliateId}/payments/${paymentId}`, {
        params: {
          storeId: storeId
        }
      });
      await fetchPayments(affiliateId); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'خطأ في حذف الدفع';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (affiliateId) {
      fetchPayments(affiliateId);
    }
  }, [affiliateId]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment
  };
} 