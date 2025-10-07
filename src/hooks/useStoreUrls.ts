import { useStoreContext } from '../contexts/StoreContext';
import { useAuth } from './useAuth';

export const useStoreUrls = () => {
  // Add safety check for context
  let storeSlug: string | null = null;
  try {
    const context = useStoreContext();
    storeSlug = context.storeSlug;
  } catch (error) {
    console.warn('StoreContext not available, using fallback storeSlug');
    // Fallback to localStorage if context is not available
    const storeData = localStorage.getItem('storeInfo');
    if (storeData) {
      try {
        const parsed = JSON.parse(storeData);
        storeSlug = parsed.slug || null;
      } catch (e) {
        console.error('Error parsing storeInfo from localStorage:', e);
      }
    }
  }
  
  const { isAuthenticatedSuperAdmin } = useAuth();

  const generateUrl = (path: string): string => {
    // If user is superadmin, don't add store slug
    if (isAuthenticatedSuperAdmin()) {
      return path;
    }
    
    // If no store slug available, return original path
    if (!storeSlug) {
      return path;
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // If path is empty, return just the store slug
    if (!cleanPath) {
      return `/${storeSlug}`;
    }
    
    return `/${storeSlug}/${cleanPath}`;
  };

  const urls = {
    // Admin URLs (with store slug)
    dashboard: generateUrl(''),
    paymentMethods: generateUrl('payment-methods'),
    deliverySettings: generateUrl('delivery-settings'),
    categories: generateUrl('categories'),
    subcategories: generateUrl('subcategories'),
    products: generateUrl('products'),
    productVariants: generateUrl('product-variants'),
    customers: generateUrl('customers'),
    orders: generateUrl('orders'),
    orderDetail: (id: string) => generateUrl(`orders/${id}`),
    stockPreview: generateUrl('stock-preview'),
    storeSlider: generateUrl('store-slider'),
    storePreview: generateUrl('store-preview'),
    storeVideos: generateUrl('store-videos'),
    wholesalers: generateUrl('wholesalers'),
    storeInfo: generateUrl('store-info'),
    storeInfoContainer: generateUrl('store-info-container'),
    affiliate: generateUrl('affiliate'),
    advertisement: generateUrl('advertisement'),
    termsConditions: generateUrl('terms-conditions'),
    productSpecifications: generateUrl('specifications'),
    testCheckboxSpecifications: generateUrl('test-checkbox-specifications'),
    units: generateUrl('units'),
    labels: generateUrl('labels'),
    testimonials: generateUrl('testimonials'),
    users: generateUrl('users'),
    
    // SuperAdmin URLs (without store slug)
    superAdminStores: '/superadmin/stores',
  };

  return {
    urls,
    generateUrl,
    storeSlug,
  };
}; 