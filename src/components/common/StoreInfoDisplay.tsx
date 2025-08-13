import React from 'react';
import { useStoreContext } from '../../contexts/StoreContext';
import { useStoreUrls } from '../../hooks/useStoreUrls';

const StoreInfoDisplay: React.FC = () => {
  const { currentStore, storeSlug } = useStoreContext();
  const { urls } = useStoreUrls();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">Store Information</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Store Slug:</strong> {storeSlug || 'Not set'}</p>
        <p><strong>Store Name (AR):</strong> {currentStore?.nameAr || 'Not set'}</p>
        <p><strong>Store Name (EN):</strong> {currentStore?.nameEn || 'Not set'}</p>
        <p><strong>Store ID:</strong> {currentStore?.id || 'Not set'}</p>
        <p><strong>Current URL:</strong> {window.location.pathname}</p>
        <div className="mt-4">
          <h4 className="font-medium mb-2">Generated URLs:</h4>
          <div className="space-y-1 text-xs">
            <p><strong>Dashboard:</strong> {urls.dashboard}</p>
            <p><strong>Products:</strong> {urls.products}</p>
            <p><strong>Categories:</strong> {urls.categories}</p>
            <p><strong>Orders:</strong> {urls.orders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreInfoDisplay; 