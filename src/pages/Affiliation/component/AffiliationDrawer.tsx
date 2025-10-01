import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomButton from '../../../components/common/CustomButton';
import AffiliationForm from './AffiliationForm';
import { useValidation } from '../../../hooks/useValidation';
import { affiliateValidationSchema, validateAffiliateWithDuplicates } from '../../../validation/affiliateValidation';
import useAffiliations from '../../../hooks/useAffiliations';
import { getStoreId, generateAffiliateLink, isAffiliateLinkUnique } from '../../../utils/storeUtils';

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
  affiliateLink: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
  };
  settings: {
    autoPayment: boolean;
    paymentThreshold: number;
    paymentMethod: string;
  };
  notes: string;
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
  const { createAffiliate, updateAffiliate } = useAffiliations();
  
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
    affiliateLink: '',
    bankInfo: {
      bankName: '',
      accountNumber: '',
      iban: '',
      swiftCode: ''
    },
    settings: {
      autoPayment: false,
      paymentThreshold: 100,
      paymentMethod: 'bank_transfer'
    },
    notes: ''
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        // تحويل البيانات من API إلى شكل النموذج
        const formData = {
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          email: initialData.email || '',
          password: '', // لا نعرض كلمة المرور في التعديل
          mobile: initialData.mobile || '',
          address: initialData.address || '',
          percent: initialData.percent || 0,
          status: initialData.status || 'Active',
          bankInfo: initialData.bankInfo || {
            bankName: '',
            accountNumber: '',
            iban: '',
            swiftCode: ''
          },
          settings: initialData.settings || {
            autoPayment: false,
            paymentThreshold: 100,
            paymentMethod: 'bank_transfer'
          },
          notes: initialData.notes || ''
        };
        setForm(formData);
      } else {
        // إنشاء رابط مسوق فريد عند إضافة مسوق جديد
        let uniqueLink = '';
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!uniqueLink && attempts < maxAttempts) {
          const generatedLink = generateAffiliateLink();
          if (generatedLink && isAffiliateLinkUnique(generatedLink, affiliates || [])) {
            uniqueLink = generatedLink;
          }
          attempts++;
        }
        
        setForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          mobile: '',
          percent: 0,
          status: 'Active',
          address: '',
          affiliateLink: uniqueLink,
          bankInfo: {
            bankName: '',
            accountNumber: '',
            iban: '',
            swiftCode: ''
          },
          settings: {
            autoPayment: false,
            paymentThreshold: 100,
            paymentMethod: 'bank_transfer'
          },
          notes: ''
        });
      }
      clearAllErrors();
    }
  }, [open, initialData, clearAllErrors, affiliates]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested object properties (e.g., bankInfo.bankName)
    if (name && name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else if (name) {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    
    // Clear general error when user starts typing
    if (errors.general) {
      const newErrors = { ...errors };
      delete newErrors.general;
      setErrors(newErrors);
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
  };

  const handleSave = async () => {
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

    try {
      // Check required fields
      if (!form.firstName || !form.lastName || !form.email || !form.password || !form.mobile || !form.address) {
        setErrors({ general: 'جميع الحقول المطلوبة يجب ملؤها' });
        return;
      }

      // Prepare data for API
      const apiData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        address: form.address,
        affiliateLink: form.affiliateLink || '',
        percent: Number(form.percent) || 0,
        store: {
          _id: getStoreId()
        },
        status: form.status || 'Active',
        bankInfo: form.bankInfo || {
          bankName: '',
          accountNumber: '',
          iban: '',
          swiftCode: ''
        },
        settings: form.settings || {
          autoPayment: false,
          paymentThreshold: 100,
          paymentMethod: 'bank_transfer'
        },
        notes: form.notes || ''
      };

      if (isEdit && (initialData?._id || initialData?.id)) {
        // Update existing affiliate
        await updateAffiliate({
          _id: initialData._id || initialData.id,
          ...apiData
        });
      } else {
        // Create new affiliate
        await createAffiliate(apiData);
      }

      // Call the parent's save function
      onSaveSuccess();
    } catch (error) {
      console.error('Error saving affiliate:', error);
      // You can add error handling here if needed
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
          <AffiliationForm 
            form={form} 
            onFormChange={handleFormChange} 
            onPhoneChange={handlePhoneChange}
            isRTL={isRTL} 
            errors={errors}
            affiliates={affiliates}
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
