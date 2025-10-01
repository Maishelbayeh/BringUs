// src/validation/examples.ts
// أمثلة على كيفية استخدام نظام الفالديشين الجديد

import { useValidation } from '../hooks/useValidation';
import { ValidationSchema, COMMON_SCHEMAS } from '../utils/validation';


// مثال 2: فورم متقدم باستخدام useValidation
export const AdvancedFormExample = () => {
  // تعريف Schema مخصص
  const productSchema: ValidationSchema = {
    // استخدام Schema جاهز للنصوص ثنائية اللغة
    ...COMMON_SCHEMAS.bilingualText(2, 100),
    
    // حقول مخصصة
    price: {
      required: true,
      type: 'number',
      min: 0,
      max: 100000,
      custom: (value: number) => value > 0, // لا يسمح بالصفر
    },
    
    category: {
      required: true,
      type: 'string',
      custom: (value: string) => ['electronics', 'clothing', 'books'].includes(value),
    },
    
    description: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 500,
    },
  };
  
  const {
    errors,
    validateForm,
    validateField,
    validateUnique,
    clearError,
    setError,
    hasError,
  } = useValidation({
    schema: productSchema,
    validateOnChange: true,
    onValidationChange: (isValid) => {
      console.log('الفورم صحيح:', isValid);
    },
  });
  
  // دالة التحقق من صحة البيانات
  const handleSubmit = (formData: any) => {
    // التحقق من صحة الفورم
    const result = validateForm(formData);
    
    if (result.isValid) {
      console.log('الفورم صحيح، يمكن إرسال البيانات');
      // إرسال البيانات
    } else {
      console.log('الفورم يحتوي على أخطاء:', result.errors);
    }
  };
  
  // دالة التحقق من عدم تكرار اسم المنتج
  const checkProductNameUnique = (name: string, existingProducts: any[], currentId?: string) => {
    const error = validateUnique(name, existingProducts, 'nameAr', currentId);
    if (error) {
      setError('nameAr', error);
    }
  };
  
  // دالة التحقق من حقل واحد فقط
  const validateSingleField = (fieldName: string, value: any) => {
    const error = validateField(fieldName, value);
    if (error) {
      console.log(`خطأ في ${fieldName}: ${error}`);
    }
  };
  
  return {
    errors,
    handleSubmit,
    checkProductNameUnique,
    validateSingleField,
    clearError,
    hasError,
  };
};

// مثال 3: فورم مع قواعد مخصصة معقدة
export const CustomValidationExample = () => {
  const customSchema: ValidationSchema = {
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      custom: (value: string) => {
        // التحقق من وجود حرف كبير وصغير ورقم
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        return hasUpper && hasLower && hasNumber;
      },
    },
    
    phoneNumber: {
      required: true,
      type: 'phone', // استخدام النمط الجديد للهاتف
      // سيتم التحقق تلقائياً: يبدأ بـ + ورمز دولة، حد أقصى 15 رقم
    },
    
    whatsappNumber: {
      required: true,
      type: 'string',
      // يمكن استخدام validateWhatsApp للتحقق المتقدم
    },
    
    birthDate: {
      required: true,
      custom: (value: string) => {
        const date = new Date(value);
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 18 && age <= 100; // يجب أن يكون العمر بين 18 و 100
      },
    },
  };
  
  const { validateForm, errors } = useValidation({
    schema: customSchema,
  });
  
  return { validateForm, errors };
};

// مثال 4: استخدام Schemas جاهزة
export const PreBuiltSchemasExample = () => {
  // Schema للمستخدم الجديد
  const userRegistrationSchema = {
    ...COMMON_SCHEMAS.userRegistration(),
    // إضافة حقول إضافية
    phoneNumber: {
      required: true,
      type: 'phone' as const,
    },
    address: {
      required: true,
      type: 'string' as const,
      minLength: 10,
      maxLength: 200,
    },
  };
  
  // Schema للمنتج مع السعر
  const productWithPriceSchema = {
    ...COMMON_SCHEMAS.bilingualText(2, 100),
    ...COMMON_SCHEMAS.price(0, 1000000, false),
    category: {
      required: true,
      type: 'string' as const,
    },
  };
  
  // Schema لمعلومات الاتصال
  const contactInfoSchema = {
    ...COMMON_SCHEMAS.contact(),
    website: {
      required: false,
      type: 'url' as const,
    },
  };
  
  return {
    userRegistrationSchema,
    productWithPriceSchema,
    contactInfoSchema,
  };
};

