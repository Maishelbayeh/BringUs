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
  const [activeMenu, setActiveMenu] = useState<'text' | 'model'>('text');

  const getMenuItems = (): MenuItem[] =>
    activeMenu === 'model' ? MenuModel.getInstance().getMenuItems() : getMenuAsText();

  const handleItemClick = (path: string) => {
    // No sidebar means full width content
    if (isSidebarOpen) toggleSidebar();
  };

  return (
    <BrowserRouter>
      <div className={
          `flex min-h-screen bg-main_bg_w    ${language === 'ARABIC' ? 'flex-row-reverse' : ''}`
        }>
          <div className='h-full'>
        {isSidebarOpen && (
          <Sidebar 
            menu={getMenuItems()}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            isRTL={language === 'ARABIC'}
            onItemClick={handleItemClick}
          />
        )}
</div>

        {/* Main area takes full width when sidebar closed */}
        <div className="flex-1 flex flex-col">
          <TopNavbar
            userName="Mai Shalabi"
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