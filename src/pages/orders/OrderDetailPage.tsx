import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon, BuildingStorefrontIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { CustomTable } from '../../components/common/CustomTable';
import InvoicePrint from '../../components/common/InvoicePrint';


interface Order {
  _id?: string;
  id: string;
  orderNumber?: string;
  storeName: string;
  storePhone?: string;
  storeUrl: string;
  customer?: string;
  customerPhone?: string;
  customerEmail?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  affiliate?: string;
  deliveryArea?: {
    locationAr?: string;
    locationEn?: string;
    price?: number;
    estimatedDays?: number;
  };
  currency: string;
  date?: string;
  createdAt?: string;
  price?: number;
  paymentStatus?: string;
  paid?: boolean;
  status: string;
  itemsCount?: number;
  notes?: string | { customer: string; admin?: string };
  items: Array<{
    id?: string;
    productId?: string;
    name?: string;
    sku?: string;
    quantity?: number;
    price?: number;
    pricePerUnit?: number;
    totalPrice?: number;
    total?: number;
    image?: string;
    variant?: any;
    productSnapshot?: any;
    selectedSpecifications?: Array<{
      specificationId: string;
      valueId: string;
      valueAr: string;
      valueEn: string;
      titleAr: string;
      titleEn: string;
      _id: string;
      id: string;
    }>;
    selectedColors?: string[];
  }>;
  pricing?: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  affiliateTracking?: {
    isAffiliateOrder: boolean;
    commissionEarned: number;
    commissionPercentage: number;
  };
  isGift?: boolean;
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  // Helper function to get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      console.log('Looking for order with ID:', id); // Debug log
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Use the new getOrderDetails endpoint
        const response = await fetch(`http://localhost:5001/api/orders/details/${id}`, {
          headers: getAuthHeaders()
        });
        
        const result = await response.json();
        console.log('API Response:', result); // Debug log
        
