import React, { useState } from 'react';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import SallersDrawer from './componnent/sallersDrawer';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import { mockWholesalers } from '../../data/mockWholesalers';

//-------------------------------------------- initialForm -------------------------------------------
const initialForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  mobile: '',
  discount: '',
  status: 'Active',
  address: '',
};
//-------------------------------------------- WholesallersPage -------------------------------------------
const WholesallersPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState(mockWholesalers);
  const [form, setForm] = useState(initialForm);
  const [editIndex, setEditIndex] = useState<number | null>(null);
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
    setDrawerOpen(true);
  };
//-------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (item: any) => {
    setForm({
      ...item,
      status: item.status === 'Active' ? 'Active' : 'Inactive'
    });
    setEditIndex(data.findIndex((d) => d.id === item.id));
    setDrawerOpen(true);
  };
//-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (item: any) => {
    setData(prev => prev.filter(d => d.id !== item.id));
  };
//-------------------------------------------- handleSubmit -------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex !== null) {
      setData(prev => prev.map((d, idx) => idx === editIndex ? { ...form, id: d.id, discount: Number(form.discount), status: form.status === 'A' ? 'Active' : 'Inactive' } : d));
      setEditIndex(null);
    } else {
      setData(prev => [
        ...prev,
        {
          ...form,
          id: prev.length + 1,
          discount: Number(form.discount),
          status: form.status === 'A' ? 'Active' : 'Inactive',
        }
      ]);
    }
    setDrawerOpen(false);
  };
//-------------------------------------------- return -------------------------------------------
  return (
    <div className="p-4">
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
        count={data.length}
      />
      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <CustomTable
        columns={columns}
        data={data}
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
      />
    </div>
  );
};

export default WholesallersPage;
