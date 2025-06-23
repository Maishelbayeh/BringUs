import  { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Routers from './routers';
import useLanguage from './hooks/useLanguage';
import useSidebar from './hooks/useSidebar';
import { getMenuAsText, MenuModel } from './constants/sideBarData';
import { MenuItem } from './Types';
import Sidebar from './components/common/navigation/sidebar';
import TopNavbar from './components/common/navigation/topNav';
function App() {
  const { language, toggleLanguage } = useLanguage();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [activeMenu, ] = useState<'text' | 'model'>('text');

  const getMenuItems = (): MenuItem[] =>
    activeMenu === 'model' ? MenuModel.getInstance().getMenuItems() : getMenuAsText();

  const handleItemClick = () => {
    // No sidebar means full width content
    if (isSidebarOpen) toggleSidebar();
  };

  return (
    <BrowserRouter>
      <div className={
          `flex min-h-screen w-full bg-main_bg_w overflow-x-hidden ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`
        }>
        {/* Sidebar for all screens, but with different style for mobile */}
        {isSidebarOpen && (
          <>
            {/* Overlay for mobile only */}
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
              onClick={toggleSidebar}
            />
            <div
              className={
                `z-50 transition-all duration-300
                fixed top-0 ${language === 'ARABIC' ? 'right-0' : 'left-0'} h-full  max-w-xs md:static md:block md:w-80 md:max-w-xs
                ${language === 'ARABIC' ? 'md:right-0' : 'md:left-0'}
                bg-primary-light shadow-xl md:shadow-none
                md:relative md:z-auto`
              }
              style={{ minHeight: '100vh' }}
            >
              <Sidebar 
                menu={getMenuItems()}
                userName="Mai Shalabi"
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                isRTL={language === 'ARABIC'}
                onItemClick={handleItemClick}
              />
            </div>
          </>
        )}
        <div className="flex-1 min-w-0 flex flex-col">
          <TopNavbar
            // userName="Mai Shalabi"
            userPosition="Last sign in on {date}"
            language={language}
            onLanguageToggle={toggleLanguage}
            onMenuToggle={toggleSidebar}
          />

          <main className="flex-1 overflow-auto p-4">
            <Routers />
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;