import React, { useState, useEffect } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';

import CustomNumberInput from '../../components/common/CustomNumberInput';

import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import CustomTextArea from '../../components/common/CustomTextArea';


import useLanguage from '@/hooks/useLanguage';
import { useTranslation } from 'react-i18next';

const SOCIAL_MEDIA = [
  { key: 'facebook', labelAr: 'فيسبوك', labelEn: 'Facebook' },
  { key: 'instagram', labelAr: 'انستقرام', labelEn: 'Instagram' },
  { key: 'twitter', labelAr: 'تويتر', labelEn: 'Twitter' },
  { key: 'youtube', labelAr: 'يوتيوب', labelEn: 'YouTube' },
  { key: 'linkedin', labelAr: 'لينكد إن', labelEn: 'LinkedIn' },
  { key: 'telegram', labelAr: 'تليجرام', labelEn: 'Telegram' },
  { key: 'snapchat', labelAr: 'سناب شات', labelEn: 'Snapchat' },
  { key: 'pinterest', labelAr: 'بينتيريست', labelEn: 'Pinterest' },
  { key: 'tiktok', labelAr: 'تيك توك', labelEn: 'TikTok' },
];

interface StoreGeneralInfoProps {
  onSubmit?: (data: any) => void;
  onValidate?: (isValid: boolean) => void;
}

