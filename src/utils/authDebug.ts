/**
 * Authentication debugging utilities
 * Use these functions to diagnose authentication issues
 */

export const debugAuthState = () => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
  const storeId = localStorage.getItem('storeId');
  const rememberMe = localStorage.getItem('rememberMe');

  console.group('🔍 Authentication Debug Info');
  console.log('Local Storage Token:', localToken ? '✅ Present' : '❌ Missing');
  console.log('Session Storage Token:', sessionToken ? '✅ Present' : '❌ Missing');
  console.log('Active Token:', localToken || sessionToken || '❌ None');
  console.log('User Info:', userInfo ? '✅ Present' : '❌ Missing');
  console.log('Store ID:', storeId || '❌ Missing');
  console.log('Remember Me:', rememberMe === 'true' ? '✅ Yes' : '❌ No');
  
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      console.log('User Role:', user.role);
      console.log('User Email:', user.email);
    } catch (e) {
      console.log('User Info Parse Error:', e);
    }
  }
  console.groupEnd();
};

export const testSubscriptionAPI = async (storeId: string) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  console.group('🧪 Testing Subscription API');
  console.log('Store ID:', storeId);
  console.log('Token:', token ? '✅ Present' : '❌ Missing');
  
  if (!token) {
    console.error('❌ No authentication token found');
    console.groupEnd();
    return;
  }

  try {
    const response = await fetch(`http://localhost:5001/api/subscription/stores/${storeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Call Successful:', data);
    } else {
      const errorData = await response.json();
      console.error('❌ API Call Failed:', errorData);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
  
  console.groupEnd();
};

export const clearAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('storeId');
  localStorage.removeItem('storeInfo');
  localStorage.removeItem('rememberMe');
  
  // Clear sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('userInfo');
  
  console.log('✅ Authentication data cleared');
};
