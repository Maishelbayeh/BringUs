/**
 * Utility functions for authentication and token management
 */

/**
 * Get the authentication token from localStorage or sessionStorage (fallback)
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
  // Try localStorage first (tokens are always saved here for API calls)
  const localToken = localStorage.getItem('token');
  if (localToken) {
    return localToken;
  }
  
  // Fallback to sessionStorage (legacy support)
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) {
    return sessionToken;
  }
  
  return null;
};

/**
 * Save the authentication token to localStorage (always saved for API calls)
 * @param token - The authentication token
 */
export const saveAuthToken = (token: string): void => {
  // Always save to localStorage (required for API calls)
  localStorage.setItem('token', token);
  // Clear sessionStorage to avoid conflicts
  sessionStorage.removeItem('token');
};

/**
 * Remove the authentication token from both localStorage and sessionStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

/**
 * Check if the user is authenticated (has a valid token)
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Get user info from either localStorage or sessionStorage
 * @returns User info object or null if not found
 */
export const getUserInfo = (): any | null => {
  // First try localStorage
  const localUserInfo = localStorage.getItem('userInfo');
  if (localUserInfo) {
    try {
      return JSON.parse(localUserInfo);
    } catch (error) {
      console.error('Error parsing userInfo from localStorage:', error);
    }
  }
  
  // Then try sessionStorage
  const sessionUserInfo = sessionStorage.getItem('userInfo');
  if (sessionUserInfo) {
    try {
      return JSON.parse(sessionUserInfo);
    } catch (error) {
      console.error('Error parsing userInfo from sessionStorage:', error);
    }
  }
  
  return null;
};

/**
 * Save user info to localStorage (always saved for API calls)
 * @param userInfo - User information object
 */
export const saveUserInfo = (userInfo: any): void => {
  const userInfoString = JSON.stringify(userInfo);
  
  // Always save to localStorage (required for API calls)
  localStorage.setItem('userInfo', userInfoString);
  // Clear sessionStorage to avoid conflicts
  sessionStorage.removeItem('userInfo');
};

/**
 * Remove user info from both localStorage and sessionStorage
 */
export const removeUserInfo = (): void => {
  localStorage.removeItem('userInfo');
  sessionStorage.removeItem('userInfo');
};

/**
 * Get store ID from either localStorage or sessionStorage
 * @returns Store ID or null if not found
 */
export const getStoreId = (): string | null => {
  // First try localStorage
  const localStoreId = localStorage.getItem('storeId');
  if (localStoreId) {
    return localStoreId;
  }
  
  // Then try sessionStorage
  const sessionStoreId = sessionStorage.getItem('storeId');
  if (sessionStoreId) {
    return sessionStoreId;
  }
  
  return null;
};

/**
 * Save store ID to localStorage (always saved for API calls)
 * @param storeId - Store ID
 */
export const saveStoreId = (storeId: string): void => {
  // Always save to localStorage (required for API calls)
  localStorage.setItem('storeId', storeId);
  // Clear sessionStorage to avoid conflicts
  sessionStorage.removeItem('storeId');
};

