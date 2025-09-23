// src/components/PaymentMethods/componant/PaymentForm.tsx
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';
import CustomFileInput from '../../../components/common/CustomFileInput';
import CustomSelect from '../../../components/common/CustomSelect';
import CustomInput from '../../../components/common/CustomInput';
import CustomTextArea from '../../../components/common/CustomTextArea';
import CustomSwitch from '../../../components/common/CustomSwitch';
import { validatePaymentForm } from './paymentValidation';
import { createImageValidationFunction } from '../../../validation/imageValidation';

interface Props {
  method: PaymentMethod | null;
  onSubmit: (m: PaymentMethod & { 
    logoFile?: File | null;
    qrCodeFile?: File | null;
    paymentImageFiles?: Array<{
      file: File;
      imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other' | 'lahza';
      altText: string;
    }>;
  }) => void;
  onCancel: () => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

interface ValidationErrors {
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  methodType?: string;
  logoUrl?: string;
  file?: string;
  qrCode?: string;
  paymentImages?: string;
}

export interface PaymentFormRef {
  handleSubmit: () => void;
}

const PaymentForm = forwardRef<PaymentFormRef, Props>(({ method, onSubmit, language, onValidationChange, isEditMode }, ref) => {
  const { t } = useTranslation();
  const isRTL = language === 'ARABIC';
  
  // Create image validation function
  const imageValidator = createImageValidationFunction(t);

  // Form state
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    methodType: 'other',
    isActive: true,
    isDefault: false,
    qrCode: {
      enabled: false,
      qrCodeUrl: '',
      qrCodeImage: '',
      qrCodeData: ''
    },
    paymentImages: []
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [paymentImageFiles, setPaymentImageFiles] = useState<Array<{
    file: File;
    imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other' | 'lahza';
    altText: string;
  }>>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Expose handleSubmit function to parent
  useImperativeHandle(ref, () => ({
    handleSubmit: () => {
      if (validateForm()) {
        const newMethod: PaymentMethod & {
          logoFile?: File | null;
          qrCodeFile?: File | null;
          paymentImageFiles?: Array<{
            file: File;
            imageType: 'logo' | 'banner' | 'qr_code' | 'payment_screenshot' | 'other' | 'lahza';
            altText: string;
          }>;
        } = {
          _id: method?._id,
          id: method?.id,
          titleAr: formData.titleAr || '',
          titleEn: formData.titleEn || '',
          descriptionAr: formData.descriptionAr || '',
          descriptionEn: formData.descriptionEn || '',
          methodType: formData.methodType || 'other',
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          isDefault: formData.isDefault !== undefined ? formData.isDefault : false,
          logoUrl: method?.logoUrl,
          qrCode: formData.qrCode,
          paymentImages: formData.paymentImages || [],
          store: method?.store,
          createdAt: method?.createdAt,
          updatedAt: new Date().toISOString(),
          // Add file data
          logoFile: logoFile,
          qrCodeFile: qrCodeFile,
          paymentImageFiles: paymentImageFiles,
        };

        onSubmit(newMethod);
      }
    }
  }));

  // Available payment method types
  const METHOD_TYPES = [
    { value: 'lahza', label: t('paymentMethods.methodTypes.lahza') },
    { value: 'cash', label: t('paymentMethods.methodTypes.cash') },
    { value: 'card', label: t('paymentMethods.methodTypes.card') },
    { value: 'digital_wallet', label: t('paymentMethods.methodTypes.digital_wallet') },
    { value: 'bank_transfer', label: t('paymentMethods.methodTypes.bank_transfer') },
    { value: 'qr_code', label: t('paymentMethods.methodTypes.qr_code') },
    { value: 'other', label: t('paymentMethods.methodTypes.other') },
  ];

  // Image type options
  const IMAGE_TYPES = [
    { value: 'lahza', label: t('paymentMethods.methodTypes.lahza') },
    { value: 'logo', label: t('paymentMethods.imageTypes.logo') },
    { value: 'banner', label: t('paymentMethods.imageTypes.banner') },
    { value: 'qr_code', label: t('paymentMethods.imageTypes.qr_code') },
    { value: 'payment_screenshot', label: t('paymentMethods.imageTypes.payment_screenshot') },
    { value: 'other', label: t('paymentMethods.imageTypes.other') },
  ];

  useEffect(() => {
    if (method) {
      setFormData({
        titleAr: method.titleAr || '',
        titleEn: method.titleEn || '',
        descriptionAr: method.descriptionAr || '',
        descriptionEn: method.descriptionEn || '',
        methodType: method.methodType || 'other',
        isActive: method.isActive !== undefined ? method.isActive : true,
        isDefault: method.isDefault || false,
        qrCode: method.qrCode || {
          enabled: false,
          qrCodeUrl: '',
          qrCodeImage: '',
          qrCodeData: ''
        },
        paymentImages: method.paymentImages || []
      });
    } else {
      setFormData({
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        methodType: 'other',
        isActive: true,
        isDefault: false,
        qrCode: {
          enabled: false,
          qrCodeUrl: '',
          qrCodeImage: '',
          qrCodeData: ''
        },
        paymentImages: []
      });
    }
    setLogoFile(null);
    setQrCodeFile(null);
    setPaymentImageFiles([]);
    setErrors({});
  }, [method]);

  // Validate form whenever formData changes
  useEffect(() => {
    validateForm();
  }, [formData, logoFile, qrCodeFile, paymentImageFiles]);

  // Initial validation when component mounts or method changes
  useEffect(() => {
    const isValid = validateForm();
    
    // For edit mode, if we have a method, the form should be valid by default
    if (isEditMode && method) {
      if (onValidationChange) {
        onValidationChange(true);
      }
    } else {
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }
  }, [method, isEditMode, onValidationChange]);

  const validateForm = (): boolean => {
    const validationData = {
      titleAr: formData.titleAr || '',
      titleEn: formData.titleEn || '',
      descriptionAr: formData.descriptionAr || '',
      descriptionEn: formData.descriptionEn || '',
      methodType: formData.methodType || '',
      logoUrl: method?.logoUrl || '',
      logoFile: logoFile,
      qrCode: formData.qrCode,
      paymentImages: formData.paymentImages || []
    };

    const validationErrors = validatePaymentForm(validationData, t, isEditMode);
    setErrors(validationErrors);
    
    const isValid = Object.keys(validationErrors).length === 0;
    
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

  const handleLogoFileChange = (files: File | File[] | null) => {
    if (files instanceof File) {
      setLogoFile(files);
    } else if (Array.isArray(files) && files.length > 0) {
      setLogoFile(files[0]);
    } else {
      setLogoFile(null);
    }
    clearError('file');
  };

  const handleQrCodeFileChange = (files: File | File[] | null) => {
    if (files instanceof File) {
      setQrCodeFile(files);
    } else if (Array.isArray(files) && files.length > 0) {
      setQrCodeFile(files[0]);
    } else {
      setQrCodeFile(null);
    }
    clearError('qrCode');
  };

  const handlePaymentImageFileChange = (files: File | File[] | null, index: number) => {
    if (files instanceof File) {
      setPaymentImageFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], file: files };
        return newFiles;
      });
    } else if (Array.isArray(files) && files.length > 0) {
      setPaymentImageFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { ...newFiles[index], file: files[0] };
        return newFiles;
      });
    }
    clearError('paymentImages');
  };

  const addPaymentImage = () => {
    setPaymentImageFiles(prev => [...prev, {
      file: new File([], ''),
      imageType: 'other',
      altText: ''
    }]);
  };

  const removePaymentImage = (index: number) => {
    setPaymentImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updatePaymentImage = (index: number, field: 'imageType' | 'altText', value: string) => {
    setPaymentImageFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], [field]: value };
      return newFiles;
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field as keyof ValidationErrors);
  };

  const handleQrCodeChange = (field: 'enabled' | 'qrCodeUrl' | 'qrCodeImage' | 'qrCodeData', value: any) => {
    setFormData(prev => ({
      ...prev,
      qrCode: {
        ...prev.qrCode!,
        [field]: value
      }
    }));
    clearError('qrCode');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Description Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Active Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomSwitch
          label={t('paymentMethods.isActive')}
          name="isActive"
          checked={formData.isActive !== undefined ? formData.isActive : true}
          onChange={(e) => handleInputChange('isActive', e.target.checked)}
         
        />

        {/* Default Status */}
        <CustomSwitch
          label={t('paymentMethods.isDefault')}
          name="isDefault"
          checked={formData.isDefault !== undefined ? formData.isDefault : false}
          onChange={(e) => handleInputChange('isDefault', e.target.checked)}
         
        />
</div>
        {/* QR Code Section */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">{t('paymentMethods.qrCode')}</h3>
          
          <CustomSwitch
            label={t('paymentMethods.qrCodeEnabled')}
            name="qrCodeEnabled"
            checked={formData.qrCode?.enabled || false}
            onChange={(e) => handleQrCodeChange('enabled', e.target.checked)}
          />

          {formData.qrCode?.enabled && (
            <div className="mt-4 space-y-4">
              <CustomInput
                label={t('paymentMethods.qrCodeUrl')}
                value={formData.qrCode?.qrCodeUrl || ''}
                onChange={(e) => handleQrCodeChange('qrCodeUrl', e.target.value)}
                placeholder={t('paymentMethods.qrCodeUrlPlaceholder')}
              />
              
              <CustomTextArea
                label={t('paymentMethods.qrCodeData')}
                value={formData.qrCode?.qrCodeData || ''}
                onChange={(e) => handleQrCodeChange('qrCodeData', e.target.value)}
                placeholder={t('paymentMethods.qrCodeDataPlaceholder')}
                rows={2}
              />

              <CustomFileInput
                label={t('paymentMethods.qrCodeImage')}
                id="qr_code_image"
                value={qrCodeFile ? qrCodeFile.name : ''}
                onChange={handleQrCodeFileChange}
                placeholder={t('paymentMethods.chooseFile')}
                style={{ textAlign: isRTL ? 'right' : 'left' }}
                beforeChangeValidate={imageValidator}
              />
            </div>
          )}
        </div>

        {/* Logo Upload */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">{t('paymentMethods.logo')}</h3>
          
          <CustomFileInput
            label={t('paymentMethods.logoImage')}
            id="payment_logo"
            value={logoFile ? logoFile.name : ''}
            onChange={handleLogoFileChange}
            placeholder={t('paymentMethods.chooseFile')}
            style={{ textAlign: isRTL ? 'right' : 'left' }}
            beforeChangeValidate={imageValidator}
          />

          {/* File validation error */}
          {errors.file && (
            <div className="text-red-500 text-xs mt-1">
              {errors.file}
            </div>
          )}

          {/* Preview current logo if exists */}
          {method?.logoUrl && !logoFile && (
            <div className="flex items-center gap-3 mt-2">
              <img 
                src={method.logoUrl} 
                alt={method.titleAr} 
                className="w-16 h-16 rounded-lg object-contain border"
              />
              <span className="text-sm text-gray-600">
                {t('common.currentImage')}
              </span>
            </div>
          )}
        </div>

        {/* Payment Images Section */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{t('paymentMethods.paymentImages')}</h3>
            <button
              type="button"
              onClick={addPaymentImage}
              className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark"
            >
              {t('paymentMethods.addImage')}
            </button>
          </div>

          {paymentImageFiles.map((imageFile, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{t('paymentMethods.image')} {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removePaymentImage(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  {t('common.remove')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFileInput
                  label={t('paymentMethods.imageFile')}
                  id={`payment_image_${index}`}
                  value={imageFile.file.name || ''}
                  onChange={(files) => handlePaymentImageFileChange(files, index)}
                  placeholder={t('paymentMethods.chooseFile')}
                  beforeChangeValidate={imageValidator}
                />

                <CustomSelect
                  label={t('paymentMethods.imageType')}
                  value={imageFile.imageType}
                  onChange={(e) => updatePaymentImage(index, 'imageType', e.target.value)}
                  options={IMAGE_TYPES}
                />

                <CustomInput
                  label={t('paymentMethods.altText')}
                  value={imageFile.altText}
                  onChange={(e) => updatePaymentImage(index, 'altText', e.target.value)}
                  placeholder={t('paymentMethods.altTextPlaceholder')}
                />
              </div>
            </div>
          ))}

          {/* Show existing payment images */}
          {method?.paymentImages && method.paymentImages.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">{t('paymentMethods.existingImages')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {method.paymentImages.map((image, index) => (
                  <div key={index} className="text-center">
                    <img 
                      src={image.imageUrl} 
                      alt={image.altText || 'Payment image'} 
                      className="w-20 h-20 rounded-lg object-cover border mx-auto"
                    />
                    <p className="text-xs text-gray-600 mt-1">{image.imageType}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
   
      </div>
    </div>
  );
});

PaymentForm.displayName = 'PaymentForm';

export default PaymentForm;
