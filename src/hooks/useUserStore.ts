import { useState, useEffect } from 'react';

interface UserStoreData {
  storeId: string;
  userId: string;
  storeName: string;
  userName: string;
    email:string;
    phone:string;
}

export const useUserStore = (): UserStoreData => {
  const [userStoreData, setUserStoreData] = useState<UserStoreData>({
    storeId: '',
    userId: '',
    storeName: '',
    userName: '',
    email:'',
    phone:''
  });

  useEffect(() => {
    // جلب بيانات المستخدم من localStorage أو API
    const getStoreData = () => {
      try {
        // يمكن تحديث هذا لاحقاً لجلب البيانات من API
        const storeId = localStorage.getItem('storeId') || 'default-store-id';
        const userId = localStorage.getItem('userId') || 'default-user-id';
        const storeName = localStorage.getItem('userName') || 'Default Store';
        const userName = localStorage.getItem('userLastName') || 'Default User';
        const email=localStorage.getItem('email')||'';
        const phone=localStorage.getItem('phone')||'';
        setUserStoreData({
          storeId,
          userId,
          storeName,
          userName,
          email,
          phone
        });
      } catch (error) {
        console.error('Error loading user store data:', error);
      }
    };

    getStoreData();
  }, []);

  return userStoreData;
};
