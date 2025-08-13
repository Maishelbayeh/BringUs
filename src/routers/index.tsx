import { Routes, Route } from "react-router-dom";
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
import Login from '../pages/Login/Login';
import Signup from '../pages/Login/Signup';
import ForgotPassword from '../pages/Login/ForgotPassword';
import NewUserRegistration from '../pages/Login/NewUserRegistration';
import UsersPage from '../pages/users/users';
import Units from "../pages/units/Units";
import ProductsLabels from "../pages/labels/ProductsLabels";
import StoreGeneralInfo from "@/pages/store/StoreGeneralInfo";
import StoreInfo from "@/pages/store/StoreInfo";
import StoresManagement from "@/pages/superadmin/StoresManagement";
import SuperAdminRoute from "@/hoc/SuperAdminRoute";
import AdminRoute from "@/hoc/AdminRoute";

export default function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/new-user-registration" element={<NewUserRegistration />} />
      <Route path="/users" element={
        <AdminRoute>
          <UsersPage />
        </AdminRoute>
      } />
      <Route path="/" element={
        <AdminRoute>
          <Homepage />
        </AdminRoute>
      } />
      <Route path="/payment-methods" element={
        <AdminRoute>
          <PaymentMethods />
        </AdminRoute>
      } />
      <Route path="/delivery-settings" element={
        <AdminRoute>
          <DeliveryMethods />
        </AdminRoute>
      } />
      <Route path="/categories" element={
        <AdminRoute>
          <CategoriesPage />
        </AdminRoute>
      } />
      <Route path="/subcategories" element={
        <AdminRoute>
          <SubcategoriesPage />
        </AdminRoute>
      } />
      <Route path="/products" element={
        <AdminRoute>
          <ProductsPage />
        </AdminRoute>
      } />
      <Route path="/product-variants" element={
        <AdminRoute>
          <ProductVariants />
        </AdminRoute>
      } />  
      <Route path="/customers" element={
        <AdminRoute>
          <CustomersPage />
        </AdminRoute>
      } />
      <Route path="/orders" element={
        <AdminRoute>
          <OrdersPage />
        </AdminRoute>
      } />
      <Route path="/orders/:id" element={
        <AdminRoute>
          <OrderDetailPage />
        </AdminRoute>
      } />
      <Route path="/stock-preview" element={
        <AdminRoute>
          <StockTable />
        </AdminRoute>
      } />
      <Route path="/store-slider" element={
        <AdminRoute>
          <StoreSliderPage />
        </AdminRoute>
      } />
      <Route path="/store-preview" element={
        <AdminRoute>
          <StorePreview />
        </AdminRoute>
      } />
      <Route path="/store-videos" element={
        <AdminRoute>
          <StoreVideoPage />
        </AdminRoute>
      } />
      <Route path="/wholesalers" element={
        <AdminRoute>
          <WholesallersPage />
        </AdminRoute>
      } />
      <Route path="/store-info" element={
        <AdminRoute>
          <StoreGeneralInfo />
        </AdminRoute>
      } />
      <Route path="/store-info-container" element={
        <AdminRoute>
          <StoreInfo />
        </AdminRoute>
      } />
      <Route path="/affiliate" element={
        <AdminRoute>
          <AffiliationPage />
        </AdminRoute>
      } />
      <Route path="/advertisement" element={
        <AdminRoute>
          <AdvertisementPage />
        </AdminRoute>
      } />
      <Route path="/terms-conditions" element={
        <AdminRoute>
          <TermsConditionsPage />
        </AdminRoute>
      } />
      <Route path="/products/specifications" element={
        <AdminRoute>
          <ProductSpecifications />
        </AdminRoute>
      } />
      <Route path="/test-checkbox-specifications" element={
        <AdminRoute>
          <CheckboxSpecificationTest />
        </AdminRoute>
      } />
      <Route path="/units" element={
        <AdminRoute>
          <Units />
        </AdminRoute>
      } />
      <Route path="/labels" element={
        <AdminRoute>
          <ProductsLabels />
        </AdminRoute>
      } /> 
      <Route path="/testimonials" element={
        <AdminRoute>
          <Testimonial />
        </AdminRoute>
      } /> 
      <Route path="/superadmin/stores" element={
        <SuperAdminRoute>
          <StoresManagement />
        </SuperAdminRoute>
      } />
    </Routes>
  );
}
