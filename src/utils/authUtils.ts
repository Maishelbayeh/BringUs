/**
 * Utility functions for authentication and token management
 */

/**
 * Get the authentication token from either localStorage or sessionStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
  // First try localStorage (for "Remember Me" users)
  const localToken = localStorage.getItem('token');
  if (localToken) {
    return localToken;
  }
  
  // Then try sessionStorage (for temporary sessions)
  const sessionToken = sessionStorage.getItem('token');
  if (sessionToken) {
    return sessionToken;
  }
  
  return null;
};

/**
 * Save the authentication token to the appropriate storage
 * @param token - The authentication token
 * @param rememberMe - Whether to save to localStorage (persistent) or sessionStorage (temporary)
 */
export const saveAuthToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    // Save to localStorage for persistent storage
    localStorage.setItem('token', token);
    // Clear sessionStorage to avoid conflicts
    sessionStorage.removeItem('token');
  } else {
    // Save to sessionStorage for temporary storage
    sessionStorage.setItem('token', token);
    // Clear localStorage to avoid conflicts
    localStorage.removeItem('token');
  }
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
 * Save user info to the appropriate storage
 * @param userInfo - User information object
 * @param rememberMe - Whether to save to localStorage (persistent) or sessionStorage (temporary)
 */
export const saveUserInfo = (userInfo: any, rememberMe: boolean = false): void => {
  const userInfoString = JSON.stringify(userInfo);
  
  if (rememberMe) {
    // Save to localStorage for persistent storage
    localStorage.setItem('userInfo', userInfoString);
    // Clear sessionStorage to avoid conflicts
    sessionStorage.removeItem('userInfo');
  } else {
    // Save to sessionStorage for temporary storage
    sessionStorage.setItem('userInfo', userInfoString);
    // Clear localStorage to avoid conflicts
    localStorage.removeItem('userInfo');
  }
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
 * Save store ID to the appropriate storage
 * @param storeId - Store ID
 * @param rememberMe - Whether to save to localStorage (persistent) or sessionStorage (temporary)
 */
export const saveStoreId = (storeId: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    // Save to localStorage for persistent storage
    localStorage.setItem('storeId', storeId);
    // Clear sessionStorage to avoid conflicts
    sessionStorage.removeItem('storeId');
  } else {
    // Save to sessionStorage for temporary storage
    sessionStorage.setItem('storeId', storeId);
    // Clear localStorage to avoid conflicts
    localStorage.removeItem('storeId');
  }
};

