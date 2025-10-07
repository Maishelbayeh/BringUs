// POS API Configuration
export const POS_API_BASE_URL = 'https://bringus-backend.onrender.com/api/pos-cart';

// API Endpoints
export const POS_API_ENDPOINTS = {
  // Cart Management
  CREATE_CART: (storeId: string) => `${POS_API_BASE_URL}/${storeId}`,
  GET_CART: (cartId: string) => `${POS_API_BASE_URL}/cart/${cartId}`,
  GET_ALL_CARTS: (storeId: string, status?: string) => 
    `${POS_API_BASE_URL}/${storeId}${status ? `?status=${status}` : ''}`,
  DELETE_CART: (cartId: string) => `${POS_API_BASE_URL}/${cartId}`,
  
  // Item Management
  ADD_ITEM: (cartId: string) => `${POS_API_BASE_URL}/${cartId}/add`,
  UPDATE_ITEM: (cartId: string, itemId: string) => 
    `${POS_API_BASE_URL}/${cartId}/item/${itemId}`,
  REMOVE_ITEM: (cartId: string, itemId: string) => 
    `${POS_API_BASE_URL}/${cartId}/item/${itemId}`,
  
  // Cart Operations
  UPDATE_CUSTOMER: (cartId: string) => `${POS_API_BASE_URL}/${cartId}/customer`,
  APPLY_DISCOUNT: (cartId: string) => `${POS_API_BASE_URL}/${cartId}/discount`,
  CLEAR_CART: (cartId: string) => `${POS_API_BASE_URL}/${cartId}/clear`,
  COMPLETE_CART: (cartId: string) => `${POS_API_BASE_URL}/${cartId}/complete`,
};

// Request Headers
export const getPOSApiHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API Response Types
export interface POSApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Cart Status Types
export type CartStatus = 'active' | 'completed' | 'cancelled';

// Discount Types
export type DiscountType = 'percentage' | 'fixed';

// Payment Methods
export type PaymentMethod = 'cash' | 'card' | 'credit' | 'debit';

// Error Messages
export const POS_ERROR_MESSAGES = {
  CART_NOT_FOUND: 'Cart not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  INSUFFICIENT_STOCK: 'Insufficient stock',
  INVALID_QUANTITY: 'Invalid quantity',
  CART_EMPTY: 'Cart is empty',
  UNAUTHORIZED: 'Access denied. Admin only.',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred'
};

// Success Messages
export const POS_SUCCESS_MESSAGES = {
  CART_CREATED: 'Cart created successfully',
  CART_UPDATED: 'Cart updated successfully',
  CART_DELETED: 'Cart deleted successfully',
  ITEM_ADDED: 'Item added to cart successfully',
  ITEM_UPDATED: 'Item updated successfully',
  ITEM_REMOVED: 'Item removed successfully',
  CUSTOMER_UPDATED: 'Customer information updated successfully',
  DISCOUNT_APPLIED: 'Discount applied successfully',
  CART_CLEARED: 'Cart cleared successfully',
  ORDER_COMPLETED: 'Order completed successfully'
};
