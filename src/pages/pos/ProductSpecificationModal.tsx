import React, { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/config';

interface ProductSpecificationModalProps {
  product: any;
  specifications: any[];
  onAddToCart: (product: any, quantity: number, selectedSpecs: { [key: string]: string }, selectedColor?: string) => void;
  onClose: () => void;
  isRTL: boolean;
}

const ProductSpecificationModal: React.FC<ProductSpecificationModalProps> = ({
  product,
  specifications,
  onAddToCart,
  onClose,
  isRTL
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specificationDetails, setSpecificationDetails] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Get unique specifications from product specificationValues
  const productSpecifications = React.useMemo(() => {
    const productSpecValues = product.specificationValues || [];
    const uniqueSpecIds = [...new Set(productSpecValues.map((specValue: any) => specValue.specificationId))];
    
    // Find specifications that match the product's specification IDs
    return specifications.filter(spec => 
      uniqueSpecIds.includes(spec._id) || uniqueSpecIds.includes(spec.id)
    );
  }, [specifications, product.specificationValues]);

  // Initialize specification details
  useEffect(() => {
    
    const details = productSpecifications.map(spec => {
      // Get the specific values for this product's specification
      const productSpecValues = product.specificationValues || [];
      const relevantValues = productSpecValues.filter((specValue: any) => 
        specValue.specificationId === spec._id || specValue.specificationId === spec.id
      );
      
      
      
       // Map the product specification values to the format we need
       const availableValues = relevantValues.map((specValue: any) => {
         // Find the corresponding value in the specifications array
         const specValueInSpec = spec.values?.find((v: any) => 
           v._id === specValue.valueId || 
           v._id === specValue._id || 
           v._id === specValue.id ||
           v.valueAr === specValue.value ||
           v.valueEn === specValue.value
         );
         
         
         return {
           _id: specValueInSpec?._id || specValue.valueId || specValue._id || specValue.id,
           valueAr: specValueInSpec?.valueAr || specValue.value || specValue.title,
           valueEn: specValueInSpec?.valueEn || specValue.value || specValue.title,
           price: specValueInSpec?.price || specValue.price || 0,
           quantity: specValueInSpec?.quantity || specValue.quantity || 0
         };
       });

      const specName = isRTL ? spec.titleAr : spec.titleEn;
      
      return {
        specId: spec._id || spec.id,
        specName: specName,
        values: availableValues,
        selectedValue: '',
        selectedValueId: ''
      };
    });
    
    setSpecificationDetails(details);
  }, [productSpecifications, product.specificationValues, isRTL]);

  const handleSpecificationChange = (specId: string, valueId: string, value: string) => {
    
    // Find the selected value to check quantity
    const specDetail = specificationDetails.find(spec => spec.specId === specId);
    const selectedValue = specDetail?.values.find((val: any) => val._id === valueId);
    
    
    // Check if the selected value has available quantity
    if (selectedValue && selectedValue.quantity !== undefined && selectedValue.quantity <= 0) {
      alert(isRTL ? 'هذا الخيار غير متوفر في المخزون' : 'This option is out of stock');
      return;
    }


    setSpecificationDetails(prev => {
      const newDetails = prev.map(spec => 
        spec.specId === specId 
          ? { ...spec, selectedValue: value, selectedValueId: valueId }
          : spec
      );
      return newDetails;
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Check if all required specifications and color are selected
    const hasRequiredSpecs = specificationDetails.some(spec => spec.values.length > 0);
    const allSpecsSelected = !hasRequiredSpecs || specificationDetails.every(spec => 
      spec.values.length === 0 || spec.selectedValue
    );
    const hasColors = product.colors && product.colors.length > 0;
    const isColorSelected = !hasColors || selectedColor;
    
    // Only allow quantity change if all requirements are met
    if (!allSpecsSelected || !isColorSelected) {
      return;
    }
    
    // Check stock availability based on selected specifications
    const hasSelectedSpecs = specificationDetails.some(spec => spec.selectedValue);
    let availableStock = 0;
    
    if (hasSelectedSpecs) {
      const selectedSpecDetails = specificationDetails.filter(spec => spec.selectedValue);
      availableStock = Math.min(...selectedSpecDetails.map(spec => {
        const selectedValue = spec.values.find((val: any) => val._id === spec.selectedValueId);
        return selectedValue?.quantity || 0;
      }));
    } else {
      availableStock = product.stock || 0;
    }
    
    if (newQuantity <= availableStock) {
      setQuantity(newQuantity);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Create a map of specId to valueId for the order
      const specIdToValueId: { [key: string]: string } = {};
      specificationDetails.forEach(spec => {
        if (spec.selectedValueId) {
          specIdToValueId[spec.specId] = spec.selectedValueId;
        }
      });
      
      console.log('🔍 تم اختيار مواصفات المنتج:', specIdToValueId);
      
      await onAddToCart(product, quantity, specIdToValueId, selectedColor);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Check if all required specifications are selected
  const hasRequiredSpecs = specificationDetails.some(spec => spec.values.length > 0);
  const allSpecsSelected = !hasRequiredSpecs || specificationDetails.every(spec => 
    spec.values.length === 0 || spec.selectedValue
  );
  
  // Check if color is selected (required if product has colors)
  const hasColors = product.colors && product.colors.length > 0;
  const isColorSelected = !hasColors || selectedColor;
  
  // Check stock availability
  const hasSelectedSpecs = specificationDetails.some(spec => spec.selectedValue);
  let availableStock = 0;
  
  if (hasSelectedSpecs) {
    const selectedSpecDetails = specificationDetails.filter(spec => spec.selectedValue);
    availableStock = Math.min(...selectedSpecDetails.map(spec => {
      const selectedValue = spec.values.find((val: any) => val._id === spec.selectedValueId);
      return selectedValue?.quantity || 0;
    }));
  } else {
    availableStock = product.stock || 0;
  }
  
  // Since the + button is disabled when quantity >= availableStock, 
  // we need to check if all specs are selected AND color is selected
  const isAddToCartDisabled = !allSpecsSelected || !isColorSelected;
  
  // Check if quantity buttons should be disabled
  const areQuantityButtonsDisabled = !allSpecsSelected || !isColorSelected;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
          <h2 className="text-xl font-bold text-gray-900">
            {isRTL ? 'إضافة للمنتج للسلة' : 'Add Product to Cart'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-200" >
          <div className={`flex items-start  ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={product.mainImage || (product.images?.[0]) || DEFAULT_PRODUCT_IMAGE}
                alt={isRTL ? product.nameAr : product.nameEn}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`flex-1 mx-6`} dir={isRTL ? 'rtl' : 'ltr'}>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {isRTL ? product.nameAr : product.nameEn}
              </h3>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                {product.isOnSale && product.salePercentage && product.salePercentage > 0 ? (
                  <>
                    <p className="text-2xl font-bold text-green-600">
                      ₪{product.finalPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-lg text-gray-500 line-through">
                      ₪{product.price?.toFixed(2) || '0.00'}
                    </p>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      -{product.salePercentage}%
                    </span>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    ₪{product.price?.toFixed(2) || '0.00'}
                  </p>
                )}
              </div>
              
              {/* Total Stock Display */}
              <div className="mb-2">
                {(() => {
                  const stock = product.totalSpecificationQuantities || 0;
                  const isLowStock = stock <= (product.lowStockThreshold || 5);
                  const isOutOfStock = stock === 0;
                  
                  let bgColor, borderColor, dotColor, textColor, textColorBold;
                  
                  if (isOutOfStock) {
                    bgColor = 'from-red-50 to-rose-50';
                    borderColor = 'border-red-200';
                    dotColor = 'bg-red-500';
                    textColor = 'text-red-700';
                    textColorBold = 'text-red-900';
                  } else if (isLowStock) {
                    bgColor = 'from-yellow-50 to-amber-50';
                    borderColor = 'border-yellow-200';
                    dotColor = 'bg-yellow-500';
                    textColor = 'text-yellow-700';
                    textColorBold = 'text-yellow-900';
                  } else {
                    bgColor = 'from-green-50 to-emerald-50';
                    borderColor = 'border-green-200';
                    dotColor = 'bg-green-500';
                    textColor = 'text-green-700';
                    textColorBold = 'text-green-900';
                  }
                  
                  return (
                    <div className={`inline-flex items-center px-3 py-1.5 bg-gradient-to-r ${bgColor} border ${borderColor} rounded-full shadow-sm`}>
                      <div className={`w-2 h-2 ${dotColor} rounded-full mr-2 rtl:mr-0 rtl:ml-2 ${!isOutOfStock ? 'animate-pulse' : ''}`}></div>
                      <span className={`text-sm font-medium ${textColor}`}>
                        {isRTL ? 'إجمالي المخزون:' : 'Total Stock:'} 
                        <span className={`font-bold ml-1 rtl:mr-1 ${textColorBold}`}>
                          {stock}
                        </span>
                        {isOutOfStock && (
                          <span className="ml-1 rtl:mr-1 text-xs font-semibold">
                            {isRTL ? '(نفد)' : '(Out)'}
                          </span>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <span className="ml-1 rtl:mr-1 text-xs font-semibold">
                            {isRTL ? '(منخفض)' : '(Low)'}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })()}
              </div>
              
              {product.category && (
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                  {isRTL ? product.category.nameAr : product.category.nameEn}
                </span>
              )}
              {product.descriptionAr || product.descriptionEn ? (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {isRTL ? product.descriptionAr : product.descriptionEn}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="p-6 border-b border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isRTL ? 'مواصفات المنتج' : 'Product Specifications'}
            </h3>
            {specificationDetails.length > 0 && (
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                {isRTL ? 'مطلوب' : 'Required'}
              </span>
            )}
          </div>
          {specificationDetails.length > 0 ? (
            <div className="space-y-4">
              {specificationDetails.map((spec) => (
                <div key={spec.specId}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {spec.specName} {isRTL ? '(مطلوب)' : '(Required)'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {spec.values.map((value: any) => (
                      <button
                        key={value._id || value.id}
                        onClick={() => handleSpecificationChange(
                          spec.specId, 
                          value._id || value.id, 
                          isRTL ? value.valueAr : value.valueEn
                        )}
                        disabled={value.quantity !== undefined && value.quantity <= 0}
                        className={`p-3 text-sm rounded-lg border transition-colors ${isRTL ? 'text-right' : 'text-left'} ${
                          spec.selectedValueId === (value._id || value.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : value.quantity !== undefined && value.quantity <= 0
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">
                          {(() => {
                            const displayValue = isRTL ? value.valueAr : value.valueEn;
                            return displayValue;
                          })()}
                          {value.quantity !== undefined && value.quantity <= 0 && (
                            <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-xs text-red-500`}>
                              {isRTL ? '(غير متوفر)' : '(Out of Stock)'}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          
                          {value.quantity !== undefined && value.quantity > 0 && (
                            <div className="text-xs text-gray-500">
                              {isRTL ? `متوفر: ${value.quantity}` : `Stock: ${value.quantity}`}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>{isRTL ? 'لا توجد مواصفات محددة لهذا المنتج' : 'No specifications available for this product'}</p>
            </div>
          )}
        </div>

        {/* Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="p-6 border-b border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {isRTL ? 'اختر اللون' : 'Choose Color'}
              </h3>
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                {isRTL ? 'مطلوب' : 'Required'}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((colorGroup: string[], index: number) => 
                colorGroup.map((color: string, colorIndex: number) => (
                  <div key={`${index}-${colorIndex}`} className="flex flex-col items-center">
                    <button
                      onClick={() => handleColorChange(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === color
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                    
                  </div>
                ))
              )}
            </div>
            {/* Color Selection Status */}
            {selectedColor ? (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  {isRTL ? `اللون المختار: ` : `Selected color: `}
                  <span className="font-semibold" style={{ color: selectedColor }}>
                    {selectedColor}
                  </span>
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  {isRTL ? 'يرجى اختيار لون للمنتج' : 'Please select a color for the product'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quantity */}
        <div className="p-6 border-b border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isRTL ? 'الكمية' : 'Quantity'}
          </h3>
          
          {/* Stock Information */}
          {(() => {
            const hasSelectedSpecs = specificationDetails.some(spec => spec.selectedValue);
            let availableStock = 0;
            
            if (hasSelectedSpecs) {
              const selectedSpecDetails = specificationDetails.filter(spec => spec.selectedValue);
              availableStock = Math.min(...selectedSpecDetails.map(spec => {
                const selectedValue = spec.values.find((val: any) => val._id === spec.selectedValueId);
                return selectedValue?.quantity || 0;
              }));
            } else {
              availableStock = product.stock || 0;
            }
            
            return (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    {isRTL ? 'المخزون المتاح:' : 'Available Stock:'}
                  </span>
                  <span className="font-semibold text-blue-900">
                    {availableStock}
                  </span>
                </div>
                {quantity > availableStock && (
                  <div className="mt-2 text-sm text-red-600 font-medium">
                    {isRTL ? `الكمية المطلوبة (${quantity}) تتجاوز المخزون المتاح (${availableStock})` : `Requested quantity (${quantity}) exceeds available stock (${availableStock})`}
                  </div>
                )}
              </div>
            );
          })()}
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={areQuantityButtonsDisabled || quantity <= 1}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              title={areQuantityButtonsDisabled 
                ? (isRTL ? 'يرجى اختيار المواصفات واللون أولاً' : 'Please select specifications and color first')
                : quantity <= 1 
                  ? (isRTL ? 'الحد الأدنى للكمية هو 1' : 'Minimum quantity is 1') 
                  : (isRTL ? 'تقليل الكمية' : 'Decrease quantity')
              }
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-semibold text-gray-900 w-12 text-center">
              {quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={areQuantityButtonsDisabled || quantity >= availableStock}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              title={areQuantityButtonsDisabled 
                ? (isRTL ? 'يرجى اختيار المواصفات واللون أولاً' : 'Please select specifications and color first')
                : quantity >= availableStock 
                  ? (isRTL ? `الحد الأقصى للكمية هو ${availableStock}` : `Maximum quantity is ${availableStock}`) 
                  : (isRTL ? 'زيادة الكمية' : 'Increase quantity')
              }
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Quantity Help Text */}
          {areQuantityButtonsDisabled && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                {isRTL ? 'يرجى اختيار المواصفات واللون أولاً لتتمكن من تغيير الكمية' : 'Please select specifications and color first to change quantity'}
              </p>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="p-6 border-b border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">
              {isRTL ? 'المجموع:' : 'Total:'}
            </span>
            <div className="text-right">
              {product.isOnSale && product.salePercentage && product.salePercentage > 0 ? (
                <>
                  <span className="text-2xl font-bold text-green-600">
                    ₪{((product.finalPrice || product.price) * quantity).toFixed(2)}
                  </span>
                  <div className="text-sm text-gray-500 line-through">
                    ₪{(product.price * quantity).toFixed(2)}
                  </div>
                </>
              ) : (
                <span className="text-2xl font-bold text-green-600">
                  ₪{(product.price * quantity).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex space-x-3 rtl:space-x-reverse">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled || isAddingToCart}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 rtl:mr-0 rtl:ml-2"></div>
                {isRTL ? 'جاري الإضافة...' : 'Adding...'}
              </>
            ) : isAddToCartDisabled ? (
              !allSpecsSelected 
                ? (isRTL ? 'يرجى اختيار جميع المواصفات المطلوبة' : 'Please select all required specifications')
                : !isColorSelected 
                  ? (isRTL ? 'يرجى اختيار لون للمنتج' : 'Please select a color for the product')
                  : (isRTL ? 'غير متاح' : 'Not available')
            ) : (
              isRTL ? 'إضافة للسلة' : 'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSpecificationModal;
