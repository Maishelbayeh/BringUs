import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer, Order } from '../../hooks/useCustomers';
import { useStoreUrls } from '../../hooks/useStoreUrls';
// CSS styles لإخفاء شريط السكرول
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Safari and Chrome */
  }
  
  /* إضافة scroll للـ tbody */
  tbody.scrollbar-hide {
    display: block;
    max-height: 12rem;
    overflow-y: auto;
  }
  
  thead {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  
  tbody {
    display: block;
    width: 100%;
  }
  
  tbody tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
`;

interface CustomerDetailsPopupProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  orders: Order[];
  isRTL: boolean;
  t: any;
  getLastOrderDate: (orders: Order[]) => string;
  getTotalSpent: (orders: Order[]) => number;
  getAverageOrderValue: (orders: Order[]) => number;
  ordersLoading?: boolean;
}

const CustomerDetailsPopup: React.FC<CustomerDetailsPopupProps> = ({
  open,
  onClose,
  customer,
  orders,
  isRTL,
  t,
  getLastOrderDate,
  getTotalSpent,
  getAverageOrderValue,
  ordersLoading = false,
}) => {
  const navigate = useNavigate();
  const { storeSlug } = useStoreUrls();
  if (!open || !customer) return null;
  
  // Get customer display name
  const getCustomerDisplayName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  // Get customer initials
  const getCustomerInitials = (customer: Customer) => {
    const firstName = customer.firstName || '';
    const lastName = customer.lastName || '';
    const firstInitial = firstName.length > 0 ? firstName[0] : '';
    const lastInitial = lastName.length > 0 ? lastName[0] : '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'GU';
  };

  const customerOrders = orders;
  const colors = [
    'bg-primary/10 text-primary',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
  ];
  // استخدم _id للعملاء الضيوف أيضاً
  const customerId = customer._id || customer.email || `${customer.firstName}-${customer.lastName}`;
  const colorIdx = customerId.charCodeAt(customerId.length - 1) % colors.length;
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <style>{scrollbarHideStyles}</style>
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl relative shadow-xl border border-primary/20">
        <button
          className="absolute top-2 left-2 text-gray-400 hover:text-primary text-2xl"
          onClick={onClose}
          aria-label={t('customers.close')}
        >
          &times;
        </button>
        {/* بيانات العميل */}
        <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-6 mb-6 border-b-2 border-primary/20 pb-4`}>
          <div className={`h-20 w-20 flex items-center justify-center rounded-full text-3xl font-bold shadow ${colors[colorIdx]}`}>
            {getCustomerInitials(customer)}
          </div>
          <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}> 
            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse ' : ''}`}>
              <h2 className="text-xl font-bold text-primary">{getCustomerDisplayName(customer)}</h2>
              <span className={`bg-purple-100 text-purple-800 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l-1.68 9.39A2 2 0 0 1 15.34 19H8.66a2 2 0 0 1-1.98-1.61L5 8zm2-3a3 3 0 0 1 6 0" />
                </svg>
                {customer.orderCount} {t('customers.orders')}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                customer.status === 'active' ? 'bg-green-100 text-green-800' :
                customer.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {customer.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
              {customer.addressSummary && (
                <span className="bg-gray-100 rounded px-3 py-1 text-sm">
                  {t('customers.address') || 'Address'}: <span className="font-semibold">{customer.addressSummary}</span>
                </span>
              )}
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.phone')}: <span className="font-semibold">{customer.phone}</span></span>
            </div>
            <div className="flex flex-wrap gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.role')}: <span className="font-semibold">{customer.role}</span></span>
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.lastOrder')}: <span className="font-semibold">{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : '-'}</span></span>
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.totalSpent')}: <span className="font-semibold">{customer.totalSpent || 0}</span></span>
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.averageOrderValue')}: <span className="font-semibold">{customer.orderCount ? Math.round((customer.totalSpent || 0) / customer.orderCount) : 0}</span></span>
            </div>
          </div>
        </div>
        {/* جدول الطلبات */}
        <h3 className={`mt-2 mb-2 font-bold text-lg text-primary/90 ${isRTL ? 'text-right' : 'text-left'}` } dir={isRTL ? 'rtl' : 'ltr'}>{t('customers.orders')}:</h3>
        
        {ordersLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">{isRTL ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</span>
          </div>
        ) : customerOrders.length > 0 ? (
          <div className="rounded-lg border border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-primary/10 text-primary">
                    <th className="py-3 px-4 border-b text-left font-semibold">{t('customers.orderNumber')}</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">{t('customers.orderDate')}</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">{t('customers.orderPrice')}</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">{t('customers.orderStatus')}</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">{t('customers.orderPaid')}</th>
                  </tr>
                </thead>
                <tbody className="max-h-64 overflow-y-auto scrollbar-hide">
                  {customerOrders.map((order) => (
                    <tr key={order.id} className={`hover:bg-primary/5 transition ${(order.paymentStatus === 'paid' || order.paid) ? 'bg-green-50' : 'bg-red-50'}`}>
                      <td className="py-3 px-4 border-b font-semibold">
                        <button
                          onClick={() => navigate(`/${storeSlug}/orders/${order.id}`)}
                          className="text-primary hover:underline"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="py-3 px-4 border-b">{new Date(order.date || order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 border-b font-medium">
                        {(() => {
                          // حساب السعر الإجمالي
                          const totalPrice = order.pricing?.total || order.price || order.items.reduce((sum, item) => sum + (item.totalPrice || item.total || 0), 0);
                          
                          // حساب سعر التوصيل
                          const shippingPrice = order.deliveryArea?.price || order.pricing?.shipping || 0;
                          
                          // حساب السعر الفرعي (السعر الإجمالي - التوصيل)
                          const subtotal = totalPrice - shippingPrice;
                          
                          return (
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">
                                {totalPrice.toFixed(2)} {order.currency}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                <div>{isRTL ? 'المجموع الفرعي' : 'Subtotal'}: {subtotal.toFixed(2)} {order.currency}</div>
                                <div>{isRTL ? 'التوصيل' : 'Shipping'}: {shippingPrice.toFixed(2)} {order.currency}</div>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        {(order.paymentStatus === 'paid' || order.paid) ? (
                          <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            {t('customers.orderPaid')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            {t('customers.orderUnpaid')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-lg font-medium">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</p>
            <p className="text-sm">{isRTL ? 'هذا العميل لم يقم بأي طلبات بعد' : 'This customer has not placed any orders yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailsPopup; 