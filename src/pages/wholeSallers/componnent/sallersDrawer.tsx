import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../../components/common/CustomButton';
import SallersForm from './SallersForm';
import { useWholesalers, Wholesaler } from '../../../hooks/useWholesalers';
import { useValidation } from '../../../hooks/useValidation';
import { wholesalerValidationSchema, validateWholesalerWithDuplicates } from '../../../validation/wholesalerValidation';

// Interface for props
interface SallersDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  initialData?: any;
  onSaveSuccess: () => void;
  isEdit: boolean;
  password?: string;
}

const SallersDrawer: React.FC<SallersDrawerProps> = ({ 
  open, 
  onClose, 
  isRTL, 
  title, 
  initialData, 
  onSaveSuccess, 
  isEdit,
  password = ''
}) => {
  const { t, i18n } = useTranslation();
  const storeId = localStorage.getItem('storeId') || '';
  const token = localStorage.getItem('token') || '';
  const { wholesalers, createWholesaler, updateWholesaler, getWholesalers } = useWholesalers(storeId, token);
  
  const { errors, setErrors, clearAllErrors } = useValidation({
    schema: wholesalerValidationSchema
  });
  
  const [form, setForm] = useState<Partial<Wholesaler>>({
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    discount: 0,
    address: '',
    status: 'Active',
    password: password || ''
  });

  // Real-time email check states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [emailMessage, setEmailMessage] = useState<{ message: string; messageAr: string } | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData);
        setEmailAvailable(null); // Reset for edit mode
      } else {
        setForm({
          email: '',
          firstName: '',
          lastName: '',
          mobile: '',
          discount: 0,
          address: '',
            status: 'Active',
            password: password || ''
        });
        setEmailAvailable(null); // Reset for new entry
      }
      clearAllErrors();
      setIsCheckingEmail(false);
      
      // Clear any pending timeout
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
        setEmailCheckTimeout(null);
      }
      
      // Load current store wholesalers when drawer opens
      if (storeId) {
        getWholesalers().catch(console.error);
      }
    }
  }, [open, initialData, clearAllErrors, getWholesalers, storeId, emailCheckTimeout]);

  // Real-time email check with API
  const checkEmailAvailability = useCallback(async (email: string) => {
    // Skip check in edit mode or if email is empty
    if (isEdit || !email.trim()) {
      setEmailAvailable(null);
      return;
    }

    // Validate email format first
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailAvailable(null);
      return;
    }

    setIsCheckingEmail(true);
    
    try {
      const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}');
      const storeSlug = storeInfo.slug;
      
      if (!storeSlug) {
        console.error('❌ No store slug found');
        setEmailAvailable(null);
        setIsCheckingEmail(false);
        return;
      }

      console.log('🔍 Checking email availability:', { email, storeSlug });
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          storeSlug: storeSlug
        })
      });

      const data = await response.json();
      console.log('📧 Email check response:', data);

      if (response.ok && data.available !== false) {
        // Email is available
        console.log('✅ Email is available');
        setEmailAvailable(true);
        
        // Store success message from backend
        setEmailMessage({
          message: data.message || 'Email is available',
          messageAr: data.messageAr || 'البريد الإلكتروني متاح للاستخدام'
        });
        
        const newErrors = { ...errors };
        delete newErrors.email;
        setErrors(newErrors);
      } else if (!data.available || data.success === false) {
        // Email already exists
        console.log('❌ Email already exists');
        const errorMessage = i18n.language === 'ar' || i18n.language === 'ar-EG'
          ? (data.messageAr || t('signup.emailAlreadyExists'))
          : (data.message || t('signup.emailAlreadyExists'));
        
        setEmailAvailable(false);
        setEmailMessage(null);
        setErrors({ ...errors, email: errorMessage });
      } else {
        setEmailAvailable(null);
        setEmailMessage(null);
      }
    } catch (error) {
      console.error('❌ Error checking email:', error);
      setEmailAvailable(null);
    } finally {
      setIsCheckingEmail(false);
    }
  }, [isEdit, errors, setErrors, t]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }

    // Check for email availability via API with debounce
    if (name === 'email') {
      // Clear previous timeout
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        checkEmailAvailability(value);
      }, 500); // 500ms debounce
      
      setEmailCheckTimeout(timeout);
    }
  };

  const handlePhoneChange = (value: string) => {
    const newForm = { ...form, mobile: value };
    setForm(newForm);
    
    // Clear error for mobile field when user starts typing
    if (errors.mobile) {
      const newErrors = { ...errors };
      delete newErrors.mobile;
      setErrors(newErrors);
    }
    
    // التحقق من رقم الهاتف في الوقت الحقيقي (real-time validation)
    // if (value && value.trim() !== '') {
    //   setTimeout(() => {
    //     const mobileError = validateWhatsApp(value, t);
    //     if (mobileError) {
    //       setErrors(prev => ({ ...prev, mobile: mobileError }));
    //     }
    //   }, 500);
    // }
  };

  const handleSave = async () => {
    // Check if email is available before proceeding (for new wholesalers)
    if (!isEdit && (emailAvailable === false || isCheckingEmail)) {
      const newErrors = { 
        ...errors, 
        email: t('users.emailNotAvailable') || 'Email is not available or still being checked'
      };
      setErrors(newErrors);
      return;
    }

    // Prepare form data for validation
    const formData = {
      ...form,
      id: initialData?._id,
      store: {
        _id: storeId
      }
    };

    // Validate using the general validation system
    const validation = validateWholesalerWithDuplicates(
      formData as any,
      wholesalers || [],
      t,
      storeId
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear errors on successful validation
    clearAllErrors();

    try {
      // Prepare data with store object containing _id
      const dataToSend = {
        ...form,
        store: {
          _id: storeId
        }
      };

      // Remove password if it's empty during edit (to keep current password)
      if (isEdit && (!dataToSend.password || dataToSend.password.trim() === '')) {
        delete dataToSend.password;
      }

      if (isEdit && initialData?._id) {
        await updateWholesaler(initialData._id, dataToSend as any);
      } else {
        await createWholesaler(dataToSend as any);
      }
      onSaveSuccess();
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col max-h-[90vh] ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
          <span className="text-xl font-bold text-primary">{title}</span>
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl">×</button>
        </div>
        
        {/* Form */}
        <div className="p-6 flex-1 overflow-y-auto">
          <SallersForm 
            form={form} 
            onFormChange={handleFormChange} 
            onPhoneChange={handlePhoneChange}
            isRTL={isRTL} 
            isEdit={isEdit} 
            errors={errors}
            isCheckingEmail={isCheckingEmail}
            emailAvailable={emailAvailable}
            emailMessage={emailMessage}
          />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel') || 'Cancel'}
            action={onClose}
            bordercolor="primary"
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={t('common.save') || 'Save'}
            action={handleSave}
            disabled={!isEdit && (emailAvailable === false || isCheckingEmail)}
          />
        </div>
      </div>
    </div>
  );
};

export default SallersDrawer;
