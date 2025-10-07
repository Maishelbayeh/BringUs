import { useState, useCallback } from 'react';
import { POS_API_ENDPOINTS, getPOSApiHeaders } from '../constants/posApi';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

export interface POSCart {
  _id: string;
  sessionId: string;
  cartName: string;
  cartNameAr: string;
  admin: string;
  store: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  items: POSCartItem[];
  subtotal: number;
  tax?: {
    amount: number;
    rate: number;
  };
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    reason?: string;
  };
  total: number;
  payment?: {
    method: string;
    amount: number;
    change: number;
    notes?: string;
  };
  notes?: {
    admin?: string;
    customer?: string;
  };
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface POSCartItem {
  _id: string;
  product: {
    _id: string;
    nameEn: string;
    nameAr: string;
    price: number;
    images: string[];
    mainImage: string;
    stock: number;
    availableQuantity: number;
  };
  quantity: number;
  variant?: any;
  priceAtAdd: number;
  selectedSpecifications: any[];
  selectedColors: any[];
}

export interface UsePOSResult {
  // Cart management
  carts: POSCart[];
  currentCart: POSCart | null;
  isLoading: boolean;
  error: string | null;
  
  // Cart operations
  createCart: (storeId: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  getCart: (cartId: string, forceRefresh?: boolean) => Promise<{ success: boolean; data?: POSCart; message?: string }>;
  getAllCarts: (storeId: string, status?: string) => Promise<{ success: boolean; data?: POSCart[]; message?: string }>;
  
  // Item operations
  addToCart: (cartId: string, product: any, quantity: number, variant?: any, selectedSpecifications?: any[], selectedColors?: any[]) => Promise<{ success: boolean; data?: POSCart; message?: string }>;
  updateCartItem: (cartId: string, itemId: string, quantity: number) => Promise<{ success: boolean; data?: POSCart; message?: string }>;
  removeFromCart: (cartId: string, itemId: string) => Promise<{ success: boolean; data?: POSCart; message?: string }>;
  
  // Cart management
  updateCustomer: (cartId: string, customer: any) => Promise<{ success: boolean; data?: POSCart; message?: string }>;
  applyDiscount: (cartId: string, type: 'percentage' | 'fixed', value: number, reason?: string) => Promise<{ success: boolean; data?: POSCart; message?: string }>;
  clearCart: (cartId: string) => Promise<{ success: boolean; data?: POSCart; message?: string }>;
  deleteCart: (cartId: string) => Promise<{ success: boolean; message?: string }>;
  
  // Order completion
  completeCart: (cartId: string, notes?: string) => Promise<{ success: boolean; data?: any; message?: string }>;
  
  // State management
  setCurrentCart: (cart: POSCart | null) => void;
  setCarts: (carts: POSCart[]) => void;
}

export function usePOS(): UsePOSResult {
  const [carts, setCarts] = useState<POSCart[]>([]);
  const [currentCart, setCurrentCart] = useState<POSCart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isRTL } = useLanguage();
  const [hasLoadedCarts, setHasLoadedCarts] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Use the centralized headers function
  const getAuthHeaders = getPOSApiHeaders;

