import React from 'react';
import { Customer } from '../../hooks/useCustomers';

type Order = {
  id: number;
  customerId: number;
  date: string;
  price: number;
  paid: boolean;
};

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
}) => {
  if (!open || !customer) return null;
  
  // Get customer display name
  const getCustomerDisplayName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  // Get customer initials
  const getCustomerInitials = (customer: Customer) => {
    return `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase();
  };

  const customerOrders = orders.filter(order => order.customerId === parseInt(customer._id.slice(-1)));
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
  const colorIdx = customer._id.charCodeAt(customer._id.length - 1) % colors.length;
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-xl border border-primary/20">
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
                {customerOrders.length} {t('customers.orders')}
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
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.lastOrder')}: <span className="font-semibold">{getLastOrderDate(customerOrders)}</span></span>
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.totalSpent')}: <span className="font-semibold">{getTotalSpent(customerOrders)}</span></span>
              <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.averageOrderValue')}: <span className="font-semibold">{getAverageOrderValue(customerOrders)}</span></span>
            </div>
          </div>
        </div>
        {/* جدول الطلبات */}
        <h3 className={`mt-2 mb-2 font-bold text-lg text-primary/90 ${isRTL ? 'text-right' : 'text-left'}` } dir={isRTL ? 'rtl' : 'ltr'}>{t('customers.orders')}:</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-primary/10 text-primary">
                <th className="py-2 px-3 border-b">{t('customers.orderNumber')}</th>
                <th className="py-2 px-3 border-b">{t('customers.orderDate')}</th>
                <th className="py-2 px-3 border-b">{t('customers.orderPrice')}</th>
                <th className="py-2 px-3 border-b">{t('customers.orderPaid')}</th>
              </tr>
            </thead>
            <tbody>
              {customerOrders.map((order) => (
                <tr key={order.id} className={`text-center hover:bg-primary/5 transition ${order.paid ? 'bg-green-50' : 'bg-red-50'}`}>
                  <td className="py-2 px-3 border-b font-semibold">{order.id}</td>
                  <td className="py-2 px-3 border-b">{order.date}</td>
                  <td className="py-2 px-3 border-b">{order.price} ₪</td>
                  <td className="py-2 px-3 border-b">
                    {order.paid ? (
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
    </div>
  );
};

export default CustomerDetailsPopup; 