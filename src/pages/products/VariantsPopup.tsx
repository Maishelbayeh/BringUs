import React from 'react';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/config';

interface VariantsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  variants: any[];
  parentProduct: any;
  onEditVariant: (variant: any) => void;
  onDeleteVariant: (variant: any) => void;
  onAddVariant: () => void;
  isRTL: boolean;
}

const VariantsPopup: React.FC<VariantsPopupProps> = ({
  isOpen,
  onClose,
  variants,
  parentProduct,
  onEditVariant,
  onDeleteVariant,
  onAddVariant,
  isRTL
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
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
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">{isRTL ? 'المنتج الأساسي:' : 'Parent Product:'}</span>{' '}
              {isRTL ? parentProduct.nameAr : parentProduct.nameEn}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {variants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {isRTL ? 'لا يوجد متغيرات' : 'No Variants Found'}
              </h3>
              <p className="text-gray-500 mb-6">
                {isRTL ? 'لا يوجد تصنيفات لهذا المنتج' : 'No variants available for this product'}
              </p>
              <button
                onClick={onAddVariant}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {isRTL ? 'إضافة متغير جديد' : 'Add New Variant'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Add New Variant Button */}
              <div className="flex justify-end">
                <button
                  onClick={onAddVariant}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {isRTL ? 'إضافة متغير جديد' : 'Add New Variant'}
                </button>
              </div>
              
              {/* Variants List */}
              <div className="grid gap-6">
                {variants.map((variant, idx) => (
                  <div key={variant._id || variant.id || idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={variant.mainImage || (variant.images && variant.images[0]) || DEFAULT_PRODUCT_IMAGE}
                          alt={isRTL ? variant.nameAr : variant.nameEn}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-4">
                        {/* Name and Description with Actions */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                              {isRTL ? variant.nameAr : variant.nameEn}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {isRTL ? variant.descriptionAr : variant.descriptionEn}
                            </p>
                          </div>
                          {/* Action Buttons */}
                          <div className="flex space-x-2 rtl:space-x-reverse">
                            <button
                              onClick={() => onEditVariant(variant)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title={isRTL ? 'تعديل المتغير' : 'Edit Variant'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteVariant(variant)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title={isRTL ? 'حذف المتغير' : 'Delete Variant'}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Price and Stock */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm font-semibold text-blue-700 mb-1">
                              {isRTL ? 'السعر' : 'Price'}
                            </div>
                            <div className="text-lg font-bold text-blue-800">
                              ${variant.price || 0}
                            </div>
                            {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
                              <div className="text-sm text-gray-500 line-through">
                                ${variant.compareAtPrice}
                              </div>
                            )}
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-sm font-semibold text-green-700 mb-1">
                              {isRTL ? 'الكمية المتوفرة' : 'Available Quantity'}
                            </div>
                            <div className="text-lg font-bold text-green-800">
                              {variant.availableQuantity || variant.stock || 0}
                            </div>
                          </div>
                        </div>

                        {/* Specifications */}
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            {isRTL ? 'المواصفات' : 'Specifications'}
                          </div>
                          {variant.specificationValues && variant.specificationValues.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {variant.specificationValues.map((spec: any, specIdx: number) => (
                                <span
                                  key={specIdx}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                                >
                                  {spec.title}: {spec.value}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              {isRTL ? 'لا توجد مواصفات' : 'No specifications'}
                            </span>
                          )}
                        </div>

                        {/* Additional Images */}
                        {variant.images && variant.images.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">
                              {isRTL ? 'الصور الإضافية' : 'Additional Images'}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
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
                              <div className="text-xs text-gray-500 mt-1">
                                +{variant.images.length - 8} {isRTL ? 'أخرى' : 'more'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariantsPopup; 