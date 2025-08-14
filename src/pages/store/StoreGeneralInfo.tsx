import React, { useState, useEffect, useCallback, useRef } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomNumberInput from '../../components/common/CustomNumberInput';
import CustomPhoneInput from '../../components/common/CustomPhoneInput';
import CustomTextArea from '../../components/common/CustomTextArea';
import CustomButton from '../../components/common/CustomButton';
import CircleLogoInput from '../../components/common/CircleLogoInput';
import useLanguage from '@/hooks/useLanguage';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { currencyOptions } from '../../data/currencyOptions';
import { getStoreInfo } from '@/utils/storeUtils';

// ============================================================================
// CONSTANTS
// ============================================================================

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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================


interface StoreGeneralInfoProps {
  onSubmit?: (data: any) => Promise<any> | void;      // دالة إرسال البيانات
  onValidate?: (isValid: boolean) => void; // دالة التحقق من صحة البيانات
  onLogoFileChange?: (file: File | null) => void; // دالة تمرير ملف اللوجو
}

/**
 * نوع أخطاء الفالديشن
 */
interface ValidationErrors {
  nameAr?: string;
  nameEn?: string;
  slug?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
}

const StoreGeneralInfo: React.FC<StoreGeneralInfoProps> = ({ onSubmit, onValidate, onLogoFileChange }) => {
  
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { t } = useTranslation();
  const { getStore, updateStore, uploadStoreLogo, loading, error } = useStore();
  const { getCurrentUser } = useAuth();

  
  // الحصول على Store ID من localStorage أو من المستخدم الحالي
  const getCurrentStoreId = useCallback((): string | null => {
    
    
    // ثانياً: جرب من localStorage مباشرة
    const storedStoreId = localStorage.getItem('storeId');
    if (storedStoreId) {
      return storedStoreId;
    }
    
    // ثالثاً: جرب من بيانات المستخدم الحالي
    const currentUser = getCurrentUser();
    if (currentUser?.store?.id) {
      return currentUser.store.id;
    }
    
    return null;
  }, [getCurrentUser]);

  // حالة الوضع (إضافة أم تعديل)
  const [isEditMode, setIsEditMode] = useState(false);
  
  // بيانات المتجر المحفوظة
  const [storeData, setStoreData] = useState<any>(null);
  
  // حالة تحميل البيانات
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // ref لتجنب استدعاء getStore مرات متعددة
  const hasFetchedData = useRef(false);
  
  // بيانات النموذج
  const [form, setForm] = useState({
    // معلومات أساسية
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    slug: '',
    
    // لوجو المتجر
    logo: {
      public_id: null as string | null,
      url: null as string | null
    },
    
    // إعدادات المتجر
    settings: {
      lahzaToken: '',
      mainColor: '#1976d2',
      language: 'ar',
      currency: 'ILS',
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
  
  // ملف اللوجو المحدد
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // معاينة اللوجو
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // أخطاء الفالديشن
  const [errors, setErrors] = useState<ValidationErrors>({});

 
  const validateField = (name: string, value: string): string => {
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
        
      // case 'phone':
      //   if (!value.trim()) {
      //     error = t('store.phoneRequired');
      //   } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
      //     error = t('store.phoneInvalid');
      //   }
      //   break;
        
      case 'whatsappNumber':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
          error = t('store.whatsappInvalid');
        }
        break;
    }
    
    return error;
  };

  
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // التحقق من جميع الحقول المطلوبة
    newErrors.nameAr = validateField('nameAr', form.nameAr);
    newErrors.nameEn = validateField('nameEn', form.nameEn);
    newErrors.slug = validateField('slug', form.slug);
    newErrors.email = validateField('email', form.contact.email);
    // newErrors.phone = validateField('phone', form.contact.phone);
    newErrors.whatsappNumber = validateField('whatsappNumber', form.whatsappNumber);
    
    setErrors(newErrors);
    
    // إرجاع true إذا لم تكن هناك أخطاء
    return !Object.values(newErrors).some(error => error);
  };

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  /**
   * معالجة تغيير الحقول النصية
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setForm(prev => {
      const newForm = {
        ...prev,
        [name]: value,
      };
      
      // حفظ البيانات محلياً فقط في الخطوة الأولى
      if (onSubmit && !isEditMode) {
        setTimeout(() => {
          const formData = {
            ...newForm,
            logo: newForm.logo || { public_id: null, url: null }
          };
          onSubmit(formData);
        }, 100);
      }
      
      return newForm;
    });
    
    // الفالديشن المباشر
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  /**
   * معالجة تغيير الوصف
   */
  const handleDescriptionChange = (field: 'descriptionAr' | 'descriptionEn', e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        [field]: e.target.value,
      };
      
      // حفظ البيانات محلياً فقط في الخطوة الأولى
      if (onSubmit && !isEditMode) {
        setTimeout(() => {
          const formData = {
            ...newForm,
            logo: newForm.logo || { public_id: null, url: null }
          };
          onSubmit(formData);
        }, 100);
      }
      
      return newForm;
    });
  };

  /**
   * معالجة تغيير اللوجو
   */
  const handleLogoChange = (fileOrFiles: File | File[] | null) => {
    let file: File | null = null;
    
    if (Array.isArray(fileOrFiles)) {
      file = fileOrFiles[0] || null;
    } else {
      file = fileOrFiles;
    }
    
    if (file) {
      console.log('🔄 تم تحديث اللوجو:', file);
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      
      // تمرير ملف اللوجو للويزرد
      if (onLogoFileChange) {
        onLogoFileChange(file);
      }
      
      // تحديث النموذج باللوجو الجديد (سيتم رفعه لاحقاً)
      setForm(prev => {
        const newForm = {
          ...prev,
          logo: {
            public_id: null, // سيتم تحديثه بعد الرفع
            url: URL.createObjectURL(file) // معاينة مؤقتة
          }
        };
        
        // حفظ البيانات محلياً فقط في الخطوة الأولى
        if (onSubmit && !isEditMode) {
          setTimeout(() => {
            const formData = {
              ...newForm,
              logo: newForm.logo || { public_id: null, url: null }
            };
            onSubmit(formData);
          }, 100);
        }
        
        return newForm;
      });
    } else {
      setLogoFile(null);
      setLogoPreview(null);
      
      // تمرير null للويزرد
      if (onLogoFileChange) {
        onLogoFileChange(null);
      }
      
      // إزالة اللوجو من النموذج
      setForm(prev => {
        const newForm = {
          ...prev,
          logo: { public_id: null, url: null }
        };
        
        // حفظ البيانات محلياً فقط في الخطوة الأولى
        if (onSubmit && !isEditMode) {
          setTimeout(() => {
            const formData = {
              ...newForm,
              logo: newForm.logo || { public_id: null, url: null }
            };
            onSubmit(formData);
          }, 100);
        }
        
        return newForm;
      });
    }
  };

  /**
   * معالجة تغيير روابط السوشال ميديا
   */
  const handleSocialChange = (key: string, value: string) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        settings: {
          ...prev.settings,
          storeSocials: { ...prev.settings.storeSocials, [key]: value },
        }
      };
      
      // حفظ البيانات محلياً فقط في الخطوة الأولى
      if (onSubmit && !isEditMode) {
        setTimeout(() => {
          const formData = {
            ...newForm,
            logo: newForm.logo || { public_id: null, url: null }
          };
          onSubmit(formData);
        }, 100);
      }
      
      return newForm;
    });
  };

  /**
   * معالجة تغيير نسبة الضريبة
   */
  const handleTaxRateChange = (value: number) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        settings: { ...prev.settings, taxRate: value }
      };
      
      // حفظ البيانات محلياً فقط في الخطوة الأولى
      if (onSubmit && !isEditMode) {
        setTimeout(() => {
          const formData = {
            ...newForm,
            logo: newForm.logo || { public_id: null, url: null }
          };
          onSubmit(formData);
        }, 100);
      }
      
      return newForm;
    });
  };

  /**
   * معالجة تغيير نسبة الخصم
   */
  const handleDiscountChange = (value: number) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        settings: { ...prev.settings, storeDiscount: value }
      };
      
      // حفظ البيانات محلياً فقط في الخطوة الأولى
      if (onSubmit && !isEditMode) {
        setTimeout(() => {
          const formData = {
            ...newForm,
            logo: newForm.logo || { public_id: null, url: null }
          };
          onSubmit(formData);
        }, 100);
      }
      
      return newForm;
    });
  };

  /**
   * معالجة تغيير رقم الهاتف
   */
  // const handlePhoneChange = (value: string) => {
  //   setForm(prev => ({
  //     ...prev,
  //     contact: { ...prev.contact, phone: value }
  //   }));
    
  //   // الفالديشن للهاتف
  //   const error = validateField('phone', value);
  //   setErrors(prev => ({
  //     ...prev,
  //     phone: error
  //   }));
  // };

  /**
   * معالجة تغيير رقم الواتساب
   */
  const handleWhatsAppChange = (value: string) => {
    setForm(prev => {
      const newForm = {
        ...prev,
        whatsappNumber: value
      };
      
      // حفظ البيانات محلياً فقط في الخطوة الأولى
      if (onSubmit && !isEditMode) {
        setTimeout(() => {
          const formData = {
            ...newForm,
            logo: newForm.logo || { public_id: null, url: null }
          };
          onSubmit(formData);
        }, 100);
      }
      
      return newForm;
    });
    
    // الفالديشن للواتساب
    const error = validateField('whatsappNumber', value);
    setErrors(prev => ({
      ...prev,
      whatsappNumber: error
    }));
  };

  /**
   * معالجة إرسال النموذج
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // التحقق من صحة النموذج قبل الإرسال
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditMode) {
        // تحديث متجر موجود
        let updatedForm = { ...form };
        
        // رفع اللوجو إذا كان هناك ملف جديد
        if (logoFile) {
          const currentStoreId = getCurrentStoreId();
          const logoResult = await uploadStoreLogo(logoFile, currentStoreId || undefined);
          console.log('🔄 تم رفع اللوجو بنجاح:', logoResult);
          if (logoResult) {
            updatedForm.logo = logoResult;
            console.log('🔄 تم رفع اللوجو بنجاح:', logoResult);
          }
        }
        
        const currentStoreId = getCurrentStoreId();
        if (currentStoreId) {
          const result = await updateStore(currentStoreId, updatedForm);
          if (result) {
            setStoreData(result);
            console.log('✅ تم تحديث المتجر بنجاح، جاري تحديث البيانات المحلية...');
            
            // تحديث البيانات في localStorage
            const currentStoreData = localStorage.getItem('storeData');
            if (currentStoreData) {
              const parsedStoreData = JSON.parse(currentStoreData);
              const updatedStoreData = {
                ...parsedStoreData,
                nameAr: result.nameAr,
                nameEn: result.nameEn,
                logo: result.logo
               
              };
              localStorage.setItem('storeData', JSON.stringify(updatedStoreData));
              console.log('✅ تم تحديث بيانات المتجر في localStorage');
            }
            
           
            
            // إرسال حدث مخصص لتحديث التوب ناف والسينبار
            window.dispatchEvent(new CustomEvent('storeDataUpdated', {
              detail: {
                nameAr: result.nameAr,
                nameEn: result.nameEn,
                logo: result.logo
              }
            }));
          }
        }
      } else {
        // إنشاء متجر جديد
        if (onSubmit) {
          // إرسال بيانات المتجر بدون لوجو أولاً
          const storeDataWithoutLogo = {
            ...form,
            status: 'suspended',
            logo: { public_id: null, url: null } // بدون لوجو في البداية
          };
          
          console.log('🔄 إرسال بيانات المتجر الجديد بدون لوجو');
          const result = await onSubmit(storeDataWithoutLogo);
          
          // إذا كان هناك ملف لوجو، ارفعه للمتجر الجديد
          if (logoFile && result && (result as any).id) {
            console.log('🔄 رفع اللوجو للمتجر الجديد:', (result as any).id);
            try {
              const logoResult = await uploadStoreLogo(logoFile, (result as any).id);
              if (logoResult) {
                console.log('✅ تم رفع اللوجو بنجاح:', logoResult);
                // تحديث المتجر باللوجو الجديد
                await updateStore((result as any).id, { logo: logoResult });
              }
            } catch (logoError) {
              console.error('❌ خطأ في رفع اللوجو:', logoError);
            }
          }
        }
      }
    } catch (err) {
      //CONSOLE.error('❌ خطأ في حفظ بيانات المتجر:', err);
    }
  };

 
  useEffect(() => {
    const fetchStoreData = async () => {
      const storeId = getCurrentStoreId();
      const storeSlug = getStoreInfo().slug;
      if (storeId && !isDataLoaded && !hasFetchedData.current) {
        hasFetchedData.current = true; // منع استدعاء متكرر
        setIsEditMode(true);
          try {
          //CONSOLE.log('🔄 جلب بيانات المتجر مرة واحدة فقط...');
          const store = await getStore(storeId,storeSlug);
          if (store) {
            setStoreData(store);
            
            // تحويل logo من array إلى الشكل المتوقع
            let logoData = { public_id: null as string | null, url: null as string | null };
            
            if (Array.isArray(store.logo) && store.logo.length > 0) {
              // إذا كان logo array، خذ أول عنصر
              logoData = {
                public_id: store.logo[0].key,
                url: store.logo[0].url
              };
            } else if (store.logo && typeof store.logo === 'object' && 'url' in store.logo) {
              // إذا كان logo object بالشكل القديم
              logoData = store.logo as { public_id: string | null; url: string | null };
            }
            
            // تحديث النموذج ببيانات المتجر الحالي
            setForm({
              nameAr: store.nameAr || '',
              nameEn: store.nameEn || '',
              descriptionAr: store.descriptionAr || '',
              descriptionEn: store.descriptionEn || '',
              slug: store.slug || '',
              logo: logoData,
              settings: {
                lahzaToken: store.settings?.lahzaToken || '',
                mainColor: store.settings?.mainColor || '#1976d2',
                language: store.settings?.language || 'ar',
                currency: store.settings?.currency || 'ILS',
                storeDiscount: store.settings?.storeDiscount || 0,
                timezone: store.settings?.timezone || 'Asia/Amman',
                taxRate: store.settings?.taxRate || 0,
                shippingEnabled: store.settings?.shippingEnabled ?? true,
                storeSocials: {
                  ...SOCIAL_MEDIA.reduce((acc, s) => ({ ...acc, [s.key]: '' }), {} as Record<string, string>),
                  ...store.settings?.storeSocials
                },
              },
              whatsappNumber: store.whatsappNumber || '',
              contact: {
                email: store.contact?.email || '',
                phone: store.contact?.phone || '',
                address: {
                  street: store.contact?.address?.street || '',
                  city: store.contact?.address?.city || '',
                  state: store.contact?.address?.state || '',
                  zipCode: store.contact?.address?.zipCode || '',
                  country: store.contact?.address?.country || ''
                }
              }
            });
            
            // عرض اللوجو الحالي إذا كان موجوداً
            if (logoData.url) {
              setLogoPreview(logoData.url);
            }

          } else {
            
          }
        } catch (error) {
      
        } finally {
          setIsDataLoaded(true);
        }
      }
    };

    fetchStoreData();
  }, [isDataLoaded, getCurrentStoreId]); // إضافة getCurrentStoreId

    const handleLahzaTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      settings: { ...prev.settings, lahzaToken: value }
    }));
  };  

  /**
   * إرسال حالة الفالديشن للويزرد
   */
  useEffect(() => {
    if (onValidate) {
      // التحقق من أن جميع الحقول المطلوبة مملوءة وصحيحة
      const hasRequiredFields = Boolean(
        form.nameAr.trim() && 
        form.nameEn.trim() && 
        form.slug.trim() && 
        form.contact.email.trim() && 
        form.whatsappNumber.trim()
      );
      
      const hasNoErrors = !Object.values(errors).some(error => !!error);
      
      // التحقق من صحة البريد الإلكتروني
      const isEmailValid = Boolean(
        form.contact.email.trim() && 
        /\S+@\S+\.\S+/.test(form.contact.email)
      );
      
      // التحقق من صحة رقم الهاتف
      const isPhoneValid = Boolean(
        form.whatsappNumber.trim() && 
        /^[\+]?[1-9][\d]{0,15}$/.test(form.whatsappNumber.replace(/\s/g, ''))
      );
      
      const isValid = hasRequiredFields && hasNoErrors && isEmailValid && isPhoneValid;
      
      onValidate(isValid);
    }
  }, [errors, form.nameAr, form.nameEn, form.slug, form.contact.email, form.whatsappNumber, onValidate]);

 
  return (
    <form onSubmit={handleSubmit} dir={isRTL ? 'rtl' : 'ltr'} className={`${isRTL ? 'text-right' : 'text-left'}`}>
      {/* عنوان الصفحة */}
      <div className="mb-6">
        <h2 className={`text-2xl font-bold text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {isEditMode ? t('store.editStoreInfo') : ''}
        </h2>
        {isEditMode ? (
          <p className={`text-gray-600 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('store.editModeDescription')}
          </p>
        ) : null}
        
        
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

         {/* معلومات المتجر الأساسية */}
    
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.basicInfo')}
        </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* وصف المتجر بالعربي */}
        <div className="">
          <CustomTextArea
            label={t('store.descriptionAr')}
            value={form.descriptionAr}
            onChange={(e) => handleDescriptionChange('descriptionAr', e)}
            placeholder={t('store.descriptionArPlaceholder')}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* وصف المتجر بالإنجليزي */}
        <div className="">
          <CustomTextArea
            label={t('store.descriptionEn')}
            value={form.descriptionEn}
            onChange={(e) => handleDescriptionChange('descriptionEn', e)}
            placeholder={t('store.descriptionEnPlaceholder')}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>
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
      

      {/* لوجو المتجر */}
      <div className="mb-8 border-t border-gray-200 pt-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.logo')}
        </h3>
        <CircleLogoInput
          preview={logoPreview}
          onChange={handleLogoChange}
          onRemove={() => {
            setLogoFile(null);
            setLogoPreview(null);
            setForm(prev => ({
              ...prev,
              logo: { public_id: null, url: null }
            }));
          }}
          alt="Store Logo"
          file={logoFile}
          label={t('store.uploadLogo')}
          isEditMode={isEditMode}
          t={t}
          currentLogoUrl={form.logo.url}
        />
      </div>

      {/* إعدادات المتجر */}
      <div className="mb-8 border-t border-gray-200 pt-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.settings')}
        </h3>
        
        {/* لون المتجر */}
        <div className="mb-4">
          <div className={`flex flex-col gap-2`}>
            <label className="block mb-1 text-sm font-medium text-gray-900">
              {t('store.mainColor')}
            </label>
            <div className={`flex items-center gap-3 `}>
              <input
                type="color"
                value={form.settings.mainColor}
                onChange={(e) => {
                  setForm(prev => {
                    const newForm = {
                      ...prev,
                      settings: { ...prev.settings, mainColor: e.target.value }
                    };
                    
                    // حفظ البيانات محلياً فقط في الخطوة الأولى
                    if (onSubmit && !isEditMode) {
                      setTimeout(() => {
                        const formData = {
                          ...newForm,
                          logo: newForm.logo || { public_id: null, url: null }
                        };
                        onSubmit(formData);
                      }, 100);
                    }
                    
                    return newForm;
                  });
                }}
                className={`
                  w-12 h-12 rounded-full border-2 border-gray-300 shadow cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                  [&::-webkit-color-swatch-wrapper]:border-0 
                  [&::-webkit-color-swatch]:border-0 
                  [&::-moz-color-swatch]:border-0
                  hover:border-gray-400 transition-colors
                `}
                style={{ background: form.settings.mainColor }}
              />
              <span className="text-sm text-gray-600 font-mono">
                {form.settings.mainColor}
              </span>
            </div>
          </div>
        </div>

        {/* عملة المتجر */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`flex flex-col gap-2`}>
            <label className="block mb-1 text-sm font-medium text-gray-900">
              {t('store.currency')}
            </label>
            <select
              value={form.settings.currency}
              onChange={(e) => {
                setForm(prev => {
                  const newForm = {
                    ...prev,
                    settings: { ...prev.settings, currency: e.target.value }
                  };
                  
                  // حفظ البيانات محلياً فقط في الخطوة الأولى
                  if (onSubmit && !isEditMode) {
                    setTimeout(() => {
                      const formData = {
                        ...newForm,
                        logo: newForm.logo || { public_id: null, url: null }
                      };
                      onSubmit(formData);
                    }, 100);
                  }
                  
                  return newForm;
                });
              }}
              className={`
                w-full px-3 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isRTL ? 'text-right' : 'text-left'}
              `}
            >
              {currencyOptions.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {isRTL ? currency.nameAr : currency.nameEn} ({currency.code})
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <CustomInput
              label={t('stores.lahzaToken')}
              name="lahzaToken"
              value={form.settings.lahzaToken}
              onChange={handleLahzaTokenChange}
              placeholder={t('stores.lahzaTokenPlaceholder')}
            />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* نسبة الخصم */}
        <div className="">
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
        <div className="">
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
      </div>

      {/* معلومات التواصل */}
      <div  className="mb-8 border-t border-gray-200 pt-8">
        <h3 className={`font-bold mb-6 text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('store.contactInfo')}
        </h3>
        
        {/* رقم الهاتف 
        <div className="mb-4">
          <CustomPhoneInput
            label={t('store.phone')}
            value={form.contact.phone}
            onChange={handlePhoneChange}
            required
            error={errors.phone}
          />
        </div>*/}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* رقم الواتساب */}
        <div className="mb-4">
          <CustomPhoneInput
            label={t('store.whatsapp')}
            value={form.whatsappNumber}
            onChange={handleWhatsAppChange}
            placeholder={t('store.whatsappPlaceholder')}
            error={errors.whatsappNumber}
            required
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
              setForm(prev => {
                const newForm = {
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value }
                };
                
                // إرسال البيانات تلقائياً في وضع إنشاء متجر جديد
                if (onSubmit && !isEditMode) {
                  setTimeout(() => {
                    const formData = {
                      ...newForm,
                      logo: newForm.logo || { public_id: null, url: null }
                    };
                    onSubmit(formData);
                  }, 100);
                }
                
                return newForm;
              });
              
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
        </div>
        {/* حقول العنوان */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label={t('signup.street')}
            name="street"
            value={form.contact.address.street}
            onChange={e => setForm(prev => {
              const newForm = {
                ...prev,
                contact: {
                  ...prev.contact,
                  address: { ...prev.contact.address, street: e.target.value }
                }
              };
              
              // إرسال البيانات تلقائياً في وضع إنشاء متجر جديد
              if (onSubmit && !isEditMode) {
                setTimeout(() => {
                  const formData = {
                    ...newForm,
                    logo: newForm.logo || { public_id: null, url: null }
                  };
                  onSubmit(formData);
                }, 100);
              }
              
              return newForm;
            })}
            placeholder={t('signup.streetPlaceholder')}
          />
          <CustomInput
            label={t('signup.city')}
            name="city"
            value={form.contact.address.city}
            onChange={e => setForm(prev => {
              const newForm = {
                ...prev,
                contact: {
                  ...prev.contact,
                  address: { ...prev.contact.address, city: e.target.value }
                }
              };
              
              // إرسال البيانات تلقائياً في وضع إنشاء متجر جديد
              if (onSubmit && !isEditMode) {
                setTimeout(() => {
                  const formData = {
                    ...newForm,
                    logo: newForm.logo || { public_id: null, url: null }
                  };
                  onSubmit(formData);
                }, 100);
              }
              
              return newForm;
            })}
            placeholder={t('signup.cityPlaceholder')}
          />
          <CustomInput
            label={t('signup.state')}
            name="state"
            value={form.contact.address.state}
            onChange={e => setForm(prev => {
              const newForm = {
                ...prev,
                contact: {
                  ...prev.contact,
                  address: { ...prev.contact.address, state: e.target.value }
                }
              };
              
              // إرسال البيانات تلقائياً في وضع إنشاء متجر جديد
              if (onSubmit && !isEditMode) {
                setTimeout(() => {
                  const formData = {
                    ...newForm,
                    logo: newForm.logo || { public_id: null, url: null }
                  };
                  onSubmit(formData);
                }, 100);
              }
              
              return newForm;
            })}
            placeholder={t('signup.statePlaceholder')}
          />
          <CustomInput
            label={t('signup.zipCode')}
            name="zipCode"
            value={form.contact.address.zipCode}
            onChange={e => setForm(prev => {
              const newForm = {
                ...prev,
                contact: {
                  ...prev.contact,
                  address: { ...prev.contact.address, zipCode: e.target.value }
                }
              };
              
              // إرسال البيانات تلقائياً في وضع إنشاء متجر جديد
              if (onSubmit && !isEditMode) {
                setTimeout(() => {
                  const formData = {
                    ...newForm,
                    logo: newForm.logo || { public_id: null, url: null }
                  };
                  onSubmit(formData);
                }, 100);
              }
              
              return newForm;
            })}
            placeholder={t('signup.zipCodePlaceholder')}
          />
          <CustomInput
            label={t('signup.country')}
            name="country"
            value={form.contact.address.country}
            onChange={e => setForm(prev => {
              const newForm = {
                ...prev,
                contact: {
                  ...prev.contact,
                  address: { ...prev.contact.address, country: e.target.value }
                }
              };
              
              // إرسال البيانات تلقائياً في وضع إنشاء متجر جديد
              if (onSubmit && !isEditMode) {
                setTimeout(() => {
                  const formData = {
                    ...newForm,
                    logo: newForm.logo || { public_id: null, url: null }
                  };
                  onSubmit(formData);
                }, 100);
              }
              
              return newForm;
            })}
            placeholder={t('signup.countryPlaceholder')}
          />
        </div>
      </div>

      {/* السوشال ميديا */}
      <div className="mb-8 border-t border-gray-200 pt-8">
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

      {/* زر الحفظ/التعديل */}
    {isEditMode &&  <div className="flex justify-end mt-8">
        <CustomButton
          type="submit"
          text={isEditMode ? t('store.updateStore') : t('store.createStore')}
          color="primary"
          disabled={loading}
          className={loading ? 'opacity-50 cursor-not-allowed' : ''}
        />
      </div>
    }
    </form>
  );
};
export default StoreGeneralInfo; 