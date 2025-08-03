import { useState, useEffect, useCallback } from 'react';
import { PaymentMethod } from '../Types';
import { BASE_URL } from '../constants/api';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

interface PaymentMethodFormData {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  methodType: 'cash' | 'card' | 'digital_wallet' | 'bank_transfer' | 'qr_code' | 'other';
  isActive?: boolean;
  isDefault?: boolean;
  logoUrl?: string;
  qrCode?: {
    enabled: boolean;
    qrCodeUrl?: string;
    qrCodeImage?: string;
    qrCodeData?: string;
  };
  paymentImages?: Array<{
    imageUrl: string;
    imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other';
    altText?: string;
  }>;
}

interface PaymentMethodWithFiles extends PaymentMethodFormData {
  logoFile?: File | null;
  qrCodeFile?: File | null;
  paymentImageFiles?: Array<{
    file: File;
    imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other';
    altText: string;
  }>;
}

interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface PaymentMethodResponse {
  success: boolean;
  data: PaymentMethod;
  message?: string;
}

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    logoUrl?: string;
    qrCodeImage?: string;
    qrCodeData?: string;
    paymentImage?: {
      imageUrl: string;
      imageType: string;
      altText: string;
    };
  };
}

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const { getToken, getCurrentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  // Get all payment methods
  const fetchPaymentMethods = useCallback(async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    isDefault?: boolean;
    methodType?: string;
  }) => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.isDefault !== undefined) queryParams.append('isDefault', params.isDefault.toString());
      if (params?.methodType) queryParams.append('methodType', params.methodType);

      const response = await fetch(`${BASE_URL}payment-methods?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: PaymentMethodsResponse = await response.json();

      if (data.success) {
        setPaymentMethods(data.data);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError(data.message || 'Failed to fetch payment methods');
        showError(data.message || 'Failed to fetch payment methods');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment methods';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken, showError]);

  // Get single payment method
  const fetchPaymentMethod = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BASE_URL}payment-methods/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        return data.data;
      } else {
        showError(data.message || 'Failed to fetch payment method');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payment method';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showError]);

  // Create payment method with all data in one request
  const createPaymentMethodWithFiles = useCallback(async (formData: PaymentMethodWithFiles) => {
    const token = getToken();
    if (!token) return null;

    try {
      const multipartFormData = new FormData();

      // Add basic form data
      multipartFormData.append('titleAr', formData.titleAr);
      multipartFormData.append('titleEn', formData.titleEn);
      if (formData.descriptionAr) multipartFormData.append('descriptionAr', formData.descriptionAr);
      if (formData.descriptionEn) multipartFormData.append('descriptionEn', formData.descriptionEn);
      multipartFormData.append('methodType', formData.methodType);
      multipartFormData.append('isActive', formData.isActive?.toString() || 'true');
      multipartFormData.append('isDefault', formData.isDefault?.toString() || 'false');

      // Add QR code data
      if (formData.qrCode) {
        multipartFormData.append('qrCode[enabled]', formData.qrCode.enabled.toString());
        if (formData.qrCode.qrCodeUrl) multipartFormData.append('qrCode[qrCodeUrl]', formData.qrCode.qrCodeUrl);
        if (formData.qrCode.qrCodeData) multipartFormData.append('qrCode[qrCodeData]', formData.qrCode.qrCodeData);
      }

      // Add logo file
      if (formData.logoFile) {
        multipartFormData.append('logo', formData.logoFile);
      }

      // Add QR code file
      if (formData.qrCodeFile) {
        multipartFormData.append('qrCodeImage', formData.qrCodeFile);
      }

      // Add payment images
      if (formData.paymentImageFiles && formData.paymentImageFiles.length > 0) {
        formData.paymentImageFiles.forEach((imageFile, index) => {
          multipartFormData.append(`paymentImages[${index}][file]`, imageFile.file);
          multipartFormData.append(`paymentImages[${index}][imageType]`, imageFile.imageType);
          if (imageFile.altText) multipartFormData.append(`paymentImages[${index}][altText]`, imageFile.altText);
        });
      }

      const response = await fetch(`${BASE_URL}payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: multipartFormData,
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        showSuccess('Payment method created successfully');
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        showError(data.message || 'Failed to create payment method');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment method';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Update payment method with all data in one request
  const updatePaymentMethodWithFiles = useCallback(async (id: string, formData: PaymentMethodWithFiles) => {
    const token = getToken();
    if (!token) return null;

    try {
      const multipartFormData = new FormData();

      // Add basic form data
      multipartFormData.append('titleAr', formData.titleAr);
      multipartFormData.append('titleEn', formData.titleEn);
      if (formData.descriptionAr) multipartFormData.append('descriptionAr', formData.descriptionAr);
      if (formData.descriptionEn) multipartFormData.append('descriptionEn', formData.descriptionEn);
      multipartFormData.append('methodType', formData.methodType);
      multipartFormData.append('isActive', formData.isActive?.toString() || 'true');
      multipartFormData.append('isDefault', formData.isDefault?.toString() || 'false');

      // Add QR code data
      if (formData.qrCode) {
        multipartFormData.append('qrCode[enabled]', formData.qrCode.enabled.toString());
        if (formData.qrCode.qrCodeUrl) multipartFormData.append('qrCode[qrCodeUrl]', formData.qrCode.qrCodeUrl);
        if (formData.qrCode.qrCodeData) multipartFormData.append('qrCode[qrCodeData]', formData.qrCode.qrCodeData);
      }

      // Add logo file
      if (formData.logoFile) {
        multipartFormData.append('logo', formData.logoFile);
      }

      // Add QR code file
      if (formData.qrCodeFile) {
        multipartFormData.append('qrCodeImage', formData.qrCodeFile);
      }

      // Add payment images
      if (formData.paymentImageFiles && formData.paymentImageFiles.length > 0) {
        formData.paymentImageFiles.forEach((imageFile, index) => {
          multipartFormData.append(`paymentImages[${index}][file]`, imageFile.file);
          multipartFormData.append(`paymentImages[${index}][imageType]`, imageFile.imageType);
          if (imageFile.altText) multipartFormData.append(`paymentImages[${index}][altText]`, imageFile.altText);
        });
      }

      const response = await fetch(`${BASE_URL}payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: multipartFormData,
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        showSuccess('Payment method updated successfully');
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        showError(data.message || 'Failed to update payment method');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment method';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Create payment method (legacy - without files)
  const createPaymentMethod = useCallback(async (formData: PaymentMethodFormData) => {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BASE_URL}payment-methods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        showSuccess('Payment method created successfully');
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        showError(data.message || 'Failed to create payment method');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment method';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Update payment method (legacy - without files)
  const updatePaymentMethod = useCallback(async (id: string, formData: Partial<PaymentMethodFormData>) => {
    const token = getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BASE_URL}payment-methods/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        showSuccess('Payment method updated successfully');
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        showError(data.message || 'Failed to update payment method');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment method';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Delete payment method
  const deletePaymentMethod = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}payment-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Payment method deleted successfully');
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        showError(data.message || 'Failed to delete payment method');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment method';
      showError(errorMessage);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Toggle active status
  const toggleActiveStatus = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}payment-methods/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        showSuccess('Payment method status updated successfully');
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        showError(data.message || 'Failed to update payment method status');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment method status';
      showError(errorMessage);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Set as default
  const setAsDefault = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}payment-methods/${id}/set-default`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        showSuccess('Default payment method set successfully');
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        showError(data.message || 'Failed to set default payment method');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set default payment method';
      showError(errorMessage);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Upload logo (legacy - separate endpoint)
  const uploadLogo = useCallback(async (id: string, file: File) => {
    const token = getToken();
    if (!token) return null;

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${BASE_URL}payment-methods/${id}/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (data.success) {
        showSuccess('Logo uploaded successfully');
        await fetchPaymentMethods(); // Refresh the list
        return data.data.logoUrl;
      } else {
        showError(data.message || 'Failed to upload logo');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Upload QR code (legacy - separate endpoint)
  const uploadQrCode = useCallback(async (id: string, file: File, qrCodeData?: string) => {
    const token = getToken();
    if (!token) return null;

    try {
      const formData = new FormData();
      formData.append('qrCodeImage', file);
      if (qrCodeData) {
        formData.append('qrCodeData', qrCodeData);
      }

      const response = await fetch(`${BASE_URL}payment-methods/${id}/upload-qr-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (data.success) {
        showSuccess('QR code uploaded successfully');
        await fetchPaymentMethods(); // Refresh the list
        return {
          qrCodeImage: data.data.qrCodeImage,
          qrCodeData: data.data.qrCodeData,
        };
      } else {
        showError(data.message || 'Failed to upload QR code');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload QR code';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Upload payment image (legacy - separate endpoint)
  const uploadPaymentImage = useCallback(async (
    id: string, 
    file: File, 
    imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other' = 'other',
    altText?: string
  ) => {
    const token = getToken();
    if (!token) return null;

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('imageType', imageType);
      if (altText) {
        formData.append('altText', altText);
      }

      const response = await fetch(`${BASE_URL}payment-methods/${id}/upload-payment-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (data.success) {
        showSuccess('Payment image uploaded successfully');
        await fetchPaymentMethods(); // Refresh the list
        return data.data.paymentImage;
      } else {
        showError(data.message || 'Failed to upload payment image');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload payment image';
      showError(errorMessage);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Remove payment image (legacy - separate endpoint)
  const removePaymentImage = useCallback(async (id: string, imageIndex: number) => {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}payment-methods/${id}/remove-payment-image/${imageIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Payment image removed successfully');
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        showError(data.message || 'Failed to remove payment image');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove payment image';
      showError(errorMessage);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Load payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    pagination,
    fetchPaymentMethods,
    fetchPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    createPaymentMethodWithFiles, // New: Single API call with files
    updatePaymentMethodWithFiles, // New: Single API call with files
    deletePaymentMethod,
    toggleActiveStatus,
    setAsDefault,
    uploadLogo,
    uploadQrCode,
    uploadPaymentImage,
    removePaymentImage,
  };
}; 