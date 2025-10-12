import { useState, useCallback } from 'react';

const API_BASE_URL = 'https://bringus-backend.onrender.com/api';

const useOTP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');

  const sendOTP = useCallback(async (email: string, storeSlug?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          email,
          storeSlug: storeSlug || 'default'
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        return { success: true, data: result.data };
      } else {
        setError(result.message || 'Failed to send verification code');
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          email,
          otp
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        return { success: true, data: result.data };
      } else {
        setError(result.message || 'Verification failed');
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const resendOTP = useCallback(async (email: string, storeSlug?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/email-verification/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          email,
          storeSlug: storeSlug || 'default'
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        return { success: true, data: result.data };
      } else {
        setError(result.message || 'Failed to resend verification code');
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [token]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    sendOTP,
    verifyOTP,
    resendOTP,
    reset
  };
};

export default useOTP;