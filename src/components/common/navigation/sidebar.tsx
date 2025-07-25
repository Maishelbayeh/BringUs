// src/components/common/navigation/Sidebar.tsx
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { MenuItem } from '../../../Types';
import logo from '../../../assets/bringus.svg';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth';
import { getStoreName, getStoreLogo, getUserAvatar } from '../../../hooks/useLocalStorage';

interface SidebarProps {
  userName: string;
  menu: MenuItem[];
  onItemClick: (path: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  isRTL: boolean;
  language: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  menu,
  userName,
  onItemClick,
  isOpen,
  toggleSidebar,
  isRTL,
  language,
}) => {
  // CSS for hiding scrollbar
  const scrollbarHideStyles = `
    .sidebar-scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .sidebar-scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [expandedRegion, setExpandedRegion] = useState<number | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();
  const { getCurrentUser } = useAuth();
  
  // الحصول على بيانات المستخدم والمتجر
  const user = getCurrentUser();
  const [storeName, setStoreName] = useState(getStoreName(language) || 'BringUs');
  const [storeLogo, setStoreLogo] = useState(getStoreLogo());
  const userDisplayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : userName;
  const userRole = user?.role || 'Sales Manager';
  const userAvatar = getUserAvatar();

  // الاستماع لتحديث بيانات المتجر
  useEffect(() => {
    const handleStoreDataUpdate = (event: CustomEvent) => {
      const { nameAr, nameEn, logo } = event.detail;
      const newStoreName = language === 'ARABIC' ? nameAr : nameEn;
      setStoreName(newStoreName || 'BringUs');
      if (logo?.url) {
        setStoreLogo(logo.url);
      }
    };

    window.addEventListener('storeDataUpdated', handleStoreDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('storeDataUpdated', handleStoreDataUpdate as EventListener);
    };
  }, [language]);

  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleLogoutClick = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleConfirmLogout = () => {
    setDialogOpen(false);
    localStorage.clear();
    navigate('/login');
  };

  const handleItemClick = (path: string) => {
    onItemClick(path);
    navigate(path);
    if (window.innerWidth < 1024) toggleSidebar();
  };

  const toggleRegion = (id: number) =>
    setExpandedRegion(prev => (prev === id ? null : id));



    return (
    <>
      <style>{scrollbarHideStyles}</style>
      <aside
        className={`
          h-screen w-80 max-w-xs p-4 bg-primary-light flex flex-col 
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
          overflow-y-auto sidebar-scrollbar-hide
          ${isRTL ? 'items-end' : 'items-start'}
        `}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
      {/* Logo & Store Name */}
      <div className={`mb-6 mt-2 w-full flex flex-col items-center justify-center`}>
        <div className="flex items-center gap-2">
          <img 
            src={storeLogo || logo} 
            alt="logo" 
            className="h-10 w-10 rounded-full object-cover border border-gray-200" 
          />
          <span className="text-2xl font-bold text-gray-900">{storeName}</span>
          <span className="text-xs text-gray-500 self-start mt-2">.com</span>
        </div>
      </div>
      {/* User Card */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4 w-full">
          <div className="flex-shrink-0">
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt="User Avatar" 
                className="h-12 w-12 rounded-full object-cover border border-gray-200" 
              />
            ) : (
              <FaUserCircle className="h-12 w-12 text-primary" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-primary text-base">{userDisplayName}</span>
            <span className="text-gray-400 text-sm">{userRole}</span>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 w-full">
        {menu.map((item, idx) => {
          const isActive = item.path === currentPath;
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedRegion === item.id;
          return (
            <div key={item.id} className="w-full">
              <button
                onClick={() => {
                  if (!isOpen) {
                    if (item.path) handleItemClick(item.path);
                    return;
                  }
                  if (hasChildren) {
                    toggleRegion(item.id);
                    if (item.path) handleItemClick(item.path);
                  } else {
                    if (item.path) handleItemClick(item.path);
                  }
                }}
                ref={el => (menuItemRefs.current[idx] = el)}
                className={`flex w-full items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200
                  ${isActive ? 'bg-primary text-white shadow-md' : 'text-black hover:bg-primary/10'}
                  font-medium text-base flex-row ${isRTL ? 'text-right' : 'text-left'}`}
                style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}
              >
                {Icon && <Icon className="h-6 w-6 mx-auto" />}
                {isOpen && (
                  <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t(item.title)}</span>
                )}
                {isOpen && (
                  hasChildren ? (
                    <ChevronRightIcon
                      className={`h-4 w-4 transition-transform
                        ${isExpanded
                          ? isRTL
                            ? 'rotate-90'
                            : 'rotate-90'
                          : isRTL
                            ? '-rotate-180'
                            : ''
                        }`
                      }
                    />
                  ) : (
                    <ChevronRightIcon className={`h-4 w-4 ${isActive ? 'text-white' : ''} ${isRTL ? 'rotate-180' : ''}`} />
                  )
                )}
              </button>
              {/* Submenu */}
              {isOpen && hasChildren && isExpanded && (
                <div className="ml-8 mt-1 flex flex-col gap-1">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = child.path === currentPath;
                    return (
                      <button
                        key={child.id}
                        onClick={() => child.path && handleItemClick(child.path)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 text-sm
                          ${isChildActive ? 'bg-primary text-white' : 'text-black hover:bg-primary/10'}
                          ${isRTL ? 'text-right' : 'text-left'}`}
                        style={{ justifyContent: isRTL ? 'flex-end' : 'flex-start' }}
                      >
                        {ChildIcon && <ChildIcon className="h-5 w-5" />}
                        <span className="flex-1">{t(child.title)}</span>
                        {isChildActive && <ChevronRightIcon className={`h-3 w-3 text-white ${isRTL ? 'rotate-180' : ''}`} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        onClick={handleLogoutClick}
        className={`w-full flex items-center mt-6 px-6 py-3 text-red-600 cursor-pointer hover:opacity-80 rounded-lg ${isRTL ? ' text-right' : ' text-left'}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className={`w-6 h-6 ${isRTL ? 'ml-2' : 'mr-2'}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
          />
        </svg>
        {isOpen && <span className="font-medium">{t('general.logout')}</span>}
      </div>

      {/* Confirm Logout Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{ sx: { borderRadius: 4, p: 2, direction: isRTL ? 'rtl' : 'ltr' } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem', textAlign: isRTL ? 'right' : 'left', fontFamily: 'Tajawal, sans-serif' }}>
          {t('general.confirmLogout')}
        </DialogTitle>
        <DialogContent>
          <p className={`text-body ${isRTL ? 'text-right' : 'text-left'}`} >{t('general.areYouSureLogout')}</p>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', gap: 2 }}>
            <button onClick={handleCloseDialog} className="px-4 py-2 border rounded-lg w-full">
            {t('general.cancel')}
          </button>
          <button
            onClick={handleConfirmLogout}
            className="px-4 py-2 bg-primary text-white rounded-lg w-full whitespace-nowrap"
          >
            {t('general.logout')}
          </button>
        </DialogActions>
      </Dialog>
    </aside>
    </>
  );
};

export default Sidebar;
