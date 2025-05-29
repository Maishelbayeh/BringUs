// src/components/common/navigation/Sidebar.tsx
import React, { useRef, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { MenuItem } from '../../../Types';

interface SidebarProps {
  menu: MenuItem[];
  onItemClick: (path: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  isRTL: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  menu,
  onItemClick,
  isOpen,
  toggleSidebar,
  isRTL,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [expandedRegion, setExpandedRegion] = useState<number | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();

  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleLogoutClick = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);
  const handleConfirmLogout = () => {
    setDialogOpen(false);
    localStorage.clear();
    navigate('/');
  };

  const handleItemClick = (path: string) => {
    onItemClick(path);
    navigate(path);
    toggleSidebar();
  };

  const toggleRegion = (id: number) =>
    setExpandedRegion(prev => (prev === id ? null : id));

  const getButtonClass = (isActive: boolean) =>
    `flex items-center justify-between w-full text-left px-6 py-3 rounded-lg ${
      isActive ? 'bg-blue-500 text-white' : 'text-gray-800 hover:bg-gray-100'
    }`;

  return (
    <aside
      className={`
        h-screen w-80 p-2 bg-white transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-auto custom-scrollbar-hide
      `}
    >
      {/* Logo */}
      <div className="mb-4 text-center">
        <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Bring Us
        </span>
      </div>

      <nav className="space-y-4">
        {menu.map((item, idx) => {
          const hasChildren = item.children && item.children.length > 0;
          // if any child matches current path, mark parent active
          const isParentActive = false;
          // for top-level leaf
          const isTopActive = !hasChildren && item.path === currentPath;

          if (hasChildren) {
            const isExpanded = expandedRegion === item.id;
            const Icon = item.icon;
            return (
              <div key={item.id} className="space-y-1">
                {/* Parent header */}
                <button
                  onClick={() => toggleRegion(item.id)}
                  className={getButtonClass(isParentActive)}
                  ref={el => (menuItemRefs.current[idx] = el)}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5" />}
                    <span className="font-semibold">{t(item.title)}</span>
                  </div>
                  <ChevronRightIcon
                    className={`h-4 w-4 transform ${
                      isExpanded ? 'rotate-90' : 'rotate-0'
                    } text-gray-500`}
                  />
                </button>

                {/* Children */}
                {isExpanded &&
                  item.children!.map(child => {
                    const isActive = child.path === currentPath;
                    const IconChild = child.icon;
                    if (IconChild) {
                      return (
                        <button
                          key={child.id}
                          onClick={() => handleItemClick(child.path)}
                          className={`flex items-center w-full text-left px-10 py-2 rounded-lg ${
                            isActive
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <IconChild className="h-5 w-5 mr-2" />
                          <span>{t(child.title)}</span>
                        </button>
                      );
                    }
                    return null;
                  })}
              </div>
            );
          }

          // Top-level (no children)
          const IconTop = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.path)}
              ref={el => (menuItemRefs.current[idx] = el)}
              className={getButtonClass(isTopActive)}
            >
              <div className="flex items-center gap-3">
                {IconTop && <IconTop className="h-6 w-6" />}
                <span>{t(item.title)}</span>
              </div>
              {isTopActive && <ChevronRightIcon className="h-5 w-5 text-white" />}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        onClick={handleLogoutClick}
        className="flex items-center mt-6 px-6 py-3 text-red-600 cursor-pointer hover:opacity-80 rounded-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 mr-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
          />
        </svg>
        <span className="font-medium">{t('home.logout')}</span>
      </div>

      {/* Confirm Logout Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
          {t('general.confirmLogout')}
        </DialogTitle>
        <DialogContent>
          <p className="text-body">{t('general.areYouSureLogout')}</p>
        </DialogContent>
        <DialogActions>
          <button onClick={handleCloseDialog} className="px-4 py-2 border rounded-lg">
            {t('general.cancel')}
          </button>
          <button
            onClick={handleConfirmLogout}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            {t('home.logout')}
          </button>
        </DialogActions>
      </Dialog>
    </aside>
  );
};

export default Sidebar;
