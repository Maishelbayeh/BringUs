import { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../constants/api';
import useLanguage from './useLanguage';
import { useToastContext } from '../contexts/ToastContext';
// Types
export interface StoreSlider {
  _id: string;
  title: string;
  description?: string;
  type: 'slider' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  youtubeId?: string;
  order: number;
  isActive: boolean;
  store: string;
  views: number;
  clicks: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreSliderData {
  title: string;
  description?: string;
  type: 'slider' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateStoreSliderData extends Partial<CreateStoreSliderData> {}



export const useStoreSlider = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeSliders, setStoreSliders] = useState<StoreSlider[]>([]);
  const [activeSliders, setActiveSliders] = useState<StoreSlider[]>([]);
  const [activeVideos, setActiveVideos] = useState<StoreSlider[]>([]);
  const { isRTL } = useLanguage();
  const { showSuccess, showError } = useToastContext();

  // Get Store ID from localStorage
  const getStoreId = useCallback(() => {
    const storeId = localStorage.getItem('storeId');
    return storeId || '';
  }, []);

  // Get all store sliders
  const getAllStoreSliders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}store-sliders?storeId=${getStoreId()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStoreSliders(data.data || data);
        return data.data || data;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في جلب قائمة السلايدر')
          : (data?.message || data?.message_en || 'Failed to fetch store sliders');
        const errorTitle = isRTL ? 'خطأ في جلب السلايدر' : 'Error Fetching Sliders';
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        return null;
      }
    } catch (err: any) {
      console.error('Network error fetching store sliders:', err);
      const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
      const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isRTL, showError, getStoreId]);

//---------------------------------------------------get store slider by id-----------------------------------------------------------
  const getStoreSliderById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}store-sliders/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return data.data || data;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في جلب بيانات السلايدر')
          : (data?.message || data?.message_en || 'Failed to fetch store slider');
        const errorTitle = isRTL ? 'خطأ في جلب السلايدر' : 'Error Fetching Slider';
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        return null;
      }
    } catch (err: any) {
      console.error('Network error fetching store slider:', err);
      const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
      const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isRTL, showError]);

