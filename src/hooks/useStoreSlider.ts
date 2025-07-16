import { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../constants/api';
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

  // Get Store ID from localStorage
  const getStoreId = useCallback(() => {
    return localStorage.getItem('storeId') || '687505893fbf3098648bfe16';
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
        throw new Error(data.message || 'Failed to fetch store sliders');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching store sliders:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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
        throw new Error(data.message || 'Failed to fetch store slider');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching store slider:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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
        return responseData.data || responseData;
      } else {
        throw new Error(responseData.message || 'Failed to create store slider');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error creating store slider:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders]);

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
        return responseData.data || responseData;
      } else {
        throw new Error(responseData.message || 'Failed to update store slider');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error updating store slider:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders]);

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
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete store slider');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error deleting store slider:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders]);

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
        return data.data || data;
      } else {
        throw new Error(data.message || 'Failed to toggle active status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error toggling active status:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAllStoreSliders]);

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