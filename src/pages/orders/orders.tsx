import React, { useState } from 'react';
import {  currencies } from '../../api/mockCustomers';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import HeaderWithAction from '../../components/common/HeaderWithAction';
import { motion } from 'framer-motion';

import { useOrder } from '../../hooks/useOrder';
import { getStoreId } from '../../utils/storeUtils';
import { useToastContext } from '../../contexts/ToastContext';
import { 
  ShoppingCartIcon, 
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

//-------------------------------------------- Types -------------------------------------------
type Column = {
  key: string;
  label: { ar: string; en: string };
  type?: 'number' | 'text' | 'date' | 'status';
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: any) => React.ReactNode;
};

//-------------------------------------------- OrderStatistics Component -------------------------------------------
interface OrderStatisticsProps {
  data: any[];
  isRtl: boolean;
  onFilterChange: (filter: { type: 'status' | 'payment', value: string | null }) => void;
  activeFilter: { type: 'status' | 'payment', value: string | null };
}

const OrderStatistics: React.FC<OrderStatisticsProps> = ({ data, isRtl, onFilterChange, activeFilter }) => {
  const { t } = useTranslation();
  
  // Calculate statistics
  const stats = {
    total: data.length,
    pending: data.filter(order => order.status === 'pending').length,
    shipped: data.filter(order => order.status === 'shipped').length,
    delivered: data.filter(order => order.status === 'delivered').length,
    cancelled: data.filter(order => order.status === 'cancelled').length,
    paid: data.filter(order => order.paymentStatus === 'paid').length,
    unpaid: data.filter(order => order.paymentStatus === 'unpaid').length,
  };

  // Calculate total amounts for paid and unpaid orders
  const paidTotal = data
    .filter(order => order.paymentStatus === 'paid' && typeof order.price === 'number')
    .reduce((sum, order) => sum + order.price, 0);
  
  const unpaidTotal = data
    .filter(order => order.paymentStatus === 'unpaid' && typeof order.price === 'number')
    .reduce((sum, order) => sum + order.price, 0);

  const statusCards = [
    {
      title: t('orders.totalOrders'),
      value: stats.total,
      icon: ShoppingCartIcon,
      color: '#3B82F6',
      bgColor: '#EBF4FF',
      filterValue: null
    },
    {
      title: t('orders.pendingOrders'),
      value: stats.pending,
      icon: ClockIcon,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      filterValue: 'pending'
    },
    {
      title: t('orders.shippedOrders'),
      value: stats.shipped,
      icon: TruckIcon,
      color: '#6366F1',
      bgColor: '#EEF2FF',
      filterValue: 'shipped'
    },
    {
      title: t('orders.deliveredOrders'),
      value: stats.delivered,
      icon: CheckCircleIcon,
      color: '#10B981',
      bgColor: '#ECFDF5',
      filterValue: 'delivered'
    },
    {
      title: t('orders.cancelledOrders'),
      value: stats.cancelled,
      icon: XCircleIcon,
      color: '#EF4444',
      bgColor: '#FEF2F2',
      filterValue: 'cancelled'
    }
  ];

  const paymentCards = [
    {
      title: t('orders.paidOrders'),
      value: stats.paid,
      amount: paidTotal,
      icon: CreditCardIcon,
      color: '#10B981',
      bgColor: '#ECFDF5',
      filterValue: 'paid'
    },
    {
      title: t('orders.unpaidOrders'),
      value: stats.unpaid,
      amount: unpaidTotal,
      icon: ExclamationTriangleIcon,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      filterValue: 'unpaid'
    }
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* Order Status Statistics */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          <span className=" h-4 bg-blue-500 rounded-full"></span>
          {t('orders.orderStatusStatistics')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statusCards.map((stat, index) => {
            const Icon = stat.icon;
            const isActive = activeFilter.type === 'status' && activeFilter.value === stat.filterValue;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all duration-300 group cursor-pointer ${
                  isActive 
                    ? 'border-blue-500 shadow-md bg-blue-50' 
                    : 'border-gray-100'
                }`}
                dir={isRtl ? 'rtl' : 'ltr'}
                onClick={() => onFilterChange({ 
                  type: 'status', 
                  value: stat.filterValue 
                })}
              >
                <div className={`flex items-center justify-between mb-3 `}>
                  <h3 className={`text-sm font-medium ${isRtl ? 'text-right' : 'text-left'} ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </h3>
                  <div 
                    className={`p-2 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                </div>

                <div className={`${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className={`text-xl font-bold ${
                    isActive ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment Statistics */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          <span className=" h-4 bg-green-500 rounded-full"></span>
          {t('orders.paymentStatistics')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentCards.map((stat, index) => {
            const Icon = stat.icon;
            const percentage = data.length > 0 ? Math.round((stat.value / data.length) * 100) : 0;
            const isActive = activeFilter.type === 'payment' && activeFilter.value === stat.filterValue;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-all duration-300 group cursor-pointer ${
                  isActive 
                    ? 'border-blue-500 shadow-md bg-blue-50' 
                    : 'border-gray-100'
                }`}
                dir={isRtl ? 'rtl' : 'ltr'}
                onClick={() => onFilterChange({ 
                  type: 'payment', 
                  value: stat.filterValue 
                })}
              >
                <div className={`flex items-center justify-between mb-4 `}>
                  <h3 className={`text-sm font-medium ${isRtl ? 'text-right' : 'text-left'} ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </h3>
                  <div 
                    className={`p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>

                <div className={`mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className={`text-2xl font-bold ${
                    isActive ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('orders.orders')}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{t('orders.totalAmount')}:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {stat.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500`}
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: stat.color
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      
    </div>
  );
};

//-------------------------------------------- OrdersPage -------------------------------------------
const OrdersPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { showSuccess, showError } = useToastContext();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<{ type: 'status' | 'payment', value: string | null }>({
    type: 'status',
    value: null
  });

  const storeId = getStoreId();
  const { data: orders, isLoading, error,  updateOrderPaymentStatus, updateOrderStatus } = useOrder(storeId);

//-------------------------------------------- tableData -------------------------------------------
  // Handle filter changes
  const handleFilterChange = (filter: { type: 'status' | 'payment', value: string | null }) => {
    setActiveFilter(filter);
  };

  const tableData = React.useMemo(() => {
    let filteredOrders = orders;
    
    // Apply filter if active
    if (activeFilter.value) {
      if (activeFilter.type === 'status') {
        filteredOrders = orders.filter(order => order.status === activeFilter.value);
      } else if (activeFilter.type === 'payment') {
        filteredOrders = orders.filter(order => order.paymentStatus === activeFilter.value);
      }
    }

    return filteredOrders.map(order => {
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
      return orderData;
    });
  }, [orders, activeFilter]);

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
  const columns: Column[] = React.useMemo(() => [
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
  ], [renderStatus, renderPaymentStatus]);

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
     
     {/* ------------------------------------------- Order Statistics ------------------------------------------- */}
     <OrderStatistics 
       data={visibleTableData} 
       isRtl={i18n.language === 'ARABIC'}
       onFilterChange={handleFilterChange}
       activeFilter={activeFilter}
     />
     
     {/* ------------------------------------------- CustomTable ------------------------------------------- */}
      <div className="overflow-x-auto" style={{ maxHeight: '70vh', overflowY: 'auto', scrollBehavior: 'smooth' }}>
        <CustomTable 
          columns={columns} 
          data={tableData} 
          onFilteredDataChange={setVisibleTableData}
          autoScrollToFirst={false}
          linkConfig={[{
            column: 'id',
            getPath: (row) => {
              const path = `/orders/${row.id}`;
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