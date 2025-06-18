import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomNav from '../../components/common/CustomNav';
import CustomTable from '../../components/common/CustomTable';
import CustomButton from '../../components/common/CustomButton';
import CustomRadioGroup from '../../components/common/CustomRadioGroup';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formHtml.trim()) {
      setData(prev => [
        ...prev,
        { id: prev.length + 1, html: formHtml, status: formStatus }
      ]);
    }
    setDrawerOpen(false);
  };

  return (
    <div className="p-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
      <CustomTable columns={columns} data={data} />
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full max-w-2xl bg-white shadow-2xl p-6 flex flex-col transition-transform duration-300`}
            style={{ [isRTL ? 'left' : 'right']: 0 }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-primary">{t('advertisement.add', 'Add HTML')}</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <label className="block mb-2 font-semibold text-gray-700">{t('advertisement.inputLabel')}</label>
              <textarea
                className="w-full min-h-[120px] border border-gray-300 rounded-lg p-2 mb-4 focus:ring-primary focus:border-primary"
                value={formHtml}
                onChange={e => setFormHtml(e.target.value)}
                placeholder="<h1>My Ad</h1>"
                required
              />
              <CustomRadioGroup
                label={t('advertisement.status', 'Status')}
                name="status"
                value={formStatus}
                onChange={e => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                options={[
                  { value: 'Active', label: t('advertisement.active', 'Active') },
                  { value: 'Inactive', label: t('advertisement.inactive', 'Inactive') },
                ]}
                labelAlign={isRTL ? 'right' : 'left'}
                isRTL={isRTL}
              />
            </form>
            <div className="sticky bottom-0 left-0 right-0 bg-white py-4 flex justify-end gap-2 border-t mt-4">
              <CustomButton text={t('common.cancel')} color="secondary" onClick={() => setDrawerOpen(false)} />
              <CustomButton text={t('common.add')} color="primary" textColor="white" type="submit" onClick={handleSubmit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementPage; 