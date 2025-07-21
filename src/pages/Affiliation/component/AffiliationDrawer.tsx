import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../../components/common/CustomButton';
import AffiliationForm from './AffiliationForm';
import { useValidation } from '../../../hooks/useValidation';
import { affiliateValidationSchema, validateAffiliateWithDuplicates } from '../../../validation/affiliateValidation';

interface AffiliationDrawerProps {
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  title: string;
  initialData?: any;
  onSaveSuccess: () => void;
  isEdit: boolean;
  affiliates: any[];
}

interface Affiliate {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobile: string;
  percent: number;
  status: string;
  address: string;
  link: string;
}

const AffiliationDrawer: React.FC<AffiliationDrawerProps> = ({ 
  open, 
  onClose, 
  isRTL, 
  title, 
  initialData, 
  onSaveSuccess, 
  isEdit,
  affiliates 
}) => {
  const { t } = useTranslation();
  
  const { errors, setErrors, clearAllErrors } = useValidation({
    schema: affiliateValidationSchema
  });
  
  const [form, setForm] = useState<Partial<Affiliate>>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    mobile: '',
    percent: 0,
    status: 'Active',
    address: '',
    link: ''
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData);
      } else {
        setForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          mobile: '',
          percent: 0,
          status: 'Active',
          address: '',
          link: ''
        });
      }
      clearAllErrors();
    }
  }, [open, initialData, clearAllErrors]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSave = () => {
    // Prepare form data for validation
    const formData = {
      ...form,
      id: initialData?.id,
      percent: Number(form.percent) // Ensure percent is a number
    };

    // Validate using the general validation system
    const validation = validateAffiliateWithDuplicates(
      formData as any,
      affiliates || [],
      t
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear errors on successful validation
    clearAllErrors();

    // Call the parent's save function
    onSaveSuccess();
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
          <AffiliationForm 
            form={form} 
            onFormChange={handleFormChange} 
            isRTL={isRTL} 
            errors={errors}
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
          />
        </div>
      </div>
    </div>
  );
};

export default AffiliationDrawer;
