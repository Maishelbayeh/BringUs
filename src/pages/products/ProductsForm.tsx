import React, { useEffect, useState } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomSelect from '../../components/common/CustomSelect';
import CustomSwitch from '../../components/common/CustomSwitch';
import CustomShuttle from '../../components/common/CustomShuttle';
import CustomColorPicker from '../../components/common/CustomColorPicker';
import CustomTextArea from '../../components/common/CustomTextArea';
import { CheckboxSpecificationSelector } from '../../components/common';

import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import MultiSelect from '@/components/common/MultiSelect';
import useProductSpecifications from '@/hooks/useProductSpecifications';

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
}

//-------------------------------------------- ProductsForm -------------------------------------------
const ProductsForm: React.FC<ProductsFormProps> = ({ 
  form, 
  onFormChange, 
  onTagsChange, 
  onImageChange, 
  onMainImageChange, 
  uploadMainImage,
  categories = [], 
  tags = [], 
  units = [],
  specifications = []
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  
  // استخدام hook لجلب مواصفات المنتجات من API
  const { specifications: apiSpecifications, fetchSpecifications } = useProductSpecifications();
  
  // state للمواصفات المختارة
  const [selectedSpecifications, setSelectedSpecifications] = useState<any[]>([]);
  const [showBarcodeSuccess, setShowBarcodeSuccess] = useState(false);
  const [localNewBarcode, setLocalNewBarcode] = useState('');
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [showMainImageSuccess, setShowMainImageSuccess] = useState(false);

  // جلب مواصفات المنتجات عند تحميل المكون
  useEffect(() => {
    //CONSOLE.log('🔍 ProductsForm - Fetching specifications...');
    fetchSpecifications().then((data) => {
      //CONSOLE.log('🔍 ProductsForm - Fetched specifications:', data);
    }).catch((error) => {
      //CONSOLE.error('🔍 ProductsForm - Error fetching specifications:', error);
    });
  }, [fetchSpecifications]);

  // تحويل البيانات من النموذج إلى التنسيق المطلوب
  useEffect(() => {
    //CONSOLE.log('🔍 ProductsForm - form.selectedSpecifications:', form.selectedSpecifications);
    if (form.selectedSpecifications) {
      try {
        let parsed;
        if (typeof form.selectedSpecifications === 'string') {
          parsed = JSON.parse(form.selectedSpecifications);
        } else {
          parsed = form.selectedSpecifications;
        }
        
        if (Array.isArray(parsed)) {
          //CONSOLE.log('🔍 ProductsForm - Setting selectedSpecifications:', parsed);
          setSelectedSpecifications(parsed);
        } else {
          //CONSOLE.log('🔍 ProductsForm - parsed is not array:', parsed);
          setSelectedSpecifications([]);
        }
      } catch (error) {
        //CONSOLE.error('Error parsing selectedSpecifications:', error);
        setSelectedSpecifications([]);
      }
    } else {
      //CONSOLE.log('🔍 ProductsForm - No selectedSpecifications, setting empty array');
      setSelectedSpecifications([]);
    }
  }, [form.selectedSpecifications]);

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
    title: isRtl ? spec.titleAr : spec.titleEn,
    values: spec.values.map((value, index) => ({
      _id: `${spec._id}_${index}`,
      value: isRtl ? value.valueAr : value.valueEn,
      title: isRtl ? spec.titleAr : spec.titleEn
    }))
  })) : [];

  // تحويل specifications prop إلى التنسيق المطلوب إذا كانت موجودة
  const formattedSpecificationsProp = Array.isArray(specifications) ? specifications.map((spec: any) => ({
    _id: spec._id,
    title: isRtl ? spec.titleAr : spec.titleEn,
    values: spec.values.map((value: any, index: number) => ({
      _id: `${spec._id}_${index}`,
      value: isRtl ? value.valueAr : value.valueEn,
      title: isRtl ? spec.titleAr : spec.titleEn
    }))
  })) : [];

  // //CONSOLE.log('🔍 ProductsForm - formattedSpecifications:', formattedSpecifications);
  // //CONSOLE.log('🔍 ProductsForm - formattedSpecificationsProp:', formattedSpecificationsProp);
  // //CONSOLE.log('🔍 ProductsForm - selectedSpecifications:', selectedSpecifications);
  // //CONSOLE.log('🔍 ProductsForm - apiSpecifications raw:', apiSpecifications);

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
    //CONSOLE.log('🔍 ProductsForm - handleColorChange:', e.target);
    onFormChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      }
    } as any);
  };
  
  //-------------------------------------------- handleInputChange -------------------------------------------
  const handleInputChange = (name: string, value: string | any[]) => {
    //CONSOLE.log('🔍 ProductsForm - handleInputChange:', { name, value });
    if (name === 'barcodes') {
      //CONSOLE.log('🔍 ProductsForm - Updating barcodes:', value);
      //CONSOLE.log('🔍 ProductsForm - barcodes type:', typeof value);
      //CONSOLE.log('🔍 ProductsForm - barcodes is array:', Array.isArray(value));
      //CONSOLE.log('🔍 ProductsForm - barcodes length:', Array.isArray(value) ? value.length : 'N/A');
    }
    
    if (name === 'mainImage') {
      //CONSOLE.log('🔍 ProductsForm - Updating mainImage:', value);
      //CONSOLE.log('🔍 ProductsForm - mainImage type:', typeof value);
      //CONSOLE.log('🔍 ProductsForm - mainImage === null:', value === null);
    }
    
    // إنشاء event object
    const event = {
      target: {
        name,
        value: value, // إرسال القيمة كما هي
      }
    } as any;
    
    if (name === 'barcodes') {
      //CONSOLE.log('🔍 ProductsForm - handleInputChange - Sending event:', event);
      //CONSOLE.log('🔍 ProductsForm - handleInputChange - Event value:', event.target.value);
    }
    
    if (name === 'mainImage') {
      //CONSOLE.log('🔍 ProductsForm - handleInputChange - Sending mainImage event:', event);
      //CONSOLE.log('🔍 ProductsForm - handleInputChange - MainImage event value:', event.target.value);
    }
    
    // إرسال الحدث إلى onFormChange
    onFormChange(event);
  };
  
  //-------------------------------------------- handleSelectChange -------------------------------------------
  const handleSelectChange = (name: string, value: string) => {
    //CONSOLE.log('🔍 ProductsForm - handleSelectChange:', { name, value });
    onFormChange({
      target: {
        name,
        value,
      }
    } as any);
  };
  
  // handle multi-select for product labels
  const handleTagsChange = (values: string[]) => {
    //CONSOLE.log('🔍 ProductsForm - handleTagsChange:', values);
    onTagsChange(values);
  };

  // دالة إضافة باركود جديد
  const addBarcode = () => {
    //CONSOLE.log('🔍 addBarcode called');
    //CONSOLE.log('🔍 localNewBarcode:', localNewBarcode);
    //CONSOLE.log('🔍 form.barcodes before:', form.barcodes);
    
    if (localNewBarcode && localNewBarcode.trim()) {
      const currentBarcodes = Array.isArray(form.barcodes) ? form.barcodes : [];
      //CONSOLE.log('🔍 currentBarcodes:', currentBarcodes);
      
      // التحقق من عدم تكرار الباركود
      if (currentBarcodes.includes(localNewBarcode.trim())) {
        //CONSOLE.log('🔍 Barcode already exists');
        alert(isRtl ? 'الباركود موجود مسبقاً!' : 'Barcode already exists!');
        return;
      }
      
      const newBarcodes = [...currentBarcodes, localNewBarcode.trim()];
      //CONSOLE.log('🔍 newBarcodes:', newBarcodes);
      
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
      
      //CONSOLE.log('🔍 Barcode added successfully');
    } else {
      //CONSOLE.log('🔍 No barcode to add - empty or whitespace');
      alert(isRtl ? 'يرجى إدخال باركود!' : 'Please enter a barcode!');
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
      alert(isRtl ? 'فشل في رفع الصورة الأساسية' : 'Failed to upload main image');
      handleInputChange('mainImage', null as any);
      setShowMainImageSuccess(false);
    } finally {
      setMainImageUploading(false);
    }
  };

  //-------------------------------------------- return -------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[70vh] space-y-6">
      
      {/* ==================== Basic Information Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isRtl ? 'المعلومات الأساسية' : 'Basic Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput
            label={isRtl ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
            name="nameAr"
            value={form.nameAr || ''}
            onChange={(e) => handleInputChange('nameAr', e.target.value)}
            required
          />
          <CustomInput
            label={isRtl ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
            name="nameEn"
            value={form.nameEn || ''}
            onChange={(e) => handleInputChange('nameEn', e.target.value)}
            required
          />
          <div className="md:col-span-2">
            <CustomTextArea
              label={isRtl ? 'الوصف (عربي)' : 'Description (Arabic)'}
              name="descriptionAr"
              value={form.descriptionAr || ''}
              onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <CustomTextArea
              label={isRtl ? 'الوصف (إنجليزي)' : 'Description (English)'}
              name="descriptionEn"
              value={form.descriptionEn || ''}
              onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ==================== Category & Unit Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {isRtl ? 'التصنيف والوحدة' : 'Category & Unit'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomSelect
            label={isRtl ? t('products.category') : 'Category'}
            value={form.categoryId || ''}
            onChange={(e) => handleSelectChange('categoryId', e.target.value)}
            options={[
              { value: '', label: isRtl ? t('products.selectCategory') : 'Select Category' },
              ...(Array.isArray(categories) ? categories.map((cat: any) => ({ 
                value: String(cat._id || cat.id), 
                label: isRtl ? cat.nameAr : cat.nameEn 
              })) : [])
            ]}
          />
          <CustomSelect
            label={isRtl ? t('products.unit') : 'Unit'}
            value={form.unitId || ''}
            onChange={(e) => handleSelectChange('unitId', e.target.value)}
            options={[
              { value: '', label: isRtl ? t('products.selectUnit') : 'Select Unit' },
              ...(Array.isArray(units) ? units.map((u: any) => ({ 
                value: String(u._id || u.id), 
                label: isRtl ? u.nameAr : u.nameEn 
              })) : [])
            ]}
          />
        </div>
      </div>

      {/* ==================== Pricing Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          {isRtl ? 'الأسعار' : 'Pricing'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CustomInput
            label={isRtl ? t('products.price') : 'Price'}
            name="price"
            value={form.price || ''}
            onChange={(e) => handleInputChange('price', e.target.value)}
            type="number"
            required
          />
          <CustomInput
            label={isRtl ? 'سعر التكلفة' : 'Cost Price'}
            name="costPrice"
            value={form.costPrice || ''}
            onChange={(e) => handleInputChange('costPrice', e.target.value)}
            type="number"
          />
          <CustomInput
            label={isRtl ? 'سعر الجملة' : 'Wholesale Price'}
            name="compareAtPrice"
            value={form.compareAtPrice || ''}
            onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
            type="number"
          />
        </div>
      </div>

      {/* ==================== Barcode Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isRtl ? 'الباركود' : 'Barcodes'}
        </h3>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              className={`w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${isRtl ? 'text-right pr-12' : 'text-left pl-12'}`}
              placeholder={isRtl ? 'أدخل الباركود واضغط Enter أو انقر على +' : 'Enter barcode and press Enter or click +'}
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
              } ${isRtl ? 'right-2' : 'left-2'}`}
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
              {isRtl ? 'تم إضافة الباركود بنجاح!' : 'Barcode added successfully!'}
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
                    title={isRtl ? 'حذف الباركود' : 'Remove barcode'}
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
              {isRtl ? 'لا توجد باركود مضافة' : 'No barcodes added'}
            </div>
          )}
        </div>
      </div>

      {/* ==================== Settings Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {isRtl ? 'الإعدادات' : 'Settings'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CustomSwitch
              label={isRtl ? t('products.visibility') : 'Visibility'}
              name="visibility"
              checked={form.visibility === 'Y'}
              onChange={onFormChange}
              isRTL={isRtl}
            />
            <CustomSwitch
              label={isRtl ? t('products.maintainStock') : 'Maintain Stock'}
              name="maintainStock"
              checked={form.maintainStock === 'Y'}
              onChange={e => {
                onFormChange(e);
                if (e.target.value === 'N') {
                  handleInputChange('availableQuantity', '');
                }
              }}
              isRTL={isRtl}
            />
          </div>
          
          <div className="space-y-4">
            <CustomInput
              label={isRtl ? t('products.availableQuantity') : 'Available Quantity'}
              name="availableQuantity"
              value={form.availableQuantity || ''}
              onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
              type="number"
              disabled={form.maintainStock !== 'Y'}
            />
            <MultiSelect
              label={isRtl ? t('products.productLabel') : 'Product Label'}
              value={Array.isArray(form.tags) ? form.tags : []}
              onChange={handleTagsChange}
              options={[
                ...(Array.isArray(tags) ? tags.map((opt: any) => ({
                  value: String(opt._id || opt.id),
                  label: isRtl ? opt.nameAr : opt.nameEn
                })) : [])
              ]}
              placeholder={isRtl ? 'اختر علامات المنتج' : 'Select product labels'}
            />
          </div>
        </div>
      </div>

      {/* ==================== Specifications Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {isRtl ? 'مواصفات المنتج' : 'Product Specifications'}
        </h3>
        
        {formattedSpecificationsProp.length > 0 || formattedSpecifications.length > 0 ? (
          <CheckboxSpecificationSelector
            specifications={formattedSpecificationsProp.length > 0 ? formattedSpecificationsProp : formattedSpecifications}
            selectedSpecifications={selectedSpecifications}
            onSelectionChange={(selected) => {
              //CONSOLE.log('🔍 ProductsForm - onSelectionChange called with:', selected);
              setSelectedSpecifications(selected);
              handleInputChange('selectedSpecifications', JSON.stringify(selected));
            }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">{isRtl ? 'لا توجد مواصفات متاحة' : 'No specifications available'}</p>
            <p className="text-sm">{isRtl ? 'قم بإضافة مواصفات المنتجات أولاً' : 'Please add product specifications first'}</p>
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
          <svg className="w-5 h-5 mr-2 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
          {isRtl ? t('products.colors') : 'Colors'}
        </h3>
        
        <CustomColorPicker
          label={isRtl ? t('products.colors') : 'Colors'}
          name="colors"
          value={form.colors || []}
          onChange={handleColorChange}
          isRTL={isRtl}
        />
      </div>

      {/* ==================== Media Section ==================== */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isRtl ? 'الوسائط' : 'Media'}
        </h3>
        
        <div className="space-y-6">
          {/* الصورة الأساسية */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              {isRtl ? 'الصورة الأساسية' : 'Main Image'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {isRtl ? 'الصورة الرئيسية التي ستظهر في قائمة المنتجات' : 'Main image that will appear in product listings'}
            </p>
            
            <CustomFileInput
              label={isRtl ? 'اختر الصورة الأساسية' : 'Select Main Image'}
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
                  {isRtl ? 'جاري رفع الصورة الأساسية...' : 'Uploading main image...'}
                </span>
              </div>
            )}
            
            {/* رسالة النجاح */}
            {showMainImageSuccess && (
              <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg flex items-center text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isRtl ? 'تم رفع الصورة الأساسية بنجاح!' : 'Main image uploaded successfully!'}
              </div>
            )}
            
            {/* معاينة الصورة الأساسية الموجودة */}
            {form.mainImage && form.mainImage !== null && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {isRtl ? 'الصورة الحالية:' : 'Current Image:'}
                </h5>
                <div className="relative inline-block">
                  <img 
                    src={form.mainImage} 
                    alt={isRtl ? 'الصورة الأساسية' : 'Main Image'}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleInputChange('mainImage', null as any);
                      setShowMainImageSuccess(false); // إزالة رسالة النجاح عند الحذف
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title={isRtl ? 'حذف الصورة' : 'Remove Image'}
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
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {isRtl ? 'الصور الإضافية' : 'Additional Images'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {isRtl ? 'صور إضافية للمنتج (اختياري)' : 'Additional product images (optional)'}
            </p>
            
            <CustomFileInput
              label={isRtl ? 'اختر الصور الإضافية' : 'Select Additional Images'}
              id="images"
              value={form.images || []}
              onChange={files => onImageChange(files)}
              multiple={true}
            />
            
            {/* معاينة الصور الإضافية الموجودة */}
            {Array.isArray(form.images) && form.images.length > 0 && form.images.some((img: any) => img && img !== null) && (
              <div className="mt-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {isRtl ? 'الصور الحالية:' : 'Current Images:'}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {form.images.filter((img: any) => img && img !== null).map((image: string, index: number) => (
                    <div key={index} className="relative">
                      <img 
                        src={image} 
                        alt={`${isRtl ? 'صورة' : 'Image'} ${index + 1}`}
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
                        title={isRtl ? 'حذف الصورة' : 'Remove Image'}
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
              <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {isRtl ? 'فيديو المنتج' : 'Product Video'}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {isRtl ? 'رابط فيديو تعريفي للمنتج (اختياري)' : 'Product video URL (optional)'}
            </p>
            
            <CustomInput
              label={isRtl ? 'رابط الفيديو' : 'Video URL'}
              name="productVideo"
              value={form.productVideo || ''}
              onChange={(e) => handleInputChange('productVideo', e.target.value)}
              placeholder={isRtl ? 'https://example.com/video.mp4' : 'https://example.com/video.mp4'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsForm; 