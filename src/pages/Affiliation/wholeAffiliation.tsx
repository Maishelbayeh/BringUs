import React, { useState } from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import AffiliationDrawer from './component/AffiliationDrawer';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import PermissionModal from '../../components/common/PermissionModal';
import { mockAffiliates } from '../../data/mockAffiliates';
import AffiliatePaymentDrawer from './AffiliatePaymentDrawer';

//------------------------------------------- AffiliationPage -------------------------------------------
const AffiliationPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState(mockAffiliates);
  const [editingAffiliate, setEditingAffiliate] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [affiliateToDelete, setAffiliateToDelete] = useState<any | null>(null);

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
  const handleDeleteConfirm = () => {
    if (affiliateToDelete) {
      setData(prev => prev.filter(d => d.id !== affiliateToDelete.id));
      setAffiliateToDelete(null);
    }
    setShowDeleteModal(false);
  };

//------------------------------------------- handleSaveSuccess -------------------------------------------  
  const handleSaveSuccess = () => {
    // This function will be called from AffiliationDrawer after successful validation
    // Here you would normally make an API call to save the data
    // For now, we'll just close the drawer
    setDrawerOpen(false);
    // You can add your save logic here
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
        title={isEdit ? t('affiliation.edit') : t('affiliation.add')}
        initialData={editingAffiliate}
        onSaveSuccess={handleSaveSuccess}
        isEdit={isEdit}
        affiliates={data}
      />
      {/* ------------------------------------------- AffiliatePaymentDrawer ------------------------------------------- */}
      <AffiliatePaymentDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        isRTL={isRTL}
        affiliate={selectedAffiliate}
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
