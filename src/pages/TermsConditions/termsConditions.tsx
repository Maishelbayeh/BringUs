import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import CustomButton from '../../components/common/CustomButton';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import { useTermsConditions } from '../../hooks/useTermsConditions';
import { getStoreId } from '@/utils/storeUtils';

const initialHtml = `<h2>Terms & Conditions</h2><ul><li>All users must be 18+ years old.</li><li>Respect privacy and data policies.</li></ul>`;

const TermsConditionsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  
  // Get store ID dynamically inside component
  const storeId = getStoreId();
  
  const {
    terms,
    loading,
    getTermsByStore,
    createTerms,
    updateTerms,
  } = useTermsConditions(storeId);

  const [html, setHtml] = useState(initialHtml);
  const [saving, setSaving] = useState(false);

  // Load active terms on component mount
  useEffect(() => {
    if (storeId && storeId.trim()) {
      loadActiveTerms();
    }
  }, [storeId]);

  const loadActiveTerms = async () => {
    if (!storeId || !storeId.trim()) {
      console.warn('Store ID is not available, skipping terms load');
      return;
    }
    
    try {
      const activeTerms = await getTermsByStore(false); // لا تظهر toast عند التحميل
      if (activeTerms) {
        setHtml(activeTerms.htmlContent);
      }
    } catch (error) {
      //CONSOLE.error('Failed to load terms:', error);
    }
  };

  const handleSave = async () => {
    if (!storeId || !storeId.trim()) {
      console.error('Store ID is not available, cannot save terms');
      return;
    }
    
    setSaving(true);
    try {
      // Check if we have existing terms to update
      if (terms) {
        // Update existing terms
        await updateTerms(terms._id, {
          title: 'Terms & Conditions',
          htmlContent: html,
        }, true); // تظهر toast للنجاح
      } else {
        // Create new terms
        await createTerms({
          title: 'Terms & Conditions',
          htmlContent: html,
          category: 'general',
        }, true); // تظهر toast للنجاح
      }
      
      // Reload terms after save (بدون toast)
      await getTermsByStore(false);
    } catch (error) {
      //CONSOLE.error('Save failed:', error);
      // Error message will be shown by the hook via toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sm:p-4" >
      {/* CustomNav as header */}
      {/* <CustomNav
        isRTL={isRTL}
        onAdd={() => {}}
        search={search}
        setSearch={setSearch}
        t={t}
        title={t('sideBar.termsConditions')}
        showAddButton={false}
        searchPlaceholder={t('termsConditions.search', 'Search Terms')}
      /> */}
      <HeaderWithAction
        title={t('sideBar.termsConditions')}
        // addLabel=""
        isRtl={isRTL}
        // showSearch={true}
        // searchValue={search}
        // onSearchChange={e => setSearch(e.target.value)}
        // searchPlaceholder={t('termsConditions.search', 'Search Terms')}
      />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Store ID not available */}
      {!storeId || !storeId.trim() ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">
              {t('common.storeNotAvailable', 'Store information is not available')}
            </div>
            <div className="text-gray-400 text-sm">
              {t('common.pleaseRefresh', 'Please refresh the page or try again later')}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Error messages are now handled by toast notifications */}

      {/* Card/Region */}
      <div className="bg-white rounded-lg  border-2 border-gray-200 mb-6 flex-1 flex flex-col">
        {/* Editor */}
        <div className={`flex-1 p-6 ${isRTL ? 'text-right' : 'text-left'}`}>
          <label className="block mb-2 font-semibold text-gray-700">{t('termsConditions.edit', 'Edit Terms & Conditions')}</label>
          <ReactQuill
            theme="snow"
            value={html}
            onChange={setHtml}
            className={`bg-white ${isRTL ? 'quill-rtl' : ''}`}
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
            text={saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            color="primary"
            textColor="white"
            action={handleSave}
            className="t-Button t-Button--hot"
            disabled={saving}
            icon={saving ? <span className="fa fa-spinner fa-spin" /> : <span className="fa fa-save" />}
          />
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default TermsConditionsPage; 