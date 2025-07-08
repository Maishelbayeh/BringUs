import { useState, useCallback } from 'react';
import { useToastContext } from '../contexts/ToastContext';
import { BASE_URL } from '../constants/api';

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
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/stores/${storeId}/terms`);
      setTerms(response.data);
      if (showToast) {
        showSuccess('Terms & conditions loaded successfully');
      }
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load terms & conditions';
      setError(errorMessage);
      if (showToast) {
        showError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeId, apiCall, showSuccess, showError]);

  // Create new terms
  const createTerms = useCallback(async (termsData: CreateTermsData, showToast = true) => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create terms & conditions';
      setError(errorMessage);
      if (showToast) {
        showError(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeId, apiCall, showSuccess, showError]);

  // Update terms
  const updateTerms = useCallback(async (termsId: string, termsData: UpdateTermsData, showToast = true) => {
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update terms & conditions';
      setError(errorMessage);
      if (showToast) {
        showError(errorMessage);
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