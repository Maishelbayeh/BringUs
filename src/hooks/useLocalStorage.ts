import { useCallback } from 'react';
export const useLocalStorage = () => {
  
 
  const updateStoreData = useCallback((storeData: any) => {
    if (storeData) {
      localStorage.setItem('storeInfo', JSON.stringify({
        id: storeData.id || storeData._id,
        nameAr: storeData.nameAr,
        nameEn: storeData.nameEn,
        slug: storeData.slug,
        status: storeData.status,
      
      }));

      if (storeData.logo) {
        let logoUrl = null;
        if (Array.isArray(storeData.logo) && storeData.logo.length > 0) {
          logoUrl = storeData.logo[0].url;
       
        } else if (storeData.logo && typeof storeData.logo === 'object' && 'url' in storeData.logo) {
          logoUrl = storeData.logo.url;
         
        }
        if (logoUrl) {
          localStorage.setItem('storeLogo', logoUrl);
            
        } else {
         
        }
      } else {
       
      }
    }
  }, []);
// -----------------------------------------------updateStoreId---------------------------------------------------------
  const updateStoreId = useCallback((storeId: string) => {
    localStorage.setItem('storeId', storeId);
  }, []);

// -----------------------------------------------getStoreData---------------------------------------------------------
  const getStoreData = useCallback(() => {
    const storeInfo = localStorage.getItem('storeInfo');
    const logo = localStorage.getItem('storeLogo');

    return {
      info: storeInfo ? JSON.parse(storeInfo) : null,
      logo: logo
    };
  }, []);

// -----------------------------------------------getStoreName---------------------------------------------------------
  const getStoreName = useCallback((language: string) => {
    const storeInfo = localStorage.getItem('storeInfo');
    if (storeInfo) {
      const store = JSON.parse(storeInfo);
      return language === 'ARABIC' ? store.nameAr : store.nameEn;
    }
    return null;
  }, []);

// -----------------------------------------------getStoreLogo---------------------------------------------------------
  const getStoreLogo = useCallback(() => {
    return localStorage.getItem('storeLogo');
  }, []);

// -----------------------------------------------getUserAvatar---------------------------------------------------------
  const getUserAvatar = useCallback(() => {
    return localStorage.getItem('userAvatar');
  }, []);

// -----------------------------------------------updateUserData---------------------------------------------------------
  const updateUserData = useCallback((userData: any) => {
    if (userData) {
      localStorage.setItem('userInfo', JSON.stringify({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role
      }));

     
      if (userData.avatar?.url) {
        localStorage.setItem('userAvatar', userData.avatar.url);
      
      }
      
     
      if (userData.store) {
      
        localStorage.setItem('storeInfo', JSON.stringify({
          id: userData.store.id,
          nameAr: userData.store.nameAr,
          nameEn: userData.store.nameEn,
          slug: userData.store.slug,
          status: userData.store.status
        }));
        
       
        if (userData.store.logo) {
        
          let logoUrl = null;
          if (Array.isArray(userData.store.logo) && userData.store.logo.length > 0) {
            logoUrl = userData.store.logo[0].url;
          
          } else if (userData.store.logo && typeof userData.store.logo === 'object' && 'url' in userData.store.logo) {
            logoUrl = userData.store.logo.url;
           
          }
          if (logoUrl) {
            localStorage.setItem('storeLogo', logoUrl);
            
          } else {
           
          }
        } else {
          
        }
      }
    }
  }, []);

// -----------------------------------------------getUserData---------------------------------------------------------
  const getUserData = useCallback(() => {
    const userInfo = localStorage.getItem('userInfo');
    const userAvatar = localStorage.getItem('userAvatar');
    
    return {
      info: userInfo ? JSON.parse(userInfo) : null,
      avatar: userAvatar
    };
  }, []);



  return {
    // Store Data Management
    updateStoreData,
    getStoreData,
    getStoreName,
    getStoreLogo,
    updateStoreId,
    // User Data Management
    updateUserData,
    getUserData,
    getUserAvatar,
  };
}; 