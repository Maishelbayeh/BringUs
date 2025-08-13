import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useStoreContext } from '../contexts/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';
import { getStoreData } from '../hooks/useLocalStorage';
import Homepage from "../pages/HomePage/homepage";
import PaymentMethods from "../pages/payment/PaymentMethods";
import DeliveryMethods from "../pages/delivery/DlieveryMethods";
import CategoriesPage from '../pages/categories/categories';
import SubcategoriesPage from "../pages/subcategories/subcategories";
import ProductsPage from "../pages/products/products";
import ProductVariants from "../pages/productVariant/PaymentVariants";
import CustomersPage from "../pages/customers/customers";
import OrdersPage from "../pages/orders/orders";
import StockTable from '../pages/stockPreview/StockTable';
import OrderDetailPage from '../pages/orders/OrderDetailPage';
import Testimonial from "../pages/Testimonials/Testimonial";
import StoreSliderPage from "../pages/StoreSlider/storeSlider";
import StorePreview from "../pages/StoreSlider/StorePreview";
import StoreVideoPage from "../pages/StoreSlider/StoreVideo";
import WholesallersPage from "@/pages/wholeSallers/wholesallers";
import AffiliationPage from "@/pages/Affiliation/wholeAffiliation";
import AdvertisementPage from "@/pages/Advertisement/advertisement";
import TermsConditionsPage from "@/pages/TermsConditions/termsConditions";
import ProductSpecifications from '../pages/products/ProductSpecifications';
import CheckboxSpecificationTest from '../pages/products/CheckboxSpecificationTest';
import UsersPage from '../pages/users/users';
import Units from "../pages/units/Units";
import ProductsLabels from "../pages/labels/ProductsLabels";
import StoreGeneralInfo from "@/pages/store/StoreGeneralInfo";
import StoreInfo from "@/pages/store/StoreInfo";
import StoresManagement from "@/pages/superadmin/StoresManagement";
import SuperAdminRoute from "@/hoc/SuperAdminRoute";
import AdminRoute from "@/hoc/AdminRoute";

// Wrapper component to handle store slug parameter
const StoreRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const { setStoreSlug, currentStore, setCurrentStore } = useStoreContext();
  const { getStore } = useStore();
  
  React.useEffect(() => {
    if (storeSlug) {
      setStoreSlug(storeSlug);
      
      // If we have a store slug but no current store data, try to fetch it
      if (!currentStore) {
        // Try to get store data from localStorage first
        const storeData = getStoreData();
        if (storeData.info && storeData.info.slug === storeSlug) {
          setCurrentStore(storeData.info);
        } else {
          // If not found in localStorage, we might need to fetch from API
          // This could happen if user directly navigates to a store URL
          console.log('Store data not found for slug:', storeSlug);
        }
      }
    }
  }, [storeSlug, setStoreSlug, currentStore, setCurrentStore]);

  return <>{children}</>;
};

export default function StoreRouter() {
  const { isAuthenticated, isAuthenticatedSuperAdmin } = useAuth();
  const { storeSlug } = useStoreContext();

  console.log('StoreRouter - isAuthenticated:', isAuthenticated());
  console.log('StoreRouter - storeSlug:', storeSlug);
  console.log('StoreRouter - current URL:', window.location.pathname);

  // If user is not authenticated, redirect to login
  if (!isAuthenticated()) {
    console.log('StoreRouter - User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user is superadmin, use the original router structure
  if (isAuthenticatedSuperAdmin()) {
    return (
      <Routes>
        <Route path="/superadmin/stores" element={<StoresManagement />} />
        <Route path="*" element={<Navigate to="/superadmin/stores" replace />} />
      </Routes>
    );
  }

  // For admin users, use store-based routing
  if (!storeSlug) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Store-based routes with slug */}
      <Route path={`/${storeSlug}`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <Homepage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/payment-methods`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <PaymentMethods />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/delivery-settings`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <DeliveryMethods />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/categories`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <CategoriesPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/subcategories`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <SubcategoriesPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/products`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <ProductsPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/product-variants`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <ProductVariants />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/customers`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <CustomersPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/orders`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <OrdersPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/orders/:id`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <OrderDetailPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/stock-preview`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <StockTable />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/store-slider`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <StoreSliderPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/store-preview`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <StorePreview />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/store-videos`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <StoreVideoPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/wholesalers`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <WholesallersPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/store-info`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <StoreGeneralInfo />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/store-info-container`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <StoreInfo />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      {/* Add route for affiliate with code - must come first and be more specific */}
      {/* <Route path={`/${storeSlug}/affiliate/:affiliateCode`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <AffiliationPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
       */}
      {/* Basic affiliate route - must come after the specific one */}
      <Route path={`/${storeSlug}/affiliate`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <AffiliationPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/advertisement`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <AdvertisementPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/terms-conditions`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <TermsConditionsPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/products/specifications`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <ProductSpecifications />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/test-checkbox-specifications`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <CheckboxSpecificationTest />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/units`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <Units />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/labels`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <ProductsLabels />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/testimonials`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <Testimonial />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      <Route path={`/${storeSlug}/users`} element={
        <StoreRouteWrapper>
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        </StoreRouteWrapper>
      } />
      
      {/* Redirect root to store dashboard */}
      <Route path="/" element={<Navigate to={`/${storeSlug}`} replace />} />
      
      {/* Catch all other routes and redirect to store dashboard */}
      <Route path="*" element={<Navigate to={`/${storeSlug}`} replace />} />
    </Routes>
  );
} 