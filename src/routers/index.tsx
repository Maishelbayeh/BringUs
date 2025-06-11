import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "../pages/HomePage/homepage";
import PaymentMethods from "../pages/payment/PaymentMethods";
import DeliveryMethods from "../pages/delivery/DlieveryMethods";
import CategoriesPage from '../pages/categories';

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
    </Routes>
  );
}
