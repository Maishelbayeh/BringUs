import React from 'react';
import { useTranslation } from 'react-i18next';

interface InvoicePrintProps {
  order: any;
  isVisible: boolean;
  onClose: () => void;
}

const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, isVisible, onClose }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ARABIC' || i18n.language === 'ar';

  if (!isVisible || !order) return null;

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

         const formatDate = (dateString: string) => {
       return new Date(dateString).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
         calendar: 'gregory'
       });
     };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending':
          return isArabic ? 'معلق' : 'Pending';
        case 'shipped':
          return isArabic ? 'تم الشحن' : 'Shipped';
        case 'delivered':
          return isArabic ? 'تم التوصيل' : 'Delivered';
        case 'cancelled':
          return isArabic ? 'تم إلغاؤه' : 'Cancelled';
        default:
          return status;
      }
    };

    const getPaymentStatusText = (status: string) => {
      return status === 'paid' ? (isArabic ? 'مدفوع' : 'Paid') : (isArabic ? 'غير مدفوع' : 'Unpaid');
    };

    const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
    const shipping = order.deliveryArea?.price || 0;
    const total = subtotal + shipping;

    const printContent = `
      <!DOCTYPE html>
      <html dir="${isArabic ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${t('orders.invoiceTitle')}</title>
                 <style>
           body {
             font-family: Arial, sans-serif;
             margin: 0;
             padding: 15px;
             background: white;
             color: black;
             direction: ${isArabic ? 'rtl' : 'ltr'};
             font-size: 12px;
           }
           .header {
             text-align: center;
             margin-bottom: 20px;
             border-bottom: 2px solid black;
             padding-bottom: 15px;
           }
           .header h1 {
             font-size: 20px;
             margin: 0 0 8px 0;
             color: black;
           }
           .info-grid {
             display: grid;
             grid-template-columns: 1fr 1fr;
             gap: 15px;
             margin-bottom: 20px;
           }
           .info-box {
             border: 1px solid black;
             padding: 10px;
             border-radius: 3px;
           }
           .info-box h3 {
             margin: 0 0 8px 0;
             font-size: 14px;
             color: black;
           }
           .status-section {
             margin-bottom: 15px;
           }
           .status-badge {
             display: inline-block;
             padding: 3px 8px;
             border-radius: 10px;
             font-size: 10px;
             font-weight: bold;
             margin-left: 8px;
             background: #f3f4f6;
             color: black;
           }
           .items-table {
             width: 100%;
             border-collapse: collapse;
             margin-bottom: 20px;
             font-size: 11px;
           }
           .items-table th,
           .items-table td {
             border: 1px solid black;
             padding: 5px;
             text-align: center;
           }
           .items-table th {
             background: #f9fafb;
             font-weight: bold;
             font-size: 11px;
           }
           .product-image {
             width: 30px;
             height: 30px;
             object-fit: cover;
             border-radius: 2px;
             display: block;
             margin: 0 auto;
           }
           .product-name {
             text-align: left;
             font-size: 10px;
           }
           .summary-box {
             border: 1px solid black;
             padding: 15px;
             border-radius: 3px;
             margin-bottom: 15px;
           }
           .summary-box h3 {
             margin: 0 0 10px 0;
             font-size: 14px;
             color: black;
           }
           .summary-row {
             display: flex;
             justify-content: space-between;
             margin-bottom: 5px;
             font-size: 11px;
           }
           .total-row {
             border-top: 2px solid black;
             padding-top: 8px;
             font-weight: bold;
             font-size: 13px;
           }
           .notes-section {
             margin-bottom: 15px;
           }
           .notes-box {
             border: 1px solid black;
             padding: 10px;
             background: #f9fafb;
             border-radius: 3px;
             font-size: 11px;
           }
           .footer {
             text-align: center;
             margin-top: 20px;
             padding-top: 15px;
             border-top: 1px solid black;
             font-size: 11px;
             color: black;
           }
           @media print {
             body {
               margin: 0;
               padding: 10px;
             }
           }
         </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('orders.invoiceTitle')}</h1>
          <div>${t('orders.orderNumber')}: <strong>#${order.id}</strong></div>
          <div>${t('orders.date')}: <strong>${formatDate(order.date)}</strong></div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <h3>${t('orders.storeInfo')}</h3>
            <div><strong>${t('orders.storeName')}:</strong> ${order.storeName || '-'}</div>
            <div><strong>${t('orders.storePhone')}:</strong> ${order.storePhone || '-'}</div>
          </div>
          <div class="info-box">
            <h3>${t('orders.customerInfo')}</h3>
            <div><strong>${t('orders.customer')}:</strong> ${order.customer || '-'}</div>
            <div><strong>${t('orders.ordersPhone')}:</strong> ${order.customerPhone || '-'}</div>
            <div><strong>${t('orders.email')}:</strong> ${order.customerEmail || '-'}</div>
          </div>
        </div>

        <div class="status-section">
          <strong>${t('orders.orderStatus')}:</strong>
          <span class="status-badge">${getStatusText(order.status)}</span>
          <strong style="margin-left: 20px;">${t('orders.paymentStatus')}:</strong>
          <span class="status-badge">${getPaymentStatusText(order.paymentStatus)}</span>
        </div>

                 <h3>${t('orders.orderItems')}</h3>
         <table class="items-table">
           <thead>
             <tr>
               <th>${isArabic ? 'الصورة' : 'Image'}</th>
               <th>${t('orders.product')}</th>
               <th>${t('orders.quantity')}</th>
               <th>${t('orders.unitPrice')}</th>
               <th>${t('orders.total')}</th>
             </tr>
           </thead>
           <tbody>
             ${order.items.map((item: any) => `
               <tr>
                 <td>
                   <img src="${item.productSnapshot?.images?.[0] || item.image || '/placeholder-image.png'}" 
                        alt="${item.name || 'Product'}" class="product-image" 
                        onerror="this.src='/placeholder-image.png'">
                 </td>
                 <td class="product-name">${item.name || item.productSnapshot?.nameEn || 'غير محدد'}</td>
                 <td>${item.quantity || 0}</td>
                 <td>${(item.price || 0).toFixed(2)} ${order.currency}</td>
                 <td><strong>${(item.totalPrice || 0).toFixed(2)} ${order.currency}</strong></td>
               </tr>
             `).join('')}
           </tbody>
         </table>

        <div class="summary-box">
          <h3>${t('orders.orderSummary')}</h3>
          <div class="summary-row">
            <span>${t('orders.subtotal')}:</span>
            <span>${subtotal.toFixed(2)} ${order.currency}</span>
          </div>
          <div class="summary-row">
            <span>${t('orders.shipping')}:</span>
            <span>${shipping.toFixed(2)} ${order.currency}</span>
          </div>
          <div class="summary-row">
            <span>${t('orders.tax')}:</span>
            <span>-</span>
          </div>
          <div class="summary-row total-row">
            <span>${t('orders.total')}:</span>
            <span>${total.toFixed(2)} ${order.currency}</span>
          </div>
        </div>

        ${order.notes ? `
          <div class="notes-section">
            <h3>${t('orders.notes')}:</h3>
            <div class="notes-box">
              ${order.notes}
            </div>
          </div>
        ` : ''}

        <div class="footer">
          <p>${t('orders.thankYouMessage')}</p>
          <p>${t('orders.enjoyShoppingMessage')}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {t('orders.invoiceTitle')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
              >
                {t('orders.print')}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                {t('orders.close')}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('orders.invoiceTitle')}
            </h1>
            <div className="text-gray-600">
              {t('orders.orderNumber')}: <span className="font-bold">#{order.id}</span>
            </div>
                         <div className="text-gray-600">
               {t('orders.date')}: <span className="font-bold">
                 {new Date(order.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric',
                   hour: '2-digit',
                   minute: '2-digit',
                   calendar: 'gregory'
                 })}
               </span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3 text-primary">
                {t('orders.storeInfo')}
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">{t('orders.storeName')}:</span>
                  <span className="ml-2">{order.storeName || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">{t('orders.storePhone')}:</span>
                  <span className="ml-2">{order.storePhone || '-'}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3 text-primary">
                {t('orders.customerInfo')}
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">{t('orders.customer')}:</span>
                  <span className="ml-2">{order.customer || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">{t('orders.ordersPhone')}:</span>
                  <span className="ml-2">{order.customerPhone || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold">{t('orders.email')}:</span>
                  <span className="ml-2">{order.customerEmail || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('orders.orderStatus')}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status === 'pending' ? (isArabic ? 'معلق' : 'Pending') :
                   order.status === 'shipped' ? (isArabic ? 'تم الشحن' : 'Shipped') :
                   order.status === 'delivered' ? (isArabic ? 'تم التوصيل' : 'Delivered') :
                   order.status === 'cancelled' ? (isArabic ? 'تم إلغاؤه' : 'Cancelled') :
                   order.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('orders.paymentStatus')}:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {order.paymentStatus === 'paid' ? (isArabic ? 'مدفوع' : 'Paid') : (isArabic ? 'غير مدفوع' : 'Unpaid')}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-4 text-primary">
              {t('orders.orderItems')}
            </h3>
                         <div className="border border-gray-300 rounded-lg overflow-hidden">
               <table className="w-full">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-3 text-center font-semibold border-b">
                       {isArabic ? 'الصورة' : 'Image'}
                     </th>
                     <th className="px-4 py-3 text-center font-semibold border-b">
                       {t('orders.product')}
                     </th>
                     <th className="px-4 py-3 text-center font-semibold border-b">
                       {t('orders.quantity')}
                     </th>
                     <th className="px-4 py-3 text-center font-semibold border-b">
                       {t('orders.unitPrice')}
                     </th>
                     <th className="px-4 py-3 text-center font-semibold border-b">
                       {t('orders.total')}
                     </th>
                   </tr>
                 </thead>
                 <tbody>
                   {order.items.map((item: any, index: number) => (
                     <tr key={index} className="border-b border-gray-200">
                       <td className="px-4 py-3 text-center">
                         <img
                           src={item.productSnapshot?.images?.[0] || item.image || '/placeholder-image.png'}
                           alt={item.name || 'Product'}
                           className="w-12 h-12 object-cover rounded mx-auto"
                           onError={(e) => {
                             const target = e.target as HTMLImageElement;
                             target.src = '/placeholder-image.png';
                           }}
                         />
                       </td>
                       <td className="px-4 py-3 text-left">
                         <span className="font-medium">{item.name || item.productSnapshot?.nameEn || 'غير محدد'}</span>
                       </td>
                       <td className="px-4 py-3 text-center">{item.quantity || 0}</td>
                       <td className="px-4 py-3 text-center">
                         {(item.price || 0).toFixed(2)} {order.currency}
                       </td>
                       <td className="px-4 py-3 text-center font-semibold">
                         {(item.totalPrice || 0).toFixed(2)} {order.currency}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-primary">
              {t('orders.orderSummary')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t('orders.subtotal')}:</span>
                <span>{order.items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0).toFixed(2)} {order.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t('orders.shipping')}:</span>
                <span>{(order.deliveryArea?.price || 0).toFixed(2)} {order.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t('orders.tax')}:</span>
                <span>-</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{t('orders.total')}:</span>
                  <span className="font-bold text-lg text-primary">
                    {(order.items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0) + (order.deliveryArea?.price || 0)).toFixed(2)} {order.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6">
              <h3 className="font-bold text-lg mb-2 text-primary">
                {t('orders.notes')}:
              </h3>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <p className="text-gray-700">{order.notes}</p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>{t('orders.thankYouMessage')}</p>
            <p>{t('orders.enjoyShoppingMessage')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint; 