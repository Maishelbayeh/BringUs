import React, { useState } from 'react';
import CustomNav from '../../components/common/CustomNav';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import AffiliationDrawer from './component/AffiliationDrawer';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';

const mockAffiliates = [
  {
    id: 1,
    email: 'affiliate1@email.com',
    password: '******',
    firstName: 'Omar',
    lastName: 'Khaled',
    mobile: '0598888888',
    percent: 8,
    status: 'Active',
    address: 'Hebron, Palestine',
  },
  {
    id: 2,
    email: 'affiliate2@email.com',
    password: '******',
    firstName: 'Lina',
    lastName: 'Samir',
    mobile: '0567777777',
    percent: 12,
    status: 'Inactive',
    address: 'Jenin, Palestine',
  },
];

const initialForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  mobile: '',
  percent: '',
  status: 'Active',
  address: '',
};

const AffiliationPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState(mockAffiliates);
  const [form, setForm] = useState(initialForm);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const columns = [
    { key: 'email', label: { en: t('affiliation.email'), ar: t('affiliation.email') } },
    { key: 'firstName', label: { en: t('affiliation.firstName'), ar: t('affiliation.firstName') } },
    { key: 'lastName', label: { en: t('affiliation.lastName'), ar: t('affiliation.lastName') } },
    { key: 'mobile', label: { en: t('affiliation.mobile'), ar: t('affiliation.mobile') } },
    { key: 'percent', label: { en: t('affiliation.percent'), ar: t('affiliation.percent') } },
    {
      key: 'status',
      label: { en: t('affiliation.status'), ar: t('affiliation.status') },
      render: (value: string) => {
        const isActive = value === 'Active' || value === t('affiliation.active');
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {value === 'Active' ? t('affiliation.active') : value === 'Inactive' ? t('affiliation.inactive') : value}
          </span>
        );
      }
    },
    { key: 'address', label: { en: t('affiliation.address'), ar: t('affiliation.address') } },
   
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
    setForm(item);
    setEditIndex(data.findIndex((d) => d.id === item.id));
    setDrawerOpen(true);
  };

  const handleDelete = (item: any) => {
    setData(prev => prev.filter(d => d.id !== item.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex !== null) {
      setData(prev => prev.map((d, idx) => idx === editIndex ? { ...form, id: d.id, percent: Number(form.percent), status: form.status === 'Active' || form.status === t('affiliation.active') ? 'Active' : 'Inactive' } : d));
      setEditIndex(null);
    } else {
      setData(prev => [
        ...prev,
        {
          ...form,
          id: prev.length + 1,
          percent: Number(form.percent),
          status: form.status === 'Active' || form.status === t('affiliation.active') ? 'Active' : 'Inactive',
        }
      ]);
    }
    setDrawerOpen(false);
  };

  return (
    <div className="p-4" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('affiliation.title') || 'Affiliation', href: '/affiliation' }
      ]} isRtl={isRTL} />
      <HeaderWithAction
        title={t('affiliation.title') || 'Affiliation'}
        addLabel={t('common.add') || 'Add'}
        onAdd={handleDrawerOpen}
        isRtl={i18n.language === 'ARABIC'}
      />
      <CustomTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <AffiliationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isRTL={isRTL}
        title={t('affiliation.add')}
        form={form}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AffiliationPage;
