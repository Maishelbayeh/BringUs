import { Routes, Route } from "react-router-dom";
import Homepage from "../pages/HomePage/homepage";
import PaymentMethods from "../pages/payment/PaymentMethods";
import DeliveryMethods from "../pages/delivery/DlieveryMethods";
import CategoriesPage from '../pages/categories/categories';
import SubcategoriesPage from "../pages/subcategories/subcategories";
import ProductsPage from "../pages/products/products";
import ProductVariants from "../pages/productVariant/PaymentVariants";
import CustomersPage from "../pages/customers/customers";
import OrdersPage from "../pages/orders";
import StoreSliderPage from "../pages/StoreSlider/storeSlider";
import StorePreview from "../pages/StoreSlider/StorePreview";
import StoreVideoPage from "../pages/StoreSlider/StoreVideo";
export default function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      {/* <Route path="/" element={<LogIn />} /> */}
      {/* <Route path="/login" element={<LogIn />} /> */}
      <Route path="/" element={<Homepage />} />
      <Route path="/payment-methods" element={<PaymentMethods />} />
      <Route path="/delivery-settings" element={<DeliveryMethods />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/subcategories" element={<SubcategoriesPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product-variants" element={<ProductVariants />} />  
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/store-slider" element={<StoreSliderPage />} />
      <Route path="/store-preview" element={<StorePreview />} />
      <Route path="/store-videos" element={<StoreVideoPage />} />
    </Routes>
  );
}
