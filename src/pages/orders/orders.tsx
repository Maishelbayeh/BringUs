import React, { useState } from 'react';
import { ordersData as ordersDataRaw, customersData, deliveryAreas, affiliates, currencies } from '../../api/mockCustomers';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import PermissionModal from '../../components/common/PermissionModal';
//-------------------------------------------- Column -------------------------------------------
type Column = {
  key: string;
  label: { ar: string; en: string };
  type?: 'number' | 'text' | 'date';
  align?: 'left' | 'center' | 'right';
};
//-------------------------------------------- OrdersPage -------------------------------------------
const OrdersPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
//-------------------------------------------- tableData -------------------------------------------
  const tableData = ordersDataRaw.map(order => {
    const customer = customersData.find(c => c.id === order.customerId);
    const area = deliveryAreas.find(a => a.id === order.deliveryAreaId);
    const affiliate = affiliates.find(a => a.id === order.affiliateId);
    const currency = currencies.find(cur => cur.id === order.currencyId);
    return {
      id: order.id,
      customer: customer && i18n.language === 'ARABIC' ? customer.nameAr : customer && i18n.language === 'ENGLISH' ? customer.nameEn : '-',
      phone: customer ? customer.phone : '-',
      deliveryArea: area && i18n.language === 'ARABIC' ? area.labelAr : area && i18n.language === 'ENGLISH' ? area.labelEn : '-',
      affiliate: affiliate && i18n.language === 'ARABIC' ? affiliate.nameAr : affiliate && i18n.language === 'ENGLISH' ? affiliate.nameEn : '-',
      currency: currency && i18n.language === 'ARABIC' ? currency.labelAr : currency && i18n.language === 'ENGLISH' ? currency.labelEn : '-',
      price: order.price,
      date: order.date,
      status: order.paid ? t('orders.paid') : t('orders.unpaid'),
    };
  });
//-------------------------------------------- columns -------------------------------------------
  const columns: Column[] = [
    { key: 'id', label: { ar: 'رقم الطلب', en: 'Order Number' }, type: 'number'},
    { key: 'customer', label: { ar: 'العميل', en: 'Customer' }, type: 'text'},
    { key: 'phone', label: { ar: 'رقم الهاتف', en: 'Phone' }, type: 'text'},
    { key: 'deliveryArea', label: { ar: 'منطقة التوصيل', en: 'Delivery Area' }, type: 'text'},
    { key: 'affiliate', label: { ar: 'المسوق', en: 'Affiliate' }, type: 'text'},
    { key: 'currency', label: { ar: 'العملة', en: 'Currency' }, type: 'text'},
    { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number'},
    { key: 'date', label: { ar: 'تاريخ الطلب', en: 'Order Date' }, type: 'date'},
    { key: 'status', label: { ar: 'الحالة', en: 'Status' }, type: 'text'},
  ];
//-------------------------------------------- visibleTableData -------------------------------------------     
  const [visibleTableData, setVisibleTableData] = useState<any[]>([]);
  
  //-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (order: any) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };
  
  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      // في التطبيق الحقيقي، هنا سيتم إرسال طلب حذف للخادم
      console.log('Deleting order:', orderToDelete);
      setOrderToDelete(null);
    }
    setShowDeleteModal(false);
  };
//-------------------------------------------- return -------------------------------------------
  return (
    <div className="sm:p-4 w-full">
     <HeaderWithAction
      title={t('orders.title')}
      count={tableData.length}
      isRtl={i18n.language === 'ARABIC'}
     />
     {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <div className="overflow-x-auto ">
        <CustomTable 
          columns={columns} 
          data={tableData} 
          onFilteredDataChange={setVisibleTableData}
          onDelete={handleDelete}
          linkConfig={[{
            column: 'id',
            getPath: (row) => `/orders/${row.id}`
          }]}
        />
      </div>
      {/* ------------------------------------------- Total Price ------------------------------------------- */}
      {(() => {
        const totals: { [currency: string]: number } = {};
        visibleTableData.forEach((row) => {
          const currency = currencies.find(cur =>
            (i18n.language === 'ARABIC' && cur.labelAr === row.currency) ||
            (i18n.language === 'ENGLISH' && cur.labelEn === row.currency)
          );
          if (!currency) return;
          const label = i18n.language === 'ARABIC' ? currency.labelAr : currency.labelEn;
          if (!totals[label]) totals[label] = 0;
          totals[label] += row.price;
        });
        const totalEntries: [string, number][] = Object.entries(totals);
        if (totalEntries.length === 0) return null;
        return (
          <div className="sm:flex-row flex-col flex flex-wrap gap-0 mt-4 py-2 font-bold text-primary text-sm justify-center items-center bg-primary/10 rounded">
            {totalEntries.map(([currencyLabel, total], idx) => (
              <React.Fragment key={currencyLabel}>
                <div dir={i18n.language === 'ARABIC' ? 'rtl' : 'ltr'} className={`flex items-center gap-1 px-3 py-3`}>
                  <span>{t('orders.total')}({currencyLabel}):</span>
                  <span className="text-primary">{total}</span>
                </div>
                {idx < totalEntries.length - 1 && (
                  <div className="border-r border-primary/30 h-6 mx-2 hidden sm:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        );
      })()}
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('orders.deleteOrderConfirmTitle') || 'Confirm Delete Order'}
        message={t('orders.deleteOrderConfirmMessage') || 'Are you sure you want to delete this order?'}
        itemName={orderToDelete ? `Order #${orderToDelete.id}` : ''}
        itemType={t('orders.order') || 'order'}
        isRTL={i18n.language === 'ARABIC'}
        severity="danger"
      />
    </div>
  );
};

export default OrdersPage; 