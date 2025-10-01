import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoreData, getStoreId } from '../hooks/useLocalStorage';
import { useStore } from '../hooks/useStore';

interface StoreContextType {
  currentStore: any;
  storeSlug: string | null;
  setCurrentStore: (store: any) => void;
  setStoreSlug: (slug: string) => void;
  loading: boolean;
  error: string | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [currentStore, setCurrentStore] = useState<any>(null);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const { loading, error } = useStore();

  // Function to update store data from localStorage
  const updateStoreFromStorage = () => {
    const storeData = getStoreData();
    const storeId = getStoreId();
    
    console.log('StoreContext - updateStoreFromStorage - storeData:', storeData);
    console.log('StoreContext - updateStoreFromStorage - storeId:', storeId);
    
    if (storeData.info) {
      setCurrentStore(storeData.info);
      setStoreSlug(storeData.info.slug);
      console.log('StoreContext - Setting storeSlug to:', storeData.info.slug);
    } else {
      // Clear store data if no store info found
      setCurrentStore(null);
      setStoreSlug(null);
      console.log('StoreContext - No store data found, clearing storeSlug');
    }
  };

  useEffect(() => {
    // Initialize store data from localStorage
    updateStoreFromStorage();
  }, []);

  // Listen for storage changes (when user logs in/out or switches stores)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'storeInfo' || e.key === 'storeId' || e.key === 'token') {
        updateStoreFromStorage();
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same tab updates)
    const handleCustomStorageChange = () => {
      updateStoreFromStorage();
    };

    window.addEventListener('storeDataUpdated', handleCustomStorageChange);
    window.addEventListener('userLoggedIn', handleCustomStorageChange);
    window.addEventListener('userLoggedOut', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storeDataUpdated', handleCustomStorageChange);
      window.removeEventListener('userLoggedIn', handleCustomStorageChange);
      window.removeEventListener('userLoggedOut', handleCustomStorageChange);
    };
  }, []);

  const handleSetCurrentStore = (store: any) => {
    setCurrentStore(store);
    if (store?.slug) {
      setStoreSlug(store.slug);
    }
  };

  const handleSetStoreSlug = (slug: string) => {
    setStoreSlug(slug);
  };

  const value: StoreContextType = {
    currentStore,
    storeSlug,
    setCurrentStore: handleSetCurrentStore,
    setStoreSlug: handleSetStoreSlug,
    loading,
    error,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}; 