import React, { useState } from 'react';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import AffiliationDrawer from './component/AffiliationDrawer';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import { mockAffiliates } from '../../data/mockAffiliates';
import AffiliatePaymentDrawer from './AffiliatePaymentDrawer';
//------------------------------------------- initialForm -------------------------------------------
const initialForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  mobile: '',
  percent: '',
  status: 'Active',
  link: '', 
  address: '',
};
//------------------------------------------- AffiliationPage -------------------------------------------
const AffiliationPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState(mockAffiliates);
  const [form, setForm] = useState(initialForm);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
//------------------------------------------- columns -------------------------------------------
  const columns = [
    {
      key: 'firstName',
      label: { en: t('affiliation.firstName'), ar: t('affiliation.firstName') },
      render: (value: string, row: any) => (
        <span
          className="text-primary font-bold cursor-pointer hover:underline"
          onClick={() => { setSelectedAffiliate(row); setPaymentDrawerOpen(true); }}
        >
          {value}
        </span>
      ),
    },
    { key: 'lastName', label: { en: t('affiliation.lastName'), ar: t('affiliation.lastName') } },
    { key: 'email', label: { en: t('affiliation.email'), ar: t('affiliation.email') } },
    { key: 'mobile', label: { en: t('affiliation.mobile'), ar: t('affiliation.mobile') } },
    { key: 'percent', label: { en: t('affiliation.percent'), ar: t('affiliation.percent') } },
    { key: 'link', label: { en: t('affiliation.link'), ar: t('affiliation.link') }, type: 'link' },
    {key: 'status',label: { en: t('affiliation.status'), ar: t('affiliation.status') },type: 'status',},
    { key: 'address', label: { en: t('affiliation.address'), ar: t('affiliation.address') } },
   
  ];
//------------------------------------------- handleFormChange -------------------------------------------
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
//------------------------------------------- handleDrawerOpen -------------------------------------------
  const handleDrawerOpen = () => {
    setForm(initialForm);
    setDrawerOpen(true);
  };
//------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (item: any) => {
    setForm(item);
   console.log(item);
    setDrawerOpen(true);
  };
//------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (item: any) => {
    console.log(item);
  };
//------------------------------------------- handleSubmit -------------------------------------------  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
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
//------------------------------------------- return -------------------------------------------
  return (
    <div className="p-4" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('affiliation.title') || 'Affiliation', href: '/affiliation' }
      ]} isRtl={isRTL} />
      {/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('affiliation.title') || 'Affiliation'}
        addLabel={t('common.add') || 'Add'}
        onAdd={handleDrawerOpen}
        isRtl={i18n.language === 'ARABIC'}
        count={data.length}
      />
      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <CustomTable
        columns={columns as any}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {/* ------------------------------------------- AffiliationDrawer ------------------------------------------- */}
      <AffiliationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isRTL={isRTL}
        title={t('affiliation.add')}
        form={form}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
      />
      {/* ------------------------------------------- AffiliatePaymentDrawer ------------------------------------------- */}
      <AffiliatePaymentDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        isRTL={isRTL}
        affiliate={selectedAffiliate}
      />
    </div>
  );
};

export default AffiliationPage;
