// src/components/PaymentMethods/componant/PaymentForm.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
  import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import CustomFileInput from '../../../components/common/CustomFileInput';
import CustomSelect from '../../../components/common/CustomSelect';
import CustomInput from '../../../components/common/CustomInput';
import CustomTextArea from '../../../components/common/CustomTextArea';
import CustomNumberInput from '../../../components/common/CustomNumberInput';
import CustomSwitch from '../../../components/common/CustomSwitch';
import CustomShuttle from '../../../components/common/CustomShuttle';
import { validatePaymentForm } from './paymentValidation';

interface Props {
  method: PaymentMethod | null;
  onSubmit: (m: PaymentMethod) => void;
  onCancel: () => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

interface ValidationErrors {
  title?: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  methodType?: string;
  processingFee?: string;
  minimumAmount?: string;
  maximumAmount?: string;
  supportedCurrencies?: string;
  logoUrl?: string;
  file?: string;
}

export interface PaymentFormRef {
  handleSubmit: () => void;
}

const PaymentForm = forwardRef<PaymentFormRef, Props>(({ method, onSubmit,  language, onValidationChange, isEditMode }, ref) => {
  const { t } = useTranslation();
  const isRTL = language === 'ARABIC';

  // Form state
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    title: '',
    titleAr: '',
    titleEn: '',
    description: '',
    descriptionAr: '',
    descriptionEn: '',
    methodType: 'other',
    processingFee: 0,
    minimumAmount: 0,
    maximumAmount: 0,
    isActive: true,
    supportedCurrencies: ['ILS'],
  });

  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Expose handleSubmit function to parent
  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      //CONSOLE.log('PaymentForm handleSubmit called');
      if (validateForm()) {
        //CONSOLE.log('PaymentForm validation passed, submitting...');
        const logoUrl = file ? URL.createObjectURL(file) : method?.logoUrl;
        
        const newMethod: PaymentMethod = {
          id: method?.id || Date.now(),
          title: formData.title || '',
          titleAr: formData.titleAr || '',
          titleEn: formData.titleEn || '',
          description: formData.description || '',
          descriptionAr: formData.descriptionAr || '',
          descriptionEn: formData.descriptionEn || '',
          methodType: formData.methodType || 'other',
          processingFee: formData.processingFee || 0,
          minimumAmount: formData.minimumAmount || 0,
          maximumAmount: formData.maximumAmount || 0,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          supportedCurrencies: formData.supportedCurrencies || ['ILS'],
          logoUrl,
          isDefault: method?.isDefault || false,
          createdAt: method?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        //CONSOLE.log('Submitting payment method:', newMethod);
        onSubmit(newMethod);
      } else {
        //CONSOLE.log('PaymentForm validation failed');
      }
    }
  }));

  // Available payment method types
  const METHOD_TYPES = [
    { value: 'cash', label: t('paymentMethods.methodTypes.cash') },
    { value: 'card', label: t('paymentMethods.methodTypes.card') },
    { value: 'digital_wallet', label: t('paymentMethods.methodTypes.digital_wallet') },
    { value: 'bank_transfer', label: t('paymentMethods.methodTypes.bank_transfer') },
    { value: 'other', label: t('paymentMethods.methodTypes.other') },
  ];

  // Available payment methods
  const AVAILABLE_METHODS = [
    { value: 'cash_on_delivery', label: t('paymentMethods.availableMethods.cash_on_delivery') },
    { value: 'paypal', label: t('paymentMethods.availableMethods.paypal') },
    { value: 'visa_mastercard', label: t('paymentMethods.availableMethods.visa_mastercard') },
    { value: 'stripe', label: t('paymentMethods.availableMethods.stripe') },
    { value: 'apple_pay', label: t('paymentMethods.availableMethods.apple_pay') },
    { value: 'google_pay', label: t('paymentMethods.availableMethods.google_pay') },
    { value: 'bank_transfer', label: t('paymentMethods.availableMethods.bank_transfer') },
    { value: 'western_union', label: t('paymentMethods.availableMethods.western_union') },
    { value: 'moneygram', label: t('paymentMethods.availableMethods.moneygram') },
    { value: 'bitcoin', label: t('paymentMethods.availableMethods.bitcoin') },
    { value: 'ethereum', label: t('paymentMethods.availableMethods.ethereum') },
    { value: 'custom', label: t('paymentMethods.availableMethods.custom') },
  ];

  // Currency options
  const CURRENCIES = [
    { value: 'ILS', label: 'ILS - Israeli Shekel' },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JOD', label: 'JOD - Jordanian Dinar' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'AED', label: 'AED - UAE Dirham' },
  ];

  useEffect(() => {
    if (method) {
      setFormData({
        title: method.title || '',
        titleAr: method.titleAr || '',
        titleEn: method.titleEn || '',
        description: method.description || '',
        descriptionAr: method.descriptionAr || '',
        descriptionEn: method.descriptionEn || '',
        methodType: method.methodType || 'other',
        processingFee: method.processingFee || 0,
        minimumAmount: method.minimumAmount || 0,
        maximumAmount: method.maximumAmount || 0,
        isActive: method.isActive !== undefined ? method.isActive : true,
        supportedCurrencies: method.supportedCurrencies || ['ILS'],
      });
    } else {
      setFormData({
        title: '',
        titleAr: '',
        titleEn: '',
        description: '',
        descriptionAr: '',
        descriptionEn: '',
        methodType: 'other',
        processingFee: 0,
        minimumAmount: 0,
        maximumAmount: 0,
        isActive: true,
        supportedCurrencies: ['ILS'],
      });
    }
    setFile(null);
    setErrors({});
  }, [method]);

  // Validate form whenever formData changes
  useEffect(() => {
    const isValid = validateForm();
    //CONSOLE.log('PaymentForm useEffect - validation result:', isValid);
  }, [formData, file]);

  // Initial validation when component mounts or method changes
  useEffect(() => {
    //CONSOLE.log('PaymentForm initial validation');
    const isValid = validateForm();
    
    // For edit mode, if we have a method, the form should be valid by default
    if (isEditMode && method) {
      //CONSOLE.log('Edit mode with method - setting form as valid');
      if (onValidationChange) {
        onValidationChange(true);
      }
    } else {
      //CONSOLE.log('New mode or no method - validation result:', isValid);
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }
  }, [method, isEditMode, onValidationChange]);

  const validateForm = (): boolean => {
    const validationData = {
      title: formData.title || '',
      titleAr: formData.titleAr || '',
      titleEn: formData.titleEn || '',
      description: formData.description || '',
      descriptionAr: formData.descriptionAr || '',
      descriptionEn: formData.descriptionEn || '',
      methodType: formData.methodType || '',
      processingFee: formData.processingFee?.toString() || '',
      minimumAmount: formData.minimumAmount?.toString() || '',
      maximumAmount: formData.maximumAmount?.toString() || '',
      supportedCurrencies: formData.supportedCurrencies || [],
      logoUrl: method?.logoUrl || '',
      file: file,
    };

    const validationErrors = validatePaymentForm(validationData, t, isEditMode);
    setErrors(validationErrors);
    
    const isValid = Object.keys(validationErrors).length === 0;
    
    //CONSOLE.log('PaymentForm validation result:', isValid, validationErrors);
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    return isValid;
  };

  const clearError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (files: File | File[] | null) => {
    if (files instanceof File) {
      setFile(files);
    } else if (Array.isArray(files) && files.length > 0) {
      setFile(files[0]);
    } else {
      setFile(null);
    }
    clearError('file');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    clearError(field as keyof ValidationErrors);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<{ name: string; value: string[] }>) => {
    setFormData(prev => ({ ...prev, supportedCurrencies: e.target.value }));
    clearError('supportedCurrencies');
  };

  return (
    <div className="flex flex-col p-6">
        <div className="space-y-6">
        
        {/* Payment Method Type */}
          <CustomSelect
          label={t('paymentMethods.methodType')}
          value={formData.methodType || ''}
          onChange={(e) => handleInputChange('methodType', e.target.value)}
          options={METHOD_TYPES}
          error={errors.methodType}
        />

        {/* Title Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomInput
            label={t('paymentMethods.titleAr')}
            value={formData.titleAr || ''}
            onChange={(e) => handleInputChange('titleAr', e.target.value)}
            placeholder={t('paymentMethods.titleAr')}
            error={errors.titleAr}
            required
            dir="rtl"
          />
          <CustomInput
            label={t('paymentMethods.titleEn')}
            value={formData.titleEn || ''}
            onChange={(e) => handleInputChange('titleEn', e.target.value)}
            placeholder={t('paymentMethods.titleEn')}
            error={errors.titleEn}
            required
          />
          <CustomInput
            label={t('paymentMethods.title')}
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder={t('paymentMethods.title')}
            error={errors.title}
            required
          />
        </div>

        {/* Description Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomTextArea
            label={t('paymentMethods.descriptionAr')}
            value={formData.descriptionAr || ''}
            onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
            placeholder={t('paymentMethods.descriptionAr')}
            rows={3}
            error={errors.descriptionAr}
            dir="rtl"
          />
          <CustomTextArea
            label={t('paymentMethods.descriptionEn')}
            value={formData.descriptionEn || ''}
            onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
            placeholder={t('paymentMethods.descriptionEn')}
            rows={3}
            error={errors.descriptionEn}
          />
          <CustomTextArea
            label={t('paymentMethods.description')}
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('paymentMethods.description')}
            rows={3}
            error={errors.description}
          />
      </div>

        {/* Financial Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomNumberInput
            label={t('paymentMethods.processingFee')}
            value={formData.processingFee || 0}
            onChange={(value) => handleInputChange('processingFee', value)}
            placeholder="0"
            min={0}
            max={100}
            step={0.01}
            error={errors.processingFee}
          />
          <CustomNumberInput
            label={t('paymentMethods.minimumAmount')}
            value={formData.minimumAmount || 0}
            onChange={(value) => handleInputChange('minimumAmount', value)}
            placeholder="0"
            min={0}
            error={errors.minimumAmount}
          />
          <CustomNumberInput
            label={t('paymentMethods.maximumAmount')}
            value={formData.maximumAmount || 0}
            onChange={(value) => handleInputChange('maximumAmount', value)}
            placeholder="0"
            min={0}
            error={errors.maximumAmount}
          />
        </div>

        {/* Supported Currencies - Multiple Selection */}
        <CustomShuttle
          label={t('paymentMethods.supportedCurrencies')}
          name="supportedCurrencies"
          value={formData.supportedCurrencies || ['ILS']}
          options={CURRENCIES}
          onChange={handleCurrencyChange}
          isRTL={isRTL}
        />

        {/* Active Status */}
        <CustomSwitch
          label={t('paymentMethods.isActive')}
          name="isActive"
          checked={formData.isActive !== undefined ? formData.isActive : true}
          onChange={(e) => handleInputChange('isActive', e.target.checked)}
        />

        {/* Logo/Image Upload */}
        <CustomFileInput
          label={t('paymentMethods.qrPicture')}
          id="payment_logo"
          value={file ? file.name : ''}
          onChange={handleFileChange}
          placeholder={t('paymentMethods.chooseFile')}
          style={{ textAlign: isRTL ? 'right' : 'left' }}
        />

        {/* File validation error */}
        {errors.file && (
          <div className="text-red-500 text-sm mt-1">
            {errors.file}
          </div>
        )}

        {/* Preview current logo if exists */}
        {method?.logoUrl && !file && (
          <div className="flex items-center gap-3">
            <img 
              src={method.logoUrl} 
              alt={method.title} 
              className="w-16 h-16 rounded-lg object-contain border"
            />
            <span className="text-sm text-gray-600">
              {t('common.currentImage')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

PaymentForm.displayName = 'PaymentForm';

export default PaymentForm;
