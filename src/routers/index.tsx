import { Routes, Route } from "react-router-dom";
import Login from '../pages/Login/Login';
import Signup from '../pages/Login/Signup';
import ForgotPassword from '../pages/Login/ForgotPassword';
import NewUserRegistration from '../pages/Login/NewUserRegistration';
import StoreRouter from './StoreRouter';

export default function Routers() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/new-user-registration" element={<NewUserRegistration />} />
      
      {/* Store-based routes - handled by StoreRouter */}
      <Route path="/*" element={<StoreRouter />} />
    </Routes>
  );
}
