import React from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { getAffiliatePaymentsById } from '../../data/mockAffiliatePayments';
import { useTranslation } from 'react-i18next';
import PaymentForm from './PaymentForm';
//------------------------------------------- AffiliatePaymentDrawerProps -------------------------------------------
interface AffiliatePaymentDrawerProps{
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  affiliate: any;
}
//------------------------------------------- columns -------------------------------------------
const columns = [
  { key: 'remaining', label: { ar: 'المتبقي', en: 'Remaining Amount' } },
  { key: 'paid', label: { ar: 'المدفوع', en: 'Paid Amount' } },
  { key: 'date', label: { ar: 'تاريخ الدفع', en: 'Paid Date' } },
  { key: 'balance', label: { ar: 'الرصيد', en: 'Balance' } },
];
//-------------------------------------------- AffiliatePaymentDrawer -------------------------------------------
const AffiliatePaymentDrawer: React.FC<AffiliatePaymentDrawerProps> = ({ open, onClose, isRTL, affiliate }) => {
  const { t } = useTranslation();
  const [form, setForm] = React.useState(() => ({
    totalSale: 555,
    remaining: 0,
    paid: '',
    paidDate: new Date().toISOString().slice(0, 10),
    balance: '',
  }));
  const [activeTab, setActiveTab] = React.useState<'form' | 'table'>('form');
  const payments = affiliate?.id ? getAffiliatePaymentsById(affiliate.id) : [];
  if (!open) return null;
//------------------------------------------- return -------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-2 relative flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}
        dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header جديد */}
        <div className="flex items-center justify-between border-b border-primary/20 px-6 py-4 gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* بيانات المسوق */}
          {affiliate && (
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-lg font-bold border border-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <span className="truncate font-bold text-lg text-gray-800">{affiliate.firstName} {affiliate.lastName}</span>
            </div>
          )}

          {/* التابات */}
          <div className={`flex gap-2 flex-1 justify-center`}>
            <button
              className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'form' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-primary'} `}
              onClick={() => setActiveTab('form')}
            >
              {t('affiliation.paymentForm')}
            </button>
            <button
              className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'table' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-primary'} `}
              onClick={() => setActiveTab('table')}
            >
              {t('affiliation.paymentDetails')}
            </button>
          </div>

          {/* زر الإغلاق */}
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl font-bold">×</button>
        </div>
        {/* Content */}
        {activeTab === 'form' ? (
        <PaymentForm form={form} setForm={setForm} onClose={onClose} isRTL={isRTL} />
        ) : (
          <div className="p-6">
        <CustomTable columns={columns as any} data={payments} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliatePaymentDrawer; 