import React, { useState, useEffect } from 'react';
import CustomInput from './CustomInput';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { BASE_URL } from '@/constants/api';
import { getStoreId } from '@/utils/storeUtils';
import { useToast } from '@/hooks/useToast';
import useLanguage from '@/hooks/useLanguage';
import { getErrorMessage } from '@/utils/errorUtils';

interface LahzaCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsSaved?: () => void;
  isRTL?: boolean;
}

interface LahzaCredentials {
  lahzaToken: string;
  lahzaSecretKey: string;
}

interface LahzaCredentialsStatus {
  hasCredentials: boolean;
  hasToken: boolean;
  hasSecretKey: boolean;
  token?: string;
  secretKey?: string;
}

const LahzaCredentialsModal: React.FC<LahzaCredentialsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsSaved,
  isRTL: isRTLProp
}) => {
  const { isRTL: isRTLHook } = useLanguage();
  const isRTL = isRTLProp !== undefined ? isRTLProp : isRTLHook;
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<LahzaCredentialsStatus | null>(null);
  const [credentials, setCredentials] = useState<LahzaCredentials>({
    lahzaToken: '',
    lahzaSecretKey: ''
  });
  const [errors, setErrors] = useState<{ lahzaToken?: string; lahzaSecretKey?: string }>({});
  const [tokenValue, setTokenValue] = useState<string>('');

  // Check for existing credentials when modal opens
  useEffect(() => {
    if (isOpen) {
      checkLahzaCredentials();
    }
  }, [isOpen]);

  // Check if Lahza credentials exist
  const checkLahzaCredentials = async () => {
    setChecking(true);
    try {
      const storeId = getStoreId();
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Fetch store info to get Lahza credentials
      const response = await fetch(`${BASE_URL}stores/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        const storeData = data.data;
        
        // Check if lahzaToken and lahzaSecretKey exist in store settings
        // Also check if they contain valid Lahza credentials (not email/password)
        const currentTokenValue = storeData.settings?.lahzaToken || '';
        const secretKeyValue = storeData.settings?.lahzaSecretKey || '';
        
        // Store token value for warning display
        setTokenValue(currentTokenValue);
        
        // Check if values look like email/password (common mistake)
        const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentTokenValue);
        const looksLikePassword = secretKeyValue.length > 0 && secretKeyValue.includes('@');
        
        // If they look like email/password, treat as invalid
        const hasValidToken = Boolean(currentTokenValue && currentTokenValue.trim() !== '' && !looksLikeEmail);
        const hasValidSecretKey = Boolean(secretKeyValue && secretKeyValue.trim() !== '' && !looksLikePassword);
        const hasCredentials = hasValidToken && hasValidSecretKey;
        
        setStatus({
          hasCredentials,
          hasToken: hasValidToken,
          hasSecretKey: hasValidSecretKey,
          token: hasValidToken ? '***configured***' : undefined,
          secretKey: hasValidSecretKey ? '***configured***' : undefined
        });
        
        // If credentials exist and are valid, populate the form (user can update them)
        if (hasCredentials) {
          setCredentials({
            lahzaToken: storeData.settings.lahzaToken || '',
            lahzaSecretKey: storeData.settings.lahzaSecretKey || ''
          });
        } else {
          // Don't pre-fill with invalid data (email/password)
          // Start with empty fields for proper Lahza credentials
          setCredentials({
            lahzaToken: '',
            lahzaSecretKey: ''
          });
        }
      } else {
        throw new Error(data.message || 'Failed to fetch store data');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في التحقق من بيانات الاعتماد' : 'Error Checking Credentials',
        message: isRTL ? 'فشل في التحقق من بيانات اعتماد لحظة' : 'Failed to check Lahza credentials'
      });
      showError(errorMsg.message, errorMsg.title);
    } finally {
      setChecking(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { lahzaToken?: string; lahzaSecretKey?: string } = {};
    
    if (!credentials.lahzaToken || credentials.lahzaToken.trim() === '') {
      newErrors.lahzaToken = isRTL ? 'رمز التاجر مطلوب' : 'Merchant Code is required';
    }
    
    if (!credentials.lahzaSecretKey || credentials.lahzaSecretKey.trim() === '') {
      newErrors.lahzaSecretKey = isRTL ? 'المفتاح السري مطلوب' : 'Secret Key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save Lahza credentials
  const saveLahzaCredentials = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const storeId = getStoreId();
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Use the PATCH /api/store-info/update endpoint
      const response = await fetch(`${BASE_URL}store-info/update`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          storeId: storeId,
          lahzaToken: credentials.lahzaToken.trim(),
          lahzaSecretKey: credentials.lahzaSecretKey.trim()
        })
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        // Use bilingual message from API response
        const successMessage = isRTL 
          ? (data.messageAr || 'تم تحديث المتجر بنجاح') 
          : (data.message || 'Store updated successfully');
        const successTitle = isRTL ? 'نجاح' : 'Success';
        
        showSuccess(successMessage, successTitle);
        
        // Call the callback to notify parent
        if (onCredentialsSaved) {
          onCredentialsSaved();
        }
        
        // Close modal
        onClose();
      } else {
        throw new Error(data.message || 'Failed to save credentials');
      }
    } catch (err: any) {
      const errorMsg = getErrorMessage(err, isRTL, {
        title: isRTL ? 'خطأ في حفظ بيانات الاعتماد' : 'Error Saving Credentials',
        message: isRTL ? 'فشل في حفظ بيانات اعتماد لحظة' : 'Failed to save Lahza credentials'
      });
      showError(errorMsg.message, errorMsg.title);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LahzaCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    // Reset form when closing
    setCredentials({ lahzaToken: '', lahzaSecretKey: '' });
    setErrors({});
    setStatus(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-lg"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {isRTL ? 'بيانات اعتماد لحظة' : 'Lahza Credentials'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {checking ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-600">
                  {isRTL ? 'جاري التحقق من بيانات الاعتماد...' : 'Checking credentials...'}
                </p>
              </div>
            ) : (
              <>
                {/* Status Banner */}
                {status && (
                  <div className={`mb-6 p-4 rounded-lg border ${
                    status.hasCredentials
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {status.hasCredentials ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${
                          status.hasCredentials ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {status.hasCredentials
                            ? (isRTL ? 'بيانات الاعتماد موجودة' : 'Credentials Configured')
                            : (isRTL ? 'بيانات الاعتماد غير مكتملة' : 'Credentials Not Complete')
                          }
                        </h4>
                        <p className={`text-sm ${
                          status.hasCredentials ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          {status.hasCredentials
                            ? (isRTL 
                                ? 'يمكنك تحديث بيانات الاعتماد أدناه إذا لزم الأمر' 
                                : 'You can update the credentials below if needed'
                              )
                            : (isRTL
                                ? 'يرجى إدخال بيانات اعتماد لحظة لتفعيل طريقة الدفع'
                                : 'Please enter Lahza credentials to activate payment method'
                              )
                          }
                        </p>
                        {!status.hasCredentials && (
                          <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                            {!status.hasToken && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                                {isRTL ? 'رمز التاجر مفقود' : 'Merchant Code missing'}
                              </li>
                            )}
                            {!status.hasSecretKey && (
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                                {isRTL ? 'المفتاح السري مفقود' : 'Secret Key missing'}
                              </li>
                            )}
                          </ul>
                        )}
                        
                        {/* Show warning if invalid data detected */}
                        {tokenValue && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tokenValue) && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <div className="text-sm text-red-800">
                                <p className="font-medium">
                                  {isRTL ? 'تحذير: بيانات اعتماد غير صحيحة' : 'Warning: Invalid credentials detected'}
                                </p>
                                <p className="mt-1">
                                  {isRTL 
                                    ? 'يبدو أن رمز التاجر يحتوي على بريد إلكتروني. يرجى إدخال رمز التاجر الصحيح من لوحة تحكم لحظة.'
                                    : 'The Merchant Code appears to contain an email address. Please enter the correct Merchant Code from your Lahza dashboard.'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <CustomInput
                      label={isRTL ? 'رمز التاجر (Merchant Code)' : 'Merchant Code'}
                      name="lahzaToken"
                      value={credentials.lahzaToken}
                      onChange={(e) => handleInputChange('lahzaToken', e.target.value)}
                      placeholder={isRTL ? 'أدخل رمز التاجر' : 'Enter merchant code'}
                      error={errors.lahzaToken}
                      required
                      dir="ltr"
                      type="text"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL 
                        ? 'الرمز الذي تحصل عليه من لحظة للدفع الإلكتروني' 
                        : 'The code provided by Lahza for electronic payments'
                      }
                    </p>
                  </div>

                  <div>
                    <CustomInput
                      label={isRTL ? 'المفتاح السري (Secret Key)' : 'Secret Key'}
                      name="lahzaSecretKey"
                      value={credentials.lahzaSecretKey}
                      onChange={(e) => handleInputChange('lahzaSecretKey', e.target.value)}
                      placeholder={isRTL ? 'أدخل المفتاح السري' : 'Enter secret key'}
                      error={errors.lahzaSecretKey}
                      required
                      type="text"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL 
                        ? 'المفتاح السري الخاص بحسابك في لحظة (يبقى سرياً)' 
                        : 'Your secret key from Lahza account (kept confidential)'
                      }
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        {isRTL ? (
                          <p>
                            <strong>ملاحظة:</strong> يمكنك الحصول على بيانات الاعتماد هذه من لوحة تحكم لحظة الخاصة بك. 
                            هذه البيانات ضرورية لتفعيل طريقة الدفع عبر لحظة في متجرك.
                          </p>
                        ) : (
                          <p>
                            <strong>Note:</strong> You can get these credentials from your Lahza dashboard. 
                            These credentials are required to activate Lahza payment method in your store.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={saveLahzaCredentials}
              disabled={loading || checking}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                : (isRTL ? 'حفظ بيانات الاعتماد' : 'Save Credentials')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LahzaCredentialsModal;

