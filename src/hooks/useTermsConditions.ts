import { useState, useCallback } from 'react';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

interface TermsConditions {
  _id: string;
  title: string;
  htmlContent: string;
  language: 'en' | 'ar' | 'fr' | 'es';
  category: 'general' | 'privacy' | 'shipping' | 'returns' | 'payment' | 'custom';
  isActive: boolean;
  lastUpdated: string;
  updatedBy?: string;
  store: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTermsData {
  title: string;
  htmlContent: string;
  language?: 'en' | 'ar' | 'fr' | 'es';
  category?: 'general' | 'privacy' | 'shipping' | 'returns' | 'payment' | 'custom';
}

interface UpdateTermsData extends Partial<CreateTermsData> {}

const API_BASE_URL = `${BASE_URL}terms-conditions`;

export const useTermsConditions = (storeId: string) => {
  const [terms, setTerms] = useState<TermsConditions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToastContext();
  const { isRTL } = useLanguage();

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Generic API call function
  const apiCall = useCallback(async (
    endpoint: string, 
    options: RequestInit = {}
  ) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }, []);

  // Get terms by store
  const getTermsByStore = useCallback(async (showToast = false) => {
    // Validate store ID before making API call
    if (!storeId || !storeId.trim()) {
      const errorMessage = 'Store ID is not available';
      setError(errorMessage);
      if (showToast) {
        showError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/stores/${storeId}/terms`);
      setTerms(response.data);
      if (showToast) {
        showSuccess('Terms & conditions loaded successfully');
      }
      return response.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحميل الشروط والأحكام' : 'Error Loading Terms',
        message: isRTL ? 'فشل في تحميل الشروط والأحكام' : 'Failed to load terms & conditions'
      });
      setError(errorMsg.message);
      if (showToast) {
        showError(errorMsg.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeId, apiCall, showSuccess, showError]);

  // Create new terms
  const createTerms = useCallback(async (termsData: CreateTermsData, showToast = true) => {
    // Validate store ID before making API call
    if (!storeId || !storeId.trim()) {
      const errorMessage = 'Store ID is not available';
      setError(errorMessage);
      if (showToast) {
        showError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/stores/${storeId}/terms`, {
        method: 'POST',
        body: JSON.stringify(termsData),
      });
      
      setTerms(response.data);
      if (showToast) {
        showSuccess('Terms & conditions created successfully');
      }
      return response.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إنشاء الشروط والأحكام' : 'Error Creating Terms',
        message: isRTL ? 'فشل في إنشاء الشروط والأحكام' : 'Failed to create terms & conditions'
      });
      setError(errorMsg.message);
      if (showToast) {
        showError(errorMsg.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeId, apiCall, showSuccess, showError]);

  // Update terms
  const updateTerms = useCallback(async (termsId: string, termsData: UpdateTermsData, showToast = true) => {
    // Validate store ID before making API call
    if (!storeId || !storeId.trim()) {
      const errorMessage = 'Store ID is not available';
      setError(errorMessage);
      if (showToast) {
        showError(errorMessage);
      }
      throw new Error(errorMessage);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/stores/${storeId}/terms/${termsId}`, {
        method: 'PUT',
        body: JSON.stringify(termsData),
      });
      
      setTerms(response.data);
      if (showToast) {
        showSuccess('Terms & conditions updated successfully');
      }
      return response.data;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث الشروط والأحكام' : 'Error Updating Terms',
        message: isRTL ? 'فشل في تحديث الشروط والأحكام' : 'Failed to update terms & conditions'
      });
      setError(errorMsg.message);
      if (showToast) {
        showError(errorMsg.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeId, apiCall, showSuccess, showError]);

  return {
    // State
    terms,
    loading,
    error,
    
    // Actions
    getTermsByStore,
    createTerms,
    updateTerms,
    
    // Utility
    clearError: () => setError(null),
  };
}; 