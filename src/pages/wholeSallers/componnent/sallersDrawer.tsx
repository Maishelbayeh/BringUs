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
  const { t } = useTranslation();
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
  const [emailMessage] = useState<{ message: string; messageAr: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(false);
      
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

  // Function to check email duplicates in real-time
  const checkEmailDuplicate = useCallback((email: string) => {
    if (!email.trim() || !wholesalers?.length) return;

    console.log('All wholesalers:', wholesalers);
    console.log('Current store ID:', storeId);
    console.log('Checking email:', email);

    const duplicate = wholesalers.find((w: any) => {
      // Skip self when editing
      if (w._id === initialData?._id) {
        return false;
      }
      
      // Check if same store
      const wholesalerStoreId = w.store?._id || w.store || w.storeId;
      if (wholesalerStoreId !== storeId) {
        return false;
      }
      
      return w.email?.trim().toLowerCase() === email.trim().toLowerCase();
    });

    console.log('Duplicate found:', duplicate);

    setErrors((prevErrors: any) => {
      if (duplicate) {
        return { ...prevErrors, email: t('validation.duplicateEmailInStore') };
      } else {
        // Clear email error if no duplicate
        const newErrors = { ...prevErrors };
        delete newErrors.email;
        return newErrors;
      }
    });
  }, [wholesalers, storeId, initialData?._id, t]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    
    // Clear error for this field when user starts typing
    setErrors((prevErrors) => {
      if (prevErrors[name]) {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      }
      return prevErrors;
    });

    // Check for email duplicate in real-time
    if (name === 'email' && value.trim() !== '') {
      setTimeout(() => {
        checkEmailDuplicate(value);
      }, 300); // Wait 300ms after user stops typing
    }
  };

  const handlePhoneChange = (value: string) => {
    const newForm = { ...form, mobile: value };
    setForm(newForm);
    
    // Clear error for mobile field when user starts typing
    setErrors((prevErrors) => {
      if (prevErrors.mobile) {
        const newErrors = { ...prevErrors };
        delete newErrors.mobile;
        return newErrors;
      }
      return prevErrors;
    });
    
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
      setIsSaving(true);
      
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
    } finally {
      setIsSaving(false);
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
            disabled={(!isEdit && (emailAvailable === false || isCheckingEmail)) || isSaving}
            loading={isSaving}
            loadingText={t('common.saving') || 'Saving...'}
          />
        </div>
      </div>
    </div>
  );
};

export default SallersDrawer;
