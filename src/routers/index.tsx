import { Routes, Route } from "react-router-dom";
import Login from '../pages/Login/Login';
import Signup from '../pages/Login/Signup';
import ForgotPassword from '../pages/Login/ForgotPassword';
import ResetPassword from '../pages/Login/ResetPassword';
import NewUserRegistration from '../pages/Login/NewUserRegistration';
import StoreRouter from './StoreRouter';

export default function Routers() {
  return (
    <Routes>
      {/* Public Routes - Support both direct paths and /:slug/ paths */}
      <Route path="/login" element={<Login />} />
      <Route path="/:slug/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/:slug/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/:slug/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/:slug/reset-password" element={<ResetPassword />} />
      <Route path="/new-user-registration" element={<NewUserRegistration />} />
      <Route path="/:slug/new-user-registration" element={<NewUserRegistration />} />
      
      {/* Store-based routes - handled by StoreRouter */}
      <Route path="/*" element={<StoreRouter />} />
    </Routes>
  );
}
