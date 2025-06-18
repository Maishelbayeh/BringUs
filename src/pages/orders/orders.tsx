import React, { useState } from 'react';
import { ordersData as ordersDataRaw, customersData, deliveryAreas, affiliates, currencies } from '../../api/mockCustomers';
import CustomTable from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';


type Column = {
  key: string;
  label: { ar: string; en: string };
  type?: 'number' | 'text' | 'date';
  align?: 'left' | 'center' | 'right';
};

const OrdersPage: React.FC = () => {
  const { i18n, t } = useTranslation();

  // تجهيز بيانات الجدول
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

  const columns: Column[] = [
    { key: 'id', label: { ar: 'رقم الطلب', en: 'Order Number' }, type: 'number', align: 'center' },
    { key: 'customer', label: { ar: 'العميل', en: 'Customer' }, type: 'text', align: 'center' },
    { key: 'phone', label: { ar: 'رقم الهاتف', en: 'Phone' }, type: 'text', align: 'center' },
    { key: 'deliveryArea', label: { ar: 'منطقة التوصيل', en: 'Delivery Area' }, type: 'text', align: 'center' },
    { key: 'affiliate', label: { ar: 'المسوق', en: 'Affiliate' }, type: 'text', align: 'center' },
    { key: 'currency', label: { ar: 'العملة', en: 'Currency' }, type: 'text', align: 'center' },
    { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number', align: 'center' },
    { key: 'date', label: { ar: 'تاريخ الطلب', en: 'Order Date' }, type: 'date', align: 'center' },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' }, type: 'text', align: 'center' },
  ];

  const [visibleTableData, setVisibleTableData] = useState<any[]>([]);

  return (
    <div className="p-4 w-full">
      <h1 className={`text-2xl font-bold mb-6 text-primary ${i18n.language === 'ARABIC' ? 'text-right' : 'text-left'}`}>{t('orders.title')}</h1>
      <div className="overflow-x-auto ">
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
      {/* شريط مجموع السعر لكل عملة */}
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
          <div className="flex flex-wrap gap-0 mt-4 py-2 font-bold text-primary text-sm justify-center items-center bg-primary/10 rounded">
            {totalEntries.map(([currencyLabel, total], idx) => (
              <React.Fragment key={currencyLabel}>
                <div dir={i18n.language === 'ARABIC' ? 'rtl' : 'ltr'} className={`flex items-center gap-1 px-3 py-1`}>
                  <span>{t('orders.total')}({currencyLabel}):</span>
                  <span className="text-primary">{total}</span>
                </div>
                {idx < totalEntries.length - 1 && (
                  <div className="border-r border-primary/30 h-6 mx-2" />
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