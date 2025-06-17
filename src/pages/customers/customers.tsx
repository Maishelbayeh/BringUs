import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import { customersData, ordersData } from '../../api/mockCustomers';
import * as XLSX from 'xlsx';

type Customer = {
  id: number;
  nameAr: string;
  nameEn: string;
  phone: string;
};
type Order = {
  id: number;
  customerId: number;
  date: string;
  price: number;
  paid: boolean;
};
////////////////////////////////////////////////////////////////////////////////////////////////////
const CustomersPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
////////////////////////////////////////////////////////////////////////////////////////////////////
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'lastOrderDesc' | 'lastOrderAsc'>('name');
////////////////////////////////////////////////////////////////////////////////////////////////////
  const getTotalSpent = (orders: Order[]) =>
    orders.reduce((sum, order) => sum + (order.paid ? order.price : 0), 0);
  const getAverageOrderValue = (orders: Order[]) => {
    const paidOrders = orders.filter(order => order.paid);
    if (paidOrders.length === 0) return 0;
    return Math.round(getTotalSpent(orders) / paidOrders.length);
  };
////////////////////////////////////////////////////////////////////////////////////////////////////
  const getLastOrderDate = (orders: Order[]) => {
    if (!orders.length) return '-';
    return orders.reduce((latest, order) => order.date > latest ? order.date : latest, orders[0].date);
  };
////////////////////////////////////////////////////////////////////////////////////////////////////
  const filteredCustomers = customersData
    .filter((customer) => {
      const name = (language === 'ARABIC' ? customer.nameAr : customer.nameEn).toLowerCase();
      return (
        name.includes(search.toLowerCase()) ||
        customer.phone.includes(search)
      );
    })
    .sort((a, b) => {
      const aOrders = ordersData.filter(order => order.customerId === a.id);
      const bOrders = ordersData.filter(order => order.customerId === b.id);
      if (sort === 'name') {
        const nameA = (language === 'ARABIC' ? a.nameAr : a.nameEn).toLowerCase();
        const nameB = (language === 'ARABIC' ? b.nameAr : b.nameEn).toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sort === 'lastOrderDesc') {
        return new Date(getLastOrderDate(bOrders)).getTime() - new Date(getLastOrderDate(aOrders)).getTime();
      }
      if (sort === 'lastOrderAsc') {
        return new Date(getLastOrderDate(aOrders)).getTime() - new Date(getLastOrderDate(bOrders)).getTime();
      }
      return 0;
    });
////////////////////////////////////////////////////////////////////////////////////////////////////
 
  const handleDownloadExcel = () => {
    
    const rows: any[] = [];
    filteredCustomers.forEach((customer) => {
      rows.push({
        [isRTL ? 'اسم العميل' : 'Customer Name']: language === 'ARABIC' ? customer.nameAr : customer.nameEn,
        [isRTL ? 'رقم الهاتف' : 'Phone']: customer.phone,
      });
    });
    
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, 'customers.xlsx');
  };
////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="p-4 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* شريط البحث والترتيب */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-2 py-3 rounded-2xl shadow bg-primary-light w-full mx-auto">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true" className="w-7 h-7 text-primary mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h1 className="text-xl font-bold text-primary">{t('customers.title')}</h1>
          <span className="bg-primary text-white rounded-full px-3 py-1 text-sm font-bold">{filteredCustomers.length}</span>
          {/* زر التنزيل */}
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition text-sm font-semibold shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            {isRTL ? 'تنزيل' : 'Download'}
          </button>
        </div>
        <div className="flex-1 flex justify-end gap-3">
        <input
          type="text"
          placeholder={isRTL ? 'ابحث باسم العميل أو رقم الهاتف...' : 'Search by customer name or phone...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
          style={isRTL ? { direction: 'rtl' } : {}}
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'name' | 'lastOrderDesc' | 'lastOrderAsc')}
          className="rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-40"
          style={isRTL ? { direction: 'rtl' } : {}}
        >
          <option value="name">{isRTL ? 'الترتيب حسب الاسم' : 'Sort by Name'}</option>
          <option value="lastOrderDesc">{isRTL ? 'الطلبات من الأحدث إلى الأقدم' : 'Orders: Newest to Oldest'}</option>
          <option value="lastOrderAsc">{isRTL ? 'الطلبات من الأقدم إلى الأحدث' : 'Orders: Oldest to Newest'}</option>
        </select>
        </div>
      </div>
      {/* شبكة العملاء */}
     
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {filteredCustomers.map((customer) => {
       
          return (
            <div
              key={customer.id}
              className="p-4 flex flex-col items-center gap-2 ring-1 ring-primary/20 hover:ring-primary transition rounded-xl cursor-pointer bg-white"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="h-20 w-20 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                {language === 'ARABIC' ? customer.nameAr[0] : customer.nameEn[0]}
              </div>
              <h2 className="text-lg font-semibold text-primary">{language === 'ARABIC' ? customer.nameAr : customer.nameEn}</h2>
              <p className="text-gray-500 text-sm">{customer.phone}</p>
            </div>
          );
        })}
      </div>
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-xl border border-primary/20">
            <button
              className="absolute top-2 left-2 text-gray-400 hover:text-primary text-2xl"
              onClick={() => setSelectedCustomer(null)}
              aria-label={t('customers.close')}
            >
              &times;
            </button>
            {/* بيانات العميل */}
            <div className="flex flex-col items-center gap-2 mb-6 border-b-2 border-primary/20 pb-4">
              <div className="h-20 w-20 flex items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold shadow">
                {(isRTL ? selectedCustomer.nameAr : selectedCustomer.nameEn)[0]}
              </div>
              <h2 className="text-xl font-bold text-primary mt-2">{isRTL ? selectedCustomer.nameAr : selectedCustomer.nameEn}</h2>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.phone')}: <span className="font-semibold">{selectedCustomer.phone}</span></span>
                <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.lastOrder')}: <span className="font-semibold">{getLastOrderDate(ordersData.filter(order => order.customerId === selectedCustomer.id))}</span></span>
                <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.totalSpent')}: <span className="font-semibold">{getTotalSpent(ordersData.filter(order => order.customerId === selectedCustomer.id))}</span></span>
                <span className="bg-gray-100 rounded px-3 py-1 text-sm">{t('customers.averageOrderValue')}: <span className="font-semibold">{getAverageOrderValue(ordersData.filter(order => order.customerId === selectedCustomer.id))}</span></span>
              </div>
            </div>
            {/* جدول الطلبات */}
            <h3 className="mt-2 mb-2 font-bold text-lg text-primary/90">{t('customers.orders')}:</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                  {ordersData.filter(order => order.customerId === selectedCustomer.id).map((order) => (
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
      )}
    </div>
  );
};

export default CustomersPage; 