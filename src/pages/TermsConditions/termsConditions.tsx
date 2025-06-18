import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomNav from '../../components/common/CustomNav';
import CustomButton from '../../components/common/CustomButton';

const initialHtml = `<h2>Terms & Conditions</h2><ul><li>All users must be 18+ years old.</li><li>Respect privacy and data policies.</li></ul>`;

const TermsConditionsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [html, setHtml] = useState(initialHtml);
  const [search, setSearch] = useState('');

  // Handlers for buttons
  const handleCancel = () => setHtml(initialHtml);
  const handleSave = () => alert(t('termsConditions.saved', 'Changes saved!'));

  return (
    <div className=" p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* CustomNav as header */}
      <CustomNav
        isRTL={isRTL}
        onAdd={() => {}}
        search={search}
        setSearch={setSearch}
        t={t}
        title={t('sideBar.termsConditions')}
        showAddButton={false}
        searchPlaceholder={t('termsConditions.search', 'Search Terms')}
      />

      {/* Card/Region */}
      <div className="bg-white rounded-lg  border-2 border-gray-200 mb-6 flex-1 flex flex-col">
        {/* Editor */}
        <div className="flex-1 p-6">
          <label className="block mb-2 font-semibold text-gray-700">{t('termsConditions.edit', 'Edit Terms & Conditions')}</label>
          <ReactQuill
            theme="snow"
            value={html}
            onChange={setHtml}
            className="bg-white"
            style={{ minHeight: 180 }}
          />
          {/* HTML Preview */}
          <div className="mt-6">
            <div className="mb-2 font-semibold text-gray-700">{t('termsConditions.htmlPreview', 'HTML Preview')}</div>
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[60px]" style={{ fontFamily: 'monospace', fontSize: 14, whiteSpace: 'pre-wrap' }}>
              {html}
            </div>
          </div>
        </div>
        {/* Sticky Footer Buttons */}
        <div className={`flex justify-between items-center px-6 py-4 border-t-2 border-gray-200 bg-white sticky bottom-0 z-10 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
        
          <CustomButton
            text={t('common.save', 'Save')}
            color="primary"
            textColor="white"
            action={handleSave}
            className="t-Button t-Button--hot"
            icon={<span className="fa fa-save" />}
          />
        </div>
      </div>
    </div>
  );
};

export default TermsConditionsPage; 