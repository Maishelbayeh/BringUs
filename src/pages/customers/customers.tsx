import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';
import { customersData, ordersData } from '../../api/mockCustomers';
import * as XLSX from 'xlsx';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CustomerDetailsPopup from './CustomerDetailsPopup';

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
  // const sortOptions = [
  //   { value: 'name', label: isRTL ? 'الترتيب حسب الاسم' : 'Sort by Name' },
  //   { value: 'lastOrderDesc', label: isRTL ? 'الطلبات من الأحدث إلى الأقدم' : 'Orders: Newest to Oldest' },
  //   { value: 'lastOrderAsc', label: isRTL ? 'الطلبات من الأقدم إلى الأحدث' : 'Orders: Oldest to Newest' },
  // ];
////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <div className="p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('customers.title') || 'Customers', href: '/customers' }
      ]} isRtl={isRTL} />
      <HeaderWithAction
        title={t('customers.title')}
       
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={isRTL ? 'ابحث باسم العميل أو رقم الهاتف...' : 'Search by customer name or phone...'}
        onDownload={handleDownloadExcel}
      />
      {/* شبكة العملاء */}
     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((customer) => {
          const orderCount = ordersData.filter(order => order.customerId === customer.id).length;
          return (
            <div
              key={customer.id}
              className={`border bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 flex items-center gap-6 group relative cursor-pointer ${language === 'ARABIC' ? 'flex-row-reverse' : 'flex-row'}`}
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="relative">
                {(() => {
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
                  const colorIdx = customer.id % colors.length;
                  return (
                    <div className={`h-20 w-20 flex items-center justify-center rounded-full text-3xl font-bold shadow ${colors[colorIdx]}`}>
                      {language === 'ARABIC' ? customer.nameAr[0] : customer.nameEn[0]}
                    </div>
                  );
                })()}
                <span className={`absolute -top-2 ${language === 'ARABIC' ? '-right-2' : '-left-2'} bg-purple-100 text-purple-800 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md border-2 border-white`}>
                  <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14l-1.68 9.39A2 2 0 0 1 15.34 19H8.66a2 2 0 0 1-1.98-1.61L5 8zm2-3a3 3 0 0 1 6 0" />
                  </svg>
                  {orderCount}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-center gap-2 mb-1 ${language === 'ARABIC' ? 'justify-end' : ''}`}> 
                  <h2 className={`text-xl font-bold text-primary truncate ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>{language === 'ARABIC' ? customer.nameAr : customer.nameEn}</h2>
                </div>
                <p className={`text-gray-500 text-sm truncate ${language === 'ARABIC' ? 'text-right' : 'text-left'}`}>{customer.phone}</p>
              </div>
              <button
                className="hidden lg:inline-flex opacity-0 group-hover:opacity-100 transition bg-primary text-white px-4 py-1 rounded-lg text-sm"
                onClick={e => { e.stopPropagation(); setSelectedCustomer(customer); }}
              >
                {t('common.details') || 'Details'}
              </button>
            </div>
          );
        })}
      </div>
      {selectedCustomer && (
        <CustomerDetailsPopup
          open={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customer={selectedCustomer}
          orders={ordersData}
          isRTL={isRTL}
          t={t}
          getLastOrderDate={getLastOrderDate}
          getTotalSpent={getTotalSpent}
          getAverageOrderValue={getAverageOrderValue}
        />
      )}
    </div>
  );
};

export default CustomersPage; 