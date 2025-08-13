import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import AffiliationDrawer from './component/AffiliationDrawer';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import useAffiliations from '@/hooks/useAffiliations';
import AffiliatePaymentDrawer from './AffiliatePaymentDrawer';

//------------------------------------------- AffiliationPage -------------------------------------------
const AffiliationPage = () => {
  console.log('AffiliationPage component loaded');
  const { t, i18n } = useTranslation();
  const { affiliateCode } = useParams<{ affiliateCode?: string }>();
  console.log('Current affiliateCode:', affiliateCode);
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [affiliateToDelete, setAffiliateToDelete] = useState<any | null>(null);
  const { 
    affiliates, 
    loading, 
    error, 
    deleteAffiliate, 
    fetchAffiliates
  } = useAffiliations();

  // Handle affiliate code from URL if present
  React.useEffect(() => {
    console.log('AffiliationPage useEffect - affiliateCode:', affiliateCode);
    console.log('AffiliationPage useEffect - current URL:', window.location.pathname);
    
    if (affiliateCode) {
      console.log('Affiliate code from URL:', affiliateCode);
      // You can add logic here to handle the affiliate code
      // For example, filter the table to show only this affiliate
      // or open a specific modal/drawer
    } else {
      console.log('No affiliate code in URL');
    }
  }, [affiliateCode]);

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
          {`${row.firstName} ${row.lastName}`}
        </span>
      ),
    },
    { key: 'email', label: { en: t('affiliation.email'), ar: t('affiliation.email') } },
    { key: 'mobile', label: { en: t('affiliation.mobile'), ar: t('affiliation.mobile') } },
    { 
      key: 'percent', 
      label: { en: t('affiliation.percent'), ar: t('affiliation.percent') },
      render: (value: number) => `${value}%`
    },
    { 
      key: 'totalSales', 
      label: { en: t('affiliation.totalSales'), ar: t('affiliation.totalSales') },
      render: (value: number) => value ? `${value.toLocaleString()}` : '0'
    },
    { 
      key: 'balance', 
      label: { en: t('affiliation.balance'), ar: t('affiliation.balance') },
      render: (value: number) => value ? `${value.toLocaleString()}` : '0'
    },
    { 
      key: 'affiliateLink', 
      label: { en: t('affiliation.affiliateLink'), ar: t('affiliation.affiliateLink') }, 
      type: 'link',
      render: (value: string) => (
        value ? (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {t('affiliation.viewLink') || 'عرض الرابط'}
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      key: 'status',
      label: { en: t('affiliation.status'), ar: t('affiliation.status') },
      type: 'status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active' ? 'bg-green-100 text-green-800' :
          value === 'Inactive' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
  ];

//------------------------------------------- handleDrawerOpen -------------------------------------------
  const handleDrawerOpen = () => {
    setEditingAffiliate(null);
    setIsEdit(false);
    setDrawerOpen(true);
  };

//------------------------------------------- handleEdit -------------------------------------------
  const handleEdit = (item: any) => {
    setEditingAffiliate(item);
    setIsEdit(true);
    setDrawerOpen(true);
  };

//------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (item: any) => {
    setAffiliateToDelete(item);
    setShowDeleteModal(true);
  };

//------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = async () => {
    if (affiliateToDelete) {
      try {
        await deleteAffiliate(affiliateToDelete._id || affiliateToDelete.id);
        setAffiliateToDelete(null);
      } catch (error) {
        console.error('Error deleting affiliate:', error);
      }
    }
    setShowDeleteModal(false);
  };

//------------------------------------------- handleSaveSuccess -------------------------------------------  
  const handleSaveSuccess = async () => {
    // Refresh the affiliates data after successful save
    await fetchAffiliates();
    setDrawerOpen(false);
  };

//------------------------------------------- handlePaymentSuccess -------------------------------------------  
  const handlePaymentSuccess = async () => {
    // Refresh the affiliates data after successful payment
    await fetchAffiliates();
  };

  return (
    <div className="p-4 bg-white">
      {/* ------------------------------------------- CustomBreadcrumb ------------------------------------------- */}
      <CustomBreadcrumb
        items={[
          { name: t('affiliation.affiliates'), href: '#' },
        ]}
        isRtl={isRTL}
      />
      {/* ------------------------------------------- HeaderWithAction ------------------------------------------- */}
      <HeaderWithAction
        title={t('affiliation.affiliates')}
        addLabel={t('affiliation.add')}
        onAdd={handleDrawerOpen}
        isRtl={isRTL}
      />
      
      {/* ------------------------------------------- Loading and Error States ------------------------------------------- */}
      {loading && (
         <div className="sm:p-4 w-full">
         <div className="flex items-center justify-center h-64">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
         </div>
       </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>خطأ:</strong> {error}
        </div>
      )}
      
      {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      {!loading && !error && (
        <CustomTable
          columns={columns as any}
          data={affiliates}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {/* ------------------------------------------- AffiliationDrawer ------------------------------------------- */}
      <AffiliationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isRTL={isRTL}
        title={isEdit ? t('affiliation.edit') : t('affiliation.add')}
        initialData={editingAffiliate}
        onSaveSuccess={handleSaveSuccess}
        isEdit={isEdit}
        affiliates={affiliates}
      />
      {/* ------------------------------------------- AffiliatePaymentDrawer ------------------------------------------- */}
      <AffiliatePaymentDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        isRTL={isRTL}
        affiliate={selectedAffiliate}
        onPaymentSuccess={handlePaymentSuccess}
      />
      {/* ------------------------------------------- PermissionModal ------------------------------------------- */}
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('affiliation.deleteConfirmTitle') || 'Confirm Delete Affiliate'}
        message={t('affiliation.deleteConfirmMessage') || 'Are you sure you want to delete this affiliate?'}
        itemName={affiliateToDelete ? `${affiliateToDelete.firstName} ${affiliateToDelete.lastName}` : ''}
        itemType={t('affiliation.affiliate') || 'affiliate'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default AffiliationPage;
