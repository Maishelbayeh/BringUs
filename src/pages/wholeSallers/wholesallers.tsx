import React, { useState, useEffect } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import SallersDrawer from './componnent/sallersDrawer';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import { useWholesalers, Wholesaler } from '@/hooks/useWholesalers';

//-------------------------------------------- initialForm -------------------------------------------
const initialForm: Partial<Wholesaler> = {
  email: '',
  firstName: '',
  lastName: '',
  mobile: '',
  discount: 0,
  status: 'Active',
  address: '',
};

//-------------------------------------------- WholesallersPage -------------------------------------------
const WholesallersPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<Partial<Wholesaler>>(initialForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wholesalerToDelete, setWholesalerToDelete] = useState<Wholesaler | null>(null);

  // TODO: Replace with actual storeId and token from context/auth
  const storeId = '686a719956a82bfcc93a2e2d';
  const token = localStorage.getItem('token') || '';

  const {
    loading,
    error,
    wholesalers,
    getWholesalers,
    createWholesaler,
    updateWholesaler,
    deleteWholesaler,
  } = useWholesalers(storeId, token);

  useEffect(() => {
    getWholesalers();
    // eslint-disable-next-line
  }, []);

  //-------------------------------------------- columns -------------------------------------------
  const columns = [
    { key: 'email', label: { en: 'Email', ar: 'البريد الإلكتروني' } },
    { key: 'firstName', label: { en: 'First Name', ar: 'الاسم الأول' } },
    { key: 'lastName', label: { en: 'Family Name', ar: 'اسم العائلة' } },
    { key: 'mobile', label: { en: 'Mobile', ar: 'الجوال' } },
    { key: 'discount', label: { en: 'Wholesaler Discount %', ar: 'نسبة خصم التاجر %' } },
    {
      key: 'status',
      label: { en: 'Status', ar: 'الحالة' }
    },
    { key: 'address', label: { en: 'Address', ar: 'العنوان' } }
  ];

  //-------------------------------------------- handleFormChange -------------------------------------------
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  //-------------------------------------------- handleDrawerOpen -------------------------------------------
  const handleDrawerOpen = () => {
    setForm(initialForm);
    setEditId(null);
    setDrawerOpen(true);
  };

  //-------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (item: any) => {
    setForm({ ...item, status: item.status === 'Active' ? 'Active' : 'Inactive' });
    setEditId(item._id);
    setDrawerOpen(true);
  };

  //-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (item: any) => {
    setWholesalerToDelete(item);
    setShowDeleteModal(true);
  };

  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = async () => {
    if (wholesalerToDelete && wholesalerToDelete._id) {
      await deleteWholesaler(wholesalerToDelete._id);
      await getWholesalers();
      setWholesalerToDelete(null);
    }
    setShowDeleteModal(false);
  };

  //-------------------------------------------- handleSubmit -------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await updateWholesaler(editId, form);
    } else {
      await createWholesaler(form);
    }
    await getWholesalers();
    setDrawerOpen(false);
    setEditId(null);
  };

  //-------------------------------------------- return -------------------------------------------
  return (
    <div className="sm:p-4">
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.wholesalers') || 'Wholesalers', href: '/wholesalers' }
      ]} isRtl={isRTL} />
      {/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('wholesalers.title') || 'Wholesalers'}
        addLabel={t('common.add') || 'Add'}
        onAdd={handleDrawerOpen}
        isRtl={i18n.language === 'ARABIC'}
        count={wholesalers.length}
      />
      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <CustomTable
        columns={columns}
        data={wholesalers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {/* ------------------------------------------- SallersDrawer ------------------------------------------- */}
      <SallersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isRTL={isRTL}
        title={t('wholesalers.add')}
        form={form}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        isEdit={!!editId}
      />
      {/* ------------------------------------------- PermissionModal ------------------------------------------- */}
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('wholesalers.deleteConfirmTitle') || 'Confirm Delete Wholesaler'}
        message={t('wholesalers.deleteConfirmMessage') || 'Are you sure you want to delete this wholesaler?'}
        itemName={wholesalerToDelete ? `${wholesalerToDelete.firstName} ${wholesalerToDelete.lastName}` : ''}
        itemType={t('wholesalers.wholesaler') || 'wholesaler'}
        isRTL={isRTL}
        severity="danger"
      />
      {/* ------------------------------------------- Error/Loading ------------------------------------------- */}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default WholesallersPage;
