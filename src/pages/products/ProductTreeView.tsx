import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ProductTreeViewProps {
  products: any[];
  isRTL: boolean;
  onEdit: (product: any) => void;
  onAddVariant: (product: any) => void;
  onDelete: (product: any) => void;
  renderImage: (value: any, item: any) => React.ReactNode;
  renderPrice: (value: any, item: any) => React.ReactNode;
  renderStock: (value: any, item: any) => React.ReactNode;
  renderVisibility: (value: any) => React.ReactNode;
  renderProductLabels: (value: any, item: any) => React.ReactNode;
  renderBarcode: (value: any, item: any) => React.ReactNode;
  renderSpecifications: (value: any, item: any) => React.ReactNode;
  renderVariantStatus: (value: any, item: any) => React.ReactNode;
  renderColors: (value: any, item: any) => React.ReactNode;
  renderActions: (value: any, item: any) => React.ReactNode;
}

const ProductTreeView: React.FC<ProductTreeViewProps> = ({
  products,
  isRTL,
  onEdit,
  onAddVariant,
  onDelete,
  renderImage,
  renderPrice,
  renderStock,
  renderVisibility,
  renderProductLabels,
  renderBarcode,
  renderSpecifications,
  renderVariantStatus,
  renderColors,
  renderActions
}) => {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  const renderProductRow = (product: any, isVariant: boolean = false, level: number = 0) => {
    const productId = product._id || product.id;
    const hasVariants = product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0;
    const isExpanded = expandedProducts.has(productId);
    const isParent = hasVariants && !isVariant;

    return (
      <React.Fragment key={productId}>
        {/* Main Product Row */}
        <div 
          className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
            isVariant ? 'bg-gray-50' : 'bg-white'
          }`}
          style={{ paddingLeft: `${level * 24}px` }}
        >
          <div className="flex items-center py-3 px-4">
            {/* Expand/Collapse Icon */}
            <div className="flex-shrink-0 w-6">
              {isParent && (
                <button
                  onClick={() => toggleProduct(productId)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0 w-16">
              {renderImage(product.mainImage || (product.images && product.images[0]), product)}
            </div>

            {/* Product Name */}
            <div className="flex-1 min-w-0 px-4">
              <div className="flex items-center">
                {isVariant && (
                  <span className="text-xs text-gray-500 mr-2">
                    {isRTL ? 'متغير' : 'Variant'}
                  </span>
                )}
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {isRTL ? product.nameAr : product.nameEn}
                </h3>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {isRTL ? product.descriptionAr : product.descriptionEn}
              </p>
            </div>

            {/* Categories */}
            <div className="flex-shrink-0 w-32 px-2">
              <div className="space-y-1">
                {product.categories && Array.isArray(product.categories) && product.categories.length > 0 ? (
                  product.categories.map((category: any, index: number) => (
                    <div key={index} className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-700 font-medium">
                      {isRTL ? category.nameAr : category.nameEn}
                    </div>
                  ))
                ) : product.category ? (
                  <div className="bg-blue-50 px-2 py-1 rounded text-xs text-blue-700 font-medium">
                    {isRTL ? product.category.nameAr : product.category.nameEn}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'لا توجد فئات' : 'No Categories'}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex-shrink-0 w-20 px-2">
              {renderPrice(product.price, product)}
            </div>

            {/* Cost Price */}
            <div className="flex-shrink-0 w-20 px-2">
              <span className="text-xs text-gray-600">
                {product.costPrice ? `$${product.costPrice}` : '-'}
              </span>
            </div>

            {/* Compare At Price */}
            <div className="flex-shrink-0 w-20 px-2">
              <span className="text-xs text-gray-600">
                {product.compareAtPrice ? `$${product.compareAtPrice}` : '-'}
              </span>
            </div>

            {/* Unit */}
            <div className="flex-shrink-0 w-16 px-2">
              <span className="text-xs text-gray-600">
                {product.unit?.nameAr || product.unit?.nameEn || '-'}
              </span>
            </div>

            {/* Available Quantity */}
            <div className="flex-shrink-0 w-20 px-2">
              {renderStock(product.availableQuantity || product.stock, product)}
            </div>

            {/* Visibility */}
            <div className="flex-shrink-0 w-16 px-2">
              {renderVisibility(product.visibility)}
            </div>

            {/* Product Labels */}
            <div className="flex-shrink-0 w-24 px-2">
              {renderProductLabels(product.productLabels || product.tags, product)}
            </div>

            {/* Specifications */}
            <div className="flex-shrink-0 w-24 px-2">
              {renderSpecifications(product.specifications || product.specificationValues, product)}
            </div>

            {/* Barcodes */}
            <div className="flex-shrink-0 w-24 px-2">
              {renderBarcode(product.barcodes, product)}
            </div>

            {/* Colors */}
            <div className="flex-shrink-0 w-24 px-2">
              <div className="flex flex-wrap gap-1">
                {product.colors && Array.isArray(product.colors) && product.colors.length > 0 ? (
                  product.colors.map((colorGroup: any, groupIndex: number) => {
                    // Handle both array of colors and object with colors property
                    const colorArray = Array.isArray(colorGroup) ? colorGroup : 
                                     (colorGroup && colorGroup.colors && Array.isArray(colorGroup.colors)) ? colorGroup.colors : 
                                     [colorGroup];
                    
                    return colorArray.map((color: string, colorIndex: number) => (
                      <div
                        key={`${groupIndex}-${colorIndex}`}
                        className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ));
                  })
                ) : (
                  <span className="text-xs text-gray-500">
                    {isRTL ? 'لا توجد ألوان' : 'No Colors'}
                  </span>
                )}
              </div>
            </div>

            {/* Variant Status */}
            <div className="flex-shrink-0 w-16 px-2">
              {renderVariantStatus(product.hasVariants, product)}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 w-24 px-2">
              {renderActions(null, product)}
            </div>
          </div>
        </div>

        {/* Variants */}
        {isParent && isExpanded && hasVariants && (
          <div className="bg-gray-25">
            {product.variants.map((variant: any) => 
              renderProductRow(variant, true, level + 1)
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center text-xs font-medium text-gray-700">
          <div className="flex-shrink-0 w-6"></div>
          <div className="flex-shrink-0 w-16">{isRTL ? 'الصورة' : 'Image'}</div>
          <div className="flex-1 px-4">{isRTL ? 'اسم المنتج' : 'Product Name'}</div>
          <div className="flex-shrink-0 w-32 px-2">{isRTL ? 'الفئات' : 'Categories'}</div>
          <div className="flex-shrink-0 w-20 px-2">{isRTL ? 'السعر' : 'Price'}</div>
          <div className="flex-shrink-0 w-20 px-2">{isRTL ? 'سعر التكلفة' : 'Cost'}</div>
          <div className="flex-shrink-0 w-20 px-2">{isRTL ? 'سعر الجملة' : 'Wholesale'}</div>
          <div className="flex-shrink-0 w-16 px-2">{isRTL ? 'الوحدة' : 'Unit'}</div>
          <div className="flex-shrink-0 w-20 px-2">{isRTL ? 'الكمية' : 'Stock'}</div>
          <div className="flex-shrink-0 w-16 px-2">{isRTL ? 'الظهور' : 'Visibility'}</div>
          <div className="flex-shrink-0 w-24 px-2">{isRTL ? 'التصنيف' : 'Labels'}</div>
          <div className="flex-shrink-0 w-24 px-2">{isRTL ? 'المواصفات' : 'Specs'}</div>
          <div className="flex-shrink-0 w-24 px-2">{isRTL ? 'الباركود' : 'Barcode'}</div>
          <div className="flex-shrink-0 w-24 px-2">{isRTL ? 'الألوان' : 'Colors'}</div>
          <div className="flex-shrink-0 w-16 px-2">{isRTL ? 'النوع' : 'Type'}</div>
          <div className="flex-shrink-0 w-24 px-2">{isRTL ? 'العمليات' : 'Actions'}</div>
        </div>
      </div>

      {/* Product Rows */}
      <div className="divide-y divide-gray-200">
        {products.map(product => renderProductRow(product))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {isRTL ? 'لا توجد منتجات' : 'No products found'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTreeView; 