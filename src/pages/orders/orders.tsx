import React, { useState } from 'react';
import {  currencies } from '../../api/mockCustomers';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';

import { useOrder } from '../../hooks/useOrder';
import { getStoreId } from '../../utils/storeUtils';
import { useToastContext } from '../../contexts/ToastContext';

//-------------------------------------------- Types -------------------------------------------
type Column = {
  key: string;
  label: { ar: string; en: string };
  type?: 'number' | 'text' | 'date' | 'status';
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: any) => React.ReactNode;
};



//-------------------------------------------- OrdersPage -------------------------------------------
const OrdersPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { showSuccess, showError } = useToastContext();


  const storeId = getStoreId();
  const { data: orders, isLoading, error,  updateOrderPaymentStatus, updateOrderStatus } = useOrder(storeId);

//-------------------------------------------- tableData -------------------------------------------
  const tableData = orders.map(order => {
    const orderData = {
      id: order.id || order.orderNumber || order._id, // Use the correct ID field
      customer: order.customer,
      phone: order.customerPhone,
      email: order.customerEmail || '-',
      deliveryArea: order.deliveryArea?.locationEn || '-',
      affiliate: order.affiliate && typeof order.affiliate === 'string' && order.affiliate.trim() !== '' ? order.affiliate : 'لا يوجد',
      currency: order.currency,
      price: order.items && order.items.length > 0 ? order.items[0].total : '-',
      date: order.date ? new Date(order.date).toISOString().slice(0, 10) : '-',
      status: order.status,
      paymentStatus: order.paymentStatus || 'unpaid', // Default to 'unpaid' if not present
      itemsCount: order.itemsCount,
      notes: order.notes,
      originalOrder: order,
    };
    console.log('Table row data:', orderData); // Debug log
    return orderData;
  });

