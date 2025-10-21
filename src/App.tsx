import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';

import Routers from './routers';
import useLanguage from './hooks/useLanguage';
import useSidebar from './hooks/useSidebar';
import { getFilteredMenuItems } from './constants/sideBarData';
import { MenuItem } from './Types';
import Sidebar from './components/common/navigation/sidebar';
import TopNavbar from './components/common/navigation/topNav';
import { ToastProvider } from './contexts/ToastContext';
import { StoreProvider } from './contexts/StoreContext';
import { useAuth } from './hooks/useAuth';
import PaymentVerificationHandler from './components/common/PaymentVerificationHandler';
import PaymentPollingManager from './components/common/PaymentPollingManager';
import ErrorBoundary from './components/common/ErrorBoundary';

// Component to check if we're on login page
const AppContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname.match(/^\/[^\/]+\/login$/);
  const isSignupPage = location.pathname === '/signup' || location.pathname.match(/^\/[^\/]+\/signup$/);
  const isForgotPasswordPage = location.pathname === '/forgot-password' || location.pathname.match(/^\/[^\/]+\/forgot-password$/);
  const isResetPasswordPage = location.pathname === '/reset-password' || location.pathname.match(/^\/[^\/]+\/reset-password$/);
  const isAuthPage = isLoginPage || isSignupPage || isForgotPasswordPage || isResetPasswordPage;
  
  const { language, toggleLanguage } = useLanguage();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const getMenuItems = (): MenuItem[] => {
    const isOwner = localStorage.getItem('isOwner') === 'true';
    const userRole = user?.role || 'admin';
  
    // Use filtered menu items based on store status and user role
    const menu = getFilteredMenuItems(userRole);
  
    // فلترة عنصر /users من children و العناصر الرئيسية
    const filteredMenu = menu.map(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          if (child.path === '/users') {
            return isOwner;
          }
          return true;
        });
        return { ...item, children: filteredChildren };
      }
      if (item.path === '/users') {
        return isOwner ? item : null;
      }
      return item;
    }).filter(Boolean) as MenuItem[];
  
    return filteredMenu;
  };
  
  const handleItemClick = () => {
    // Handle menu item click
  };

  // If on auth pages, render only the router without navigation
  if (isAuthPage) {
    return <Routers />;
  }

  return (
    <>
      <PaymentVerificationHandler />
      <PaymentPollingManager />
      <div className={
          `flex h-screen w-full bg-main_bg_w overflow-x-hidden ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`
        }>
        {/* Sidebar for all screens, but with different style for mobile */}
        {isSidebarOpen && (
        <>
          {/* Overlay for mobile and tablets only (less than lg) */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 lg:hidden"
            onClick={toggleSidebar}
          />
          <div
            className={
              `z-50 transition-all duration-300
              fixed top-0 ${language === 'ARABIC' ? 'right-0' : 'left-0'} h-full  max-w-xs lg:static lg:block lg:w-80 lg:max-w-xs
              ${language === 'ARABIC' ? 'lg:right-0' : 'lg:left-0'}
              bg-primary-light shadow-xl lg:shadow-none
              lg:relative lg:z-auto`
            }
            style={{ minHeight: '100vh' }}
          >
            <Sidebar 
              menu={getMenuItems()}
              userName={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              isRTL={language === 'ARABIC'}
              language={language}
              onItemClick={handleItemClick}
            />
          </div>
        </>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopNavbar
          language={language}
          onLanguageToggle={toggleLanguage}
          onMenuToggle={toggleSidebar}
        />

        <main className="flex-1 overflow-auto p-4">
          <Routers />
        </main>
      </div>
    </div>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <StoreProvider>
            <AppContent />
          </StoreProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;