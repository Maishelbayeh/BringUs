import React, { useState } from 'react';
import { ordersData, customersData, deliveryAreas, affiliates, currencies } from '../../api/mockCustomers';
import CustomSelect from '../../components/common/CustomSelect';
import CustomInput from '../../components/common/CustomInput';
import CustomTable from '../../components/common/CustomTable';

const OrdersPage: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [generalSearch, setGeneralSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // تعريف نوع الطلب بشكل صريح ليشمل جميع الحقول المتوقعة
  type OrderWithCurrency = {
    id: number;
    customerId: number;
    date: string;
    price: number;
    paid: boolean;
    deliveryAreaId: number;
    affiliateId: number;
    currencyId: number;
  };
  const ordersWithCurrency: OrderWithCurrency[] = ordersData.map((order) => {
    const currencyId = 'currencyId' in order ? (order as any).currencyId : currencies[(order.id % currencies.length)].id;
    return {
      ...order,
      currencyId,
    };
  });

  // تصفية الطلبات حسب الفلاتر
  const filteredOrders: OrderWithCurrency[] = ordersWithCurrency.filter(order => {
    const customer = customersData.find(c => c.id === order.customerId);
    const customerMatch = selectedCustomer ? order.customerId === Number(selectedCustomer) : true;
    const deliveryAreaMatch = selectedDeliveryArea ? order.deliveryAreaId === Number(selectedDeliveryArea) : true;
    const affiliateMatch = selectedAffiliate ? order.affiliateId === Number(selectedAffiliate) : true;
    const currencyMatch = selectedCurrency ? order.currencyId === Number(selectedCurrency) : true;
    const statusMatch = selectedStatus === '' ? true : selectedStatus === 'paid' ? order.paid : !order.paid;
    const dateFromMatch = dateFrom ? order.date >= dateFrom : true;
    const dateToMatch = dateTo ? order.date <= dateTo : true;
    // بحث عام في رقم الطلب، اسم العميل، رقم الهاتف
    const generalMatch = generalSearch
      ? (
          order.id.toString().includes(generalSearch) ||
          (customer && (
            customer.nameAr.includes(generalSearch) ||
            customer.nameEn.toLowerCase().includes(generalSearch.toLowerCase()) ||
            customer.phone.includes(generalSearch)
          ))
        )
      : true;
    return (
      customerMatch && deliveryAreaMatch && affiliateMatch && currencyMatch && statusMatch && dateFromMatch && dateToMatch && generalMatch
    );
  });

  // تعريف أعمدة الجدول مع type صحيح
  const columns = [
    { key: 'id', label: { ar: 'رقم الطلب', en: 'Order ID' }, type: 'number', align: 'center' },
    { key: 'customer', label: { ar: 'العميل', en: 'Customer' }, type: 'text', align: 'center' },
    { key: 'phone', label: { ar: 'رقم الهاتف', en: 'Phone' }, type: 'text', align: 'center' },
    { key: 'deliveryArea', label: { ar: 'منطقة التوصيل', en: 'Delivery Area' }, type: 'text', align: 'center' },
    { key: 'affiliate', label: { ar: 'المسوق', en: 'Affiliate' }, type: 'text', align: 'center' },
    { key: 'currency', label: { ar: 'العملة', en: 'Currency' }, type: 'text', align: 'center' },
    { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number', align: 'center' },
    { key: 'date', label: { ar: 'تاريخ الطلب', en: 'Order Date' }, type: 'date', align: 'center' },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' }, type: 'text', align: 'center' },
  ];

  // تجهيز بيانات الجدول
  const tableData = filteredOrders.map(order => {
    const customer = customersData.find(c => c.id === order.customerId);
    const area = deliveryAreas.find(a => a.id === order.deliveryAreaId);
    const affiliate = affiliates.find(a => a.id === order.affiliateId);
    const currency = currencies.find(cur => cur.id === order.currencyId);
    return {
      id: order.id,
      customer: customer ? customer.nameAr : '-',
      phone: customer ? customer.phone : '-',
      deliveryArea: area ? area.labelAr : '-',
      affiliate: affiliate ? affiliate.nameAr : '-',
      currency: currency ? currency.labelAr : '-',
      price: order.price,
      date: order.date,
      status: order.paid ? 'مدفوع' : 'غير مدفوع',
    };
  });

  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-6 text-primary">الطلبات</h1>
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white/80 rounded-2xl shadow p-4 border border-gray-200">
          <div className="flex flex-col">
            
            <div className="relative">
              <CustomInput
                label="بحث"
                placeholder="بحث..."
                value={generalSearch}
                onChange={e => setGeneralSearch(e.target.value)}
                // className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary w-full pr-10"
               
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" />
                </svg>
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <CustomInput
              label="من تاريخ"
              type="date"
              value={dateFrom}
              placeholder='من تاريخ'
              onChange={e => setDateFrom(e.target.value)}
            //   className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary w-full"
             
            />
          </div>
          <div className="flex flex-col">
           
            <CustomInput
              label="إلى تاريخ"
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            //   className="rounded-lg px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-primary w-full"
             
            />
          </div>
          <div className="flex flex-col">
           
            <CustomSelect
            label="الحالة"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              options={[
                { value: '', label: 'كل الحالات' },
                { value: 'paid', label: 'مدفوع' },
                { value: 'unpaid', label: 'غير مدفوع' },
              ]}
              className="w-full"
            
            />
          </div>
          <div className="flex flex-col">
           
            <CustomSelect
            label="العميل"
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
              options={[{ value: '', label: 'كل العملاء' }, ...customersData.map(c => ({ value: String(c.id), label: `${c.nameAr} / ${c.nameEn}` }))]}
              className="w-full"
            
            />
          </div>
          <div className="flex flex-col">
           
            <CustomSelect
            label="المسوق"
              value={selectedAffiliate}
              onChange={e => setSelectedAffiliate(e.target.value)}
              options={[{ value: '', label: 'كل المسوقين' }, ...affiliates.map(a => ({ value: String(a.id), label: `${a.nameAr} / ${a.nameEn}` }))]}
              className="w-full"
            
            />
          </div>
          <div className="flex flex-col">
           
            <CustomSelect
            label="العملة"
              value={selectedCurrency}
              onChange={e => setSelectedCurrency(e.target.value)}
              options={[{ value: '', label: 'كل العملات' }, ...currencies.map(cur => ({ value: String(cur.id), label: `${cur.labelAr} / ${cur.labelEn}` }))]}
              className="w-full"
            
            />
          </div>
          <div className="flex flex-col">
              
            <CustomSelect
            label="منطقة التوصيل"
              value={selectedDeliveryArea}
              onChange={e => setSelectedDeliveryArea(e.target.value)}
              options={[{ value: '', label: 'كل مناطق التوصيل' }, ...deliveryAreas.map(a => ({ value: String(a.id), label: `${a.labelAr} / ${a.labelEn}` }))]}
              className="w-full"
            
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <CustomTable columns={columns} data={tableData} />
      </div>
      
      {/* شريط مجموع السعر لكل عملة */}
      {(() => {
        const totals: { [currencyId: number]: number } = {};
        (filteredOrders as OrderWithCurrency[]).forEach((order: OrderWithCurrency) => {
          if (!totals[order.currencyId]) totals[order.currencyId] = 0;
          totals[order.currencyId] += order.price;
        });
        const totalEntries = Object.entries(totals) as [string, number][];
        if (totalEntries.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-0 mt-4 py-2 font-bold text-primary text-sm justify-center items-center bg-primary/10 rounded">
            {totalEntries.map(([currencyId, total], idx) => {
              const currency = currencies.find(cur => cur.id === Number(currencyId));
              return (
                <React.Fragment key={currencyId}>
                  <div className="flex items-center gap-1 px-3 py-1">
                    <span>المجموع ({currency ? currency.labelAr : '-'})</span>
                    <span className="text-primary">{total}</span>
                  </div>
                  {idx < totalEntries.length - 1 && (
                    <div className="border-r border-primary/30 h-6 mx-2" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default OrdersPage; 