        if (result.success) {
          console.log('Found order:', result.data); // Debug log
          console.log('Notes data:', result.data.notes); // Debug notes
          console.log('Pricing data:', result.data.pricing); // Debug pricing
          console.log('Price data:', result.data.price); // Debug price
          console.log('Discount calculation:', {
            subtotal: result.data.pricing?.subtotal,
            total: result.data.pricing?.total,
            discount: result.data.pricing?.discount,
            price: result.data.price
          }); // Debug discount calculation
          // Map the order data to match our interface
          const mappedOrder = {
            _id: result.data.id,
            id: result.data.id,
            orderNumber: result.data.orderNumber,
            storeName: result.data.storeName || '',
            storePhone: result.data.store?.phone || '',
            storeUrl: result.data.storeUrl || '',
            customer: result.data.user ? `${result.data.user.firstName} ${result.data.user.lastName}` : '',
            customerPhone: result.data.user?.phone || '',
            customerEmail: result.data.user?.email || '',
            user: result.data.user ? {
              firstName: result.data.user.firstName,
              lastName: result.data.user.lastName,
              email: result.data.user.email,
              phone: result.data.user.phone
            } : undefined,
            affiliate: result.data.affiliate ? 
              `${result.data.affiliate.snapshot?.firstName || ''} ${result.data.affiliate.snapshot?.lastName || ''}`.trim() || 'لا يوجد' : 'لا يوجد',
            deliveryArea: result.data.deliveryArea ? {
              locationAr: result.data.deliveryArea.locationAr,
              locationEn: result.data.deliveryArea.locationEn,
              price: result.data.deliveryArea.price,
              estimatedDays: result.data.deliveryArea.estimatedDays
            } : undefined,
            currency: result.data.currency || '',
            date: result.data.date || result.data.createdAt,
            createdAt: result.data.createdAt,
            price: result.data.price,
            paymentStatus: result.data.paymentStatus || (result.data.paid ? 'paid' : 'unpaid'),
            paid: result.data.paid,
            status: result.data.status || '',
            itemsCount: result.data.itemsCount || 0,
            notes: typeof result.data.notes === 'string' ? result.data.notes : 
                   typeof result.data.notes === 'object' && result.data.notes ? 
                   (result.data.notes.customer || result.data.notes.admin || '') : '',
            items: result.data.items || [],
            pricing: result.data.pricing,
            affiliateTracking: result.data.affiliateTracking,
            isGift: result.data.isGift
          };
          setOrder(mappedOrder);
        } else {
          console.log('Order not found:', result.message); // Debug log
          setError(result.message || 'Order not found');
        }
      } catch (err: any) {
        console.error('Error fetching order:', err); // Debug log
        setError(err.message || 'Network error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

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
                onClick={() => setShowInvoicePrint(true)}
                className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition text-base no-print"
                title={t('orders.print')}
              >
                <PrinterIcon className="h-5 w-5" />
                <span className="hidden md:inline">{t('orders.print')}</span>
              </button>
            </div>
            <div id="print-section">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4">
                {/* <div className={`bg-primary/5 rounded-lg p-4 flex flex-col items-start shadow`} dir={isArabic ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingStorefrontIcon className="h-5 w-5 text-primary" />
                    <span className="font-bold">{t('orders.storeInfo')}</span>
                  </div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.storeName')}:</span> {order.storeName || '-'}</div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.storeId')}:</span> -</div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="font-semibold">{t('orders.storePhone')}:</span> {order.storePhone || '-'}</div>
                  <a href={order.storeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 px-3 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition">{t('orders.visitStore')}</a>
                </div> */}
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
                  <div className="mb-1"><span className="font-semibold">{t('orders.date')}:</span> {order.date ? new Date(order.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    calendar: 'gregory'
                  }) : '-'}</div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.orderPrice')}:</span> {order.price || order.pricing?.total || order.items.reduce((sum, item) => sum + (item.totalPrice || item.total || 0), 0)} {order.currency || ''}</div>
                  <div className="mb-1"><span className="font-semibold">{t('orders.discountPercentage')}:</span> <span className="text-green-600 font-medium">
                    {(() => {
                      if (order.pricing?.discount) {
                        // discount هو النسبة المئوية (مثل 14 = 14%)
                        const discountPercentage = order.pricing.discount;
                        const discountAmount = order.pricing.subtotal ? (order.pricing.subtotal * discountPercentage) / 100 : 0;
                        return `${discountPercentage}% (خصم ${discountAmount.toFixed(2)} ${order.currency})`;
                      }
                      return `0%`;
                    })()}
                  </span></div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="font-semibold">{t('orders.paymentStatus')}:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.paymentStatus === 'paid' ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <XCircleIcon className="h-4 w-4 text-red-500" />}
                      {order.paymentStatus === 'paid' ? t('orders.paid') : t('orders.unpaid')}
                    </span>
                  </div>
                  <div className="mb-1 flex items-center gap-1">
                    <span className="font-semibold">{t('orders.orderStatus')}:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status === 'pending' ? (i18n.language === 'ARABIC' ? 'معلق' : 'Pending') :
                       order.status === 'shipped' ? (i18n.language === 'ARABIC' ? 'تم الشحن' : 'Shipped') :
                       order.status === 'delivered' ? (i18n.language === 'ARABIC' ? 'تم التوصيل' : 'Delivered') :
                       order.status === 'cancelled' ? (i18n.language === 'ARABIC' ? 'تم إلغاؤه' : 'Cancelled') :
                       order.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mb-2 flex-1 p-4">
                <h3 className="text-lg font-bold text-primary mb-2">{t('orders.orderItems')}</h3>
                <CustomTable
                  columns={[
                    { 
                      key: 'image', 
                      label: { ar: 'الصورة', en: 'Image' }, 
                      type: 'image',
                      render: (value: any, item: any) => (
                        <div className="flex justify-center">
                          <img 
                            src={value || '/placeholder-image.png'} 
                            alt={item.name || 'Product'} 
                            className="w-12 h-12 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              if (value) {
                                window.open(value, '_blank');
                              }
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.png';
                            }}
                          />
                        </div>
                      )
                    },
                    { key: 'name', label: { ar: 'اسم المنتج', en: 'Product Name' }, type: 'text' },
                    { key: 'quantity', label: { ar: 'الكمية', en: 'Quantity' }, type: 'number' },
                    { key: 'price', label: { ar: 'سعر الوحدة', en: 'Unit Price' }, type: 'number' },
                    { key: 'totalPrice', label: { ar: 'الإجمالي', en: 'Total' }, type: 'number' },
                  ]}
                  data={order.items.map(item => ({
                    image: item.image || item.productSnapshot?.images?.[0] || '',
                    name: item.name || item.productSnapshot?.nameEn || 'غير محدد',
                    quantity: item.quantity || 0,
                    price: item.price || item.pricePerUnit || 0,
                    totalPrice: item.totalPrice || item.total || 0,
                    currency: order.currency
                  }))}
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
                <span className="font-semibold">{t('orders.itemsCount') || 'Items Count'}</span>
                <span>{order.itemsCount}</span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.subtotal') || 'Subtotal'}</span>
                <span>{order.pricing?.subtotal || order.items.reduce((sum, item) => sum + (item.totalPrice || item.total || 0), 0)} {order.currency || ''}</span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.shipping') || 'Shipping'}</span>
                <span>{order.pricing?.shipping || order.deliveryArea?.price || 0} {order.currency || ''}</span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.tax') || 'Tax'}</span>
                <span>{order.pricing?.tax || 0} {order.currency || ''}</span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.discountPercentage') || 'Discount Percentage'}</span>
                <span className="text-green-600 font-medium">
                  {(() => {
                    if (order.pricing?.discount) {
                      // discount هو النسبة المئوية (مثل 14 = 14%)
                      const discountPercentage = order.pricing.discount;
                      const discountAmount = order.pricing.subtotal ? (order.pricing.subtotal * discountPercentage) / 100 : 0;
                      return `${discountPercentage}% (${discountAmount.toFixed(2)} ${order.currency})`;
                    }
                    return `0%`;
                  })()}
                </span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''} font-bold text-lg border-t-2 pt-2`}> 
                <span>{t('orders.total') || 'Total'}</span>
                <span>{order.price || order.pricing?.total || (order.items.reduce((sum, item) => sum + (item.totalPrice || item.total || 0), 0) + (order.deliveryArea?.price || 0))} {order.currency || ''}</span>
              </div>
              <div className={`py-2 flex justify-between items-center ${isArabic ? 'flex-row-reverse' : ''}`}> 
                <span className="font-semibold">{t('orders.notes') || 'Notes'}</span>
                <span className="text-sm text-gray-600 max-w-xs truncate">
                  {typeof order.notes === 'string' ? order.notes : 
                   typeof order.notes === 'object' && order.notes ? 
                   (order.notes.customer || order.notes.admin || '-') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Invoice Print Modal */}
      <InvoicePrint
        order={order}
        isVisible={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
      />
    </div>
  );
};

export default OrderDetailPage; 