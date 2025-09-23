import React, { useState, useEffect } from 'react';
import { X, Plus, ShoppingCart, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePOS } from '../../hooks/usePOS';
import { getStoreId } from '../../utils/storeUtils';
import useLanguage from '../../hooks/useLanguage';
import POSManager from './POSManager';

interface POSTab {
  id: string;
  cartId: string;
  name: string;
  status: 'active' | 'completed' | 'cancelled';
  total: number;
  itemCount: number;
  createdAt: string;
}

const POSTabsManager: React.FC = () => {
  const { isRTL } = useLanguage();
  const pos = usePOS();
  const storeId = getStoreId();
  
  const [tabs, setTabs] = useState<POSTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isCreatingCart, setIsCreatingCart] = useState(false);

  // Load tabs on component mount
  useEffect(() => {
    if (storeId) {
      loadTabs();
    }
  }, [storeId]);

  // Update tabs when current cart changes
  useEffect(() => {
    if (pos.currentCart && activeTabId) {
      // Calculate total from items if API total is 0
      const calculatedTotal = pos.currentCart.total > 0 
        ? pos.currentCart.total 
        : pos.currentCart.items?.reduce((sum, item) => {
            return sum + ((item.priceAtAdd || 0) * item.quantity);
          }, 0) || 0;
      
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? {
              ...tab,
              total: calculatedTotal,
              itemCount: pos.currentCart?.items?.length || 0
            }
          : tab
      ));
    }
  }, [pos.currentCart, activeTabId]);

  // Load tabs from POS carts
  const loadTabs = async () => {
    if (!storeId) return;
    
    try {
      const result = await pos.getAllCarts(storeId, 'active');
      if (result.success && result.data) {
        const tabsData: POSTab[] = result.data.map((cart: any) => ({
          id: cart._id,
          cartId: cart._id,
          name: cart.cartName || `Cart ${cart.sessionId.slice(-4)}`,
          status: cart.status,
          total: cart.total || 0,
          itemCount: cart.items?.length || 0,
          createdAt: cart.createdAt
        }));
        setTabs(tabsData);
        
        // Set first tab as active if no active tab
        if (tabsData.length > 0 && !activeTabId) {
          setActiveTabId(tabsData[0].id);
          await pos.getCart(tabsData[0].cartId);
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
          name: result.data.cartName || `Cart ${result.data.sessionId.slice(-4)}`,
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
    if (!tab) return;
    
    setActiveTabId(tabId);
    // Force reload the cart data
    await pos.getCart(tab.cartId);
    console.log('Switched to tab:', tabId, 'Cart data:', pos.currentCart);
  };

  // Close tab
  const handleCloseTab = async (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    
    try {
      // If tab has items, ask for confirmation
      if (tab.itemCount > 0) {
        const confirmed = window.confirm(
          isRTL 
            ? `هل أنت متأكد من إغلاق هذه السلة؟ (${tab.itemCount} عنصر)` 
            : `Are you sure you want to close this cart? (${tab.itemCount} items)`
        );
        if (!confirmed) return;
      }
      
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
    } catch (error) {
      console.error('Error closing tab:', error);
    }
  };

  // Update tab when cart changes
  useEffect(() => {
    if (pos.currentCart && activeTabId) {
      setTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? {
              ...tab,
              total: pos.currentCart?.total || 0,
              itemCount: pos.currentCart?.items?.length || 0,
              status: pos.currentCart?.status || 'active'
            }
          : tab
      ));
    }
  }, [pos.currentCart, activeTabId]);

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
                  }`}
                >
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {tab.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tab.itemCount} {isRTL ? 'عنصر' : 'items'} • ₪{(() => {
                        // Calculate total locally if tab total is 0 or missing
                        const tabTotal = tab.total || 0;
                        if (tabTotal > 0) {
                          return tabTotal.toFixed(2);
                        }
                        
                        // Calculate total from current cart items if this is the active tab
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

      {/* Main Content */}
      <div className="flex-1">
        {activeTabId ? (
          <POSManager 
            cartId={activeTabId!}
            onNewOrder={(cartId) => {
              // This will be called when a new order is created
              console.log('New order created:', cartId);
            }}
          />
        ) : null}
      </div>

    </div>
  );
};

export default POSTabsManager;