// مثال 5: استخدام فالديشين النص الإنجليزي المحدث
export const EnglishTextValidationExample = () => {
  const textSchema: ValidationSchema = {
    productName: {
      required: true,
      type: 'englishText',
      minLength: 2,
      maxLength: 100,
      // يقبل: أحرف إنجليزية + أرقام + رموز عادية
    },
    description: {
      required: true,
      type: 'englishText',
      minLength: 10,
      maxLength: 500,
    },
  };

  const { validateField } = useValidation({
    schema: textSchema,
  });

  // أمثلة صحيحة:
  const validExamples = [
    'Product Name 123',
    'Email: user@example.com',
    'Price: $99.99 (50% off!)',
    'Description with symbols: #product & features',
    'Special chars: -_.,;:!?()\'"&@#$%*+=/\\[]{}|<>~`^',
  ];

  // أمثلة خاطئة:
  const invalidExamples = [
    'اسم المنتج', // نص عربي
    'Продукт',    // نص روسي
    'Название',   // أحرف غير مدعومة
  ];

  const testValidation = () => {
    validExamples.forEach(text => {
      const error = validateField('productName', text);
      console.log(`"${text}" -> ${error ? 'خطأ' : 'صحيح'}`);
    });

    invalidExamples.forEach(text => {
      const error = validateField('productName', text);
      console.log(`"${text}" -> ${error ? 'خطأ' : 'صحيح'}`);
    });
  };

  return { testValidation };
};

// مثال 6: استخدام فالديشين الهاتف والواتساب الجديد
export const PhoneValidationExample = () => {
  const phoneSchema: ValidationSchema = {
    phoneNumber: {
      required: true,
      type: 'phone', // يجب أن يبدأ بـ + ورمز الدولة، حد أقصى 15 رقم
    },
    whatsappNumber: {
      required: true,
      type: 'string', // سيتم التحقق منه باستخدام validateWhatsApp
    },
  };

  const {
    errors,
    validateForm,
    validateWhatsApp,
    validateField,
  } = useValidation({
    schema: phoneSchema,
  });

  // دالة التحقق من صحة رقم الهاتف
  const validatePhoneNumber = (phone: string) => {
    const error = validateField('phoneNumber', phone);
    // أمثلة صحيحة: +970591234567, +972594056090, +12125551234, +966501234567
    // أمثلة خاطئة: 0591234567, 970591234567, +0591234567
    return error;
  };

  // دالة التحقق من صحة رقم الواتساب  
  const validateWhatsAppNumber = (whatsapp: string) => {
    const error = validateWhatsApp(whatsapp);
    // نفس قواعد الهاتف + تحقق إضافي للأرقام المحلية
    return error;
  };

  return {
    validatePhoneNumber,
    validateWhatsAppNumber,
    errors,
    validateForm,
  };
};

// مثال 6: استخدام النظام في كومبوننت React
export const ReactComponentExample = `
import React, { useState } from 'react';
import { useValidation } from '../hooks/useValidation';
import { deliveryValidationSchema } from '../validation/deliveryValidation';

const DeliveryForm = () => {
  const [formData, setFormData] = useState({
    locationAr: '',
    locationEn: '',
    price: '',
    whatsappNumber: '',
  });

  const {
    errors,
    validateForm,
    validateWhatsApp,
    clearError,
  } = useValidation({
    schema: deliveryValidationSchema,
    onValidationChange: (isValid) => {
      console.log('Form is valid:', isValid);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field); // مسح الخطأ عند الكتابة
  };

  const handleSubmit = () => {
    const result = validateForm(formData);
    
    // التحقق الإضافي من رقم الواتساب
    const whatsappError = validateWhatsApp(formData.whatsappNumber);
    if (whatsappError) {
      // معالجة خطأ الواتساب
    }
    
    if (result.isValid && !whatsappError) {
      // إرسال البيانات
      console.log('Submitting form data:', formData);
    }
  };

  return (
    <form>
      <input
        value={formData.locationAr}
        onChange={(e) => handleInputChange('locationAr', e.target.value)}
      />
      {errors.locationAr && <span className="error">{errors.locationAr}</span>}
      
      {/* باقي الحقول... */}
      
      <button type="button" onClick={handleSubmit}>
        إرسال
      </button>
    </form>
  );
};
`; 