import { useState } from 'react';

const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return { isSidebarOpen, toggleSidebar };
};

export default useSidebar; 