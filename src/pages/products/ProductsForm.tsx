import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback, useRef } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomSelect from '../../components/common/CustomSelect';
import CustomSwitch from '../../components/common/CustomSwitch';
import CustomColorPicker from '../../components/common/CustomColorPicker';
import CustomTextArea from '../../components/common/CustomTextArea';
import { CheckboxSpecificationSelector } from '../../components/common';

import { useTranslation } from 'react-i18next';
import MultiSelect from '@/components/common/MultiSelect';
import useProductSpecifications from '@/hooks/useProductSpecifications';
import { createCategorySelectOptions, type CategoryNode } from '@/utils/categoryUtils';
import { useValidation } from '@/hooks/useValidation';
import { productValidationSchema, validateBarcode } from '@/validation/productValidation';

//-------------------------------------------- ColorVariant -------------------------------------------
interface ColorVariant {
  id: string;
  colors: string[];
}

//-------------------------------------------- ProductSpecification -------------------------------------------
interface ProductSpecification {
  _id: string;
  titleAr: string;
  titleEn: string;
  values: Array<{
    valueAr: string;
    valueEn: string;
  }>;
  store: string;
  isActive: boolean;
  sortOrder: number;
}

//-------------------------------------------- ProductsFormProps -------------------------------------------
interface ProductsFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onTagsChange: (values: string[]) => void;
  onImageChange: (files: File | File[] | null) => void;
  onMainImageChange: (file: File | null) => void;
  uploadMainImage?: (file: File) => Promise<string>;
  categories?: { id: number; nameAr: string; nameEn: string }[];
  tags?: any[];
  units?: any[];
  specifications?: any[];
  // إضافة خصائص التحقق من صحة البيانات
  validationErrors?: { [key: string]: string };
  onFieldValidation?: (fieldName: string, value: any) => void;
  showValidation?: boolean;
}

