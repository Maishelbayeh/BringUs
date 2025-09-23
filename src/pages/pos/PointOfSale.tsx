import React, { useEffect, useState } from 'react';
import useCategories from '@/hooks/useCategories';
import useProductSpecifications from '@/hooks/useProductSpecifications';
import useLanguage from '@/hooks/useLanguage';
import useProducts from '@/hooks/useProducts';
import { getStoreId } from '@/hooks/useLocalStorage';
import { useOrder } from '@/hooks/useOrder';
import { AlertCircle, ArrowLeftIcon, Calculator, CheckCircle, Info, Search, ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductSpecificationModal from './ProductSpecificationModal';
import { DEFAULT_PRODUCT_IMAGE } from '@/constants/config';

interface CartItem {
  id: string;
  product: any;
  quantity: number;
  specifications: { [key: string]: string }; // specId -> valueId
  selectedColor: string;
  unitPrice: number;
  totalPrice: number;
}

// Customer info is now taken from localStorage, no need for interface

const PointOfSale: React.FC = () => {
  const { isRTL } = useLanguage();

  // Hooks
  const { products, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { specifications, fetchSpecifications } = useProductSpecifications();
  
  // Get store ID
  const storeId = getStoreId() || ''; // Provide empty string as fallback
  const { createPOSOrder, isCreatingOrder, error: createOrderError } = useOrder(storeId);

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    orderNumber?: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Load data on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSpecifications();
  }, [fetchProducts, fetchCategories, fetchSpecifications]);

  // Show toast notification
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string, orderNumber?: string) => {
    setToast({
      show: true,
      type,
      title,
      message,
      orderNumber
    });
    
    // Play notification sound
    if (type === 'success') {
      // Success sound - gentle chime
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2O0fPTgjMGHm7A7+OZURE=');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio fails
    } else if (type === 'error') {
      // Error sound - gentle beep
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2O0fPTgjMGHm7A7+OZURE=');
      audio.volume = 0.2;
      audio.play().catch(() => {}); // Ignore errors if audio fails
    }
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Smart search function that handles all types of search
  const smartSearch = (searchValue: string) => {
    if (!searchValue.trim()) return;
    
    const trimmedValue = searchValue.trim();
    
    // Check if it's a barcode (8+ digits)
    if (trimmedValue.length >= 8 && /^\d+$/.test(trimmedValue)) {
      const product = products.find(p => 
        p.barcodes && Array.isArray(p.barcodes) && 
        p.barcodes.some((b: string) => b === trimmedValue)
      );
      
      if (product) {
        handleProductFound(product);
        return;
      }
    }
    
    // Check if it's a price search (starts with $ or ₪ or contains numbers with currency)
    const priceMatch = trimmedValue.match(/^[₪$]?(\d+(?:\.\d{2})?)$/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      const productsAtPrice = products.filter(p => 
        Math.abs((p.price || 0) - price) < 0.01 ||
        Math.abs((p.finalPrice || 0) - price) < 0.01
      );
      
      if (productsAtPrice.length === 1) {
        handleProductFound(productsAtPrice[0]);
        return;
      } else if (productsAtPrice.length > 1) {
        // Show multiple products found
        const productNames = productsAtPrice.map(p => isRTL ? p.nameAr : p.nameEn).join(', ');
        showToast('info',
          isRTL ? 'تم العثور على عدة منتجات' : 'Multiple Products Found',
          isRTL ? `تم العثور على عدة منتجات بهذا السعر: ${productNames}` : `Multiple products found at this price: ${productNames}`
        );
        return;
      }
    }
    
    // Check if it's a partial barcode or exact name match
    const exactMatch = products.find(p => 
      p.nameAr?.toLowerCase() === trimmedValue.toLowerCase() ||
      p.nameEn?.toLowerCase() === trimmedValue.toLowerCase() ||
      (p.barcodes && Array.isArray(p.barcodes) && 
       p.barcodes.some((b: string) => b === trimmedValue))
    );
    
    if (exactMatch) {
      handleProductFound(exactMatch);
    } else {
      // No exact match found, just filter the products list
      console.log('No exact match found, filtering products...');
    }
  };

  // Handle product found (add to cart or open specifications)
  const handleProductFound = (product: any) => {
    console.log('Found product:', product);
    
    // If product has specifications, open modal
    if (product.specificationValues && product.specificationValues.length > 0) {
      setSelectedProduct(product);
      setShowSpecModal(true);
    } else {
      // Add directly to cart if no specifications
      addToCart(product, 1, {}, '');
      // Show success message
      const productName = isRTL ? product.nameAr : product.nameEn;
      showToast('success', 
        isRTL ? 'تم الإضافة بنجاح' : 'Added Successfully',
        isRTL ? `تم إضافة ${productName} للسلة` : `${productName} added to cart`
      );
    }
    setSearchTerm(''); // Clear search
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      smartSearch(searchTerm);
    }
  };

  // Auto-search for barcodes and exact matches
  useEffect(() => {
    if (searchTerm.length >= 8 && /^\d+$/.test(searchTerm)) {
      const timer = setTimeout(() => {
        smartSearch(searchTerm);
      }, 500); // Wait 500ms after user stops typing
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    // First check category filter
    const matchesCategory = selectedCategory === 'all' || 
      product.categoryId === selectedCategory ||
      product.categories?.some((cat: any) => cat._id === selectedCategory || cat.id === selectedCategory);
    
    // If no search term, only filter by category
    if (searchTerm === '') {
      return matchesCategory;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search by name
    const matchesName = 
      product.nameAr?.toLowerCase().includes(searchLower) ||
      product.nameEn?.toLowerCase().includes(searchLower);
    
    // Search by barcode
    const matchesBarcode = 
      product.barcodes && Array.isArray(product.barcodes) && 
      product.barcodes.some((barcode: string) => barcode.includes(searchTerm));
    
    // Search by price
    const priceMatch = searchTerm.match(/^[₪$]?(\d+(?:\.\d{2})?)$/);
    let matchesPrice = false;
    if (priceMatch) {
      const searchPrice = parseFloat(priceMatch[1]);
      matchesPrice = 
        Math.abs((product.price || 0) - searchPrice) < 0.01 ||
        Math.abs((product.finalPrice || 0) - searchPrice) < 0.01;
    }
    
    // Search by partial price (without currency symbol)
    const partialPriceMatch = /^\d+(?:\.\d{2})?$/.test(searchTerm);
    let matchesPartialPrice = false;
    if (partialPriceMatch) {
      const searchPrice = parseFloat(searchTerm);
      matchesPartialPrice = 
        Math.abs((product.price || 0) - searchPrice) < 0.01 ||
        Math.abs((product.finalPrice || 0) - searchPrice) < 0.01;
    }
    
    const matchesSearch = matchesName || matchesBarcode || matchesPrice || matchesPartialPrice;
    
    return matchesSearch && matchesCategory;
  });


  // Handle product click
  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowSpecModal(true);
  };

  // Add item to cart
  // selectedSpecs contains {specId: valueId} mapping
  const addToCart = (product: any, quantity: number, selectedSpecs: { [key: string]: string }, selectedColor: string = '') => {
    
    const unitPrice = product.isOnSale && product.salePercentage && product.salePercentage > 0 
      ? (product.finalPrice || product.price || 0)
      : (product.price || 0);
    const totalPrice = unitPrice * quantity;
    
    const cartItem: CartItem = {
      id: `${product._id || product.id}-${Date.now()}`,
      product,
      quantity,
      specifications: selectedSpecs,
      selectedColor,
      unitPrice,
      totalPrice
    };

    setCart(prev => [...prev, cartItem]);
    setShowSpecModal(false);
    setSelectedProduct(null);
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
        : item
    ));
  };

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Complete order
  const handleCompleteOrder = async () => {
    if (cart.length === 0) {
      showToast('error',
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'السلة فارغة' : 'Cart is empty'
      );
      return;
    }

    try {
      // Get store info from localStorage
      const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}');
      
      // Prepare cart items for the order
      const cartItems = cart.map(item => ({
        productId: item.product._id || item.product.id,
        product: item.product,
        quantity: item.quantity,
        selectedSpecifications: Object.entries(item.specifications || {}).map(([specId, valueId]) => ({
          specificationId: specId,
          valueId: valueId,
          title: specId, // This will be replaced with actual spec name if needed
          value: valueId  // This will be replaced with actual value name if needed
        })),
        selectedColors: item.selectedColor ? [{
          colorId: item.selectedColor,
          name: item.selectedColor,
          value: item.selectedColor
        }] : [],
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }));

      console.log('Creating POS order with cart items:', cartItems);
      console.log('Store info:', storeInfo);
      console.log('Selected specifications details:', cartItems[0]?.selectedSpecifications);

      const result = await createPOSOrder(cartItems, storeInfo, `POS Order - ${new Date().toLocaleString()}`);

      if (result.success) {
        // Clear cart after successful order
        setCart([]);
        showToast('success',
          isRTL ? 'تم إكمال الطلب بنجاح!' : 'Order Completed Successfully!',
          isRTL ? 'تم إنشاء الطلب بنجاح' : 'Order has been created successfully',
          result.data?.orderNumber || 'N/A'
        );
      } else {
        showToast('error',
          isRTL ? 'فشل في إنشاء الطلب' : 'Failed to Create Order',
          result.message || (isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred')
        );
      }
    } catch (error) {
      console.error('Error completing order:', error);
      showToast('error',
        isRTL ? 'خطأ في إكمال الطلب' : 'Error Completing Order',
        isRTL ? 'حدث خطأ في إكمال الطلب' : 'Error completing order'
      );
    }
  };

  // Get all categories including subcategories
  const getAllCategories = () => {
    const allCategories: any[] = [];
    
    const addCategory = (category: any) => {
      allCategories.push(category);
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach(addCategory);
      }
    };

    categories.forEach(addCategory);
    return allCategories;
  };

  const allCategories = getAllCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-3 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center space-x-2 lg:space-x-4 rtl:space-x-reverse">
              <Link 
                to=".." 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className={`w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2 rtl:mr-0 rtl:ml-1 lg:rtl:ml-2 ${isRTL ? 'rotate-180' : ''}`} />
                <span className="hidden sm:inline text-sm lg:text-base">{isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
                <span className="sm:hidden text-sm">{isRTL ? 'العودة' : 'Back'}</span>
              </Link>
              <div className="flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
                <Calculator className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                  {isRTL ? 'نقطة البيع' : 'POS'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Left Side - Products */}
        <div className="flex-1 p-3 lg:p-6 overflow-y-auto">
          {/* Smart Search Bar */}
          <div className="mb-4 lg:mb-6">
            <div className="relative">
              <div className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input
                type="text"
                placeholder={isRTL ? 'البحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className={`w-full ${isRTL ?  'pr-10 pl-16': 'pl-10 pr-16'} py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base`}
              />
              <button
                onClick={() => smartSearch(searchTerm)}
                className={`absolute ${isRTL ? 'left-2' :'right-2' } top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-2 lg:px-4 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1 rtl:space-x-reverse`}
              >
                <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm hidden sm:inline">{isRTL ? 'بحث' : 'Search'}</span>
              </button>
            </div>
            
            {/* Search Help Text - Hidden on mobile */}
            <div className="mt-2 text-xs text-gray-500 hidden lg:block">
              <div className="flex flex-wrap gap-4 rtl:gap-4">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 rtl:mr-0 rtl:ml-1"></span>
                  {isRTL ? 'الاسم' : 'Name'}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1 rtl:mr-0 rtl:ml-1"></span>
                  {isRTL ? 'الباركود' : 'Barcode'}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-1 rtl:mr-0 rtl:ml-1"></span>
                  {isRTL ? 'السعر' : 'Price'}
                </span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mb-4 lg:mb-6">
            <div className="flex flex-wrap gap-1 lg:gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium transition-colors text-xs lg:text-sm whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isRTL ? 'الكل' : 'All'}
              </button>
              {allCategories.map((category) => (
                <button
                  key={category._id || category.id}
                  onClick={() => setSelectedCategory(category._id || category.id)}
                  className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg font-medium transition-colors text-xs lg:text-sm whitespace-nowrap ${
                    selectedCategory === (category._id || category.id)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isRTL ? category.nameAr : category.nameEn}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-4 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                onClick={() => handleProductClick(product)}
                className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-2 lg:p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="aspect-square mb-2 lg:mb-3 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product.mainImage || (product.images?.[0]) || DEFAULT_PRODUCT_IMAGE}
                    alt={isRTL ? product.nameAr : product.nameEn}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-xs lg:text-sm">
                  {isRTL ? product.nameAr : product.nameEn}
                </h3>
                
                {/* Search Match Indicators */}
                {searchTerm && (
                  <div className="mb-2 flex flex-wrap gap-1">
                    {/* Name match indicator */}
                    {((isRTL ? product.nameAr : product.nameEn)?.toLowerCase().includes(searchTerm.toLowerCase())) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 rtl:mr-0 rtl:ml-1"></span>
                        {isRTL ? 'الاسم' : 'Name'}
                      </span>
                    )}
                    
                    {/* Barcode match indicator */}
                    {product.barcodes && Array.isArray(product.barcodes) && 
                     product.barcodes.some((barcode: string) => barcode.includes(searchTerm)) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 rtl:mr-0 rtl:ml-1"></span>
                        {isRTL ? 'الباركود' : 'Barcode'}
                      </span>
                    )}
                    
                    {/* Price match indicator */}
                    {(() => {
                      const priceMatch = searchTerm.match(/^[₪$]?(\d+(?:\.\d{2})?)$/);
                      const partialPriceMatch = /^\d+(?:\.\d{2})?$/.test(searchTerm);
                      const searchPrice = priceMatch ? parseFloat(priceMatch[1]) : (partialPriceMatch ? parseFloat(searchTerm) : null);
                      
                      if (searchPrice && (
                        Math.abs((product.price || 0) - searchPrice) < 0.01 ||
                        Math.abs((product.finalPrice || 0) - searchPrice) < 0.01
                      )) {
                        return (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1 rtl:mr-0 rtl:ml-1"></span>
                            {isRTL ? 'السعر' : 'Price'}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
                
                {/* Barcode display */}
                {product.barcodes && product.barcodes.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <path d="M9 9h6v6H9z"/>
                        <path d="M9 1v6"/>
                        <path d="M15 1v6"/>
                        <path d="M9 17v6"/>
                        <path d="M15 17v6"/>
                        <path d="M1 9h6"/>
                        <path d="M17 9h6"/>
                        <path d="M1 15h6"/>
                        <path d="M17 15h6"/>
                      </svg>
                      <span className="truncate">
                        {product.barcodes[0]}
                        {product.barcodes.length > 1 && ` +${product.barcodes.length - 1}`}
                      </span>
                    </div>
                  </div>
                )}
                <div className="mb-2">
                  {product.isOnSale && product.salePercentage && product.salePercentage > 0 ? (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <p className="text-lg font-bold text-green-600">
                        ₪{product.finalPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        ₪{product.price?.toFixed(2) || '0.00'}
                      </p>
                      <span className="absolute top-6 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        -{product.salePercentage}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-green-600">
                      ₪{product.price?.toFixed(2) || '0.00'}
                    </p>
                  )}
                </div>
                
                {/* Stock Display */}
                <div className="mb-2">
                  {(() => {
                    const stock = product.stock || 0;
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
                      <div className={`inline-flex items-center px-2 py-1 bg-gradient-to-r ${bgColor} border ${borderColor} rounded-full`}>
                        <div className={`w-1.5 h-1.5 ${dotColor} rounded-full mr-1.5 rtl:mr-0 rtl:ml-1.5 ${!isOutOfStock ? 'animate-pulse' : ''}`}></div>
                        <span className={`text-xs font-medium ${textColor}`}>
                          {isRTL ? 'المخزون:' : 'Stock:'} 
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
                
                <div className="flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
                  <span className="truncate max-w-[120px] inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {isRTL ? product.category?.nameAr : product.category?.nameEn}
                  </span>
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {product.colors.slice(0, 3).map((colorGroup: string[], index: number) => 
                        colorGroup.slice(0, 1).map((color: string, colorIndex: number) => (
                          <div
                            key={`${index}-${colorIndex}`}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))
                      )}
                      {product.colors.length > 3 && (
                        <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-full lg:w-64 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-3 lg:p-6 flex flex-col max-h-96 lg:max-h-none">
          <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">
            {isRTL ? 'الطلب الحالي' : 'Current Order'}
          </h2>

          {/* Customer Information - Now taken from localStorage - Hidden on mobile */}
          <div className="mb-4 lg:mb-6 space-y-4 hidden lg:block">
            <div className="p-3 lg:p-4 bg-blue-50 rounded-lg">
              <h3 className="text-xs lg:text-sm font-medium text-blue-900 mb-2">
                {isRTL ? 'معلومات العميل' : 'Customer Information'}
              </h3>
              <p className="text-xs lg:text-sm text-blue-800">
                {isRTL ? 'سيتم استخدام معلومات المستخدم المسجل حالياً' : 'Will use current logged-in user information'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {isRTL ? 'الاسم والهاتف سيتم أخذهما من بيانات تسجيل الدخول' : 'Name and phone will be taken from login data'}
              </p>
            </div>
          </div>

         

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-4 lg:mb-6">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <ShoppingCart className="w-8 h-8 mb-2" />
                <p>{isRTL ? 'لا توجد عناصر في السلة' : 'No items in cart'}</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-2 lg:p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs lg:text-sm line-clamp-2">
                          {isRTL ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        {item.selectedColor && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-600 mr-2 rtl:mr-0 rtl:ml-2">
                              {isRTL ? 'اللون:' : 'Color:'}
                            </span>
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.selectedColor }}
                              title={item.selectedColor}
                            />
                          </div>
                        )}
                        {Object.keys(item.specifications).length > 0 && (
                          <div className="mt-1">
                            <span className="text-xs text-gray-600">
                              {isRTL ? 'المواصفات: ' : 'Specs: '}
                            </span>
                            <span className="text-xs text-gray-800">
                              {Object.entries(item.specifications).map(([specId, valueId]) => {
                                // Find the specification and its value
                                const spec = specifications.find(s => s._id === specId || s.id === specId);
                                if (!spec) return valueId;
                                
                                const specValue = spec.values?.find((v: any) => v._id === valueId);
                                if (!specValue) return valueId;
                                
                                return isRTL ? specValue.valueAr : specValue.valueEn;
                              }).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2 rtl:ml-0 rtl:mr-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 text-xs lg:text-sm"
                        >
                          -
                        </button>
                        <span className="w-6 lg:w-8 text-center text-xs lg:text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 text-xs lg:text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium text-gray-900 text-xs lg:text-sm">
                        ₪{item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total and Complete Order */}
          <div className="border-t border-gray-200 pt-3 lg:pt-4">
            {createOrderError && (
              <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs lg:text-sm">
                {createOrderError}
              </div>
            )}
            <div className="flex justify-between items-center mb-3 lg:mb-4">
              <span className="text-base lg:text-lg font-bold text-gray-900">
                {isRTL ? 'المجموع:' : 'Total:'}
              </span>
              <span className="text-lg lg:text-xl font-bold text-green-600">
                ₪{cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCompleteOrder}
              disabled={cart.length === 0 || isCreatingOrder}
              className="w-full bg-green-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm lg:text-base"
            >
              {isCreatingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2"></div>
                  <span className="text-xs lg:text-sm">{isRTL ? 'جاري إنشاء الطلب...' : 'Creating Order...'}</span>
                </>
              ) : (
                <span className="text-xs lg:text-sm">{isRTL ? 'إكمال الطلب' : 'Complete Order'}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Specification Modal */}
      {showSpecModal && selectedProduct && (
        <ProductSpecificationModal
          product={selectedProduct}
          specifications={specifications}
          onAddToCart={addToCart}
          onClose={() => {
            setShowSpecModal(false);
            setSelectedProduct(null);
          }}
          isRTL={isRTL}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 z-50 max-w-sm w-full transition-all duration-500 ease-in-out ${
          isRTL ? 'left-4' : 'right-4'
        } ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className={`rounded-xl shadow-2xl border-l-4 p-5 backdrop-blur-sm ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-green-100' 
              : toast.type === 'error' 
              ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500 shadow-red-100' 
              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500 shadow-blue-100'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />          
                  </div>
                )}
                {toast.type === 'error' && (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                )}
                {toast.type === 'info' && (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                )}
              </div>
              <div className={`w-0 flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                <p className={`text-base font-semibold ${
                  toast.type === 'success' 
                    ? 'text-green-900' 
                    : toast.type === 'error' 
                    ? 'text-red-900' 
                    : 'text-blue-900'
                }`}>
                  {toast.title}
                </p>
                <p className={`mt-1 text-sm leading-relaxed ${
                  toast.type === 'success' 
                    ? 'text-green-700' 
                    : toast.type === 'error' 
                    ? 'text-red-700' 
                    : 'text-blue-700'
                }`}>
                  {toast.message}
                </p>
                {toast.orderNumber && (
                  <div className="mt-3">
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      toast.type === 'success' 
                        ? 'bg-green-200 text-green-900 border border-green-300' 
                        : 'bg-gray-200 text-gray-900 border border-gray-300'
                    }`}>
                      <span className="w-2 h-2 bg-current rounded-full mr-2 rtl:mr-0 rtl:ml-2 animate-pulse"></span>
                      {isRTL ? 'رقم الطلب:' : 'Order #:'} <span className="font-bold ml-1 rtl:mr-1">{toast.orderNumber}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className={`flex-shrink-0 flex ${isRTL ? 'mr-4' : 'ml-4'}`}>
                <button
                  onClick={hideToast}
                  className={`inline-flex rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    toast.type === 'success' 
                      ? 'text-green-500 hover:text-green-600 hover:bg-green-100 focus:ring-green-500' 
                      : toast.type === 'error' 
                      ? 'text-red-500 hover:text-red-600 hover:bg-red-100 focus:ring-red-500' 
                      : 'text-blue-500 hover:text-blue-600 hover:bg-blue-100 focus:ring-blue-500'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className={`mt-3 h-1 rounded-full overflow-hidden ${
              toast.type === 'success' 
                ? 'bg-green-200' 
                : toast.type === 'error' 
                ? 'bg-red-200' 
                : 'bg-blue-200'
            }`}>
              <div className={`h-full rounded-full transition-all duration-5000 ease-linear ${
                toast.type === 'success' 
                  ? 'bg-green-500' 
                  : toast.type === 'error' 
                  ? 'bg-red-500' 
                  : 'bg-blue-500'
              }`} style={{ width: '100%', animation: 'toast-progress 5s linear forwards' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointOfSale;
