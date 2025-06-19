import React, { useState } from 'react';
import CustomNav from '../../components/common/CustomNav';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import SallersDrawer from './componnent/sallersDrawer';

// Mock data for wholesalers
const mockWholesalers = [
  {
    id: 1,
    email: 'wholesale1@email.com',
    password: '******',
    firstName: 'Ahmad',
    lastName: 'Saleh',
    mobile: '0599999999',
    discount: 10,
    status: 'Active',
    address: 'Ramallah, Palestine',
  },
  {
    id: 2,
    email: 'wholesale2@email.com',
    password: '******',
    firstName: 'Sara',
    lastName: 'Ali',
    mobile: '0566666666',
    discount: 15,
    status: 'Inactive',
    address: 'Nablus, Palestine',
  },
];

const initialForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  mobile: '',
  discount: '',
  status: 'A',
  address: '',
};

const WholesallersPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState(mockWholesalers);
  const [form, setForm] = useState(initialForm);
  const [editIndex, setEditIndex] = useState<number | null>(null);

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDrawerOpen = () => {
    setForm(initialForm);
    setDrawerOpen(true);
  };

  const handleEdit = (item: any) => {
    setForm({
      ...item,
      status: item.status === 'Active' ? 'A' : item.status === 'Inactive' ? 'I' : item.status
    });
    setEditIndex(data.findIndex((d) => d.id === item.id));
    setDrawerOpen(true);
  };

  const handleDelete = (item: any) => {
    setData(prev => prev.filter(d => d.id !== item.id));
  };

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

  return (
    <div className="p-4">
      <CustomNav
        isRTL={isRTL}
        onAdd={handleDrawerOpen}
        search={search}
        setSearch={setSearch}
        t={t}
        title={t('wholesalers.title')}
        showCategory={false}
        showSubcategory={false}
        addButtonText={t('wholesalers.add')}
        searchPlaceholder={t('common.search')}
      />
      <CustomTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
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