//-------------------------------------------- ProductsForm -------------------------------------------
const ProductsForm = forwardRef<unknown, ProductsFormProps>((props, ref) => {
  const {
    form,
    onFormChange,
    onTagsChange,
    onImageChange,
    onMainImageChange,
    uploadMainImage,
    categories = [],
    tags = [],
    units = [],
    specifications = [],
    validationErrors = {},
    onFieldValidation,
    showValidation = true
  } = props;
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';

  // نظام التحقق من صحة البيانات
  const {
    errors: internalErrors,
    validateField,
    clearError,
    setError,
    hasError
  } = useValidation({
    schema: productValidationSchema,
    validateOnChange: true,
    validateOnBlur: true
  });

  // دمج الأخطاء الداخلية مع الأخطاء الخارجية
  const allErrors = { ...internalErrors, ...validationErrors };
  
  // استخدام hook لجلب مواصفات المنتجات من API
  const { specifications: apiSpecifications, fetchSpecifications } = useProductSpecifications();
  
  // state للمواصفات المختارة
  const [selectedSpecifications, setSelectedSpecifications] = useState<any[]>([]);
  const [showBarcodeSuccess, setShowBarcodeSuccess] = useState(false);
  const [localNewBarcode, setLocalNewBarcode] = useState('');
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [showMainImageSuccess, setShowMainImageSuccess] = useState(false);
  const [formattedColors, setFormattedColors] = useState<ColorVariant[]>([]);
  const [hasLocalColorChanges, setHasLocalColorChanges] = useState(false);
  const hasFetchedSpecifications = useRef(false);
  const hasLoadedSpecifications = useRef(false);

  // دالة تحويل الألوان من API إلى التنسيق المطلوب
  const convertColorsFromAPI = (colors: any[]): ColorVariant[] => {
    // console.log('🔍 convertColorsFromAPI - input colors:', colors);
    
    if (!Array.isArray(colors) || colors.length === 0) {
      return [];
    }

    try {
      // تحويل الألوان من التنسيق القادم من API
      const convertedColors: ColorVariant[] = [];
      
      colors.forEach((colorGroup, index) => {
        // console.log(`🔍 Processing colorGroup ${index}:`, colorGroup);
        
        if (Array.isArray(colorGroup)) {
          // إذا كان colorGroup مصفوفة، خذ العنصر الأول
          const firstElement = colorGroup[0];
          // console.log(`🔍 First element of colorGroup ${index}:`, firstElement);
          
          if (typeof firstElement === 'string') {
            try {
              // محاولة تحليل JSON string
              const parsedColors = JSON.parse(firstElement);
              // console.log(`🔍 Parsed colors for group ${index}:`, parsedColors);
              
              if (Array.isArray(parsedColors)) {
                // إذا كان parsedColors مصفوفة، خذ جميع الألوان
                let colorsArray: string[] = [];
                
                if (Array.isArray(parsedColors[0])) {
                  // إذا كان العنصر الأول مصفوفة، خذ جميع العناصر
                  colorsArray = parsedColors.flat().filter((color: any) => typeof color === 'string');
                } else {
                  // إذا لم يكن العنصر الأول مصفوفة، خذ جميع العناصر مباشرة
                  colorsArray = parsedColors.filter((color: any) => typeof color === 'string');
                }
                
                // console.log(`🔍 Colors array for group ${index}:`, colorsArray);
                
                if (colorsArray.length > 0) {
                  convertedColors.push({
                    id: `color-${index}`,
                    colors: colorsArray
                  });
                }
              }
            } catch (parseError) {
              // console.log('🔍 Failed to parse color JSON, treating as direct color:', firstElement);
              convertedColors.push({
                id: `color-${index}`,
                colors: [firstElement]
              });
            }
          }
        } else if (typeof colorGroup === 'string') {
          try {
            // محاولة تحليل JSON string مباشرة
            const parsedColors = JSON.parse(colorGroup);
            // console.log(`🔍 Direct parsed colors for group ${index}:`, parsedColors);
            
            if (Array.isArray(parsedColors)) {
              // إذا كان parsedColors مصفوفة، خذ جميع الألوان
              let colorsArray: string[] = [];
              
              if (Array.isArray(parsedColors[0])) {
                // إذا كان العنصر الأول مصفوفة، خذ جميع العناصر
                colorsArray = parsedColors.flat().filter((color: any) => typeof color === 'string');
              } else {
                // إذا لم يكن العنصر الأول مصفوفة، خذ جميع العناصر مباشرة
                colorsArray = parsedColors.filter((color: any) => typeof color === 'string');
              }
              
              // console.log(`🔍 Direct colors array for group ${index}:`, colorsArray);
              
              if (colorsArray.length > 0) {
                convertedColors.push({
                  id: `color-${index}`,
                  colors: colorsArray
                });
              }
            }
          } catch (parseError) {
            // console.log('🔍 Failed to parse color JSON, treating as direct color:', colorGroup);
            convertedColors.push({
              id: `color-${index}`,
              colors: [colorGroup]
            });
          }
        }
      });

      // console.log('🔍 convertColorsFromAPI - final converted colors:', convertedColors);
      return convertedColors;
    } catch (error) {
      // console.error('🔍 Error converting colors:', error);
      return [];
    }
  };

  // جلب مواصفات المنتجات عند تحميل المكون (مرة واحدة فقط)
  useEffect(() => {
    if (!hasFetchedSpecifications.current) {
      //CONSOLE.log('🔍 ProductsForm - Fetching specifications...');
      hasFetchedSpecifications.current = true;
      fetchSpecifications().then((data) => {
        //CONSOLE.log('🔍 ProductsForm - Fetched specifications:', data);
      }).catch((error) => {
        //CONSOLE.error('🔍 ProductsForm - Error fetching specifications:', error);
        hasFetchedSpecifications.current = false; // إعادة تعيين في حالة الخطأ
      });
    }
  }, []); // جلب البيانات مرة واحدة فقط عند تحميل المكون

  // تحويل البيانات من النموذج إلى التنسيق المطلوب (مرة واحدة فقط عند التحميل)
  useEffect(() => {
    if (!hasLoadedSpecifications.current) {
      console.log('🔍 ProductsForm - Initial load - form.selectedSpecifications:', form.selectedSpecifications);
      console.log('🔍 ProductsForm - Initial load - form.specificationValues:', form.specificationValues);
      
      // محاولة استخدام specificationValues أولاً (من API)
      if (form.specificationValues && Array.isArray(form.specificationValues) && form.specificationValues.length > 0) {
        console.log('🔍 ProductsForm - Using specificationValues from API');
        const cleaned = form.specificationValues.map((spec: any) => {
          // البحث عن المواصفة في البيانات المحملة للحصول على العنوان الصحيح
          const specData = Array.isArray(apiSpecifications) ? apiSpecifications.find((s: any) => s._id === spec.specificationId) : null;
          const title = specData ? (isRTL ? specData.titleAr : specData.titleEn) : (spec.title || `Specification ${spec.specificationId}`);
          
          return {
            _id: spec.valueId || spec._id,
            title: title,
            value: spec.value || ''
          };
        });
        console.log('🔍 ProductsForm - Cleaned specificationValues:', cleaned);
        setSelectedSpecifications(cleaned);
      }
      // إذا لم تكن specificationValues موجودة، استخدم selectedSpecifications
      else if (form.selectedSpecifications) {
        try {
          let parsed;
          if (typeof form.selectedSpecifications === 'string') {
            parsed = JSON.parse(form.selectedSpecifications);
          } else {
            parsed = form.selectedSpecifications;
          }
          if (Array.isArray(parsed)) {
            // تنظيف الداتا هنا أيضاً
            const cleaned = parsed.map(spec => ({
              _id: spec._id,
              title: typeof spec.title === 'string' ? spec.title : JSON.stringify(spec.title),
              value: typeof spec.value === 'string' ? spec.value : JSON.stringify(spec.value)
            }));
            console.log('🔍 ProductsForm - Cleaned selectedSpecifications:', cleaned);
            setSelectedSpecifications(cleaned);
          } else {
            setSelectedSpecifications([]);
          }
        } catch (error) {
          console.error('Error parsing selectedSpecifications:', error);
          setSelectedSpecifications([]);
        }
      } else {
        console.log('🔍 ProductsForm - No specifications found, setting empty array');
        setSelectedSpecifications([]);
      }
      
      hasLoadedSpecifications.current = true;
    }
  }, []); // تشغيل مرة واحدة فقط عند التحميل

  // تحويل الألوان من API إلى التنسيق المطلوب
  useEffect(() => {
    console.log('🔍 ProductsForm - Colors useEffect triggered');
    console.log('🔍 ProductsForm - form.colors:', form.colors);
    console.log('🔍 ProductsForm - form.allColors:', form.allColors);
    console.log('🔍 ProductsForm - Current formattedColors:', formattedColors);
    
    // تحقق مما إذا كانت هناك تغييرات محلية
    if (hasLocalColorChanges) {
      console.log('🔍 ProductsForm - Skipping conversion, using local formattedColors');
      return; // لا تعيد التحويل إذا كانت هناك تغييرات محلية
    }
    
    // تحقق من تضارب البيانات بين colors و allColors
    const hasColorsConflict = form.colors && form.allColors && 
      Array.isArray(form.colors) && Array.isArray(form.allColors) &&
      form.colors.length > 0 && form.allColors.length > 0;
    
    if (hasColorsConflict) {
      console.log('🔍 ProductsForm - Colors conflict detected, using colors (groups) instead of allColors');
      // في حالة التضارب، استخدم colors (المجموعات) بدلاً من allColors (الألوان المنفردة)
      const convertedColors = convertColorsFromAPI(form.colors);
      console.log('🔍 ProductsForm - Converted colors from form.colors:', convertedColors);
      setFormattedColors(convertedColors);
      setHasLocalColorChanges(false);
    }
    // محاولة استخدام allColors (من API)
    else if (form.allColors && Array.isArray(form.allColors) && form.allColors.length > 0) {
      console.log('🔍 ProductsForm - Using allColors from API');
      
      // معالجة خاصة لـ allColors - قد يكون مصفوفة تحتوي على string واحد
      let colorsToProcess = form.allColors;
      if (form.allColors.length === 1 && typeof form.allColors[0] === 'string') {
        // إذا كان allColors مصفوفة تحتوي على string واحد، عالجها مباشرة
        try {
          const parsedColors = JSON.parse(form.allColors[0]);
          if (Array.isArray(parsedColors)) {
            colorsToProcess = parsedColors;
          }
        } catch (error) {
          console.log('🔍 Failed to parse allColors string:', error);
        }
      }
      
      const convertedColors = convertColorsFromAPI(colorsToProcess);
      console.log('🔍 ProductsForm - Converted colors from API:', convertedColors);
      setFormattedColors(convertedColors);
      setHasLocalColorChanges(false); // إعادة تعيين عند تحميل بيانات جديدة
    }
    // إذا لم تكن allColors موجودة، استخدم colors
    else if (form.colors && Array.isArray(form.colors) && form.colors.length > 0) {
      console.log('🔍 ProductsForm - Using colors from form');
      const convertedColors = convertColorsFromAPI(form.colors);
      console.log('🔍 ProductsForm - Converted colors from form:', convertedColors);
      setFormattedColors(convertedColors);
      setHasLocalColorChanges(false); // إعادة تعيين عند تحميل بيانات جديدة
    } else {
      console.log('🔍 ProductsForm - No colors found, setting empty array');
      setFormattedColors([]);
      setHasLocalColorChanges(false); // إعادة تعيين عند تحميل بيانات جديدة
    }
  }, [form.colors, form.allColors]);

  // تحويل الفئة والوحدة من API إلى التنسيق المطلوب
  useEffect(() => {
    // console.log('🔍 ProductsForm - form.category:', form.category);
    // console.log('🔍 ProductsForm - form.unit:', form.unit);
    
    // تحويل الفئة من API إلى categoryId
    if (form.category && form.category._id && !form.categoryId) {
      // console.log('🔍 ProductsForm - Setting categoryId from API:', form.category._id);
      handleInputChange('categoryId', form.category._id);
    }
    
    // تحويل الوحدة من API إلى unit
    if (form.unit && typeof form.unit === 'object' && form.unit._id) {
      // console.log('🔍 ProductsForm - Setting unit from API object:', form.unit._id);
      handleInputChange('unit', form.unit._id);
    } else if (form.unit && typeof form.unit === 'string' && form.unit !== '') {
      // console.log('🔍 ProductsForm - Unit is already a string:', form.unit);
    }
  }, [form.category, form.unit]);

  // Debug: طباعة بيانات النموذج
  useEffect(() => {
    // //CONSOLE.log('🔍 Form data in ProductsForm:', {
    //   images: form.images,
    //   mainImage: form.mainImage,
    //   mainImageType: typeof form.mainImage,
    //   mainImageIsNull: form.mainImage === null,
    //   selectedSpecifications: form.selectedSpecifications,
    //   tags: form.tags,
    //   colors: form.colors,
    //   barcodes: form.barcodes,
    //   newBarcode: form.newBarcode
    // });
    //CONSOLE.log('🔍 Barcodes in form:', form.barcodes);
    //CONSOLE.log('🔍 Barcodes type:', typeof form.barcodes);
    //CONSOLE.log('🔍 Barcodes is array:', Array.isArray(form.barcodes));
    //CONSOLE.log('🔍 Barcodes length:', Array.isArray(form.barcodes) ? form.barcodes.length : 'N/A');
    //CONSOLE.log('🔍 Specifications prop:', specifications);
    //CONSOLE.log('🔍 Specifications prop length:', specifications.length);
    //CONSOLE.log('🔍 API Specifications:', apiSpecifications);
    //CONSOLE.log('🔍 API Specifications length:', apiSpecifications.length);
  }, [form, specifications, apiSpecifications]);

  // تحويل مواصفات المنتجات إلى التنسيق المطلوب للمكون الجديد
  const formattedSpecifications = Array.isArray(apiSpecifications) ? apiSpecifications.map((spec: ProductSpecification) => ({
    _id: spec._id,
    title: isRTL ? spec.titleAr : spec.titleEn,
    values: spec.values.map((value, index) => ({
      _id: `${spec._id}_${index}`,
      value: isRTL ? value.valueAr : value.valueEn,
      title: isRTL ? spec.titleAr : spec.titleEn
    }))
  })) : [];

  // تحويل specifications prop إلى التنسيق المطلوب إذا كانت موجودة
  const formattedSpecificationsProp = Array.isArray(specifications) ? specifications.map((spec: any) => ({
    _id: spec._id,
    title: isRTL ? spec.titleAr : spec.titleEn,
    values: spec.values.map((value: any, index: number) => ({
      _id: `${spec._id}_${index}`,
      value: isRTL ? value.valueAr : value.valueEn,
      title: isRTL ? spec.titleAr : spec.titleEn
    }))
  })) : [];


  // دالة مساعدة لعرض رسائل الخطأ
  const renderFieldError = (fieldName: string) => {
    if (!showValidation) return null;
    
    const error = allErrors[fieldName];
    if (!error) return null;
    
    return (
      <div className={`text-red-500 text-xs mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        {error}
      </div>
    );
  };

  // دالة للتحقق من وجود خطأ في حقل معين
  const hasFieldError = (fieldName: string): boolean => {
    return !!allErrors[fieldName];
  };

  // دالة للحصول على كلاس الخطأ للحقل
  const getFieldErrorClass = (fieldName: string): string => {
    return hasFieldError(fieldName) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';
  };

  //-------------------------------------------- handleShuttleChange -------------------------------------------
  const handleShuttleChange = (e: React.ChangeEvent<{ name: string; value: string[] }>) => {
    //CONSOLE.log('🔍 ProductsForm - handleShuttleChange:', e.target);
    onFormChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      }
    } as any);
  };
  
  //-------------------------------------------- handleColorChange -------------------------------------------
  const handleColorChange = (e: React.ChangeEvent<{ name: string; value: ColorVariant[] }>) => {
    console.log('🔍 ProductsForm - handleColorChange:', e.target);
    
    // تحديث formattedColors مباشرة
    setFormattedColors(e.target.value);
    
    // تعيين أن هناك تغييرات محلية
    setHasLocalColorChanges(true);
    
    // تحويل الألوان إلى التنسيق المطلوب للـ API
    const convertedColors = e.target.value.map(colorVariant => {
      return [JSON.stringify(colorVariant.colors)];
    });
    
    // تحديث allColors أيضاً لتجنب التضارب
    const allColorsArray = e.target.value.flatMap(colorVariant => 
      colorVariant.colors
    );
    
    console.log('🔍 ProductsForm - convertedColors for API:', convertedColors);
    console.log('🔍 ProductsForm - allColorsArray for API:', allColorsArray);
    
    // تحديث colors
    onFormChange({
      target: {
        name: e.target.name,
        value: convertedColors,
      }
    } as any);
    
    // تحديث allColors أيضاً
    onFormChange({
      target: {
        name: 'allColors',
        value: allColorsArray,
      }
    } as any);
  };
  
  //-------------------------------------------- handleInputChange -------------------------------------------
  const handleInputChange = (name: string, value: string | any[]) => {
    //CONSOLE.log('🔍 ProductsForm - handleInputChange:', { name, value });
    
    // التحقق من صحة البيانات للحقل المحدث
    if (showValidation) {
      // مسح الخطأ الحالي أولاً
      clearError(name);
      
      // التحقق من صحة القيمة الجديدة
      const fieldError = validateField(name, value);
      
      // إذا كان هناك دالة للتحقق الخارجي، استدعاؤها
      if (onFieldValidation) {
        onFieldValidation(name, value);
      }
    }
    
    // إنشاء event object
    const event = {
      target: {
        name,
        value: value, // إرسال القيمة كما هي
      }
    } as any;
    
    // إرسال الحدث إلى onFormChange
    onFormChange(event);
  };
  
  //-------------------------------------------- handleSelectChange -------------------------------------------
  const handleSelectChange = (name: string, value: string) => {
    // console.log('🔍 ProductsForm - handleSelectChange:', { name, value });
    
    // التحقق من صحة البيانات للحقل المحدث
    if (showValidation) {
      // مسح الخطأ الحالي أولاً
      clearError(name);
      
      // التحقق من صحة القيمة الجديدة
      const fieldError = validateField(name, value);
      
      // إذا كان هناك دالة للتحقق الخارجي، استدعاؤها
      if (onFieldValidation) {
        onFieldValidation(name, value);
      }
    }
    
    // تحديث الحقل المطلوب
    onFormChange({
      target: {
        name,
        value,
      }
    } as any);
    
    // تحديث unitId أيضاً عندما يتم تغيير unit
    if (name === 'unit') {
      onFormChange({
        target: {
          name: 'unitId',
          value,
        }
      } as any);
      
      // التحقق من صحة unitId أيضاً
      if (showValidation) {
        clearError('unitId');
        const fieldError = validateField('unitId', value);
        if (onFieldValidation) {
          onFieldValidation('unitId', value);
        }
      }
    }
  };
  
  // handle multi-select for product labels
  const handleTagsChange = (values: string[]) => {
    //CONSOLE.log('🔍 ProductsForm - handleTagsChange:', values);
    onTagsChange(values);
  };

  // دالة إضافة باركود جديد
  const addBarcode = () => {
    if (localNewBarcode && localNewBarcode.trim()) {
      // التحقق من صحة الباركود أولاً
      const barcodeError = validateBarcode(localNewBarcode.trim(), t);
      if (barcodeError) {
        alert(barcodeError);
        return;
      }
      
      const currentBarcodes = Array.isArray(form.barcodes) ? form.barcodes : [];
      
      // التحقق من عدم تكرار الباركود
      if (currentBarcodes.includes(localNewBarcode.trim())) {
        alert(isRTL ? 'الباركود موجود مسبقاً!' : 'Barcode already exists!');
        return;
      }
      
      const newBarcodes = [...currentBarcodes, localNewBarcode.trim()];
      
      // تحديث الباركود مباشرة باستخدام onFormChange
      onFormChange({
        target: {
          name: 'barcodes',
          value: newBarcodes,
        }
      } as any);
      
      // مسح حقل الإدخال المحلي
      setLocalNewBarcode('');
      
      // إظهار رسالة النجاح
      setShowBarcodeSuccess(true);
      setTimeout(() => setShowBarcodeSuccess(false), 2000);
    } else {
      alert(isRTL ? 'يرجى إدخال باركود!' : 'Please enter a barcode!');
    }
  };

  // دالة حذف باركود
  const removeBarcode = (index: number) => {
    //CONSOLE.log('🔍 removeBarcode called with index:', index);
    //CONSOLE.log('🔍 form.barcodes before removal:', form.barcodes);
    const currentBarcodes = Array.isArray(form.barcodes) ? form.barcodes : [];
    const updatedBarcodes = currentBarcodes.filter((_: string, i: number) => i !== index);
    //CONSOLE.log('🔍 updatedBarcodes:', updatedBarcodes);
    
    // تحديث الباركود مباشرة باستخدام onFormChange
    onFormChange({
      target: {
        name: 'barcodes',
        value: updatedBarcodes,
      }
    } as any);
    
    //CONSOLE.log('🔍 Barcode removed successfully');
  };

  // دالة معالجة رفع الصورة الأساسية
  const handleMainImageUpload = async (file: File | null) => {
    console.log('🔍 handleMainImageUpload called with file:', file);
    
    if (!file) {
      console.log('🔍 No file provided, clearing main image');
      handleInputChange('mainImage', null as any);
      setShowMainImageSuccess(false);
      return;
    }

    try {
      setMainImageUploading(true);
      setShowMainImageSuccess(false);
      console.log('🔍 Starting main image upload...');
      
      // Use the uploadMainImage function if available
      if (uploadMainImage) {
        const uploadedUrl = await uploadMainImage(file);
        console.log('🔍 Image uploaded successfully:', uploadedUrl);
        handleInputChange('mainImage', uploadedUrl);
        setShowMainImageSuccess(true);
      } else {
        // Fallback: just call onMainImageChange
        console.log('🔍 uploadMainImage not available, using onMainImageChange');
        onMainImageChange(file);
        setShowMainImageSuccess(true);
      }
      
    } catch (error) {
      console.error('🔍 Error uploading main image:', error);
      alert(isRTL ? 'فشل في رفع الصورة الأساسية' : 'Failed to upload main image');
      handleInputChange('mainImage', null as any);
      setShowMainImageSuccess(false);
    } finally {
      setMainImageUploading(false);
    }
  };

  // expose getCurrentBarcode to parent
  useImperativeHandle(ref, () => ({
    getCurrentBarcode: () => localNewBarcode
  }));

  //-------------------------------------------- return -------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[70vh] space-y-6">
      
      {/* ==================== Basic Information Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className={`w-5 h-5  text-blue-500 ${isRTL ? 'ml-2' :'mr-2' }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomInput
              label={isRTL ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
              name="nameAr"
              value={form.nameAr || ''}
              onChange={(e) => handleInputChange('nameAr', e.target.value)}
              className={getFieldErrorClass('nameAr')}
             required
            />
            {renderFieldError('nameAr')}
          </div>
          <div>
            <CustomInput
              label={isRTL ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
              name="nameEn"
              value={form.nameEn || ''}
              onChange={(e) => handleInputChange('nameEn', e.target.value)}
              className={getFieldErrorClass('nameEn')}
              required
            />
            {renderFieldError('nameEn')}
          </div>
          <div className="md:col-span-2">
            <CustomTextArea
              label={isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
              name="descriptionAr"
              value={form.descriptionAr || ''}
              onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
              className={getFieldErrorClass('descriptionAr')}
            />
            {renderFieldError('descriptionAr')}
          </div>
          <div className="md:col-span-2">
            <CustomTextArea
              label={isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
              name="descriptionEn"
              value={form.descriptionEn || ''}
              onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
              className={getFieldErrorClass('descriptionEn')}
            />
            {renderFieldError('descriptionEn')}
          </div>
        </div>
      </div>

      {/* ==================== Category & Unit Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {isRTL ? 'التصنيف والوحدة' : 'Category & Unit'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              label={isRTL ? t('products.category') : 'Category'}
              value={form.categoryId || ''}
              onChange={(e) => handleSelectChange('categoryId', e.target.value)}
              className={getFieldErrorClass('categoryId')}
              options={createCategorySelectOptions(
                categories as CategoryNode[] || [],
                isRTL,
                true,
                isRTL ? t('products.selectCategory') : 'Select Category'
              )}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? '❖ فئات أساسية | › فئات فرعية | » فئات فرعية متقدمة' 
                : '❖ Main categories | › Subcategories | » Sub-subcategories'
              }
            </p>
            {renderFieldError('categoryId')}
          </div>
          <div>
            <CustomSelect
              label={isRTL ? t('products.unit') : 'Unit'}
              value={typeof form.unit === 'object' && form.unit && form.unit._id ? form.unit._id : (form.unit || '')}
              onChange={(e) => {
                // console.log('🚩 select unitId:', e.target.value);
                handleSelectChange('unit', e.target.value);
              }}
              className={getFieldErrorClass('unitId')}
               searchable={true}
              options={[
                { value: '', label: isRTL ? t('products.selectUnit') : 'Select Unit' },
                ...(Array.isArray(units) ? units.map((u: any) => ({ 
                  value: String(u._id || u.id), 
                  label: isRTL ? u.nameAr : u.nameEn 
                })) : [])
              ]}
            />
            {renderFieldError('unitId')}
          </div>
        </div>
        
        {/* Debug info for category and unit */}
        {/* <div className="mt-4 p-3 bg-blue-100 rounded-lg text-xs">
          <p><strong>Debug Category & Unit:</strong></p>
          <p>form.category: {form.category ? JSON.stringify(form.category) : 'null'}</p>
          <p>form.categoryId: {form.categoryId || 'null'}</p>
          <p>form.unit: {form.unit ? JSON.stringify(form.unit) : 'null'}</p>
          <p>form.unit type: {typeof form.unit}</p>
          <p>Unit value for select: {typeof form.unit === 'object' && form.unit && form.unit._id ? form.unit._id : (form.unit || '')}</p>
          <p>Available units count: {Array.isArray(units) ? units.length : 0}</p>
          <p>Available categories count: {Array.isArray(categories) ? categories.length : 0}</p>
          {Array.isArray(units) && units.length > 0 && (
            <p>First unit: {JSON.stringify(units[0])}</p>
          )}
        </div> */}
      </div>

      {/* ==================== Pricing Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          {isRTL ? 'الأسعار' : 'Pricing'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <CustomInput
              label={isRTL ? t('products.price') : 'Price'}
              name="price"
              value={form.price || ''}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className={getFieldErrorClass('price')}
              type="number"
              required
            />
            {renderFieldError('price')}
          </div>
          <div>
            <CustomInput
              label={isRTL ? 'سعر التكلفة' : 'Cost Price'}
              name="costPrice"
              value={form.costPrice || ''}
              onChange={(e) => handleInputChange('costPrice', e.target.value)}
              className={getFieldErrorClass('costPrice')}
              type="number"
            />
            {renderFieldError('costPrice')}
          </div>
          <div>
            <CustomInput
              label={isRTL ? 'سعر الجملة' : 'Wholesale Price'}
              name="compareAtPrice"
              value={form.compareAtPrice || ''}
              onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
              className={getFieldErrorClass('compareAtPrice')}
              type="number"
            />
            {renderFieldError('compareAtPrice')}
          </div>
        </div>
      </div>

      {/* ==================== Barcode Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isRTL ? 'الباركود' : 'Barcodes'}
        </h3>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              className={`w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${isRTL ? 'text-right pr-12' : 'text-left pl-12'}`}
              placeholder={isRTL ? 'أدخل الباركود واضغط Enter أو انقر على +' : 'Enter barcode and press Enter or click +'}
              value={localNewBarcode}
              onChange={(e) => {
                //CONSOLE.log('🔍 Input onChange:', e.target.value);
                setLocalNewBarcode(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addBarcode();
                }
              }}
            />
            <button
              type="button"
              onClick={addBarcode}
              disabled={!localNewBarcode || !localNewBarcode.trim()}
              className={`absolute top-1/2 transform -translate-y-1/2 w-8 h-8 text-white rounded-full flex items-center justify-center transition-colors ${
                localNewBarcode && localNewBarcode.trim() 
                  ? 'bg-purple-500 hover:bg-purple-600 cursor-pointer' 
                  : 'bg-gray-300 cursor-not-allowed'
              } ${isRTL ? 'right-2' : 'left-2'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {/* رسالة النجاح */}
          {showBarcodeSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg flex items-center text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isRTL ? 'تم إضافة الباركود بنجاح!' : 'Barcode added successfully!'}
            </div>
          )}
          
          {/* عرض الباركود الموجودة مباشرة تحت الحقل */}
          {Array.isArray(form.barcodes) && form.barcodes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.barcodes.map((barcode: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-2 bg-purple-100 text-purple-800 text-sm rounded-lg border border-purple-200 hover:bg-purple-150 transition-colors"
                >
                  <span className="font-mono mr-2">{barcode}</span>
                  <button
                    type="button"
                    onClick={() => removeBarcode(index)}
                    className="w-5 h-5 bg-purple-200 hover:bg-purple-300 rounded-full flex items-center justify-center transition-colors"
                    title={isRTL ? 'حذف الباركود' : 'Remove barcode'}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              {isRTL ? 'لا توجد باركود مضافة' : 'No barcodes added'}
            </div>
          )}
        </div>
      </div>

      {/* ==================== Settings Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isRTL ? 'الإعدادات' : 'Settings'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <div className="space-y-4">
            <CustomSwitch
              label={isRTL ? t('products.visibility') : 'Visibility'}
              name="visibility"
              checked={form.visibility === 'Y'}
              onChange={onFormChange}
                  
            />
            <CustomSwitch
              label={isRTL ? t('products.maintainStock') : 'Maintain Stock'}
              name="maintainStock"
              checked={form.maintainStock === 'Y'}
              onChange={e => {
                onFormChange(e);
                if (e.target.value === 'N') {
                  handleInputChange('availableQuantity', '');
                }
              }}
              
            />
          </div> */}
          
          <div className="space-y-4">
            <div>
              <CustomInput
                label={isRTL ? t('products.availableQuantity') : 'Available Quantity'}
                name="availableQuantity"
                value={form.availableQuantity || ''}
                onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
                className={getFieldErrorClass('availableQuantity')}
                type="number"
                disabled={false}
              />
              {renderFieldError('availableQuantity')}
            </div>
            
            <div className="space-y-1">
              <CustomInput
                label={isRTL ? t('products.lowStockThreshold') : 'Low Stock Alert Threshold'}
                name="lowStockThreshold"
                value={form.lowStockThreshold || '10'}
                onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
                className={getFieldErrorClass('lowStockThreshold')}
                type="number"
                min="1"
                max="1000"
                placeholder={isRTL ? 'أدخل الحد الأدنى للمخزون (مثال: 10)' : 'Enter minimum stock level (e.g., 10)'}
                disabled={false}
              />
              {renderFieldError('lowStockThreshold')}
              <p className="text-xs text-gray-500 mt-1">
                {isRTL 
                  ? 'سيتم تنبيهك عندما تصل الكمية إلى هذا الرقم أو أقل' 
                  : 'You will be alerted when stock reaches this number or below'
                }
              </p>
            </div>
            
            <MultiSelect
              label={isRTL ? t('products.productLabel') : 'Product Label'}
              value={
                Array.isArray(form.productLabels)
                  ? form.productLabels.map((l: any) => typeof l === 'object' ? l._id || l.id : l)
                  : Array.isArray(form.tags)
                    ? form.tags.map((l: any) => typeof l === 'object' ? l._id || l.id : l)
                    : []
              }
              onChange={(values) => {
                const ids = values.map((v: any) => typeof v === 'object' ? v._id || v.id : v);
                if ('productLabels' in form) {
                  onFormChange({
                    target: {
                      name: 'productLabels',
                      value: ids,
                    }
                  } as any);
                } else {
                  handleTagsChange(ids);
                }
              }}
              options={
                Array.isArray(tags)
                  ? tags.map((opt: any) => ({
                      value: String(opt._id || opt.id),
                      label: isRTL ? opt.nameAr : opt.nameEn
                    }))
                  : []
              }
              placeholder={isRTL ? 'اختر علامات المنتج' : 'Select product labels'}
            />
          </div>
        </div>
      </div>

      {/* ==================== Specifications Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-indigo-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {isRTL ? 'مواصفات المنتج' : 'Product Specifications'}
        </h3>
        
        {formattedSpecificationsProp.length > 0 || formattedSpecifications.length > 0 ? (
          <CheckboxSpecificationSelector
            specifications={formattedSpecificationsProp.length > 0 ? formattedSpecificationsProp : formattedSpecifications}
            selectedSpecifications={selectedSpecifications}
            onSelectionChange={(selected) => {
              console.log('🔍 ProductsForm - onSelectionChange called with:', selected);
              console.log('🔍 ProductsForm - Current form state before update:', {
                selectedSpecifications: form.selectedSpecifications,
                specifications: form.specifications,
                specificationValues: form.specificationValues
              });
              
              // تنظيف المواصفات المختارة قبل حفظها مع البحث عن العنوان الصحيح
              const cleaned = selected.map(spec => {
                // البحث عن المواصفة في البيانات المحملة للحصول على العنوان الصحيح
                const specData = Array.isArray(apiSpecifications) ? apiSpecifications.find((s: any) => s._id === spec._id.split('_')[0]) : null;
                const title = specData ? (isRTL ? specData.titleAr : specData.titleEn) : (spec.title || `Specification ${spec._id.split('_')[0]}`);
                
                return {
                  _id: spec._id,
                  title: title,
                  value: typeof spec.value === 'string' ? spec.value : JSON.stringify(spec.value)
                };
              });
              console.log('🔍 ProductsForm - Cleaned specifications:', cleaned);
              setSelectedSpecifications(cleaned);
              
              // تحديث form.selectedSpecifications
              onFormChange({
                target: {
                  name: 'selectedSpecifications',
                  value: JSON.stringify(cleaned)
                }
              } as any);
              
              // تحديث form.specifications (IDs فقط)
              const specificationIds = [...new Set(cleaned.map(spec => spec._id.split('_')[0]))];
              console.log('🔍 ProductsForm - Specification IDs:', specificationIds);
              onFormChange({
                target: {
                  name: 'specifications',
                  value: specificationIds
                }
              } as any);
              
              // تحديث form.specificationValues (القيم الكاملة)
              const specificationValues = cleaned.map(spec => {
                // البحث عن المواصفة في البيانات المحملة للحصول على العنوان الصحيح
                const specData = Array.isArray(apiSpecifications) ? apiSpecifications.find((s: any) => s._id === spec._id.split('_')[0]) : null;
                const title = specData ? (isRTL ? specData.titleAr : specData.titleEn) : (spec.title || `Specification ${spec._id.split('_')[0]}`);
                
                return {
                  specificationId: spec._id.split('_')[0],
                  valueId: spec._id,
                  value: spec.value,
                  title: title
                };
              });
              console.log('🔍 ProductsForm - Specification values:', specificationValues);
              onFormChange({
                target: {
                  name: 'specificationValues',
                  value: specificationValues
                }
              } as any);
              
              console.log('🔍 ProductsForm - Form updates completed. New values will be available on next render.');
            }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
                <p className="text-lg font-medium">{isRTL ? 'لا توجد مواصفات متاحة' : 'No specifications available'}</p>
            <p className="text-sm">{isRTL ? 'قم بإضافة مواصفات المنتجات أولاً' : 'Please add product specifications first'}</p>
            <p className="text-xs mt-2 text-gray-400">
              API: {apiSpecifications.length}, Prop: {specifications.length}
            </p>
          </div>
        )}
        
        {/* Debug info - Commented out for production */}
        {/* <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
          <p><strong>Debug Info:</strong></p>
          <p>Specifications prop length: {specifications.length}</p>
          <p>API Specifications length: {apiSpecifications.length}</p>
          <p>Formatted Specifications length: {formattedSpecifications.length}</p>
          <p>Formatted Specifications Prop length: {formattedSpecificationsProp.length}</p>
          <p>Selected Specifications length: {selectedSpecifications.length}</p>
          <p>Using: {formattedSpecificationsProp.length > 0 ? 'formattedSpecificationsProp' : 'formattedSpecifications'}</p>
          <p>API Specs sample: {apiSpecifications.length > 0 ? JSON.stringify(apiSpecifications[0]).substring(0, 100) + '...' : 'None'}</p>
        </div> */}
      </div>

      {/* ==================== Colors Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-pink-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
          {isRTL ? t('products.colors') : 'Colors'}
        </h3>
        
        <CustomColorPicker
          label={isRTL ? t('products.colors') : 'Colors'}
          name="colors"
          value={formattedColors}
          onChange={handleColorChange}
          isRTL={isRTL}
        />
        
        {/* Debug info for colors */}
     
      </div>

      {/* ==================== Media Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isRTL ? 'الوسائط' : 'Media'}
        </h3>
        
        <div className="space-y-6">
          {/* الصورة الأساسية */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {isRTL ? 'الصورة الأساسية' : 'Main Image'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {isRTL ? 'الصورة الرئيسية التي ستظهر في قائمة المنتجات' : 'Main image that will appear in product listings'}
            </p>
            
            <CustomFileInput
              label={isRTL ? 'اختر الصورة الأساسية' : 'Select Main Image'}
              id="mainImage"
              value={form.mainImage && form.mainImage !== null ? [form.mainImage] : []}
              onChange={files => {
                console.log('🔍 CustomFileInput onChange called with:', files);
                if (files && !Array.isArray(files)) {
                  // Single file selected
                  console.log('🔍 Single file selected:', files);
                  handleMainImageUpload(files);
                } else if (files && Array.isArray(files) && files.length > 0) {
                  // Array of files, take the first one
                  const file = files[0];
                  console.log('🔍 First file from array:', file);
                  handleMainImageUpload(file);
                } else {
                  // No files selected, clear main image
                  console.log('🔍 No files selected, clearing main image');
                  handleMainImageUpload(null);
                }
              }}
              multiple={false}
            />
            
            {/* مؤشر التحميل */}
            {mainImageUploading && (
              <div className="mt-3 flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-blue-600 text-sm">
                  {isRTL ? 'جاري رفع الصورة الأساسية...' : 'Uploading main image...'}
                </span>
              </div>
            )}
            
            {/* رسالة النجاح */}
            {showMainImageSuccess && (
              <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg flex items-center text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isRTL ? 'تم رفع الصورة الأساسية بنجاح!' : 'Main image uploaded successfully!'}
              </div>
            )}
            
            {/* معاينة الصورة الأساسية الموجودة */}
            {form.mainImage && form.mainImage !== null && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الصورة الحالية:' : 'Current Image:'}
                </h5>
                <div className="relative inline-block">
                  <img 
                    src={form.mainImage} 
                      alt={isRTL ? 'الصورة الأساسية' : 'Main Image'}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('mainImage', null as any);
                      setShowMainImageSuccess(false); // إزالة رسالة النجاح عند الحذف
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title={isRTL ? 'حذف الصورة' : 'Remove Image'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            

          </div>

          {/* الصور الإضافية */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
              <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isRTL ? 'الصور الإضافية' : 'Additional Images'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {isRTL ? 'صور إضافية للمنتج (اختياري)' : 'Additional product images (optional)'}
            </p>
            
            <CustomFileInput
              label={isRTL ? 'اختر الصور الإضافية' : 'Select Additional Images'}
              id="images"
              value={form.images || []}
              onChange={files => onImageChange(files)}
              multiple={true}
            />
            
            {/* معاينة الصور الإضافية الموجودة */}
            {Array.isArray(form.images) && form.images.length > 0 && form.images.some((img: any) => img && img !== null) && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? 'الصور الحالية:' : 'Current Images:'}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {form.images.filter((img: any) => img && img !== null).map((image: string, index: number) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`${isRTL ? 'صورة' : 'Image'} ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const validImages = form.images.filter((img: any) => img && img !== null);
                          const newImages = validImages.filter((_: string, i: number) => i !== index);
                          handleInputChange('images', newImages);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                        title={isRTL ? 'حذف الصورة' : 'Remove Image'}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            

          </div>

          {/* رابط الفيديو */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <svg className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {isRTL ? 'فيديو المنتج' : 'Product Video'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {isRTL ? 'رابط فيديو تعريفي للمنتج (اختياري)' : 'Product video URL (optional)'}
            </p>
            
            <CustomInput
              label={isRTL ? 'رابط الفيديو' : 'Video URL'}
              name="productVideo"
              value={form.productVideo || ''}
              onChange={(e) => handleInputChange('productVideo', e.target.value)}
              placeholder={isRTL ? 'https://example.com/video.mp4' : 'https://example.com/video.mp4'}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductsForm; 