//-------------------------------------------- Status Renderer -------------------------------------------
  const renderStatus = (status: string, item: any) => {
    const [isUpdating, setIsUpdating] = useState(false);
    
    const statusConfig = {
      pending: { 
        label: i18n.language === 'ARABIC' ? 'معلق' : 'Pending',
        class: 'bg-yellow-100 text-yellow-700'
      },
      shipped: { 
        label: i18n.language === 'ARABIC' ? 'تم الشحن' : 'Shipped',
        class: 'bg-blue-100 text-blue-700'
      },
      delivered: { 
        label: i18n.language === 'ARABIC' ? 'تم التوصيل' : 'Delivered',
        class: 'bg-green-100 text-green-700'
      },
      cancelled: { 
        label: i18n.language === 'ARABIC' ? 'تم إلغاؤه' : 'Cancelled',
        class: 'bg-red-100 text-red-700'
      }
    };

    const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = event.target.value;
      setIsUpdating(true);
      try {
        const orderId = item.originalOrder.id || item.originalOrder.orderNumber || item.originalOrder._id;
        await updateOrderStatus(orderId, newStatus);
        showSuccess(
          t('orders.orderStatusUpdated', { orderId }),
          i18n.language === 'ARABIC' ? 'تم التحديث' : 'Updated'
        );
      } catch (error) {
        console.error('Failed to update order status:', error);
        showError(
          t('orders.orderStatusUpdateFailed'),
          i18n.language === 'ARABIC' ? 'خطأ' : 'Error'
        );
      } finally {
        setIsUpdating(false);
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <select
        value={status}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-primary focus:outline-none ${
          isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${config.class}`}
        style={{ minWidth: '120px' }}
      >
        <option value="pending" className="bg-[#ffffff] text-yellow-700">
          {isUpdating ? t('orders.updating') : statusConfig.pending.label}
        </option>
        <option value="shipped" className="bg-[#ffffff] text-blue-700">
          {isUpdating ? t('orders.updating') : statusConfig.shipped.label}
        </option>
        <option value="delivered" className="bg-[#ffffff] text-green-700">
          {isUpdating ? t('orders.updating') : statusConfig.delivered.label}
        </option>
        <option value="cancelled" className="bg-[#ffffff] text-red-700">
          {isUpdating ? t('orders.updating') : statusConfig.cancelled.label}
        </option>
      </select>
    );
  };

  const renderPaymentStatus = (status: string, item: any) => {
    const isPaid = status === 'paid';
    const [isUpdating, setIsUpdating] = useState(false);
    
    const handlePaymentStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newPaymentStatus = event.target.value;
      setIsUpdating(true);
      try {
        const orderId = item.originalOrder.id || item.originalOrder.orderNumber || item.originalOrder._id;
        await updateOrderPaymentStatus(orderId, newPaymentStatus === 'paid');
        showSuccess(
          t('orders.paymentStatusUpdated', { orderId }),
          i18n.language === 'ARABIC' ? 'تم التحديث' : 'Updated'
        );
      } catch (error) {
        console.error('Failed to update payment status:', error);
        showError(
          t('orders.paymentStatusUpdateFailed'),
          i18n.language === 'ARABIC' ? 'خطأ' : 'Error'
        );
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <select
        value={status}
        onChange={handlePaymentStatusChange}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 focus:ring-2 focus:ring-primary focus:outline-none ${
          isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${
          isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}
        style={{ minWidth: '80px' }}
      >
        <option value="paid" className="bg-green-100 text-green-700" disabled={isUpdating}>
          {isUpdating ? t('orders.updating') : t('orders.paid')}
        </option>
        <option value="unpaid" className="bg-red-100 text-red-700" disabled={isUpdating}>
          {isUpdating ? t('orders.updating') : t('orders.unpaid')}
        </option>
      </select>
    );
  };



//-------------------------------------------- columns -------------------------------------------
  const columns: Column[] = [
    { key: 'id', label: { ar: 'رقم الطلب', en: 'Order Number' }, type: 'number'},
    { key: 'customer', label: { ar: 'العميل', en: 'Customer' }, type: 'text'},
    { key: 'phone', label: { ar: 'رقم الهاتف', en: 'Phone' }, type: 'text'},
    { key: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email' }, type: 'text'},
    { key: 'deliveryArea', label: { ar: 'منطقة التوصيل', en: 'Delivery Area' }, type: 'text'},
    { key: 'affiliate', label: { ar: 'المسوق', en: 'Affiliate' }, type: 'text'},
    { key: 'currency', label: { ar: 'العملة', en: 'Currency' }, type: 'text'},
    { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number'},
    { key: 'date', label: { ar: 'تاريخ الطلب', en: 'Order Date' }, type: 'date'},
    { key: 'status', label: { ar: 'حالة الطلب', en: 'Order Status' }, type: 'status', render: renderStatus},
    { key: 'paymentStatus', label: { ar: 'حالة الدفع', en: 'Payment Status' }, type: 'status', render: renderPaymentStatus},
    { key: 'itemsCount', label: { ar: 'عدد المنتجات', en: 'Items Count' }, type: 'number'},
    { key: 'notes', label: { ar: 'ملاحظات', en: 'Notes' }, type: 'text'},
    // { key: 'actions', label: { ar: 'العمليات', en: 'Actions' }, type: 'text', render: renderActions},
  ];

//-------------------------------------------- visibleTableData -------------------------------------------     
  const [visibleTableData, setVisibleTableData] = useState<any[]>([]);
  




//-------------------------------------------- return -------------------------------------------
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="sm:p-4 w-full">
     <HeaderWithAction
      title={t('orders.title')}
      count={tableData.length}
      isRtl={i18n.language === 'ARABIC'}
     />
     {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <div className="overflow-x-auto">
        <CustomTable 
          columns={columns} 
          data={tableData} 
          onFilteredDataChange={setVisibleTableData}
          linkConfig={[{
            column: 'id',
            getPath: (row) => {
              const path = `/orders/${row.id}`;
              console.log('Generated path:', path, 'for row:', row); // Debug log
              return path;
            }
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

      

      
    </div>
  );
};

export default OrdersPage; 