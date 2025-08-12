import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback, useRef } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomSelect from '../../components/common/CustomSelect';
import CustomSwitch from '../../components/common/CustomSwitch';
import CustomColorPicker from '../../components/common/CustomColorPicker';
import CustomTextArea from '../../components/common/CustomTextArea';
import SpecificationSelector from '../../components/common/SpecificationSelector';
import CustomBarcode from '../../components/common/CustomBarcode';
import CustomCategorySelector from '../../components/common/CustomCategorySelector';

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
  const [specificationDetails, setSpecificationDetails] = useState<any[]>([]);
  
  // state للفئات المختارة (دعم متعدد)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
    console.log('🔍 ProductsForm - Initializing selectedCategoryIds with form data:', {
      formCategoryId: form.categoryId,
      formCategoryIds: form.categoryIds,
      formCategory: form.category
    });
    
    // Handle categoryId as comma-separated string
    if (form.categoryId && typeof form.categoryId === 'string' && form.categoryId.includes(',')) {
      const ids = form.categoryId.split(',').map((id: string) => id.trim()).filter((id: string) => id);
      console.log('🔍 ProductsForm - Parsed categoryId as comma-separated:', ids);
      return ids;
    }
    // Handle categoryIds array
    if (form.categoryIds && Array.isArray(form.categoryIds)) {
      console.log('🔍 ProductsForm - Using categoryIds array:', form.categoryIds);
      return form.categoryIds;
    }
    // Handle single categoryId
    if (form.categoryId) {
      console.log('🔍 ProductsForm - Using single categoryId:', form.categoryId);
      return [form.categoryId];
    }
    console.log('🔍 ProductsForm - No categories found, returning empty array');
    return [];
  });

  // دالة لحساب مجموع الكميات من الصفات
  const calculateTotalQuantity = (specifications: any[]): number => {
    const total = specifications.reduce((total, spec) => total + (spec.quantity || 0), 0);
    console.log('🔍 calculateTotalQuantity - specifications:', specifications, 'total:', total);
    return total;
  };

  // دالة لتحديث الكمية المتاحة بناءً على الصفات
  const updateAvailableQuantity = (specifications: any[]) => {
    const totalQuantity = calculateTotalQuantity(specifications);
    onFormChange({
      target: {
        name: 'stock',
        value: totalQuantity.toString()
      }
    } as any);
  };



  
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
    console.log('🔍 convertColorsFromAPI - input colors:', colors);
    console.log('🔍 convertColorsFromAPI - colors type:', typeof colors);
    console.log('🔍 convertColorsFromAPI - colors is array:', Array.isArray(colors));
    
    if (!Array.isArray(colors) || colors.length === 0) {
      console.log('🔍 convertColorsFromAPI - No colors to convert, returning empty array');
      return [];
    }

    try {
      // تحويل الألوان من التنسيق القادم من API
      const convertedColors: ColorVariant[] = [];
      
      colors.forEach((colorGroup, index) => {
        console.log(`🔍 Processing colorGroup ${index}:`, colorGroup);
        console.log(`🔍 colorGroup type:`, typeof colorGroup);
        console.log(`🔍 colorGroup is array:`, Array.isArray(colorGroup));
        
        if (Array.isArray(colorGroup)) {
          // إذا كان colorGroup مصفوفة من الألوان، استخدمها مباشرة
          const colorsArray = colorGroup.filter((color: any) => typeof color === 'string');
          console.log(`🔍 Colors array for group ${index}:`, colorsArray);
          
          if (colorsArray.length > 0) {
            convertedColors.push({
              id: `color-${index}-${Date.now()}`,
              colors: colorsArray
            });
          }
        } else if (typeof colorGroup === 'string') {
          // إذا كان colorGroup string، قد يكون JSON أو لون واحد
          try {
            const parsedColors = JSON.parse(colorGroup);
            console.log(`🔍 Parsed colors for group ${index}:`, parsedColors);
            
            if (Array.isArray(parsedColors)) {
              // إذا كان parsedColors مصفوفة من المصفوفات
              if (Array.isArray(parsedColors[0])) {
                // إذا كان العنصر الأول مصفوفة، خذ جميع العناصر
                const colorsArray = parsedColors.flat().filter((color: any) => typeof color === 'string');
                console.log(`🔍 Flattened colors array for group ${index}:`, colorsArray);
                
                if (colorsArray.length > 0) {
                  convertedColors.push({
                    id: `color-${index}-${Date.now()}`,
                    colors: colorsArray
                  });
                }
              } else {
                // إذا لم يكن العنصر الأول مصفوفة، خذ جميع العناصر مباشرة
                const colorsArray = parsedColors.filter((color: any) => typeof color === 'string');
                console.log(`🔍 Direct colors array for group ${index}:`, colorsArray);
                
                if (colorsArray.length > 0) {
                  convertedColors.push({
                    id: `color-${index}-${Date.now()}`,
                    colors: colorsArray
                  });
                }
              }
            }
          } catch (parseError) {
            console.log('🔍 Failed to parse color JSON, treating as direct color:', colorGroup);
            convertedColors.push({
              id: `color-${index}-${Date.now()}`,
              colors: [colorGroup]
            });
          }
        }
      });

      console.log('🔍 convertColorsFromAPI - final converted colors:', convertedColors);
      return convertedColors;
    } catch (error) {
      console.error('🔍 Error converting colors:', error);
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
      console.log('🔍 ProductsForm - Initial load - form.specificationValues:', form.specificationValues);
      
      // محاولة استخدام specificationValues أولاً (من API)
      if (form.specificationValues && Array.isArray(form.specificationValues) && form.specificationValues.length > 0) {
        console.log('🔍 ProductsForm - Using specificationValues from API');
        const cleaned = form.specificationValues.map((spec: any) => {
          // البحث عن المواصفة في البيانات المحملة للحصول على العنوان الصحيح
          const specData = Array.isArray(apiSpecifications) ? apiSpecifications.find((s: any) => s._id === spec.specificationId) : null;
          const title = specData ? (isRTL ? specData.titleAr : specData.titleEn) : (spec.title || `Specification ${spec.specificationId}`);
          
          return {
            specId: spec.specificationId,
            valueId: spec.valueId || spec._id,
            value: spec.value || '',
            quantity: spec.quantity || 0,
            price: spec.price || 0
          };
        });
        console.log('🔍 ProductsForm - Cleaned specificationValues:', cleaned);
        setSpecificationDetails(cleaned);
        // تحديث الكمية المتاحة عند تحميل البيانات الأولية
        updateAvailableQuantity(cleaned);
      } else {
        console.log('🔍 ProductsForm - No specifications found, setting empty array');
        setSpecificationDetails([]);
        // تحديث الكمية المتاحة إلى صفر عند عدم وجود صفات
        updateAvailableQuantity([]);
      }
      
      hasLoadedSpecifications.current = true;
    }
  }, []); // تشغيل مرة واحدة فقط عند التحميل

  // مراقبة تغييرات specificationDetails وتحديث الكمية المتاحة
  useEffect(() => {
    if (hasLoadedSpecifications.current) {
      updateAvailableQuantity(specificationDetails);
    }
  }, [specificationDetails]);

  // تحويل الألوان من API إلى التنسيق المطلوب
  useEffect(() => {
    console.log('🔍 ProductsForm - Colors useEffect triggered');
    console.log('🔍 ProductsForm - form.colors:', form.colors);
    console.log('🔍 ProductsForm - form.colors type:', typeof form.colors);
    console.log('🔍 ProductsForm - form.colors is array:', Array.isArray(form.colors));
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

  // تحديث الفئات المختارة عند تغيير بيانات النموذج
  useEffect(() => {
    let newSelectedIds: string[] = [];
    
    console.log('🔍 ProductsForm - useEffect: Updating selectedCategoryIds from form data:', {
      formCategoryIds: form.categoryIds,
      formCategoryId: form.categoryId,
      formCategory: form.category
    });
    
    if (form.categoryIds && Array.isArray(form.categoryIds)) {
      newSelectedIds = form.categoryIds;
      console.log('🔍 ProductsForm - useEffect: Using categoryIds array:', newSelectedIds);
    } else if (form.categoryId) {
      // Handle categoryId as comma-separated string
      if (typeof form.categoryId === 'string' && form.categoryId.includes(',')) {
        newSelectedIds = form.categoryId.split(',').map((id: string) => id.trim()).filter((id: string) => id);
        console.log('🔍 ProductsForm - useEffect: Parsed categoryId as comma-separated:', newSelectedIds);
      } else {
        newSelectedIds = [form.categoryId];
        console.log('🔍 ProductsForm - useEffect: Using single categoryId:', newSelectedIds);
      }
    } else if (form.category && form.category._id) {
      newSelectedIds = [form.category._id];
      console.log('🔍 ProductsForm - useEffect: Using form.category._id:', newSelectedIds);
    }
    
    console.log('🔍 ProductsForm - useEffect: Final selectedCategoryIds:', newSelectedIds);
    setSelectedCategoryIds(newSelectedIds);
  }, [form.categoryIds, form.categoryId, form.category, form]);

  // useEffect إضافي لمراقبة تغييرات form prop
  useEffect(() => {
    console.log('🔍 ProductsForm - form prop changed:', {
      formCategoryIds: form.categoryIds,
      formCategoryId: form.categoryId,
      formCategories: form.categories
    });
  }, [form]);

  // تحديث categoryId في الفورم عند تغيير selectedCategoryIds
  useEffect(() => {
    console.log('🔍 useEffect for selectedCategoryIds triggered:', {
      selectedCategoryIds,
      currentFormCategoryId: form.categoryId
    });
    
    if (selectedCategoryIds.length > 0) {
      // تحديث categoryId ليشمل جميع الفئات المختارة
      const newCategoryId = selectedCategoryIds.join(',');
      if (form.categoryId !== newCategoryId) {
        console.log('🔍 Updating categoryId from selectedCategoryIds:', newCategoryId);
        handleInputChange('categoryId', newCategoryId);
      }
    } else {
      // إذا لم تكن هناك فئات مختارة، تأكد من مسح categoryId
      if (form.categoryId !== '') {
        console.log('🔍 Clearing categoryId as no categories are selected');
        handleInputChange('categoryId', '');
      }
    }
  }, [selectedCategoryIds, form.categoryId]);

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
    titleAr: spec.titleAr,
    titleEn: spec.titleEn,
    values: spec.values.map((value, index) => ({
      valueAr: value.valueAr,
      valueEn: value.valueEn
    }))
  })) : [];

  // تحويل specifications prop إلى التنسيق المطلوب إذا كانت موجودة
  const formattedSpecificationsProp = Array.isArray(specifications) ? specifications.map((spec: any) => ({
    _id: spec._id,
    title: isRTL ? spec.titleAr : spec.titleEn,
    titleAr: spec.titleAr,
    titleEn: spec.titleEn,
    values: spec.values.map((value: any) => ({
      valueAr: value.valueAr,
      valueEn: value.valueEn
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
  const convertedColors = e.target.value.map(colorVariant => colorVariant.colors);
  
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
  };
  
  //-------------------------------------------- handleInputChange -------------------------------------------
  const handleInputChange = (name: string, value: string | any[]) => {
    //CONSOLE.log('🔍 ProductsForm - handleInputChange:', { name, value });
    
    // Debug logging for categoryId changes
    if (name === 'categoryId') {
      console.log('🔍 handleInputChange - categoryId:', { 
        name, 
        value, 
        currentFormCategoryId: form.categoryId,
        valueType: typeof value 
      });
    }
    
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
    console.log('🔍 ProductsForm - handleTagsChange called with values:', values);
    console.log('🔍 ProductsForm - handleTagsChange - values type:', typeof values);
    console.log('🔍 ProductsForm - handleTagsChange - values is array:', Array.isArray(values));
    onTagsChange(values);
  };

  // دالة معالجة تغيير الفئات المختارة
  const handleCategorySelectionChange = (categoryIds: string[]) => {
    console.log('🔍 handleCategorySelectionChange called with:', categoryIds);
    console.log('🔍 Current form.categoryId before update:', form.categoryId);
    
    setSelectedCategoryIds(categoryIds);
    
    // تحديث الفورم مع الفئات المختارة
    if (categoryIds.length === 1) {
      // إذا كانت فئة واحدة فقط، استخدم categoryId للتوافق مع النظام الحالي
      console.log('🔍 Setting single categoryId:', categoryIds[0]);
      handleInputChange('categoryId', categoryIds[0]);
      handleInputChange('categoryIds', categoryIds);
    } else if (categoryIds.length > 1) {
      // إذا كانت أكثر من فئة، استخدم أول فئة كـ categoryId للتوافق مع النظام الحالي
      console.log('🔍 Setting multiple categories, using first as categoryId:', categoryIds[0]);
      handleInputChange('categoryId', categoryIds[0]);
      handleInputChange('categoryIds', categoryIds);
    } else {
      // إذا لم تكن هناك فئات مختارة
      console.log('🔍 Clearing categories');
      handleInputChange('categoryId', '');
      handleInputChange('categoryIds', []);
    }
    
    console.log('🔍 handleCategorySelectionChange completed');
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
    <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[70vh] space-y-6" onClick={(e) => e.stopPropagation()}>
      
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
            {(() => {
              console.log('🔍 ProductsForm - CustomCategorySelector props:', {
                selectedCategories: selectedCategoryIds,
                categoriesCount: categories?.length || 0
              });
              return null;
            })()}
            <CustomCategorySelector
              categories={categories as CategoryNode[] || []}
              selectedCategories={selectedCategoryIds}
              onSelectionChange={handleCategorySelectionChange}
              isRTL={isRTL}
              label={isRTL ? t('products.category') : 'Category'}
              placeholder={isRTL ? t('products.selectCategory') : 'Select Category'}
              className={getFieldErrorClass('categoryId')}
              maxSelections={10}
              showSearch={true}
              showCount={true}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? 'يمكنك اختيار عدة فئات مع دعم حتى 10 مستويات من الفئات الفرعية' 
                : 'You can select multiple categories with support for up to 10 levels of subcategories'
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
       
      </div>

      {/* ==================== Pricing Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          {isRTL ? 'الأسعار' : 'Pricing'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
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

        {/* سويتش تفعيل الخصم */}
        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'} text-orange-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {isRTL ? 'تفعيل الخصم' : 'Enable Sale'}
              </span>
            </div>
            <CustomSwitch
              name="isOnSale"
              checked={form.isOnSale === 'true' || form.isOnSale === true}
              onChange={(e) => handleInputChange('isOnSale', e.target.checked.toString())}
              label=""
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {isRTL 
              ? 'قم بتفعيل هذا الخيار لتفعيل خصم المنتج' 
              : 'Enable this option to activate product discount'
            }
          </p>
        </div>

        {/* حقل نسبة الخصم - يظهر فقط عند تفعيل السويتش */}
        {(form.isOnSale === 'true' || form.isOnSale === true) && (
          <div className="mt-4">
            <CustomInput
              label={isRTL ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}
              name="salePercentage"
              value={form.salePercentage || ''}
              onChange={(e) => handleInputChange('salePercentage', e.target.value)}
              className={getFieldErrorClass('salePercentage')}
              type="number"
              min="0"
              max="100"
              placeholder={isRTL ? 'أدخل نسبة الخصم من 0 إلى 100' : 'Enter discount percentage from 0 to 100'}
            />
            {renderFieldError('salePercentage')}
            <p className="text-xs text-gray-500 mt-1">
              {isRTL 
                ? 'سيتم تطبيق الخصم على السعر الأساسي للمنتج' 
                : 'The discount will be applied to the product\'s base price'
              }
            </p>
          </div>
        )}
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
          
          {/* عرض الباركود المُنشأ تحت الحقل */}
          {localNewBarcode && localNewBarcode.trim() && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {isRTL ? 'معاينة الباركود:' : 'Barcode Preview:'}
              </h4>
              <div className="flex justify-center">
                <CustomBarcode
                  value={localNewBarcode.trim()}
                  width={2}
                  height={80}
                  fontSize={14}
                  margin={5}
                  displayValue={true}
                  format="CODE128"
                  className="max-w-full"
                />
              </div>
            </div>
          )}
          
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
            <div className="space-y-4">
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
              
              {/* عرض الباركود المُنشأ للباركود المضافة */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {isRTL ? 'الباركود المُنشأ:' : 'Generated Barcodes:'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {form.barcodes.map((barcode: string, index: number) => (
                    <div key={index} className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs text-gray-600 mb-2 font-mono">{barcode}</span>
                      <CustomBarcode
                        value={barcode}
                        width={1.5}
                        height={60}
                        fontSize={10}
                        margin={2}
                        displayValue={false}
                        format="CODE128"
                        className="max-w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
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
          
          <div className="space-y-4 col-span-2 ">
            <div>
              <CustomInput
                label={isRTL ? t('products.availableQuantity') : 'Available Quantity'}
                name="stock"
                value={form.stock || ''}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className={getFieldErrorClass('stock')}
                type="number"
                disabled={specificationDetails.length > 0}
                placeholder={
                  specificationDetails.length > 0 
                    ? (isRTL ? 'سيتم الحساب تلقائياً من الصفات' : 'Will be calculated automatically from specifications')
                    : (isRTL ? 'أدخل الكمية المتاحة' : 'Enter available quantity')
                }
              />
              {renderFieldError('availableQuantity')}
              <p className="text-xs text-gray-500 mt-1">
                {specificationDetails.length > 0 
                  ? (isRTL 
                      ? 'يتم حساب الكمية المتاحة تلقائياً من مجموع كميات الصفات المختارة' 
                      : 'Available quantity is automatically calculated from the sum of selected specification quantities'
                    )
                  : (isRTL 
                      ? 'يمكنك إدخال الكمية المتاحة يدوياً عندما لا توجد صفات مختارة' 
                      : 'You can manually enter the available quantity when no specifications are selected'
                    )
                }
              </p>
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
                console.log('🔍 MultiSelect onChange called with values:', values);
                console.log('🔍 MultiSelect - values type:', typeof values);
                console.log('🔍 MultiSelect - values is array:', Array.isArray(values));
                
                const ids = values.map((v: any) => typeof v === 'object' ? v._id || v.id : v);
                console.log('🔍 MultiSelect - processed ids:', ids);
                console.log('🔍 MultiSelect - form has productLabels:', 'productLabels' in form);
                        console.log('🔍 MultiSelect - form.productLabels:', form.productLabels);
        console.log('🔍 MultiSelect - form.tags:', form.tags);
        
        if ('productLabels' in form) {
                  console.log('🔍 MultiSelect - calling onFormChange with productLabels');
                  onFormChange({
                    target: {
                      name: 'productLabels',
                      value: ids,
                    }
                  } as any);
                } else {
                  console.log('🔍 MultiSelect - calling handleTagsChange with tags');
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
          <SpecificationSelector
            specifications={formattedSpecificationsProp.length > 0 ? formattedSpecificationsProp : formattedSpecifications}
            selectedSpecifications={specificationDetails}
            onSpecificationChange={(specifications) => {
              console.log('🔍 ProductsForm - New specification selector called with:', specifications);
              
              setSpecificationDetails(specifications);
              
              // تحديث الكمية المتاحة تلقائياً
              updateAvailableQuantity(specifications);
              
              // تحويل البيانات إلى التنسيق المطلوب للنموذج
              const cleaned = specifications.map(spec => ({
                _id: spec.valueId,
                title: spec.value,
                value: spec.value
              }));
              
              // تحديث form.selectedSpecifications
              onFormChange({
                target: {
                  name: 'selectedSpecifications',
                  value: JSON.stringify(cleaned)
                }
              } as any);
              
              // تحديث form.specifications (IDs فقط)
              const specificationIds = [...new Set(specifications.map(spec => spec.specId))];
              console.log('🔍 ProductsForm - Specification IDs:', specificationIds);
              onFormChange({
                target: {
                  name: 'specifications',
                  value: specificationIds
                }
              } as any);
              
              // تحديث form.specificationValues (القيم الكاملة مع الكمية والسعر)
              const specificationValues = specifications.map(spec => {
                // البحث عن المواصفة في البيانات المحملة للحصول على العنوان الصحيح
                const specData = Array.isArray(apiSpecifications) ? apiSpecifications.find((s: any) => s._id === spec.specId) : null;
                const title = specData ? (isRTL ? specData.titleAr : specData.titleEn) : `Specification ${spec.specId}`;
                
                return {
                  specificationId: spec.specId,
                  valueId: spec.valueId,
                  value: spec.value,
                  title: title,
                  quantity: spec.quantity,
                  price: spec.price
                };
              });
              console.log('🔍 ProductsForm - Specification values with quantity and price:', specificationValues);
              onFormChange({
                target: {
                  name: 'specificationValues',
                  value: specificationValues
                }
              } as any);
              
              console.log('🔍 ProductsForm - Form updates completed with new specification selector.');
            }}
            isRTL={isRTL}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 mr-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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