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

  // Function to safely render HTML
  const renderHtml = (html: string) => {
    try {
      return { __html: html };
    } catch (error) {
      console.error('Error rendering HTML:', error);
      return { __html: '<p style="color: red;">Error rendering HTML</p>' };
    }
  };

  const columns = [
    {
      key: 'html',
      label: { en: t('advertisement.preview'), ar: t('advertisement.preview') },
      render: (value: string) => (
        <div className="border rounded-lg p-4 bg-white min-h-[60px] max-w-md overflow-x-auto shadow-sm">
          <div 
            className="max-w-none"
            style={{ 
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#333',
              wordBreak: 'break-word'
            }}
            dangerouslySetInnerHTML={renderHtml(value)} 
          />
        </div>
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700">{t('advertisement.inputLabel')}</label>
                <textarea
                  className="w-full min-h-[120px] border border-gray-300 rounded-lg p-2 focus:ring-primary focus:border-primary font-mono text-sm"
                  value={formHtml}
                  onChange={e => setFormHtml(e.target.value)}
                  placeholder="<h1>My Ad</h1>"
                  required
                />
              </div>
              
              {/* HTML Preview */}
              <div className="mb-4">
                <label className="block mb-2 font-semibold text-gray-700">{t('advertisement.preview', 'Preview')}</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[100px]">
                  {formHtml ? (
                    <div 
                      className="max-w-none"
                      style={{ 
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#333',
                        wordBreak: 'break-word'
                      }}
                      dangerouslySetInnerHTML={renderHtml(formHtml)} 
                    />
                  ) : (
                    <p className="text-gray-400 italic">{t('advertisement.noPreview', 'No preview available')}</p>
                  )}
                </div>
              </div>

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