  // Helper function to handle API responses
  const handleResponse = async (response: Response) => {
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }
    
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  };

  // Create new POS cart
  const createCart = useCallback(async (storeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.CREATE_CART(storeId), {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      // Refresh carts list
      await getAllCarts(storeId);
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إنشاء السلة' : 'Error Creating Cart',
        message: isRTL ? 'فشل في إنشاء سلة جديدة' : 'Failed to create new cart'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get specific POS cart
  const getCart = useCallback(async (cartId: string, forceRefresh: boolean = false) => {
    // Avoid duplicate calls for the same cart unless forceRefresh is true
    if (!forceRefresh && currentCart && currentCart._id === cartId) {
      console.log('Cart already loaded, skipping duplicate call');
      return { success: true, data: currentCart };
    }
    
    // Clear current cart immediately to prevent data leakage (only if switching carts)
    if (currentCart && currentCart._id !== cartId) {
      console.log('Clearing current cart before loading new one');
      setCurrentCart(null);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.GET_CART(cartId), {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure all required fields exist
        const cartData = {
          ...result.data,
          items: result.data.items || [],
          total: result.data.total || 0,
          subtotal: result.data.subtotal || 0,
          status: result.data.status || 'active'
        };
        console.log('Setting current cart:', cartData);
        setCurrentCart(cartData);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب السلة' : 'Error Getting Cart',
        message: isRTL ? 'فشل في جلب السلة' : 'Failed to get cart'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentCart]);

  // Get all POS carts
  const getAllCarts = useCallback(async (storeId: string, status: string = 'active', forceRefresh: boolean = false) => {
    // Check if data is already loaded and not forcing refresh
    const now = Date.now();
    if (hasLoadedCarts && !forceRefresh && (now - lastFetchTime) < 500) { // 10 seconds cache
      console.log('Carts already loaded recently, skipping API call');
      return { success: true, data: carts };
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.GET_ALL_CARTS(storeId, status), {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure items array exists for each cart
        const cartsData = result.data.map((cart: any) => ({
          ...cart,
          items: cart.items || []
        }));
        setCarts(cartsData);
        setHasLoadedCarts(true);
        setLastFetchTime(now);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب السلات' : 'Error Getting Carts',
        message: isRTL ? 'فشل في جلب قائمة السلات' : 'Failed to get carts list'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, [hasLoadedCarts, lastFetchTime, carts]);

  // Add item to POS cart
  const addToCart = useCallback(async (cartId: string, product: any, quantity: number, variant?: any, selectedSpecifications?: any[], selectedColors?: any[]) => {
    // Ensure we're working with the correct cart
    if (currentCart && currentCart._id !== cartId) {
      console.warn('Adding to different cart than current, clearing current cart first');
      setCurrentCart(null);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate the correct price at the time of adding to cart
      // This ensures that if a product is on sale, the discounted price (finalPrice) is used
      // instead of the original price, fixing the issue where original price was being added
      const priceAtAdd = product.isOnSale && product.salePercentage && product.salePercentage > 0 
        ? (product.finalPrice || product.price || 0)
        : (product.price || 0);
      
      const response = await fetch(POS_API_ENDPOINTS.ADD_ITEM(cartId), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product: product._id || product.id,
          quantity,
          priceAtAdd,
          variant: variant || null,
          selectedSpecifications: selectedSpecifications || [],
          selectedColors: selectedColors || []
        })
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure all required fields exist
        const cartData = {
          ...result.data,
          items: result.data.items || [],
          total: result.data.total || 0,
          subtotal: result.data.subtotal || 0,
          status: result.data.status || 'active'
        };
        console.log('Adding to cart, setting current cart:', cartData);
        setCurrentCart(cartData);
        // Update carts list
        setCarts(prev => prev.map(cart => cart._id === cartId ? cartData : cart));
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إضافة المنتج' : 'Error Adding Item',
        message: isRTL ? 'فشل في إضافة المنتج للسلة' : 'Failed to add item to cart'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentCart]);

  // Update item in POS cart
  const updateCartItem = useCallback(async (cartId: string, itemId: string, quantity: number) => {
    // Ensure we're working with the correct cart
    if (currentCart && currentCart._id !== cartId) {
      console.warn('Updating different cart than current, clearing current cart first');
      setCurrentCart(null);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.UPDATE_ITEM(cartId, itemId), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity })
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure all required fields exist
        const cartData = {
          ...result.data,
          items: result.data.items || [],
          total: result.data.total || 0,
          subtotal: result.data.subtotal || 0,
          status: result.data.status || 'active'
        };
        console.log('Adding to cart, setting current cart:', cartData);
        setCurrentCart(cartData);
        // Update carts list
        setCarts(prev => prev.map(cart => cart._id === cartId ? cartData : cart));
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث المنتج' : 'Error Updating Item',
        message: isRTL ? 'فشل في تحديث كمية المنتج' : 'Failed to update cart item'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentCart]);

  // Remove item from POS cart
  const removeFromCart = useCallback(async (cartId: string, itemId: string) => {
    // Ensure we're working with the correct cart
    if (currentCart && currentCart._id !== cartId) {
      console.warn('Removing from different cart than current, clearing current cart first');
      setCurrentCart(null);
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.REMOVE_ITEM(cartId, itemId), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure all required fields exist
        const cartData = {
          ...result.data,
          items: result.data.items || [],
          total: result.data.total || 0,
          subtotal: result.data.subtotal || 0,
          status: result.data.status || 'active'
        };
        console.log('Adding to cart, setting current cart:', cartData);
        setCurrentCart(cartData);
        // Update carts list
        setCarts(prev => prev.map(cart => cart._id === cartId ? cartData : cart));
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حذف المنتج' : 'Error Removing Item',
        message: isRTL ? 'فشل في حذف المنتج من السلة' : 'Failed to remove item from cart'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentCart]);

  // Update POS cart customer info
  const updateCustomer = useCallback(async (cartId: string, customer: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.UPDATE_CUSTOMER(cartId), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ customer })
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure all required fields exist
        const cartData = {
          ...result.data,
          items: result.data.items || [],
          total: result.data.total || 0,
          subtotal: result.data.subtotal || 0,
          status: result.data.status || 'active'
        };
        console.log('Adding to cart, setting current cart:', cartData);
        setCurrentCart(cartData);
        // Update carts list
        setCarts(prev => prev.map(cart => cart._id === cartId ? cartData : cart));
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث بيانات العميل' : 'Error Updating Customer Info',
        message: isRTL ? 'فشل في تحديث بيانات العميل' : 'Failed to update customer info'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply discount to POS cart
  const applyDiscount = useCallback(async (cartId: string, type: 'percentage' | 'fixed', value: number, reason?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.APPLY_DISCOUNT(cartId), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, value, reason })
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure all required fields exist
        const cartData = {
          ...result.data,
          items: result.data.items || [],
          total: result.data.total || 0,
          subtotal: result.data.subtotal || 0,
          status: result.data.status || 'active'
        };
        console.log('Adding to cart, setting current cart:', cartData);
        setCurrentCart(cartData);
        // Update carts list
        setCarts(prev => prev.map(cart => cart._id === cartId ? cartData : cart));
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تطبيق الخصم' : 'Error Applying Discount',
        message: isRTL ? 'فشل في تطبيق الخصم' : 'Failed to apply discount'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear POS cart
  const clearCart = useCallback(async (cartId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.CLEAR_CART(cartId), {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      if (result.data) {
        // Ensure all required fields exist
        const cartData = {
          ...result.data,
          items: result.data.items || [],
          // Force total to 0 if items array is empty
          total: (result.data.items && result.data.items.length === 0) ? 0 : (result.data.total || 0),
          subtotal: (result.data.items && result.data.items.length === 0) ? 0 : (result.data.subtotal || 0),
          status: result.data.status || 'active'
        };
        console.log('Clearing cart, setting current cart:', cartData);
        setCurrentCart(cartData);
        // Update carts list
        setCarts(prev => prev.map(cart => cart._id === cartId ? cartData : cart));
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في مسح السلة' : 'Error Clearing Cart',
        message: isRTL ? 'فشل في مسح السلة' : 'Failed to clear cart'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete POS cart
  const deleteCart = useCallback(async (cartId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.DELETE_CART(cartId), {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const result = await handleResponse(response);
      
      // Remove from local state
      setCarts(prev => prev.filter(cart => cart._id !== cartId));
      if (currentCart?._id === cartId) {
        setCurrentCart(null);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حذف السلة' : 'Error Deleting Cart',
        message: isRTL ? 'فشل في حذف السلة' : 'Failed to delete cart'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentCart]);

  // Complete POS cart (convert to order)
  const completeCart = useCallback(async (cartId: string, notes?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(POS_API_ENDPOINTS.COMPLETE_CART(cartId), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes })
      });
      
      const result = await handleResponse(response);
      
      // Update cart status to completed
      setCarts(prev => prev.map(cart => 
        cart._id === cartId 
          ? { ...cart, status: 'completed' as const }
          : cart
      ));
      
      if (currentCart?._id === cartId) {
        setCurrentCart(prev => prev ? { ...prev, status: 'completed' as const } : null);
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إكمال الطلب' : 'Error Completing Cart',
        message: isRTL ? 'فشل في إكمال الطلب' : 'Failed to complete cart'
      });
      setError(errorMsg.message);
      return { success: false, message: errorMsg.message };
    } finally {
      setIsLoading(false);
    }
  }, [currentCart]);

  return {
    carts,
    currentCart,
    isLoading,
    error,
    createCart,
    getCart,
    getAllCarts,
    addToCart,
    updateCartItem,
    removeFromCart,
    updateCustomer,
    applyDiscount,
    clearCart,
    deleteCart,
    completeCart,
    setCurrentCart,
    setCarts
  };
}