//---------------------------------------------------get active sliders by type-----------------------------------------------------------
  const getActiveByType = useCallback(async (type: 'slider' | 'video') => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}store-sliders/active/${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        if (type === 'slider') {
          setActiveSliders(data.data || data);
        } else {
          setActiveVideos(data.data || data);
        }
        return data.data || data;
      } else {
        throw new Error(data.message || `Failed to fetch active ${type}s`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error(`Error fetching active ${type}s:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  //---------------------------------------------------create store slider-----------------------------------------------------------
  const createStoreSlider = useCallback(async (data: CreateStoreSliderData) => {
    console.log('createStoreSlider called with data:', data);
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const storeId = getStoreId();
      
      console.log('Token:', token);
      console.log('Store ID:', storeId);
      
      // Prepare the request body
      const sliderData = {
        ...data
      };
      
      console.log('Final slider data to send:', sliderData);
      console.log('API URL:', `${BASE_URL}store-sliders`);
      
      const response = await fetch(`${BASE_URL}store-sliders?storeId=${storeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sliderData)
      });
     
      const responseData = await response.json();

      if (response.ok) {
        // Refresh the list
        await getAllStoreSliders();
        
        // Show success message from backend
        const successMessage = isRTL 
          ? (responseData?.messageAr || responseData?.message_ar || 'تم إنشاء السلايدر بنجاح')
          : (responseData?.message || responseData?.message_en || 'Store slider created successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return responseData.data || responseData;
      } else {
        // Handle error response
        const errorMessage = isRTL 
          ? (responseData?.messageAr || responseData?.message_ar || 'فشل في إنشاء سلايدر المتجر')
          : (responseData?.message || responseData?.message_en || 'Failed to create store slider');
        const errorTitle = isRTL 
          ? (responseData?.errorAr || responseData?.error_ar || 'خطأ في إنشاء السلايدر')
          : (responseData?.error || responseData?.error_en || 'Error Creating Slider');
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        console.error('Error creating store slider:', responseData);
        return null;
      }
    } catch (err: any) {
      console.error('Network error creating store slider:', err);
      const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
      const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders, isRTL, showSuccess, showError, getStoreId]);

  //---------------------------------------------------update store slider-----------------------------------------------------------
  const updateStoreSlider = useCallback(async (id: string, data: UpdateStoreSliderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const storeId = getStoreId();
      
      // Prepare the request body
      const sliderData = {
        ...data
      };
      
      const response = await fetch(`${BASE_URL}store-sliders/${id}?storeId=${storeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sliderData)
      });

      const responseData = await response.json();

      if (response.ok) {
        // Refresh the list
        await getAllStoreSliders();
        
        // Show success message from backend
        const successMessage = isRTL 
          ? (responseData?.messageAr || responseData?.message_ar || 'تم تحديث السلايدر بنجاح')
          : (responseData?.message || responseData?.message_en || 'Store slider updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return responseData.data || responseData;
      } else {
        // Handle error response
        const errorMessage = isRTL 
          ? (responseData?.messageAr || responseData?.message_ar || 'فشل في تحديث سلايدر المتجر')
          : (responseData?.message || responseData?.message_en || 'Failed to update store slider');
        const errorTitle = isRTL 
          ? (responseData?.errorAr || responseData?.error_ar || 'خطأ في تحديث السلايدر')
          : (responseData?.error || responseData?.error_en || 'Error Updating Slider');
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        console.error('Error updating store slider:', responseData);
        return null;
      }
    } catch (err: any) {
      console.error('Network error updating store slider:', err);
      const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
      const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders, isRTL, showSuccess, showError, getStoreId]);

//---------------------------------------------------delete store slider-----------------------------------------------------------
  const deleteStoreSlider = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}store-sliders/${id}?storeId=${getStoreId()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the list
        await getAllStoreSliders();
        
        // Show success message from backend
        const successMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'تم حذف السلايدر بنجاح')
          : (data?.message || data?.message_en || 'Store slider deleted successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return true;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في حذف سلايدر المتجر')
          : (data?.message || data?.message_en || 'Failed to delete store slider');
        const errorTitle = isRTL 
          ? (data?.errorAr || data?.error_ar || 'خطأ في حذف السلايدر')
          : (data?.error || data?.error_en || 'Error Deleting Slider');
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        return false;
      }
    } catch (err: any) {
      console.error('Network error deleting store slider:', err);
      const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
      const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders, isRTL, showSuccess, showError, getStoreId]);

//---------------------------------------------------toggle active status-----------------------------------------------------------
  const toggleActiveStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}store-sliders/${id}/toggle-active?storeId=${getStoreId()}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the list
        await getAllStoreSliders();
        
        // Show success message from backend
        const successMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'تم تغيير حالة السلايدر بنجاح')
          : (data?.message || data?.message_en || 'Slider status updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return data.data || data;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في تغيير حالة السلايدر')
          : (data?.message || data?.message_en || 'Failed to toggle active status');
        const errorTitle = isRTL 
          ? (data?.errorAr || data?.error_ar || 'خطأ في تغيير الحالة')
          : (data?.error || data?.error_en || 'Error Toggling Status');
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        return null;
      }
    } catch (err: any) {
      console.error('Network error toggling active status:', err);
      const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
      const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      setError(errorMessage);
      showError(errorMessage, errorTitle);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders, isRTL, showSuccess, showError]);

//---------------------------------------------------increment views-----------------------------------------------------------
  const incrementViews = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}store-sliders/${id}/increment-views`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return data.data || data;
      } else {
        throw new Error(data.message || 'Failed to increment views');
      }
    } catch (err) {
      console.error('Error incrementing views:', err);
      return null;
    }
  }, []);

//---------------------------------------------------increment clicks-----------------------------------------------------------
  const incrementClicks = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${BASE_URL}store-sliders/${id}/increment-clicks`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        return data.data || data;
      } else {
        throw new Error(data.message || 'Failed to increment clicks');
      }
    } catch (err) {
      console.error('Error incrementing clicks:', err);
      return null;
    }
  }, []);

//---------------------------------------------------load initial data-----------------------------------------------------------
  useEffect(() => {
    getAllStoreSliders();
  }, [getAllStoreSliders]);

  return {
    // State
    loading,
    error,
    storeSliders,
    activeSliders,
    activeVideos,
    
    // Actions
    getAllStoreSliders,
    getStoreSliderById,
    getActiveByType,
    createStoreSlider,
    updateStoreSlider,
    deleteStoreSlider,
    toggleActiveStatus,
    incrementViews,
    incrementClicks,
    
    // Utilities
    getStoreId
  };
}; 