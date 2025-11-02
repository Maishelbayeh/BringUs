import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import PermissionModal from '@/components/common/PermissionModal';
import { 
  Email,
  Phone,

} from '@mui/icons-material';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import { CustomTable } from '../../components/common/CustomTable';
import { useUser } from '../../hooks/useUser';
import { useToastContext } from '@/contexts/ToastContext';
import {  getStoreId } from '@/hooks/useLocalStorage';
import useLanguage from '@/hooks/useLanguage';
import UserForm from './UserForm';
import CustomButton from '@/components/common/CustomButton';

// interface User {
//   _id: string;
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   role: string;
//   status: string;
//   store?: string | { _id: string };
//   avatar: {
//     public_id: string | null;
//     url: string;
//   };
//   addresses: Array<{
//     type: string;
//     street: string;
//     city: string;
//     state: string;
//     zipCode: string;
//     country: string;
//     isDefault: boolean;
//   }>;
//   createdAt: string;
//   updatedAt: string;
// }

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const isRTL = language === 'ARABIC';
  
  const { getAllUsers, deleteUser} = useUser();
  const { showSuccess, showError } = useToastContext();
  
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [canSubmitForm, setCanSubmitForm] = useState(true); // Track if form can be submitted
  // const [deleteConfirmText, setDeleteConfirmText] = useState('');

 

  // جلب المستخدمين
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const storeId = getStoreId();
      if (!storeId) {
        showError(t('users.storeNotFound'), t('general.error'));
        return;
      }
      const allUsers = await getAllUsers();
      
      // فلترة المستخدمين حسب المتجر الحالي
      const storeUsers = allUsers.filter((user: any) => 
        user.store === storeId || (typeof user.store === 'object' && user.store._id === storeId && user.role === 'admin')
      );
      
      setUsers(storeUsers);
      setFilteredUsers(storeUsers);
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدمين:', error);
      showError(t('users.fetchError'), t('general.error'));
    } finally {
      console.log('🏁 إنهاء جلب المستخدمين، تعيين isLoading إلى false');
      setIsLoading(false);
    }
  }, [getAllUsers, showError, t]);

  useEffect(() => {
    console.log('🚀 useEffect triggered, calling fetchUsers...');
    fetchUsers();
  }, []);
