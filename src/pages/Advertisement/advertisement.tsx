import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomNav from '../../components/common/CustomNav';
import CustomTable from '../../components/common/CustomTable';
import CustomButton from '../../components/common/CustomButton';
import AdvertisementForm from './AdvertisementForm';

const initialHtml = [
  { id: 1, html: '<h2 style="color:green">Welcome to Advertisement!</h2>', status: 'Active' },
];

const AdvertisementPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [data, setData] = useState(initialHtml);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formHtml, setFormHtml] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [search, setSearch] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const columns = [
    {
      key: 'html',
      label: { en: t('advertisement.preview'), ar: t('advertisement.preview') },
      render: (value: string) => (
        <div className="border rounded-lg p-2 bg-gray-50 min-h-[40px] max-w-xs overflow-x-auto" dangerouslySetInnerHTML={{ __html: value }} />
      ),
      align: 'center' as const,
    },
    {
      key: 'status',
      label: { en: t('advertisement.status', 'Status'), ar: t('advertisement.status', 'الحالة') },
      render: (value: string) => {
        const isActive = value === 'Active' || value === t('advertisement.active', 'Active');
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
            {isActive ? t('advertisement.active', 'Active') : t('advertisement.inactive', 'Inactive')}
          </span>
        );
      },
      align: 'center' as const,
    },
    
  ];

  const handleAdd = () => {
    setFormHtml('');
    setFormStatus('Active');
    setDrawerOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormHtml(item.html);
    setFormStatus(item.status);
    setEditIndex(data.findIndex((d) => d.id === item.id));
    setDrawerOpen(true);
  };

  const handleDelete = (item: any) => {
    setData(prev => prev.filter(d => d.id !== item.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formHtml.trim()) {
      if (editIndex !== null) {
        setData(prev => prev.map((d, idx) => idx === editIndex ? { ...d, html: formHtml, status: formStatus } : d));
        setEditIndex(null);
      } else {
        setData(prev => [
          ...prev,
          { id: prev.length + 1, html: formHtml, status: formStatus }
        ]);
      }
    }
    setDrawerOpen(false);
  };

  return (
    <div className="p-4" >
      <CustomNav
        isRTL={isRTL}
        onAdd={handleAdd}
        search={search}
        setSearch={setSearch}
        t={t}
        title={t('sideBar.advertisement')}
        showCategory={false}
        showSubcategory={false}
        addButtonText={t('common.add')}
        searchPlaceholder={t('advertisement.inputLabel')}
      />
      <CustomTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4">
              <span className="text-xl font-bold text-primary">{t('advertisement.add', 'Add HTML')}</span>
              <button onClick={() => setDrawerOpen(false)} className="text-primary hover:text-red-500 text-2xl">×</button>
            </div>
            {/* Form */}
            <AdvertisementForm
              formHtml={formHtml}
              setFormHtml={setFormHtml}
              formStatus={formStatus}
              setFormStatus={setFormStatus}
              isRTL={isRTL}
              t={t}
              handleSubmit={handleSubmit}
            />
            {/* Footer */}
            <div className="flex justify-between gap-2 px-6 py-4 border-t border-primary/20 bg-white rounded-b-2xl">
              <CustomButton text={t('common.cancel')} color="white" textColor="primary" bordercolor="primary" action={() => setDrawerOpen(false)} />
              <CustomButton text={editIndex !== null ? t('common.save') : t('common.add')} color="primary" textColor="white" type="submit" onClick={handleSubmit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementPage; 