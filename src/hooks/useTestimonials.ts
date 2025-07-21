import { useState, useCallback } from 'react';
import { BASE_URL } from '@/constants/api';

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

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }

      const data = await response.json();
      setTestimonials(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch testimonials');
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create testimonial');
      }
        console.log(response);
      const data = await response.json();
      setTestimonials(prev => [...prev, data.data]);
      return data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create testimonial');
      console.error('Error creating testimonial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update testimonial');
      }

      const data = await response.json();
      setTestimonials(prev => 
        prev.map(item => item._id === id ? data.data : item)
      );
      return data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update testimonial');
      console.error('Error updating testimonial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete testimonial');
      }

      setTestimonials(prev => prev.filter(item => item._id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete testimonial');
      console.error('Error deleting testimonial:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      return data.data.url;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      throw err;
    }
  }, []);

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