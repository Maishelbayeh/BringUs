export const updateStoreData = (storeData: any) => {
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
      }
    }
    
    // Dispatch custom event for store context update
    window.dispatchEvent(new CustomEvent('storeDataUpdated', { 
      detail: { storeData } 
    }));
  }
};

export const updateStoreId = (storeId: string) => {
  localStorage.setItem('storeId', storeId);
  
  // Dispatch custom event for store context update
  window.dispatchEvent(new CustomEvent('storeDataUpdated', { 
    detail: { storeId } 
  }));
};

export const getStoreId = () => {
  return localStorage.getItem('storeId');
};

export const getStoreData = () => {
  const storeInfo = localStorage.getItem('storeInfo');
  const logo = localStorage.getItem('storeLogo');
  return {
    info: storeInfo ? JSON.parse(storeInfo) : null,
    logo: logo,
  };
};

export const getStoreName = (language: string) => {
  const storeInfo = localStorage.getItem('storeInfo');
  if (storeInfo) {
    const store = JSON.parse(storeInfo);
    return language === 'ARABIC' ? store.nameAr : store.nameEn;
  }
  return null;
};

export const getStoreLogo = () => {
  return localStorage.getItem('storeLogo');
};

export const getUserAvatar = () => {
  return localStorage.getItem('userAvatar');
};

export const updateUserData = (userData: any) => {
  if (userData) {
    localStorage.setItem('userInfo', JSON.stringify({
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role,
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
        status: userData.store.status,
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
        }
      }
    }
  }
};

export const getUserData = () => {
  const userInfo = localStorage.getItem('userInfo');
  const userAvatar = localStorage.getItem('userAvatar');
  const isOwner = localStorage.getItem('isOwner');
  return {
    info: userInfo ? JSON.parse(userInfo) : null,
    avatar: userAvatar,
    isOwner: isOwner,
  };
}; 