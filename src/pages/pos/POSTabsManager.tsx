import React, { useState, useEffect } from 'react';
import { X, Plus, ShoppingCart, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePOS } from '../../hooks/usePOS';
import { getStoreId } from '../../utils/storeUtils';
import useLanguage from '../../hooks/useLanguage';
import useProducts from '../../hooks/useProducts';
import useCategories from '../../hooks/useCategories';
import useProductSpecifications from '../../hooks/useProductSpecifications';
import POSManager from './POSManager';
import ConfirmationModal from '../../components/common/ConfirmationModal';

interface POSTab {
  id: string;
  cartId: string;
  nameAr: string;
  nameEn: string;
  status: 'active' | 'completed' | 'cancelled';
  total: number;
  itemCount: number;
  createdAt: string;
}

const POSTabsManager: React.FC = () => {
  const { isRTL } = useLanguage();
  const pos = usePOS();
  const storeId = getStoreId();
  
  // Import hooks for data loading
  const { products, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const { specifications, fetchSpecifications } = useProductSpecifications();
  
  const [tabs, setTabs] = useState<POSTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isCreatingCart, setIsCreatingCart] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);
  
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

  // Load initial data (products, categories, specifications) - only once
  useEffect(() => {
    const loadInitialData = async () => {
      if (hasLoadedInitialData) {
        console.log('Initial data already loaded, skipping API calls');
        return;
      }
      
      try {
        console.log('Loading initial POS data (products, categories, specifications)...');
        // Load data in parallel for better performance
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchSpecifications()
        ]);
        
        setHasLoadedInitialData(true);
        console.log('Initial POS data loaded successfully');
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [hasLoadedInitialData]);

  // Load tabs on component mount - only if not already loaded
  useEffect(() => {
    if (storeId && tabs.length === 0) {
      loadTabs();
    }
  }, [storeId, tabs.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refreshTimeout]);

  // Stop loading when cart data is ready
  useEffect(() => {
    if (isLoadingTab && pos.currentCart && pos.currentCart._id === activeTabId) {
      console.log('Cart data is ready, stopping loading');
      setIsLoadingTab(false);
    }
  }, [isLoadingTab, pos.currentCart, activeTabId]);

  // Clear cart data when activeTabId changes to prevent data leakage
  useEffect(() => {
    if (activeTabId) {
      // If current cart doesn't match active tab, clear it
      if (pos.currentCart && pos.currentCart._id !== activeTabId) {
        console.log('Active tab changed, clearing mismatched cart data');
        pos.setCurrentCart(null);
      }
    }
  }, [activeTabId, pos.currentCart]);

  // Load tabs from POS carts
  const loadTabs = async () => {
    if (!storeId) return;
    
    try {
      const result = await pos.getAllCarts(storeId, 'active');
      if (result.success && result.data) {
        const tabsData: POSTab[] = result.data.map((cart: any) => {
          // Calculate total from items if API total is 0 or missing
          const calculatedTotal = cart.total > 0 
            ? cart.total 
            : cart.items?.reduce((sum: number, item: any) => {
                return sum + ((item.priceAtAdd || 0) * item.quantity);
              }, 0) || 0;
          
          return {
          id: cart._id,
          cartId: cart._id,
          nameAr: cart.cartNameAr,
          nameEn: cart.cartName,
          status: cart.status,
            total: calculatedTotal,
          itemCount: cart.items?.length || 0,
          createdAt: cart.createdAt
          };
        });
        setTabs(tabsData);
        
        // Set first tab as active if no active tab
        if (tabsData.length > 0 && !activeTabId) {
          const firstTab = tabsData[0];
          setActiveTabId(firstTab.id);
          await pos.getCart(firstTab.cartId);
          console.log('First tab loaded:', firstTab.id);
        }
      }
    } catch (error) {
      console.error('Error loading tabs:', error);
    }
  };

  // Create new tab
  const handleCreateNewTab = async () => {
    if (!storeId) return;
    
    setIsCreatingCart(true);
    try {
      const result = await pos.createCart(storeId);
      if (result.success && result.data) {
        const newTab: POSTab = {
          id: result.data.cartId,
          cartId: result.data.cartId,
          nameAr: result.data.cartNameAr,
          nameEn: result.data.cartName,
          status: 'active',
          total: 0,
          itemCount: 0,
          createdAt: new Date().toISOString()
        };
        
        setTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
        // Load the cart immediately to ensure it's available
        await pos.getCart(newTab.cartId);
      }
    } catch (error) {
      console.error('Error creating new tab:', error);
    } finally {
      setIsCreatingCart(false);
    }
  };

  // Switch to tab
  const handleTabClick = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || tabId === activeTabId) return;
    
    setIsLoadingTab(true);
    try {
      setActiveTabId(tabId);
      
      // Clear current cart immediately to prevent data leakage
      console.log('Clearing cart data before switching to tab:', tabId);
      pos.setCurrentCart(null);
      
      // Force reload the cart data to get latest updates
      await pos.getCart(tab.cartId);
      console.log('Switched to tab:', tabId);
    } catch (error) {
      console.error('Error switching tab:', error);
      setIsLoadingTab(false); // Stop loading on error
    }
  };

  // Refresh all tabs data - with debouncing to prevent excessive calls
  const refreshAllTabs = async () => {
    if (storeId && !isLoadingTab) {
      await loadTabs();
    }
  };

  // Debounced refresh function to prevent excessive API calls
  const debouncedRefresh = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Only refresh if we're not currently loading a tab
      if (!isLoadingTab) {
        refreshAllTabs();
      }
    }, 300); // 300ms delay
    
    setRefreshTimeout(timeout);
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

  // Close tab by cart ID (used after completing an order)
  const closeTabByCartId = async (cartId: string) => {
    const tab = tabs.find(t => t.cartId === cartId);
    if (!tab) return;
    
    console.log('Closing tab after order completion:', tab.id);
    
    // Remove from tabs
    setTabs(prev => prev.filter(t => t.id !== tab.id));
    
    // If this was the active tab, switch to another tab
    if (activeTabId === tab.id) {
      const remainingTabs = tabs.filter(t => t.id !== tab.id);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
        await pos.getCart(remainingTabs[0].cartId);
      } else {
        setActiveTabId(null);
        pos.setCurrentCart(null);
      }
    }
  };

  // Close tab
  const handleCloseTab = async (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
      // If tab has items, ask for confirmation
      if (tab.itemCount > 0) {
      showConfirmationModal(
        isRTL ? 'تأكيد إغلاق السلة' : 'Confirm Cart Closure',
          isRTL 
          ? `هل أنت متأكد من إغلاق هذه السلة؟\n\nتحتوي على ${tab.itemCount} عنصر${tab.itemCount > 1 ? 'ات' : ''}.\n\nسيتم حذف جميع العناصر نهائياً.`
          : `Are you sure you want to close this cart?\n\nIt contains ${tab.itemCount} item${tab.itemCount > 1 ? 's' : ''}.\n\nAll items will be permanently deleted.`,
        () => executeCloseTab(tabId),
        'warning'
      );
    } else {
      // Close immediately if no items
      executeCloseTab(tabId);
    }
  };

  // Execute the actual tab closing
  const executeCloseTab = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    try {
      // Delete the cart
      await pos.deleteCart(tab.cartId);
      
      // Remove from tabs
      setTabs(prev => prev.filter(t => t.id !== tabId));
      
      // If this was the active tab, switch to another tab
      if (activeTabId === tabId) {
        const remainingTabs = tabs.filter(t => t.id !== tabId);
        if (remainingTabs.length > 0) {
          setActiveTabId(remainingTabs[0].id);
          await pos.getCart(remainingTabs[0].cartId);
        } else {
          setActiveTabId(null);
          pos.setCurrentCart(null);
        }
      }
      
      // Close the modal
      closeConfirmationModal();
    } catch (error) {
      console.error('Error closing tab:', error);
      closeConfirmationModal();
    }
  };

  // Update tab when cart changes
  useEffect(() => {
    if (pos.currentCart && activeTabId && pos.currentCart._id === activeTabId && !isLoadingTab) {
      // Calculate total from items if API total is 0 or missing
      const calculatedTotal = pos.currentCart.total > 0 
        ? pos.currentCart.total 
        : pos.currentCart.items?.reduce((sum, item) => {
            return sum + ((item.priceAtAdd || 0) * item.quantity);
          }, 0) || 0;
      
      console.log('Updating tab with cart data:', {
        cartId: pos.currentCart._id,
        total: calculatedTotal,
        itemCount: pos.currentCart.items?.length || 0,
        items: pos.currentCart.items
      });
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? {
              ...tab,
              total: calculatedTotal,
              itemCount: pos.currentCart?.items?.length || 0,
              status: pos.currentCart?.status || 'active'
            }
          : tab
      ));
    }
  }, [pos.currentCart, activeTabId, isLoadingTab]);

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'cancelled':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      default:
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">
                {isRTL ? 'إدارة نقاط البيع' : 'POS Tabs Manager'}
              </h1>
            </div>
            
            <button
              onClick={handleCreateNewTab}
              disabled={isCreatingCart}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreatingCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isCreatingCart ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'سلة جديدة' : 'New Cart')}</span>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="mt-4 flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2 " dir={isRTL ? 'rtl' : 'ltr'}>
            {tabs.map((tab) => {
              const statusInfo = getStatusInfo(tab.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg cursor-pointer transition-colors min-w-0 ${
                    activeTabId === tab.id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent'
                  } ${isLoadingTab && activeTabId === tab.id ? 'opacity-50' : ''}`}
                >
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {isRTL ? tab.nameAr : tab.nameEn}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tab.itemCount} {isRTL ? 'عنصر' : 'items'} • ₪{(() => {
                        // Always use the tab's stored total if it's greater than 0
                        const tabTotal = tab.total || 0;
                        if (tabTotal > 0) {
                          return tabTotal.toFixed(2);
                        }
                        
                        // For active tab, also calculate from current cart items as fallback
                        if (activeTabId === tab.id && pos.currentCart?.items) {
                          const calculatedTotal = pos.currentCart.items.reduce((sum, item) => {
                            return sum + ((item.priceAtAdd || 0) * item.quantity);
                          }, 0);
                          return calculatedTotal.toFixed(2);
                        }
                        
                        return tabTotal.toFixed(2);
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            
            {tabs.length === 0 && (
              <div className="text-center py-8 text-gray-500 mx-auto">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {isRTL ? 'لا توجد سلات نشطة' : 'No Active Carts'}
                </p>
                <p className="text-sm">
                  {isRTL ? 'انقر على "سلة جديدة" لبدء عملية بيع جديدة' : 'Click "New Cart" to start a new sale'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Always show POSManager, loading only affects cart section */}
      <div className="flex-1">
        {activeTabId ? (
          <POSManager 
            key="pos-manager" // Fixed key to prevent re-creation
            cartId={activeTabId!}
            isLoadingTab={isLoadingTab}
            // Pass pre-loaded data to avoid re-fetching
            products={products}
            categories={categories}
            specifications={specifications}
            onNewOrder={async (cartId) => {
              // This will be called when a new order is created
              console.log('New order created:', cartId);
              // Refresh tabs to include the new cart
              await refreshAllTabs();
              // Set the new cart as active
              setActiveTabId(cartId);
            }}
            onCartUpdate={(completedCartId) => {
              // If a cart was completed, close its tab
              if (completedCartId) {
                closeTabByCartId(completedCartId);
              } else {
              //  console.log('Cart upfffffffffffffffffffffffffffffffffdated:', completedCartId);
                debouncedRefresh();
              }
            }}
          />
        ) : (
          null
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type || 'warning'}
      />

    </div>
  );
};

export default POSTabsManager;
