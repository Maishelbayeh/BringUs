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
import Units from "../pages/units/Units";
import ProductsLabels from "../pages/labels/ProductsLabels";

export default function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={<Homepage />} />
      <Route path="/payment-methods" element={<PaymentMethods />} />
      <Route path="/delivery-settings" element={<DeliveryMethods />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/subcategories" element={<SubcategoriesPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product-variants" element={<ProductVariants />} />  
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/orders/:id" element={<OrderDetailPage />} />
      <Route path="/stock-preview" element={<StockTable />} />
      <Route path="/store-slider" element={<StoreSliderPage />} />
      <Route path="/store-preview" element={<StorePreview />} />
      <Route path="/store-videos" element={<StoreVideoPage />} />
      <Route path="/wholesalers" element={<WholesallersPage />} />
      <Route path="/affiliate" element={<AffiliationPage />} />
      <Route path="/advertisement" element={<AdvertisementPage />} />
      <Route path="/terms-conditions" element={<TermsConditionsPage />} />
      <Route path="/products/specifications" element={<ProductSpecifications />} />
      <Route path="/test-checkbox-specifications" element={<CheckboxSpecificationTest />} />
      <Route path="/units" element={<Units />} />
      <Route path="/labels" element={<ProductsLabels />} /> 
       <Route path="/testimonials" element={<Testimonial />} /> 
    </Routes>
  );
}
