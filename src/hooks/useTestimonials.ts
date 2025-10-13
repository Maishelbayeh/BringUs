import { useState, useCallback } from 'react';
import { BASE_URL } from '@/constants/api';
import { useToastContext } from '@/contexts/ToastContext';
import useLanguage from './useLanguage';

export interface Testimonial {
  _id: string;
  platform: string;
  image: string;
  personName: string;
  personTitle: string;
  comment: string;
  active: boolean;
  store: string;
}

export const useTestimonials = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const { showSuccess, showError } = useToastContext();
  const { isRTL } = useLanguage();

  const getToken = () => localStorage.getItem('token');
  const getStoreId = () => localStorage.getItem('storeId');

  // Get all testimonials
  const getAllTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const storeId = getStoreId();
      const response = await fetch(`${BASE_URL}social-comments/by-store/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTestimonials(data.data || []);
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في جلب قائمة التقييمات')
          : (data?.message || data?.message_en || 'Failed to fetch testimonials');
        const errorTitle = isRTL ? 'خطأ في جلب التقييمات' : 'Error Fetching Testimonials';
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
      }
    } catch (err: any) {
      console.error('Network error fetching testimonials:', err);
      const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
      const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
      setError(errorMessage);
      showError(errorMessage, errorTitle);
    } finally {
      setLoading(false);
    }
  }, [isRTL, showError]);

  // Create new testimonial
  const createTestimonial = useCallback(async (testimonialData: Omit<Testimonial, '_id' | 'store'>) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const storeId = localStorage.getItem('storeId');
      console.log(storeId);
      const response = await fetch(`${BASE_URL}social-comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testimonialData,
          store: storeId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(response);
        setTestimonials(prev => [...prev, data.data]);
        
        // Show success message
        const successMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'تم إنشاء التقييم بنجاح')
          : (data?.message || data?.message_en || 'Testimonial created successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return data.data;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في إنشاء التقييم')
          : (data?.message || data?.message_en || 'Failed to create testimonial');
        const errorTitle = isRTL 
          ? (data?.errorAr || data?.error_ar || 'خطأ في الإنشاء')
          : (data?.error || data?.error_en || 'Error Creating');
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      if (!err.message?.includes('Failed to create testimonial') && !err.message?.includes('فشل في إنشاء التقييم')) {
        console.error('Network error creating testimonial:', err);
        const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
        const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
        setError(errorMessage);
        showError(errorMessage, errorTitle);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isRTL, showSuccess, showError]);

  // Update testimonial
  const updateTestimonial = useCallback(async (id: string, testimonialData: Partial<Testimonial>) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}social-comments/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData),
      });

      const data = await response.json();

      if (response.ok) {
        setTestimonials(prev => 
          prev.map(item => item._id === id ? data.data : item)
        );
        
        // Show success message
        const successMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'تم تحديث التقييم بنجاح')
          : (data?.message || data?.message_en || 'Testimonial updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return data.data;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في تحديث التقييم')
          : (data?.message || data?.message_en || 'Failed to update testimonial');
        const errorTitle = isRTL 
          ? (data?.errorAr || data?.error_ar || 'خطأ في التحديث')
          : (data?.error || data?.error_en || 'Error Updating');
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      if (!err.message?.includes('Failed to update testimonial') && !err.message?.includes('فشل في تحديث التقييم')) {
        console.error('Network error updating testimonial:', err);
        const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
        const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
        setError(errorMessage);
        showError(errorMessage, errorTitle);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isRTL, showSuccess, showError]);

  // Delete testimonial
  const deleteTestimonial = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${BASE_URL}social-comments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTestimonials(prev => prev.filter(item => item._id !== id));
        
        // Show success message
        const successMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'تم حذف التقييم بنجاح')
          : (data?.message || data?.message_en || 'Testimonial deleted successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        showSuccess(successMessage, successTitle);
        
        return true;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في حذف التقييم')
          : (data?.message || data?.message_en || 'Failed to delete testimonial');
        const errorTitle = isRTL 
          ? (data?.errorAr || data?.error_ar || 'خطأ في الحذف')
          : (data?.error || data?.error_en || 'Error Deleting');
        
        setError(errorMessage);
        showError(errorMessage, errorTitle);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      if (!err.message?.includes('Failed to delete testimonial') && !err.message?.includes('فشل في حذف التقييم')) {
        console.error('Network error deleting testimonial:', err);
        const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
        const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
        setError(errorMessage);
        showError(errorMessage, errorTitle);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isRTL, showSuccess, showError]);

  // Upload image
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${BASE_URL}social-comments/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return data.data.url;
      } else {
        const errorMessage = isRTL 
          ? (data?.messageAr || data?.message_ar || 'فشل في رفع الصورة')
          : (data?.message || data?.message_en || 'Failed to upload image');
        const errorTitle = isRTL ? 'خطأ في رفع الصورة' : 'Error Uploading Image';
        
        showError(errorMessage, errorTitle);
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      if (!err.message?.includes('Failed to upload image') && !err.message?.includes('فشل في رفع الصورة')) {
        console.error('Network error uploading image:', err);
        const errorMessage = isRTL ? 'فشل في الاتصال بالخادم' : 'Failed to connect to server';
        const errorTitle = isRTL ? 'خطأ في الشبكة' : 'Network Error';
        showError(errorMessage, errorTitle);
      }
      throw err;
    }
  }, [isRTL, showError]);

  return {
    loading,
    error,
    testimonials,
    getAllTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    uploadImage,
  };
}; 