//-------------------------------------------------------------------------------------------
  // تحديث البيانات بعد إضافة مستخدم جديد
  const handleUserCreated = useCallback(() => {
    console.log('🔄 تم إنشاء مستخدم جديد، إعادة جلب البيانات...');
    setShowNewUserModal(false);
    fetchUsers();
    showSuccess(t('users.userCreated'), t('general.success'));
  }, [fetchUsers, showSuccess, t]);

  // عرض الأفاتار
  // const renderAvatar = (value: any, item: any) => {
  //   if (item.avatar && item.avatar.url) {
  //     return (
  //       <div className="flex items-center justify-center">
  //         <img 
  //           src={item.avatar.url} 
  //           alt={`${item.firstName} ${item.lastName}`}
  //           className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
  //           onError={(e) => {
  //             e.currentTarget.src = '/user.jpg';
  //           }}
  //         />
  //       </div>
  //     );
  //   }
  //   return (
  //     <div className="flex items-center justify-center">
  //       <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
  //         <Person className="w-4 h-4 text-gray-600" />
  //       </div>
  //     </div>
  //   );
  // };

  // عرض الاسم الكامل
  const renderFullName = (_value: any, item: any) => {
    // Check if item exists first
    if (!item) {
      return <span className="text-gray-400">-</span>;
    }
    
    return (
      <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
        <span className="font-medium text-gray-900">
          {item.firstName} {item.lastName}
        </span>
       
      </div>
    );
  };

  // عرض الدور
  const renderRole = (value: any) => {
    const roleColors = {
      superadmin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800'
    };
    
    const roleLabels = {
      superadmin: t('users.roles.superadmin'),
      admin: t('users.roles.admin'),
      client: t('users.roles.client')
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[value as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
        {roleLabels[value as keyof typeof roleLabels] || value}
      </span>
    );
  };

  // عرض الحالة
  const renderStatus = (value: any) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
    
    };
    
    const statusLabels = {
      active: t('users.status.active'),
      inactive: t('users.status.inactive'),
    
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[value as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[value as keyof typeof statusLabels] || value}
      </span>
    );
  };

  // عرض العنوان
  const renderAddress = (_value: any, item: any) => {
    // Check if item exists first
    if (!item) {
      return <span className="text-gray-400">-</span>;
    }
    
    const defaultAddress = item.addresses?.find((addr: any) => addr.isDefault) || item.addresses?.[0];
    
    if (!defaultAddress) {
      return <span className="text-gray-400">-</span>;
    }

    return (
      <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
        <span className="text-sm text-gray-900">
          {defaultAddress.street}, {defaultAddress.city}
        </span>
        <span className="text-xs text-gray-500">
          {defaultAddress.state}, {defaultAddress.country}
        </span>
      </div>
    );
  };

  // عرض تاريخ الإنشاء
  const renderCreatedAt = (value: any) => {
    const date = new Date(value);
    return (
      <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
        <span className="text-sm text-gray-900">
          {date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
        </span>
        <span className="text-xs text-gray-500">
          {date.toLocaleTimeString(isRTL ? 'ar-EG' : 'en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    );
  };


  // معالجة التعديل
  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setCanSubmitForm(true); // In edit mode, always allow submit
    setShowNewUserModal(true);
  };

  // معالجة الحذف
  const handleDelete = (user: any) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // تأكيد الحذف
  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const userId = userToDelete._id || userToDelete.id?.toString();
      if (userId) {
        const success = await deleteUser(userId);
        if (success) {
          setShowDeleteModal(false);
          setUserToDelete(null);
          fetchUsers();
          showSuccess(t('users.deleteSuccess'), t('general.success'));
        }
      }
    }
   
  };

  // إضافة مستخدم جديد
  const handleAddUser = useCallback(() => {
    setSelectedUser(null); // مسح المستخدم المحدد
    setCanSubmitForm(false); // Reset to false for new user (will be enabled when email is available)
    setShowNewUserModal(true);
  }, []);

  // إغلاق modal إضافة المستخدم
  const handleCloseNewUserModal = useCallback(() => {
    setShowNewUserModal(false);
    setSelectedUser(null); // مسح المستخدم المحدد
    setCanSubmitForm(true); // Reset to default
  }, []);

  // تعريف أعمدة الجدول
  const columns: any[] = [
    // {
    //   key: 'avatar',
    //   label: t('users.columns.avatar'),
    //   render: renderAvatar,
    //   sortable: false,
    //   filterable: false,
    //   width: '60px'
    // },
    {
      key: 'fullName',
      label: t('users.columns.fullName'),
      render: renderFullName,
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      label: t('users.columns.email'),
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Email className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
      sortable: true,
      filterable: true
    },
    {
      key: 'phone',
      label: t('users.columns.phone'),
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      ),
      sortable: true,
      filterable: true
    },
    {
      key: 'role',
      label: t('users.columns.role'),
      render: renderRole,
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: t('users.columns.status'),
      render: renderStatus,
      sortable: true,
      filterable: true
    },
    {
      key: 'address',
      label: t('users.columns.address'),
      render: renderAddress,
      sortable: false,
      filterable: false
    },
    {
      key: 'createdAt',
      label: t('users.columns.createdAt'),
      render: renderCreatedAt,
      sortable: true,
      filterable: false
    }
  ];

  console.log('🔍 قيمة isLoading في UsersPage:', isLoading);

  return (
    <div className="min-h-screen  p-4">
      <div className="">
        {/* Breadcrumb */}
        <CustomBreadcrumb
          items={[
            { name: t('sideBar.dashboard'), href: '/' },
            { name: t('users.title'), href: '/users' }
          ]}
          isRtl={isRTL}
        />

        {/* Header */}
        <HeaderWithAction
          title={t('users.title')}
          addLabel={t('users.addUser')}
          onAdd={handleAddUser}
          isRtl={isRTL}
          count={users.length}
          loading={false}
        />

        {/* Table */}
        <div className="">
          <CustomTable
            columns={columns}
            data={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFilteredDataChange={setFilteredUsers}
          />
        </div>

        {/* User Form Modal */}
        {showNewUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-2 relative flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
                <span className="text-xl font-bold text-primary">
                  {selectedUser ? t('users.editUser') : t('users.addNewUser')}
                </span>
                <button
                  onClick={handleCloseNewUserModal}
                  className="text-primary hover:text-red-500 text-2xl"
                  type="button"
                >
                  ×
                </button>
              </div>
              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <UserForm 
                  user={selectedUser}
                  onSuccess={handleUserCreated}
                  onCancel={handleCloseNewUserModal}
                  formId="user-form"
                  onCanSubmitChange={setCanSubmitForm}
                />
              </div>
              {/* Footer */}
              <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
                <CustomButton
                  color="white"
                  textColor="primary"
                  text={t('users.cancel')}
                  action={handleCloseNewUserModal}
                  bordercolor="primary"
                />
                <button
                  type="submit"
                  form="user-form"
                  disabled={!canSubmitForm}
                  className={`px-5 py-2.5 rounded-lg transition-colors ${
                    canSubmitForm
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={!canSubmitForm ? (t('users.emailNotAvailable') || 'Email not available') : ''}
                >
                  {selectedUser ? t('general.update') : t('general.create')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('users.deleteConfirmTitle')}
        message={t('users.deleteConfirmMessage')}
        itemName={userToDelete ? (language === 'ARABIC' ? userToDelete.firstNameAr : userToDelete.firstNameEn) : ''}
        itemType={t('users.user')}
        requirePermission={true}
        confirmButtonText={t('paymentMethods.delete')}
        cancelButtonText={t('paymentMethods.cancel')}
        isRTL={language === 'ARABIC'}
        severity="danger"
      />
      </div>
    </div>
  );
};

export default UsersPage; 