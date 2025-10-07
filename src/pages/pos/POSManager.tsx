import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ShoppingCart, Search, X, CheckCircle, AlertCircle, Info, ArrowLeftIcon, Trash2 } from 'lucide-react';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import useProductSpecifications from '../../hooks/useProductSpecifications';
import { usePOS } from '../../hooks/usePOS';
import { getStoreId } from '../../utils/storeUtils';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/config';
import ProductSpecificationModal from './ProductSpecificationModal';
import useLanguage from '../../hooks/useLanguage';
import ConfirmationModal from '../../components/common/ConfirmationModal';

interface POSManagerProps {
  cartId?: string;
  onNewOrder?: (cartId: string) => void;
  onCartUpdate?: (completedCartId?: string) => void;
  isLoadingTab?: boolean;
  // Pre-loaded data to avoid re-fetching
  products?: any[];
  categories?: any[];
  specifications?: any[];
}

const POSManager: React.FC<POSManagerProps> = ({ 
  cartId, 
  onNewOrder, 
  onCartUpdate, 
  isLoadingTab = false,
  products: propProducts,
  categories: propCategories,
  specifications: propSpecifications
}) => {
  const { isRTL } = useLanguage();

  // Hooks (for fallback if props are not provided)
  const { products: hookProducts } = useProducts();
  const { categories: hookCategories } = useCategories();
  const { specifications: hookSpecifications } = useProductSpecifications();
  const pos = usePOS();
  
  // Use props data if available, otherwise fall back to hooks
  const products = propProducts || hookProducts;
  const categories = propCategories || hookCategories;
  const specifications = propSpecifications || hookSpecifications;
  
  // Get store ID
  const storeId = getStoreId();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
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

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Data is now loaded by parent component (POSTabsManager)
  // No need to load data here anymore

  // Load cart when cartId changes - only if it's different from current cart
  useEffect(() => {
    if (cartId && pos.currentCart?._id !== cartId) {
      console.log('Loading cart for cartId:', cartId);
      setIsCartLoading(true);
      
      // Clear current cart immediately to prevent data leakage
      pos.setCurrentCart(null);
      
      pos.getCart(cartId).then((result) => {
        if (result.success) {
          console.log('Cart loaded successfully:', result.data);
        }
        setIsCartLoading(false);
      }).catch(() => {
        setIsCartLoading(false);
      });
    }
  }, [cartId, pos.currentCart?._id]);

  // Show toast notification
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string, orderNumber?: string) => {
    setToast({
      show: true,
      type,
      title,
      message,
      orderNumber
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Hide toast
  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Show confirmation modal
  const showConfirmationModal = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    type: 'warning' | 'danger' | 'info' | 'success' = 'warning'
  ) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Create new cart
  const handleCreateNewCart = async () => {
    if (!storeId) return;
    
    try {
      const result = await pos.createCart(storeId);
      if (result.success && result.data) {
        await pos.getCart(result.data.cartId);
        showToast('success', 
          isRTL ? 'تم إنشاء سلة جديدة' : 'New Cart Created',
          isRTL ? 'تم إنشاء سلة جديدة بنجاح' : 'New cart created successfully'
        );
        
        // Open new tab if callback provided
        if (onNewOrder && result.data.cartId) {
          onNewOrder(result.data.cartId);
        }
      } else {
        showToast('error',
          isRTL ? 'خطأ في إنشاء السلة' : 'Error Creating Cart',
          result.message || (isRTL ? 'حدث خطأ في إنشاء السلة' : 'Error creating cart')
        );
      }
    } catch (error) {
      console.error('Error creating cart:', error);
      showToast('error',
        isRTL ? 'خطأ في إنشاء السلة' : 'Error Creating Cart',
        isRTL ? 'حدث خطأ في إنشاء السلة' : 'Error creating cart'
      );
    }
  };

  // Smart search function
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
    
    // Check if it's a price search
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
    }
  };

  // Handle product found
  const handleProductFound = (product: any) => {
    if (!pos.currentCart) {
      showToast('error',
        isRTL ? 'لا توجد سلة نشطة' : 'No Active Cart',
        isRTL ? 'يرجى إنشاء سلة جديدة أولاً' : 'Please create a new cart first'
      );
      return;
    }
    
    // If product has specifications, open modal
    if (product.specificationValues && product.specificationValues.length > 0) {
      setSelectedProduct(product);
      setShowSpecModal(true);
    } else {
      // Add directly to cart if no specifications
      addToCart(product, 1, {}, '');
    }
    setSearchTerm('');
  };

  // Add item to cart
  const addToCart = async (product: any, quantity: number, selectedSpecs: { [key: string]: string }, selectedColor: string = '') => {
    if (!pos.currentCart) return;
    
    const currentCartId = pos.currentCart._id;
    
    try {
      const result = await pos.addToCart(
        currentCartId,
        product,
        quantity,
        null,
        Object.entries(selectedSpecs).map(([specId, valueId]) => ({
          specificationId: specId,
          valueId: valueId,
          title: specId,
          value: valueId
        })),
        selectedColor ? [{
          colorId: selectedColor,
          name: selectedColor,
          value: selectedColor
        }] : []
      );
       onCartUpdate?.();
      if (result.success) {
        // Close the specification modal after successful addition
       
        setSelectedProduct(null);
        
        // Notify parent component that cart was updated (data already updated in usePOS)
       
         setShowSpecModal(false);
        // Show toast after update is complete
        const productName = isRTL ? product.nameAr : product.nameEn;
        showToast('success', 
          isRTL ? 'تم الإضافة بنجاح' : 'Added Successfully',
          isRTL ? `تم إضافة ${productName} للسلة` : `${productName} added to cart`
        );
      } else {
        showToast('error',
          isRTL ? 'خطأ في الإضافة' : 'Error Adding Item',
          result.message || (isRTL ? 'حدث خطأ في إضافة المنتج' : 'Error adding product')
        );
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('error',
        isRTL ? 'خطأ في الإضافة' : 'Error Adding Item',
        isRTL ? 'حدث خطأ في إضافة المنتج' : 'Error adding product'
      );
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (!pos.currentCart) return;
    
    const currentCartId = pos.currentCart._id;
    
    if (newQuantity <= 0) {
      await pos.removeFromCart(currentCartId, itemId);
      onCartUpdate?.();
      return;
    }

    try {
      const result = await pos.updateCartItem(currentCartId, itemId, newQuantity);
      if (result.success) {
        // Notify parent component that cart was updated (data already updated in usePOS)
        onCartUpdate?.();
      } else {
        showToast('error',
          isRTL ? 'خطأ في تحديث الكمية' : 'Error Updating Quantity',
          result.message || (isRTL ? 'حدث خطأ في تحديث الكمية' : 'Error updating quantity')
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast('error',
        isRTL ? 'خطأ في تحديث الكمية' : 'Error Updating Quantity',
        isRTL ? 'حدث خطأ في تحديث الكمية' : 'Error updating quantity'
      );
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: string) => {
    if (!pos.currentCart) return;
    
    const currentCartId = pos.currentCart._id;
    
    try {
      const result = await pos.removeFromCart(currentCartId, itemId);
      if (result.success) {
        // Notify parent component that cart was updated (data already updated in usePOS)
        onCartUpdate?.();
        // Show toast after update is complete
        showToast('success',
          isRTL ? 'تم الحذف بنجاح' : 'Removed Successfully',
          isRTL ? 'تم حذف المنتج من السلة' : 'Product removed from cart'
        );
      } else {
        showToast('error',
          isRTL ? 'خطأ في الحذف' : 'Error Removing Item',
          result.message || (isRTL ? 'حدث خطأ في حذف المنتج' : 'Error removing product')
        );
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      showToast('error',
        isRTL ? 'خطأ في الحذف' : 'Error Removing Item',
        isRTL ? 'حدث خطأ في حذف المنتج' : 'Error removing product'
      );
    }
  };

  // Complete order
  const handleCompleteOrder = async () => {
    if (!pos.currentCart || !pos.currentCart.items || pos.currentCart.items.length === 0) {
      showToast('error',
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'السلة فارغة' : 'Cart is empty'
      );
      return;
    }

    try {
      const result = await pos.completeCart(pos.currentCart._id, `POS Order - ${new Date().toLocaleString()}`);
      
      if (result.success) {
        showToast('success',
          isRTL ? 'تم إكمال الطلب بنجاح!' : 'Order Completed Successfully!',
          isRTL ? 'تم إنشاء الطلب بنجاح' : 'Order has been created successfully',
          result.data?.orderNumber || 'N/A'
        );
        
        // Delete the completed cart
        const cartId = pos.currentCart._id;
        console.log('Deleting completed cart:', cartId);
        const deleteResult = await pos.deleteCart(cartId);
        
        if (deleteResult.success) {
          console.log('Cart deleted successfully after completion');
        } else {
          console.warn('Failed to delete cart after completion:', deleteResult.message);
        }
        
        // Notify parent component that cart was completed and deleted
        onCartUpdate?.(cartId);
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

  // Clear cart
  const handleClearCart = () => {
    if (!pos.currentCart) return;
    
    const itemCount = pos.currentCart.items?.length || 0;
    
    if (itemCount > 0) {
      showConfirmationModal(
        isRTL ? 'تأكيد مسح السلة' : 'Confirm Cart Clear',
        isRTL 
          ? `هل أنت متأكد من مسح جميع العناصر من السلة؟\n\nتحتوي على ${itemCount} عنصر${itemCount > 1 ? 'ات' : ''}.\n\nسيتم حذف جميع العناصر نهائياً.`
          : `Are you sure you want to clear all items from the cart?\n\nIt contains ${itemCount} item${itemCount > 1 ? 's' : ''}.\n\nAll items will be permanently removed.`,
        () => executeClearCart(),
        'warning'
      );
    }
  };

  // Execute the actual cart clearing
  const executeClearCart = async () => {
    if (!pos.currentCart || isClearingCart) return;
    
    const currentCartId = pos.currentCart._id;
    setIsClearingCart(true);
    
    try {
      const result = await pos.clearCart(currentCartId);
      if (result.success) {
        // Notify parent component that cart was updated (data already updated in usePOS)
        onCartUpdate?.();
        
        // Show toast after update is complete
        showToast('success',
          isRTL ? 'تم مسح السلة بنجاح' : 'Cart Cleared Successfully',
          isRTL ? 'تم مسح جميع المنتجات من السلة' : 'All products removed from cart'
        );
      } else {
        showToast('error',
          isRTL ? 'خطأ في مسح السلة' : 'Error Clearing Cart',
          result.message || (isRTL ? 'حدث خطأ في مسح السلة' : 'Error clearing cart')
        );
      }
      
      // Close the modal
      closeConfirmationModal();
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast('error',
        isRTL ? 'خطأ في مسح السلة' : 'Error Clearing Cart',
        isRTL ? 'حدث خطأ في مسح السلة' : 'Error clearing cart'
      );
      closeConfirmationModal();
    } finally {
      setIsClearingCart(false);
    }
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
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || 
      product.categoryId === selectedCategory ||
      product.categories?.some((cat: any) => cat._id === selectedCategory || cat.id === selectedCategory);
    
    if (searchTerm === '') {
      return matchesCategory;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    const matchesName = 
      product.nameAr?.toLowerCase().includes(searchLower) ||
      product.nameEn?.toLowerCase().includes(searchLower);
    
    const matchesBarcode = 
      product.barcodes && Array.isArray(product.barcodes) && 
      product.barcodes.some((barcode: string) => barcode.includes(searchTerm));
    
    const priceMatch = searchTerm.match(/^[₪$]?(\d+(?:\.\d{2})?)$/);
    let matchesPrice = false;
    if (priceMatch) {
      const searchPrice = parseFloat(priceMatch[1]);
      matchesPrice = 
        Math.abs((product.price || 0) - searchPrice) < 0.01 ||
        Math.abs((product.finalPrice || 0) - searchPrice) < 0.01;
    }
    
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
    if (!pos.currentCart) {
      showToast('error',
        isRTL ? 'لا توجد سلة نشطة' : 'No Active Cart',
        isRTL ? 'يرجى إنشاء سلة جديدة أولاً' : 'Please create a new cart first'
      );
      return;
    }
    
    setSelectedProduct(product);
    setShowSpecModal(true);
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
                  {isRTL ? 'نقطة البيع' : 'POS Manager'}
                </h1>
              </div>
            </div>
            
            {/* Cart Actions */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* <button
                onClick={handleCreateNewCart}
                className="flex items-center space-x-1 rtl:space-x-reverse bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">{isRTL ? 'سلة جديدة' : 'New Cart'}</span>
              </button> */}
              
                {pos.currentCart && (
                  <button
                    onClick={() => !isCartLoading && !isClearingCart && handleClearCart()}
                    disabled={isCartLoading || isClearingCart}
                    className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                      isCartLoading || isClearingCart
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isClearingCart ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {isClearingCart 
                        ? (isRTL ? 'جاري المسح...' : 'Clearing...') 
                        : (isRTL ? 'مسح السلة' : 'Clear Cart')
                      }
                    </span>
                  </button>
                )}
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
                onClick={() => !isCartLoading && smartSearch(searchTerm)}
                disabled={isCartLoading}
                className={`absolute ${isRTL ? 'left-2' :'right-2' } top-1/2 transform -translate-y-1/2 px-2 lg:px-4 py-1 rounded-md transition-colors flex items-center space-x-1 rtl:space-x-reverse ${
                  isCartLoading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Search className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="text-xs lg:text-sm hidden sm:inline">{isRTL ? 'بحث' : 'Search'}</span>
              </button>
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
                onClick={() => !isCartLoading && handleProductClick(product)}
                className={`relative bg-white rounded-lg shadow-sm border border-gray-200 p-2 lg:p-4 transition-shadow ${
                  isCartLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'
                }`}
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
                
                <div className="mb-2">
                  {product.isOnSale && product.salePercentage && product.salePercentage > 0 ? (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse flex-wrap">
                      <p className="text-lg font-bold text-green-600">
                        ₪{product.finalPrice?.toFixed(2) || product.price?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-500 line-through">
                        ₪{product.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-lg font-bold text-green-600 flex-wrap">
                      ₪{product.price?.toFixed(2) || '0.00'}
                    </p>
                  )}
                </div>
                
                {/* Stock Display */}
                <div className="mb-2">
                  {(() => {
                    const stock = product.availableQuantity || 0;
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
                        </span>
                      </div>
                    );
                  })()}
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

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mb-4 lg:mb-6">
            {isCartLoading || isLoadingTab ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 text-sm">
                    {isRTL ? 'جاري تحميل الطلب...' : 'Loading order...'}
                  </p>
                </div>
              </div>
            ) : !pos.currentCart || !pos.currentCart.items || pos.currentCart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <ShoppingCart className="w-8 h-8 mb-2" />
                <p>{isRTL ? 'لا توجد عناصر في السلة' : 'No items in cart'}</p>
                {!pos.currentCart && (
                  <button
                    onClick={() => !isCartLoading && handleCreateNewCart()}
                    disabled={isCartLoading}
                    className={`mt-2 px-4 py-2 rounded-lg transition-colors ${
                      isCartLoading 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isRTL ? 'إنشاء سلة جديدة' : 'Create New Cart'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {pos.currentCart.items.map((item) => {
                  console.log('Item data:', item);
                  return (
                  <div key={item._id} className="bg-gray-50 rounded-lg p-2 lg:p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs lg:text-sm line-clamp-2">
                          {isRTL ? (item.product?.nameAr || item.product?.nameEn || 'Unknown Product') : (item.product?.nameEn || item.product?.nameAr || 'Unknown Product')}
                        </h4>
                        <div className="text-xs text-gray-600 mt-1">
                          {isRTL ? 'السعر:' : 'Price:'} ₪{(item.priceAtAdd || 0).toFixed(2)}
                        </div>
                        {/* Display selected specifications */}
                        {item.selectedSpecifications && item.selectedSpecifications.length > 0 && (
                          <div className="text-xs text-blue-600 mt-1">
                            {isRTL ? 'المواصفات:' : 'Specifications:'} {item.selectedSpecifications.map(spec => {
                              console.log('Spec:', spec, 'All specs:', specifications);
                              const specData = specifications.find(s => s._id === spec.specificationId);
                              const valueData = specData?.values?.find((v: any) => v._id === spec.valueId);
                              return valueData ? (isRTL ? valueData.valueAr : valueData.valueEn) : spec.specificationId;
                            }).join(', ')}
                          </div>
                        )}
                        {/* Display selected colors */}
                        {item.selectedColors && item.selectedColors.length > 0 && (
                          <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <span>{isRTL ? 'الألوان:' : 'Colors:'}</span>
                            {item.selectedColors.map((color, index) => (
                              <div key={index} className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300" 
                                  style={{ backgroundColor: color.colorId }}
                                ></div>
                                <span>{color.name}</span>
                                {index < item.selectedColors.length - 1 && <span>,</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => !isCartLoading && removeFromCart(item._id)}
                        disabled={isCartLoading}
                        className={`ml-2 rtl:ml-0 rtl:mr-2 ${
                          isCartLoading 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-500 hover:text-red-700'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 lg:space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => !isCartLoading && updateQuantity(item._id, item.quantity - 1)}
                          disabled={isCartLoading}
                          className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-xs lg:text-sm ${
                            isCartLoading 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          -
                        </button>
                        <span className="w-6 lg:w-8 text-center text-xs lg:text-sm">{item.quantity}</span>
                        <button
                          onClick={() => !isCartLoading && updateQuantity(item._id, item.quantity + 1)}
                          disabled={isCartLoading}
                          className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex items-center justify-center text-xs lg:text-sm ${
                            isCartLoading 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium text-gray-900 text-xs lg:text-sm">
                        ₪{((item.priceAtAdd || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total and Complete Order */}
          {pos.currentCart && pos.currentCart.items && pos.currentCart.items.length > 0 && (
            <div className="border-t border-gray-200 pt-3 lg:pt-4">
              {pos.error && (
                <div className="mb-3 lg:mb-4 p-2 lg:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs lg:text-sm">
                  {pos.error}
                </div>
              )}
              <div className="flex justify-between items-center mb-3 lg:mb-4">
                <span className="text-base lg:text-lg font-bold text-gray-900">
                  {isRTL ? 'المجموع:' : 'Total:'}
                </span>
                <span className="text-lg lg:text-xl font-bold text-green-600">
                  ₪{(() => {
                    // Calculate total locally if API total is 0 or missing
                    const apiTotal = pos.currentCart.total || 0;
                    if (apiTotal > 0) {
                      return apiTotal.toFixed(2);
                    }
                    
                    // Calculate total from items
                    const calculatedTotal = pos.currentCart.items?.reduce((sum, item) => {
                      return sum + ((item.priceAtAdd || 0) * item.quantity);
                    }, 0) || 0;
                    
                    console.log('Calculated total:', calculatedTotal, 'API total:', apiTotal, 'Items count:', pos.currentCart.items?.length || 0);
                    
                    // If no items, return 0
                    if (!pos.currentCart.items || pos.currentCart.items.length === 0) {
                      return '0.00';
                    }
                    
                    return calculatedTotal.toFixed(2);
                  })()}
                </span>
              </div>
              <button
                onClick={handleCompleteOrder}
                disabled={pos.isLoading || isCartLoading}
                className={`w-full py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-medium transition-colors flex items-center justify-center text-sm lg:text-base ${
                  pos.isLoading || isCartLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {pos.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-b-2 border-white mr-2 rtl:mr-0 rtl:ml-2"></div>
                    <span className="text-xs lg:text-sm">{isRTL ? 'جاري إنشاء الطلب...' : 'Creating Order...'}</span>
                  </>
                ) : (
                  <span className="text-xs lg:text-sm">{isRTL ? 'إكمال الطلب' : 'Complete Order'}</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Specification Modal */}
      {showSpecModal && selectedProduct && pos.currentCart && (
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
            <div className={`flex items-start isRTL ${isRTL ? 'flex-row' : 'flex-row-reverse'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type || 'warning'}
        isLoading={isClearingCart}
      />
    </div>
  );
};

export default POSManager;
