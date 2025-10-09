import { useState, useEffect, useCallback } from 'react';
import { PaymentMethod } from '../Types';
import { BASE_URL } from '../constants/api';
import { useAuth } from './useAuth';
import { useToastContext } from '../contexts/ToastContext';
import { getErrorMessage } from '../utils/errorUtils';
import useLanguage from './useLanguage';

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
  // Old format (backward compatibility)
  message?: string;
  messageAr?: string;
  error?: string;
  errorAr?: string;
  // New format
  
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
  // Old format (backward compatibility)
  message?: string;
  messageAr?: string;
  error?: string;
  errorAr?: string;
  // New format
  message_en?: string;
  message_ar?: string;
  error_en?: string;
  error_ar?: string;
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

  const { getToken } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const { isRTL } = useLanguage();

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
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب طرق الدفع' : 'Error Fetching Payment Methods',
        message: isRTL ? 'فشل في جلب قائمة طرق الدفع' : 'Failed to fetch payment methods'
      });
      setError(errorMsg.message);
      showError(errorMsg.message);
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
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في جلب طريقة الدفع' : 'Error Fetching Payment Method',
        message: isRTL ? 'فشل في جلب بيانات طريقة الدفع' : 'Failed to fetch payment method'
      });
      showError(errorMsg.message);
      return null;
    }
  }, [getToken, showError]);

  // Create payment method with all data in one request
  const createPaymentMethodWithFiles = useCallback(async (formData: PaymentMethodWithFiles) => {
    const token = getToken();
    console.log('createPaymentMethodWithFiles', formData);
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

      const response = await fetch(`${BASE_URL}payment-methods/with-files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: multipartFormData,
      });

      const data: PaymentMethodResponse = await response.json();
      
      // Debug: Log the response to see what we're getting
      console.log('🔍 Payment Method API Response:', data);

      if (data.success) {
        showSuccess(
          isRTL ? 'تم إنشاء طريقة الدفع بنجاح' : 'Payment method created successfully',
          isRTL ? 'نجاح' : 'Success'
        );
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        // Handle specific Lahza error
        if (data.error === 'Lahza method already exists' || data.message?.includes('Only one Lahza payment method')) {
          console.log('🚨 Lahza duplicate error detected:', { error: data.error, message: data.message, messageAr: data.messageAr });
          
          const errorMessage = isRTL ? data.messageAr || 'يُسمح بطريقة دفع لحظة واحدة فقط لكل متجر' : data.message || 'Only one Lahza payment method is allowed per store';
          const errorTitle = isRTL ? 'طريقة دفع لحظة موجودة بالفعل' : 'Lahza Method Already Exists';
          
          console.log('🚨 Calling showError with:', { errorMessage, errorTitle, isRTL });
          const toastId = showError(errorMessage, errorTitle);
          console.log('🚨 Toast ID returned:', toastId);
        } else {
          showError(
            isRTL ? data.messageAr || 'فشل في إنشاء طريقة الدفع' : data.message || 'Failed to create payment method',
            isRTL ? 'خطأ في إنشاء طريقة الدفع' : 'Error Creating Payment Method'
          );
        }
        return null;
      }
    } catch (err: any) {
      // Handle specific Lahza error from response
      if (err.response?.data?.error === 'Lahza method already exists' || err.response?.data?.message?.includes('Only one Lahza payment method')) {
        showError(
          isRTL ? err.response.data.messageAr || 'يُسمح بطريقة دفع لحظة واحدة فقط لكل متجر' : err.response.data.message || 'Only one Lahza payment method is allowed per store',
          isRTL ? 'طريقة دفع لحظة موجودة بالفعل' : 'Lahza Method Already Exists'
        );
      } else {
        const errorMsg = getErrorMessage(err, isRTL, {
          title: isRTL ? 'خطأ في إنشاء طريقة الدفع' : 'Error Creating Payment Method',
          message: isRTL ? 'فشل في إنشاء طريقة الدفع' : 'Failed to create payment method'
        });
        showError(errorMsg.message, errorMsg.title);
      }
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

      const response = await fetch(`${BASE_URL}payment-methods/${id}/with-files`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: multipartFormData,
      });

      const data: PaymentMethodResponse = await response.json();

      if (data.success) {
        // Show bilingual success message
        const successMessage = isRTL 
          ? (data.messageAr || 'تم تحديث طريقة الدفع بنجاح') 
          : (data.message || 'Payment method updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        
        showSuccess(successMessage, successTitle);
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        // Show bilingual error message
        const errorMessage = isRTL 
          ? (data.messageAr || 'فشل في تحديث طريقة الدفع') 
          : (data.message || 'Failed to update payment method');
        const errorTitle = isRTL 
          ? (data.errorAr || 'خطأ في تحديث طريقة الدفع') 
          : (data.error || 'Error Updating Payment Method');
        
        showError(errorMessage, errorTitle);
        return null;
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث طريقة الدفع' : 'Error Updating Payment Method',
        message: isRTL ? 'فشل في تحديث طريقة الدفع' : 'Failed to update payment method'
      });
      showError(errorMsg.message, errorMsg.title);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods, isRTL]);

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
        // Show bilingual success message
        const successMessage = isRTL 
          ? (data.messageAr || 'تم إنشاء طريقة الدفع بنجاح') 
          : (data.message || 'Payment method created successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        
        showSuccess(successMessage, successTitle);
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        // Show bilingual error message
        const errorMessage = isRTL 
          ? (data.messageAr || 'فشل في إنشاء طريقة الدفع') 
          : (data.message || 'Failed to create payment method');
        const errorTitle = isRTL 
          ? (data.errorAr || 'خطأ في إنشاء طريقة الدفع') 
          : (data.error || 'Error Creating Payment Method');
        
        showError(errorMessage, errorTitle);
        return null;
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في إنشاء طريقة الدفع' : 'Error Creating Payment Method',
        message: isRTL ? 'فشل في إنشاء طريقة الدفع' : 'Failed to create payment method'
      });
      showError(errorMsg.message, errorMsg.title);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods, isRTL]);

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
        // Show bilingual success message
        const successMessage = isRTL 
          ? (data.messageAr || 'تم تحديث طريقة الدفع بنجاح') 
          : (data.message || 'Payment method updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        
        showSuccess(successMessage, successTitle);
        await fetchPaymentMethods(); // Refresh the list
        return data.data;
      } else {
        // Show bilingual error message
        const errorMessage = isRTL 
          ? (data.messageAr || 'فشل في تحديث طريقة الدفع') 
          : (data.message || 'Failed to update payment method');
        const errorTitle = isRTL 
          ? (data.errorAr || 'خطأ في تحديث طريقة الدفع') 
          : (data.error || 'Error Updating Payment Method');
        
        showError(errorMessage, errorTitle);
        return null;
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث طريقة الدفع' : 'Error Updating Payment Method',
        message: isRTL ? 'فشل في تحديث طريقة الدفع' : 'Failed to update payment method'
      });
      showError(errorMsg.message, errorMsg.title);
      return null;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods, isRTL]);

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
        // Show bilingual success message
        const successMessage = isRTL 
          ? (data.messageAr || 'تم حذف طريقة الدفع بنجاح') 
          : (data.message || 'Payment method deleted successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        
        showSuccess(successMessage, successTitle);
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        // Show bilingual error message
        const errorMessage = isRTL 
          ? (data.messageAr || 'فشل في حذف طريقة الدفع') 
          : (data.message || 'Failed to delete payment method');
        const errorTitle = isRTL 
          ? (data.errorAr || 'خطأ في حذف طريقة الدفع') 
          : (data.error || 'Error Deleting Payment Method');
        
        showError(errorMessage, errorTitle);
        return false;
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حذف طريقة الدفع' : 'Error Deleting Payment Method',
        message: isRTL ? 'فشل في حذف طريقة الدفع' : 'Failed to delete payment method'
      });
      showError(errorMsg.message, errorMsg.title);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods, isRTL]);

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
        // Show bilingual success message
        const successMessage = isRTL 
          ? (data.messageAr || 'تم تحديث حالة طريقة الدفع بنجاح') 
          : (data.message || 'Payment method status updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        
        showSuccess(successMessage, successTitle);
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        // Show bilingual error message
        const errorMessage = isRTL 
          ? (data.messageAr || 'فشل في تحديث حالة طريقة الدفع') 
          : (data.message || 'Failed to update payment method status');
        const errorTitle = isRTL 
          ? (data.errorAr || 'خطأ في تحديث حالة طريقة الدفع') 
          : (data.error || 'Error Updating Payment Method Status');
        
        showError(errorMessage, errorTitle);
        return false;
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تحديث حالة طريقة الدفع' : 'Error Updating Payment Method Status',
        message: isRTL ? 'فشل في تحديث حالة طريقة الدفع' : 'Failed to update payment method status'
      });
      showError(errorMsg.message, errorMsg.title);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods, isRTL]);

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
        // Show bilingual success message
        const successMessage = isRTL 
          ? (data.messageAr || 'تم تعيين طريقة الدفع الافتراضية بنجاح') 
          : (data.message || 'Default payment method set successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        
        showSuccess(successMessage, successTitle);
        await fetchPaymentMethods(); // Refresh the list
        return true;
      } else {
        // Show bilingual error message
        const errorMessage = isRTL 
          ? (data.messageAr || 'فشل في تعيين طريقة الدفع الافتراضية') 
          : (data.message || 'Failed to set default payment method');
        const errorTitle = isRTL 
          ? (data.errorAr || 'خطأ في تعيين طريقة الدفع الافتراضية') 
          : (data.error || 'Error Setting Default Payment Method');
        
        showError(errorMessage, errorTitle);
        return false;
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في تعيين طريقة الدفع الافتراضية' : 'Error Setting Default Payment Method',
        message: isRTL ? 'فشل في تعيين طريقة الدفع الافتراضية' : 'Failed to set default payment method'
      });
      showError(errorMsg.message, errorMsg.title);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods, isRTL]);

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
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في رفع الشعار' : 'Error Uploading Logo',
        message: isRTL ? 'فشل في رفع شعار طريقة الدفع' : 'Failed to upload payment method logo'
      });
      showError(errorMsg.message);
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
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في رفع رمز QR' : 'Error Uploading QR Code',
        message: isRTL ? 'فشل في رفع رمز QR' : 'Failed to upload QR code'
      });
      showError(errorMsg.message);
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
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في رفع صورة الدفع' : 'Error Uploading Payment Image',
        message: isRTL ? 'فشل في رفع صورة الدفع' : 'Failed to upload payment image'
      });
      showError(errorMsg.message);
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
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حذف صورة الدفع' : 'Error Removing Payment Image',
        message: isRTL ? 'فشل في حذف صورة الدفع' : 'Failed to remove payment image'
      });
      showError(errorMsg.message);
      return false;
    }
  }, [getToken, showSuccess, showError, fetchPaymentMethods]);

  // Load payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

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