const StoreGeneralInfo: React.FC<StoreGeneralInfoProps> = ({ onSubmit, onValidate }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { t } = useTranslation();
  
  const [form, setForm] = useState({
    // معلومات أساسية
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    slug: '',
    
    // لوجو
    logo: {
      public_id: null,
      url: null
    },
    
    // إعدادات المتجر
    settings: {
      mainColor: '#1976d2',
      language: 'ar',
      storeDiscount: 0,
      timezone: 'Asia/Amman',
      taxRate: 0,
      shippingEnabled: true,
      storeSocials: SOCIAL_MEDIA.reduce((acc, s) => ({ ...acc, [s.key]: '' }), {} as Record<string, string>),
    },
    
    // معلومات التواصل
    whatsappNumber: '',
    contact: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    }
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // حالة الفالديشن
  const [errors, setErrors] = useState<{
    nameAr?: string;
    nameEn?: string;
    slug?: string;
    email?: string;
    phone?: string;
    whatsappNumber?: string;
  }>({});

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'nameAr':
        if (!value.trim()) {
          error = t('store.nameArRequired');
        } else if (value.length < 3) {
          error = t('store.nameArMinLength');
        }
        break;
      case 'nameEn':
        if (!value.trim()) {
          error = t('store.nameEnRequired');
        } else if (value.length < 3) {
          error = t('store.nameEnMinLength');
        }
        break;
      case 'slug':
        if (!value.trim()) {
          error = t('store.slugRequired');
        } else if (!/^[a-z0-9-]+$/.test(value)) {
          error = t('store.slugInvalid');
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = t('store.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = t('store.emailInvalid');
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = t('store.phoneRequired');
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
          error = t('store.phoneInvalid');
        }
        break;
      case 'whatsappNumber':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
          error = t('store.whatsappInvalid');
        }
        break;
    }
    
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // الفالديشن المباشر
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleDescriptionChange = (field: 'descriptionAr' | 'descriptionEn', e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };



  const handleLogoChange = (fileOrFiles: File | File[] | null) => {
    let file: File | null = null;
    if (Array.isArray(fileOrFiles)) {
      file = fileOrFiles[0] || null;
    } else {
      file = fileOrFiles;
    }
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      // عند رفع الصورة للسيرفر، خزّن الرابط في form.logo
      // setForm(prev => ({ ...prev, logo: { public_id: 'id', url: uploadedUrl } }));
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleSocialChange = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        storeSocials: { ...prev.settings.storeSocials, [key]: value },
      }
    }));
  };

  const handleTaxRateChange = (value: number) => {
    setForm(prev => ({
      ...prev,
      settings: { ...prev.settings, taxRate: value }
    }));
  };

  const handleDiscountChange = (value: number) => {
    setForm(prev => ({
      ...prev,
      settings: { ...prev.settings, storeDiscount: value }
    }));
  };

  const handlePhoneChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      contact: { ...prev.contact, phone: value }
    }));
    
    // الفالديشن للهاتف
    const error = validateField('phone', value);
    setErrors(prev => ({
      ...prev,
      phone: error
    }));
  };

  const handleWhatsAppChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      whatsappNumber: value
    }));
    
    // الفالديشن للواتساب
    const error = validateField('whatsappNumber', value);
    setErrors(prev => ({
      ...prev,
      whatsappNumber: error
    }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    // التحقق من جميع الحقول المطلوبة
    newErrors.nameAr = validateField('nameAr', form.nameAr);
    newErrors.nameEn = validateField('nameEn', form.nameEn);
    newErrors.slug = validateField('slug', form.slug);
    newErrors.email = validateField('email', form.contact.email);
    newErrors.phone = validateField('phone', form.contact.phone);
    newErrors.whatsappNumber = validateField('whatsappNumber', form.whatsappNumber);
    
    setErrors(newErrors);
    
    // إرجاع true إذا لم تكن هناك أخطاء
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // التحقق من صحة النموذج قبل الإرسال
    if (!validateForm()) {
      console.log('❌ النموذج يحتوي على أخطاء، لا يمكن الإرسال');
      return;
    }
    
    console.log('✅ النموذج صحيح، جاري الإرسال...');
    console.log('Store General Info:', form);
    if (logoFile) {
      console.log('Logo file:', logoFile);
    }
    
    if (onSubmit) {
      onSubmit({ ...form, status: 'suspended' });
    }
  };

  // حفظ البيانات تلقائياً عند أي تغيير
  useEffect(() => {
    if (onSubmit && Object.keys(form).length > 0) {
      // تأخير بسيط لتجنب استدعاء onSubmit كثيراً
      const timeoutId = setTimeout(() => {
        console.log('💾 حفظ بيانات المتجر تلقائياً:', form);
        onSubmit(form);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [form, onSubmit]);

  // إرسال حالة الفالديشن للويزرد
  useEffect(() => {
    if (onValidate) {
      // التحقق من أن جميع الحقول المطلوبة مملوءة وصحيحة
      const hasRequiredFields = Boolean(form.nameAr.trim() && 
                               form.nameEn.trim() && 
                               form.slug.trim() && 
                               form.contact.email.trim() && 
                               form.contact.phone.trim());
      
      const hasNoErrors = !Object.values(errors).some(error => !!error);
      
      // التحقق من صحة البريد الإلكتروني
      const isEmailValid = Boolean(form.contact.email.trim() && /\S+@\S+\.\S+/.test(form.contact.email));
      
      // التحقق من صحة رقم الهاتف
      const isPhoneValid = Boolean(form.contact.phone.trim() && /^[\+]?[1-9][\d]{0,15}$/.test(form.contact.phone.replace(/\s/g, '')));
      
      const isValid = hasRequiredFields && hasNoErrors && isEmailValid && isPhoneValid;
      
      console.log('🔍 Store Validation Check:', {
        hasRequiredFields,
        hasNoErrors,
        isEmailValid,
        isPhoneValid,
        isValid,
        errors,
        formData: {
          nameAr: form.nameAr,
          nameEn: form.nameEn,
          slug: form.slug,
          email: form.contact.email,
          phone: form.contact.phone
        }
      });
      
      onValidate(isValid);
    }
  }, [errors, form, onValidate]);

  return (
    <form onSubmit={handleSubmit}>
      {/* معلومات المتجر الأساسية */}
      <div className="mb-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.basicInfo')}
        </h3>
        
        {/* اسم المتجر بالعربي */}
        <div className="mb-4">
          <CustomInput
            label={t('store.nameAr')}
            name="nameAr"
            value={form.nameAr}
            onChange={handleChange}
            required
            placeholder={t('store.nameArPlaceholder')}
            error={errors.nameAr}
          />
        </div>

        {/* اسم المتجر بالإنجليزي */}
        <div className="mb-4">
          <CustomInput
            label={t('store.nameEn')}
            name="nameEn"
            value={form.nameEn}
            onChange={handleChange}
            required
            placeholder={t('store.nameEnPlaceholder')}
            error={errors.nameEn}
          />
        </div>

        {/* وصف المتجر بالعربي */}
        <div className="mb-4">
          <CustomTextArea
            label={t('store.descriptionAr')}
            value={form.descriptionAr}
            onChange={(e) => handleDescriptionChange('descriptionAr', e)}
            placeholder={t('store.descriptionArPlaceholder')}
          />
        </div>

        {/* وصف المتجر بالإنجليزي */}
        <div className="mb-4">
          <CustomTextArea
            label={t('store.descriptionEn')}
            value={form.descriptionEn}
            onChange={(e) => handleDescriptionChange('descriptionEn', e)}
            placeholder={t('store.descriptionEnPlaceholder')}
          />
        </div>

        {/* رابط المتجر */}
        <div className="mb-4">
          <CustomInput
            label={t('store.slug')}
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            placeholder={t('store.slugPlaceholder')}
            error={errors.slug}
          />
        </div>
      </div>

      {/* لوجو المتجر */}
      <div className="mb-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.logo')}
        </h3>
        <CustomFileInput
          label={t('store.uploadLogo')}
          onChange={handleLogoChange}
        />
        {logoPreview && (
          <img src={logoPreview} alt="Logo Preview" className="mt-2 h-20" />
        )}
      </div>

      {/* إعدادات المتجر */}
      <div className="mb-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.settings')}
        </h3>
        
        {/* لون المتجر */}
        <div className="mb-4">
          <div className="flex flex-col gap-2">
            <label className="block mb-1 text-sm font-medium text-gray-900">{t('store.mainColor')}</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.settings.mainColor}
                onChange={(e) => {
                  console.log('Color changed to:', e.target.value);
                  setForm(prev => ({
                    ...prev,
                    settings: { ...prev.settings, mainColor: e.target.value }
                  }));
                }}
                className="w-12 h-12 rounded-full border-2 border-gray-300 shadow cursor-pointer"
                style={{ background: form.settings.mainColor }}
              />
              <span className="text-sm text-gray-600 font-mono">{form.settings.mainColor}</span>
            </div>
          </div>
        </div>

        {/* نسبة الخصم */}
        <div className="mb-4">
          <CustomNumberInput
            label={t('store.discount')}
            value={form.settings.storeDiscount}
            onChange={handleDiscountChange}
            min={0}
            max={100}
            placeholder={t('store.discountPlaceholder')}
          />
        </div>

        {/* الضريبة */}
        <div className="mb-4">
          <CustomNumberInput
            label={t('store.taxRate')}
            value={form.settings.taxRate}
            onChange={handleTaxRateChange}
            min={0}
            max={100}
            placeholder={t('store.taxRatePlaceholder')}
          />
        </div>
      </div>

      {/* معلومات التواصل */}
      <div className="mb-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.contactInfo')}
        </h3>
        
        {/* رقم الهاتف */}
        <div className="mb-4">
          <CustomPhoneInput
            label={t('store.phone')}
            value={form.contact.phone}
            onChange={handlePhoneChange}
            required
            error={errors.phone}
          />
        </div>

        {/* رقم الواتساب */}
        <div className="mb-4">
          <CustomPhoneInput
            label={t('store.whatsapp')}
            value={form.whatsappNumber}
            onChange={handleWhatsAppChange}
            placeholder={t('store.whatsappPlaceholder')}
            error={errors.whatsappNumber}
          />
        </div>

        {/* البريد الإلكتروني */}
        <div className="mb-4">
          <CustomInput
            label={t('store.email')}
            name="email"
            type="email"
            value={form.contact.email}
            onChange={(e) => {
              setForm(prev => ({
                ...prev,
                contact: { ...prev.contact, email: e.target.value }
              }));
              
              // الفالديشن للبريد الإلكتروني
              const error = validateField('email', e.target.value);
              setErrors(prev => ({
                ...prev,
                email: error
              }));
            }}
            required
            placeholder={t('store.emailPlaceholder')}
            error={errors.email}
          />
        </div>
        {/* حقول العنوان */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label={t('signup.street')}
            name="street"
            value={form.contact.address.street}
            onChange={e => setForm(prev => ({
              ...prev,
              contact: {
                ...prev.contact,
                address: { ...prev.contact.address, street: e.target.value }
              }
            }))}
            placeholder={t('signup.streetPlaceholder')}
          />
          <CustomInput
            label={t('signup.city')}
            name="city"
            value={form.contact.address.city}
            onChange={e => setForm(prev => ({
              ...prev,
              contact: {
                ...prev.contact,
                address: { ...prev.contact.address, city: e.target.value }
              }
            }))}
            placeholder={t('signup.cityPlaceholder')}
          />
          <CustomInput
            label={t('signup.state')}
            name="state"
            value={form.contact.address.state}
            onChange={e => setForm(prev => ({
              ...prev,
              contact: {
                ...prev.contact,
                address: { ...prev.contact.address, state: e.target.value }
              }
            }))}
            placeholder={t('signup.statePlaceholder')}
          />
          <CustomInput
            label={t('signup.zipCode')}
            name="zipCode"
            value={form.contact.address.zipCode}
            onChange={e => setForm(prev => ({
              ...prev,
              contact: {
                ...prev.contact,
                address: { ...prev.contact.address, zipCode: e.target.value }
              }
            }))}
            placeholder={t('signup.zipCodePlaceholder')}
          />
          <CustomInput
            label={t('signup.country')}
            name="country"
            value={form.contact.address.country}
            onChange={e => setForm(prev => ({
              ...prev,
              contact: {
                ...prev.contact,
                address: { ...prev.contact.address, country: e.target.value }
              }
            }))}
            placeholder={t('signup.countryPlaceholder')}
          />
        </div>
      </div>

      {/* السوشال ميديا */}
      <div className="mb-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.socialMedia')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_MEDIA.map(s => (
            <CustomInput
              key={s.key}
              label={isRTL ? s.labelAr : s.labelEn}
              name={s.key}
              value={form.settings.storeSocials[s.key]}
              onChange={e => handleSocialChange(s.key, e.target.value)}
              placeholder={`${t('store.link')} ${isRTL ? s.labelAr : s.labelEn}`}
            />
          ))}
        </div>
      </div>



    </form>
  );
};

export default StoreGeneralInfo; 