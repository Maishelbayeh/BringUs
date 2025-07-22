import React, { useState } from 'react';
import { ordersData as ordersDataRaw, customersData, deliveryAreas, affiliates, currencies } from '../../api/mockCustomers';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import PermissionModal from '../../components/common/PermissionModal';
import { useOrder } from '../../hooks/useOrder';

//-------------------------------------------- Types -------------------------------------------
type Column = {
  key: string;
  label: { ar: string; en: string };
  type?: 'number' | 'text' | 'date' | 'status';
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: any) => React.ReactNode;
};

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

//-------------------------------------------- OrdersPage -------------------------------------------
const OrdersPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  const storeId = '687505893fbf3098648bfe16';
  const { data: orders, isLoading, error, refetch } = useOrder(storeId);

//-------------------------------------------- tableData -------------------------------------------
  const tableData = orders.map(order => ({
    id: order.id,
    customer: order.customer,
    phone: order.customerPhone,
    email: order.customerEmail || '-',
    deliveryArea: order.deliveryArea?.locationEn || '-',
    affiliate: order.affiliate && typeof order.affiliate === 'string' && order.affiliate.trim() !== '' ? order.affiliate : 'لا يوجد',
    currency: order.currency,
    price: order.items && order.items.length > 0 ? order.items[0].total : '-',
    date: order.date ? new Date(order.date).toISOString().slice(0, 10) : '-',
    status: order.status,
    paymentStatus: order.paid ? 'paid' : 'unpaid',
    itemsCount: order.itemsCount,
    notes: order.notes,
    originalOrder: order,
  }));

//-------------------------------------------- Status Renderer -------------------------------------------
  const renderStatus = (status: string) => {
    const statusConfig = {
      pending: { 
        label: i18n.language === 'ARABIC' ? 'في الانتظار' : 'Pending',
        class: 'bg-yellow-100 text-yellow-700'
      },
      confirmed: { 
        label: i18n.language === 'ARABIC' ? 'مؤكد' : 'Confirmed',
        class: 'bg-blue-100 text-blue-700'
      },
      processing: { 
        label: i18n.language === 'ARABIC' ? 'قيد المعالجة' : 'Processing',
        class: 'bg-orange-100 text-orange-700'
      },
      shipped: { 
        label: i18n.language === 'ARABIC' ? 'تم الشحن' : 'Shipped',
        class: 'bg-purple-100 text-purple-700'
      },
      delivered: { 
        label: i18n.language === 'ARABIC' ? 'تم التوصيل' : 'Delivered',
        class: 'bg-green-100 text-green-700'
      },
      cancelled: { 
        label: i18n.language === 'ARABIC' ? 'ملغي' : 'Cancelled',
        class: 'bg-red-100 text-red-700'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const renderPaymentStatus = (status: string) => {
    const isPaid = status === 'paid';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {isPaid ? (i18n.language === 'ARABIC' ? 'مدفوع' : 'Paid') : (i18n.language === 'ARABIC' ? 'غير مدفوع' : 'Unpaid')}
      </span>
    );
  };

  const renderActions = (value: any, item: any) => (
    <div className="flex justify-center space-x-2">
      <button
        onClick={() => handleEditStatus(item)}
        className="text-blue-600 hover:text-blue-900 p-1"
        title={i18n.language === 'ARABIC' ? 'تغيير الحالة' : 'Change Status'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <button
        onClick={() => handleDelete(item)}
        className="text-red-600 hover:text-red-900 p-1"
        title={i18n.language === 'ARABIC' ? 'حذف الطلب' : 'Delete Order'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );

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
  
  //-------------------------------------------- handleDelete -------------------------------------------
  const handleDelete = (order: any) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };
  
  //-------------------------------------------- handleDeleteConfirm -------------------------------------------
  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      // في التطبيق الحقيقي، هنا سيتم إرسال طلب حذف للخادم
      //CONSOLE.log('Deleting order:', orderToDelete);
      setOrderToDelete(null);
    }
    setShowDeleteModal(false);
  };

  //-------------------------------------------- handleEditStatus -------------------------------------------
  const handleEditStatus = (order: any) => {
    setOrderToUpdateStatus(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  //-------------------------------------------- handleStatusUpdate -------------------------------------------
  const handleStatusUpdate = () => {
    if (orderToUpdateStatus) {
      // في التطبيق الحقيقي، هنا سيتم إرسال طلب تحديث للخادم
      //CONSOLE.log('Updating order status:', orderToUpdateStatus.id, 'to:', newStatus);
      
      // Note: In a real application, you would send an API request here
      // For now, we'll just log the status change
      // The mock data doesn't have status fields, so we can't update them directly
      
      setOrderToUpdateStatus(null);
    }
    setShowStatusModal(false);
  };

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

      {/* ------------------------------------------- Delete Modal ------------------------------------------- */}
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

      {/* ------------------------------------------- Status Update Modal ------------------------------------------- */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {i18n.language === 'ARABIC' ? 'تغيير حالة الطلب' : 'Change Order Status'}
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {i18n.language === 'ARABIC' ? 'الطلب رقم:' : 'Order #'}{orderToUpdateStatus?.id}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {i18n.language === 'ARABIC' ? 'الحالة الجديدة:' : 'New Status:'}
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="pending">{i18n.language === 'ARABIC' ? 'في الانتظار' : 'Pending'}</option>
                <option value="confirmed">{i18n.language === 'ARABIC' ? 'مؤكد' : 'Confirmed'}</option>
                <option value="processing">{i18n.language === 'ARABIC' ? 'قيد المعالجة' : 'Processing'}</option>
                <option value="shipped">{i18n.language === 'ARABIC' ? 'تم الشحن' : 'Shipped'}</option>
                <option value="delivered">{i18n.language === 'ARABIC' ? 'تم التوصيل' : 'Delivered'}</option>
                <option value="cancelled">{i18n.language === 'ARABIC' ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                {i18n.language === 'ARABIC' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark transition"
              >
                {i18n.language === 'ARABIC' ? 'تحديث' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 