import React, { useState, useEffect } from 'react';
import CustomBarcode from '../../components/common/CustomBarcode';
import { getStoreInfo } from '../../utils/storeUtils';
import { currencyOptions } from '../../data/currencyOptions';
import { getSpecificationDisplay } from '../../utils/specificationUtils';

interface VariantsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  variants: any[];
  parentProduct: any;
  onEditVariant: (variant: any) => void;
  onDeleteVariant: (variant: any) => void;
  onAddVariant: () => void;
  isRTL: boolean;
  isLoading?: boolean;
}

const VariantsPopup: React.FC<VariantsPopupProps> = ({
  isOpen,
  onClose,
  variants,
  parentProduct,
  onEditVariant,
  onDeleteVariant,
  isRTL,
  isLoading = false
}) => {
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [localVariants, setLocalVariants] = useState<any[]>(variants);

  // دالة للحصول على رمز العملة
  const getCurrencySymbol = (): string => {
    const storeInfo = getStoreInfo();
    const storeCurrency = storeInfo?.settings?.currency || 'ILS';
    
    // البحث عن رمز العملة في قائمة العملات المتاحة
    const currency = currencyOptions.find(option => option.code === storeCurrency);
    if (currency) {
      // إرجاع رمز العملة المناسب
      const symbols: { [key: string]: string } = {
        'ILS': '₪',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'SAR': 'ر.س',
        'AED': 'د.إ',
        'QAR': 'ر.ق',
        'KWD': 'د.ك',
        'BHD': 'د.ب',
        'OMR': 'ر.ع',
        'JOD': 'د.أ',
        'EGP': 'ج.م',
        'LBP': 'ل.ل',
        'TRY': '₺',
        'JPY': '¥',
        'CNY': '¥',
        'INR': '₹',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF'
      };
      return symbols[storeCurrency] || storeCurrency;
    }
    
    return '₪'; // رمز افتراضي
  };

  // تحديث البيانات المحلية عند تغيير variants prop
  useEffect(() => {
    console.log('🔍 VariantsPopup - variants prop changed:', variants);
    setLocalVariants(variants);
  }, [variants]);

  // دالة لتحديث متغير محدد في البوب أب
  // const updateVariantInPopup = (updatedVariant: any) => {
  //   setLocalVariants(prevVariants => 
  //     prevVariants.map(variant => 
  //       variant._id === updatedVariant._id || variant.id === updatedVariant._id
  //         ? { ...variant, ...updatedVariant }
  //         : variant
  //     )
  //   );
  // };

  // // دالة لحذف متغير من البوب أب
  // const removeVariantFromPopup = (variantId: string) => {
  //   setLocalVariants(prevVariants => 
  //     prevVariants.filter(v => 
  //       v._id !== variantId && v.id !== variantId
  //     )
  //   );
  // };

  const toggleVariant = (variantId: string) => {
    const newExpanded = new Set(expandedVariants);
    if (newExpanded.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
    }
    setExpandedVariants(newExpanded);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 flex `}>
      <div className={`${isRTL ? 'justify-end' : 'justify-start'} bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={` sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg`}>
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
            <h2 className="text-xl font-bold text-gray-800 ">
              {isRTL ? 'متغيرات المنتج' : 'Product Variants'}
            </h2>
            <button
              className="text-gray-500 hover:text-red-500 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              onClick={onClose}
              title={isRTL ? 'إغلاق' : 'Close'}
            >
              ×
            </button>
          </div>
          {parentProduct && (
            <div className={`flex  mt-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
              <span className={`font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {isRTL ? 'المنتج الأساسي' : 'Parent Product:'}
              </span>
              <span className={`font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                {isRTL ? parentProduct.nameAr : parentProduct.nameEn}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 ">
          {isLoading ? (
            <div className="text-center py-12 ${isRTL ? 'flex-row-reverse' : 'flex-row'} ">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {isRTL ? 'جاري تحميل المتغيرات...' : 'Loading variants...'}
              </p>
            </div>
          ) : localVariants.length === 0 ? (
            <div className="text-center py-12 ${isRTL ? 'flex-row-reverse' : 'flex-row'} ">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {isRTL ? 'لا يوجد متغيرات' : 'No Variants Found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isRTL ? 'لا يوجد تصنيفات لهذا المنتج' : 'No variants available for this product'}
              </p>
              {/* <button
                onClick={onAddVariant}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {isRTL ? 'إضافة متغير جديد' : 'Add New Variant'}
              </button> */}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add New Variant Button */}
              <div className="flex justify-end">
                {/* <button
                  onClick={onAddVariant}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {isRTL ? 'إضافة متغير جديد' : 'Add New Variant'}
                </button> */}
              </div>
              
              {/* Variants List */}
              <div className="space-y-4 ">
                {localVariants.map((variant, idx) => {
                  const variantId = variant._id || variant.id || idx.toString();
                  const isExpanded = expandedVariants.has(variantId);
                  
                  return (
                    <div key={variantId} className={`border border-gray-200 rounded-lg overflow-hidden `}>
                      {/* Collapsible Header */}
                      <div 
                        className={`flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}
                        onClick={() => toggleVariant(variantId)}
                      >
                        <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                           {/* Product Image */}
                           <div className={`flex-shrink-0 ${isRTL ? 'mr-2' : 'ml-2'} `}>
                             {(() => {
                               // التحقق من وجود صورة صالحة
                               const hasMainImage = variant.mainImage && variant.mainImage !== null && variant.mainImage !== '';
                               const hasImages = variant.images && Array.isArray(variant.images) && variant.images.length > 0 && variant.images[0] && variant.images[0] !== '';
                               
                               if (hasMainImage || hasImages) {
                                 const imageSrc = hasMainImage ? variant.mainImage : variant.images[0];
                                 return (
                                   <img
                                     src={imageSrc}
                                     alt={variant.nameAr || 'Product Image'}
                                     className={`w-16 h-16 object-cover rounded-lg border border-gray-200 ${isRTL ? 'mr-2' : 'ml-2'} `}
                                     onError={(e) => {
                                       // إذا فشل تحميل الصورة، أظهر صورة no_image
                                       e.currentTarget.src = '/no_image.png';
                                     }}
                                   />
                                 );
                               }
                               
                               // إذا لم تكن هناك صورة، أظهر صورة no_image
                               return (
                                 <img
                                   src="/no_image.png"
                                   alt="No Image"
                                   className={`w-16 h-16 object-cover rounded-lg border border-gray-200 ${isRTL ? 'mr-2' : 'ml-2'} `}
                                   onError={(e) => {
                                     // إذا فشل تحميل صورة no_image، أظهر placeholder
                                     e.currentTarget.style.display = 'none';
                                     e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                   }}
                                 />
                               );
                             })()}
                             
                             {/* Placeholder fallback */}
                             <div className={`hidden w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg border border-gray-300 flex items-center justify-center relative overflow-hidden ${isRTL ? 'mr-2' : 'ml-2'} `}>
                               {/* خلفية متدرجة */}
                               <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>
                               
                               {/* أيقونة المنتج */}
                               <div className="relative z-10 flex flex-col items-center">
                                 <svg className="w-6 h-6 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                 </svg>
                                 <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                               </div>
                               
                               {/* تأثيرات زخرفية */}
                               <div className="absolute top-1 right-1 w-2 h-2 bg-blue-200 rounded-full opacity-60"></div>
                               <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-purple-200 rounded-full opacity-60"></div>
                             </div>
                           </div>
                          
                          {/* Product Name and Price */}
                          <div className={`flex-1 ${isRTL ? 'mr-2' : 'ml-2'} `}>
                            <h3 className={`text-lg font-bold text-gray-800 ${isRTL ? 'mr-2' : 'ml-2'} `}>
                              {isRTL ? variant.nameAr : variant.nameEn}
                            </h3>
                            <p className={`text-gray-600 text-sm ${isRTL ? 'mr-2' : 'ml-2' } ${isRTL ? 'text-right' : 'text-left'} `}>
                              {isRTL ? 'السعر:' : 'Price:'} {getCurrencySymbol()}{variant.price || 0}
                            </p>
                          </div>
                        </div>
                        
                        {/* Expand/Collapse Icon */}
                        <div className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditVariant(variant);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title={isRTL ? 'تعديل المتغير' : 'Edit Variant'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteVariant(variant);
                            }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title={isRTL ? 'حذف المتغير' : 'Delete Variant'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Collapsible Content */}
                      {isExpanded && (
                        <div className={`p-6 bg-white flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                          <div className={`space-y-4 w-full `}>
                            {/* Description */}
                            <div className={`${isRTL ? 'text-right' : 'text-left'} `}>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                {isRTL ? 'الوصف' : 'Description'}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {isRTL ? variant.descriptionAr : variant.descriptionEn}
                              </p>
                            </div>
 {/* Additional Images */}
 {variant.images && variant.images.length > 0 && (
                              <div className={`${isRTL ? 'text-right' : 'text-left'} `}>
                                <div className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {isRTL ? 'الصور الإضافية' : 'Additional Images'}
                                </div>
                                <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                  {variant.images.slice(0, 8).map((img: string, imgIdx: number) => (
                                                                      <img
                                    key={imgIdx}
                                    src={img}
                                    alt={`${isRTL ? 'صورة إضافية' : 'Additional image'} ${imgIdx + 1}`}
                                    className="w-16 h-16 object-cover rounded border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                                    onClick={() => window.open(img, '_blank')}
                                    title={isRTL ? 'انقر لعرض الصورة' : 'Click to view image'}
                                  />
                                  ))}
                                </div>
                                {variant.images.length > 8 && (
                                                                  <div className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'} `}>
                                  +{variant.images.length - 8} {isRTL ? 'أخرى' : 'more'}
                                </div>
                                )}
                              </div>
                            )}
                            {/* Barcodes Section */}
                            {Array.isArray(variant.barcodes) && variant.barcodes.length > 0 && (
                              <div className={`${isRTL ? 'text-right' : 'text-left'} `}>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  {isRTL ? 'الباركود' : 'Barcodes'}
                                </h4>
                                <div className={`flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                  {variant.barcodes.map((barcode: string, idx: number) => (
                                    <div key={idx} className={`flex flex-col items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                      <CustomBarcode 
                                        value={barcode} 
                                        width={1.5} 
                                        height={40} 
                                        fontSize={8}
                                        margin={4}
                                        displayValue={false}
                                        className="mb-1"
                                      />
                                      <span className={`font-mono bg-gray-100 px-2 py-1 rounded text-xs text-center ${isRTL ? 'mr-2' : 'ml-2'} `}>
                                        {barcode}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
    
                                                        {/* Price and Stock */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className={`text-sm font-semibold text-blue-700 mb-1 ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {isRTL ? 'السعر' : 'Price'}
                                </div>
                                <div className={`text-lg font-bold text-blue-800 ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {getCurrencySymbol()}{variant.price || 0}
                                </div>
                                {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                                  <div className={`text-sm text-gray-500 line-through ${isRTL ? 'text-right' : 'text-left'} `}>
                                    {getCurrencySymbol()}{variant.compareAtPrice}
                                  </div>
                                )}
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className={`text-sm font-semibold text-green-700 mb-1 ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {isRTL ? 'الكمية المتوفرة' : 'Available Quantity'}
                                </div>
                                <div className={`text-lg font-bold text-green-800 ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {variant.availableQuantity || variant.stock || 0}
                                </div>
                              </div>
                            </div>

                            {/* Product Labels */}
                            <div className={`${isRTL ? 'text-right' : 'text-left'} `}>
                              <div className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'} `}>
                                {isRTL ? 'علامات المنتج' : 'Product Labels'}
                              </div>
                              {variant.productLabels && variant.productLabels.length > 0 ? (
                                <div className={`flex flex-wrap gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                  {variant.productLabels.map((label: any, labelIdx: number) => (
                                    <span 
                                      key={labelIdx}
                                      className={`px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold ${isRTL ? 'mr-2' : 'ml-2'} `}
                                      style={{ 
                                        backgroundColor: label.color ? `${label.color}20` : '#dbeafe',
                                        color: label.color || '#1d4ed8',
                                        border: label.color ? `1px solid ${label.color}` : '1px solid #dbeafe'
                                      }}
                                    >
                                      {isRTL ? label.nameAr : label.nameEn}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className={`text-gray-500 text-sm ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {isRTL ? 'لا توجد علامات' : 'No Labels'}
                                </span>
                              )}
                            </div>

                            {/* Specifications */}
                            <div className={`${isRTL ? 'text-right' : 'text-left'} `}>
                              <div className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'} `}>
                                {isRTL ? 'المواصفات' : 'Specifications'}
                              </div>
                              {variant.specificationValues && variant.specificationValues.length > 0 ? (
                                <div className={`space-y-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                  {variant.specificationValues.map((spec: any, specIdx: number) => (
                                    <div key={specIdx} className={`flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                      <div className="flex-1">
                                        <span className={`text-sm font-medium text-purple-800 ${isRTL ? 'text-right' : 'text-left'} `}>
                                          {getSpecificationDisplay(spec, isRTL).fullText}
                                        </span>
                                        <div className={`text-xs text-purple-600 mt-1 ${isRTL ? 'text-right' : 'text-left'} `}>
                                          {isRTL ? 'الكمية:' : 'Quantity:'} {spec.quantity || 0} 
                                          {/* | {isRTL ? 'السعر الإضافي:' : 'Additional Price:'} {getCurrencySymbol()}{spec.price || 0} */}
                                        </div>
                                      </div>
                                      {/* <div className={`text-right ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                        <span className={`text-sm font-medium text-purple-600 ${isRTL ? 'text-right' : 'text-left'} `}>
                                          {getCurrencySymbol()}{((spec.quantity || 0) * (spec.price || 0)).toFixed(2)}
                                        </span>
                                      </div> */}
                                    </div>
                                  ))}
                                  {/* Total for specifications */}
                                  {/* <div className={`mt-2 pt-2 border-t border-purple-200 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                      <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'} `}>
                                        {isRTL ? 'مجموع المواصفات:' : 'Specifications Total:'}
                                      </span>
                                      <span className={`font-medium text-purple-600 ${isRTL ? 'text-right' : 'text-left'} `}>
                                        {getCurrencySymbol()}{variant.specificationValues.reduce((total: number, spec: any) => 
                                          total + ((spec.quantity || 0) * (spec.price || 0)), 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div> */}
                                </div>
                              ) : (
                                <span className={`text-gray-500 text-sm ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {isRTL ? 'لا توجد مواصفات' : 'No specifications'}
                                </span>
                              )}
                            </div>

                            {/* Categories Section */}
                            <div className={`${isRTL ? 'text-right' : 'text-left'} `}>
                              <div className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'} `}>
                                {isRTL ? 'الفئات' : 'Categories'}
                              </div>
                              {variant.categories && variant.categories.length > 0 ? (
                                <div className={`flex flex-wrap gap-1 ${isRTL ? 'flex-row-reverse' : 'flex-row'} `}>
                                  {variant.categories.map((category: any, categoryIdx: number) => (
                                    <span 
                                      key={categoryIdx}
                                      className={`px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-200 ${isRTL ? 'mr-2' : 'ml-2'} `}
                                    >
                                      {isRTL ? category.nameAr : category.nameEn}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className={`text-gray-500 text-sm ${isRTL ? 'text-right' : 'text-left'} `}>
                                  {isRTL ? 'لا توجد فئات' : 'No Categories'}
                                </span>
                              )}
                            </div>

                            {/* Colors Section */}
                              <div className={`${isRTL ? 'text-right' : 'text-left'} `}>
                              <div className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'} `}>
                                <svg className="w-4 h-4 inline-block mr-1 rtl:ml-1 rtl:mr-0 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                                </svg>
                                {isRTL ? 'الألوان' : 'Colors'}
                              </div>
                          {(() => {
                            // استخدم allColors إذا كانت موجودة
                            let colorArrs: string[][] = [];
                            if (Array.isArray(variant.allColors) && variant.allColors.length > 0) {
                              // allColors is an array of strings, treat it as a single multi-color combination
                              colorArrs = [variant.allColors];
                            } else if (Array.isArray(variant.colors)) {
                              colorArrs = variant.colors;
                            }
                            return colorArrs.length > 0 ? (
                                <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`} style={{ minHeight: 28 }}>
                                {colorArrs.map((arr: string[], idx: number) => {
                                  let style = {};
                                  if (arr.length > 1) {
                                    const step = 100 / arr.length;
                                    const segments = arr.map((color, i) => {
                                      const start = step * i;
                                      const end = step * (i + 1);
                                      return `${color} ${start}% ${end}%`;
                                    }).join(', ');
                                    style = { background: `conic-gradient(${segments})` };
                                  } else {
                                    style = { background: arr[0] };
                                  }
                                  return (
                                    <span
                                      key={arr.join('-') + idx}
                                      className="inline-block w-6 h-6 rounded-full border border-gray-300 shadow-sm hover:scale-110 transition-transform duration-150 cursor-pointer"
                                      style={style}
                                      title={arr.join(', ')}
                                    />
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                {isRTL ? 'لا توجد ألوان' : 'No Colors'}
                              </span>
                            );
                          })()}
                        </div>
                        {/* <label htmlFor="hs-color-input" className="block text-sm font-medium mb-2 dark:text-white">Color picker</label>
<input type="color" className ="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700" id="hs-color-input" value="#2563eb" title="Choose your color"></input> */}

                           
                            </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantsPopup; 