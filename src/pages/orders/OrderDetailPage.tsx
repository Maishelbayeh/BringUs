import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrder';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, BuildingStorefrontIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { CustomTable } from '../../components/common/CustomTable';
import PermissionModal from '../../components/common/PermissionModal';

const storeId = '687505893fbf3098648bfe16';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const { data: orders, isLoading, error } = useOrder(storeId);
  const order = orders.find(o => String(o.id) === String(id));

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;
  if (!order) {
    return <div className="p-8 text-center text-red-600 font-bold">{t('orders.notFound') || 'Order not found'}</div>;
  }

  const isArabic = i18n.language === 'ARABIC' || i18n.language === 'ar';
  const flexDir = isArabic ? 'md:flex-row-reverse' : 'md:flex-row';
  const textDir = isArabic ? 'text-right' : '';

  return (
    <div className="sm:p-4 w-full">
      <div dir={isArabic ? 'rtl' : 'ltr'}>
        <button onClick={() => navigate(-1)} className="mb-4 text-primary underline flex items-center gap-2">
          <ArrowLeftIcon className={`h-4 w-4 text-primary ${isArabic ? 'rotate-180' : ''}`} />
          {isArabic ? 'رجوع' : 'Back'}
        </button>
      </div>
      <div className={`flex flex-col ${flexDir} gap-6 w-full min-h-[400px]`}>
        <div className={`h-full w-full md:basis-3/4 md:w-3/4 ${textDir}`}>
          <div className={`bg-white rounded-xl shadow  h-full flex flex-col ${textDir}`}>
            <div className="text-xl font-bold text-primary bg-primary/10 py-2 px-4 rounded-t-lg flex items-center gap-3 justify-between" dir={isArabic ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-3">
                <span>{t('orders.orderDetails')}</span>
                <span className="inline-block bg-primary/20 text-primary font-bold text-lg px-3 py-1 rounded-md tracking-widest">#{order.id}</span>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition text-base no-print"
                title={t('orders.print')}
              >
                <PrinterIcon className="h-5 w-5" />
                <span className="hidden md:inline">{t('orders.print')}</span>
              </button>
            </div>
            <div id="print-section">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4">
                <div className={`bg-primary/5 rounded-lg p-4 flex flex-col items-start shadow`} dir={isArabic ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingStorefrontIcon className="h-5 w-5 text-primary" />
                    <span className="font-bold">{t('orders.storeInfo')}</span>
                  </div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.storeName')}:</span> {order.storeName || '-'}</div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.storeId')}:</span> -</div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="font-semibold">{t('orders.storePhone')}:</span> {order.storePhone || '-'}</div>
                  <a href={order.storeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition">{t('orders.visitStore')}</a>
                </div>
                <div className={`bg-primary/5 rounded-lg p-4 flex flex-col items-start shadow`} dir={isArabic ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <span className="font-bold">{t('orders.customerInfo')}</span>
                  </div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.customer')}:</span> {order.customer || '-'}</div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.ordersPhone')}:</span> {order.customerPhone || '-'}</div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.affiliate')}:</span> {order.affiliate || '-'}</div>
                </div>
                <div className={`bg-primary/5 rounded-lg p-4 flex flex-col items-start shadow`} dir={isArabic ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-primary" />
                    <span className="font-bold">{t('orders.orderInfo')}</span>
                  </div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.date')}:</span> {order.date ? new Date(order.date).toLocaleString() : '-'}</div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.orderPrice')}:</span> {order.items && order.items.length > 0 ? order.items[0].total : '-'} {order.currency || ''}</div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="font-semibold">{t('orders.status')}:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${order.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.paid ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <XCircleIcon className="h-4 w-4 text-red-500" />}
                      {order.paid ? t('orders.paid') : t('orders.unpaid')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-2 flex-1 p-4">
                <h3 className="text-lg font-bold text-primary mb-2">{t('orders.orderItems')}</h3>
                <CustomTable
                  columns={[
                    { key: 'quantity', label: { ar: 'الكمية', en: 'Quantity' }, type: 'number' },
                    { key: 'total', label: { ar: 'الإجمالي', en: 'Total' }, type: 'number' },
                  ]}
                  data={order.items}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={`h-full w-full md:basis-1/4 md:w-1/4 ${textDir}`}>
          <div className={`bg-white rounded-xl shadow  h-full flex flex-col ${textDir}`}>
            <div className="text-xl font-bold text-primary bg-primary/10 py-2 px-4 rounded-t-lg">{i18n.language === 'ARABIC' ? 'ملخص الطلب' : 'Order Summary'}</div>
            <div className=" p-6 divide-y divide-gray-200">
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.productsTotal') || 'Products Total'}</span>
                <span>{order.items && order.items.length > 0 ? order.items[0].total : '-'} {order.currency || ''}</span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.notes') || 'Notes'}</span>
                <span>{order.notes || '-'}</span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.itemsCount') || 'Items Count'}</span>
                <span>{order.itemsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 