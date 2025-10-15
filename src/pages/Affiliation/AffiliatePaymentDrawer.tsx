import React from 'react';
import { CustomTable } from '../../components/common/CustomTable';
import { useTranslation } from 'react-i18next';
import PaymentForm from './PaymentForm';
import useAffiliatePayments from '../../hooks/useAffiliatePayments';
import useAffiliations from '../../hooks/useAffiliations';
//------------------------------------------- AffiliatePaymentDrawerProps -------------------------------------------
interface AffiliatePaymentDrawerProps{
  open: boolean;
  onClose: () => void;
  isRTL: boolean;
  affiliate: any;
  onPaymentSuccess?: () => void;
}

//-------------------------------------------- AffiliatePaymentDrawer -------------------------------------------
const AffiliatePaymentDrawer: React.FC<AffiliatePaymentDrawerProps> = ({ open, onClose, isRTL, affiliate, onPaymentSuccess }) => {
  const { t, i18n } = useTranslation();
  const { updateAffiliateTotalPaid, loading: updateLoading } = useAffiliations();
  
  // الحصول على عملة المتجر من localStorage
  const getStoreCurrency = () => {
    try {
      const storeInfo = localStorage.getItem('storeInfo');
      if (storeInfo) {
        const parsedStoreInfo = JSON.parse(storeInfo);
        return parsedStoreInfo.settings.currency || '';
      }
    } catch (error) {
      console.error('Error parsing storeInfo from localStorage:', error);
    }
    return ''; // قيمة افتراضية
  };
  
  const storeCurrency = getStoreCurrency();
  
  // State for editing total paid amount
  const [isEditingTotalPaid, setIsEditingTotalPaid] = React.useState(false);
  const [editedTotalPaid, setEditedTotalPaid] = React.useState(affiliate?.totalPaid || 0);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  
  // تحديث النموذج بالبيانات الحقيقية من المسوق
  const [form, setForm] = React.useState(() => ({
    totalSale: affiliate?.totalSales || 0,
    remaining: affiliate?.remainingBalance || 0,
    paid: '',
    paidDate: new Date().toISOString().slice(0, 10),
    balance: affiliate?.balance || 0,
  }));

  // تحديث النموذج عندما يتغير المسوق
  React.useEffect(() => {
    if (affiliate) {
      setForm({
        totalSale: affiliate.totalSales || 0,
        remaining: affiliate.remainingBalance || 0,
        paid: '',
        paidDate: new Date().toISOString().slice(0, 10),
        balance: affiliate.balance || 0,
      });
      setEditedTotalPaid(affiliate.totalPaid || 0);
    }
  }, [affiliate]);

  const [activeTab] = React.useState<'form' | 'table' | 'info'>('info');
  const { payments, loading: paymentsLoading, error: paymentsError } = useAffiliatePayments(affiliate?._id || affiliate?.id || '');

  // Function to refresh data after payment creation
  const handlePaymentSuccess = () => {
    // Call parent callback to refresh data
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  // Function to handle saving total paid amount
  const handleSaveTotalPaid = async () => {
    try {
      const affiliationId = affiliate?._id || affiliate?.id;
      if (!affiliationId) return;
      
      // Clear previous validation errors
      setValidationError(null);
      
      // Validation
      if (editedTotalPaid < 0) {
        setValidationError(isRTL ? 'لا يمكن أن يكون المبلغ أقل من صفر' : 'Amount cannot be negative');
        return;
      }
      
      if (isNaN(editedTotalPaid)) {
        setValidationError(isRTL ? 'يرجى إدخال رقم صحيح' : 'Please enter a valid number');
        return;
      }
      
      // Check if amount exceeds total commission
      if (editedTotalPaid > (affiliate?.totalCommission || 0)) {
        setValidationError(isRTL 
          ? `المبلغ المدخل (${editedTotalPaid}) أكبر من إجمالي العمولة (${affiliate?.totalCommission || 0})`
          : `Entered amount (${editedTotalPaid}) exceeds total commission (${affiliate?.totalCommission || 0})`
        );
        return;
      }
      
      await updateAffiliateTotalPaid(affiliationId, editedTotalPaid);
      setIsEditingTotalPaid(false);
      setValidationError(null);
      
      // Call parent callback to refresh data
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      
      // Small delay to show success message before closing
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error updating total paid:', error);
      setValidationError(isRTL ? 'حدث خطأ أثناء حفظ البيانات' : 'An error occurred while saving data');
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditedTotalPaid(affiliate?.totalPaid || 0);
    setIsEditingTotalPaid(false);
    setValidationError(null);
  };

  // تعريف الأعمدة داخل المكون للوصول إلى i18n
  const columns = [
    { 
      key: 'amount', 
      label: { ar: 'المبلغ', en: 'Amount' },
      render: (value: number) => `${value.toLocaleString()} ${storeCurrency}`
    },
    { 
      key: 'paymentMethod', 
      label: { ar: 'طريقة الدفع', en: 'Payment Method' },
      render: (value: string) => {
        const methods = {
          bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
          paypal: { ar: 'PayPal', en: 'PayPal' },
          cash: { ar: 'نقداً', en: 'Cash' },
          check: { ar: 'شيك', en: 'Check' },
          credit_card: { ar: 'بطاقة ائتمان', en: 'Credit Card' }
        };
        return methods[value as keyof typeof methods]?.[i18n.language as 'ar' | 'en'] || value;
      }
    },
    { 
      key: 'paymentDate', 
      label: { ar: 'تاريخ الدفع', en: 'Payment Date' },
      render: (value: string) => new Date(value).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')
    },
    { 
      key: 'description', 
      label: { ar: 'الوصف', en: 'Description' }
    },
    { 
      key: 'paymentStatus', 
      label: { ar: 'الحالة', en: 'Status' },
      render: (value: string) => {
        const statusConfig = {
          pending: { ar: 'قيد الانتظار', en: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
          processing: { ar: 'قيد المعالجة', en: 'Processing', class: 'bg-blue-100 text-blue-800' },
          completed: { ar: 'مكتمل', en: 'Completed', class: 'bg-green-100 text-green-800' },
          failed: { ar: 'فشل', en: 'Failed', class: 'bg-red-100 text-red-800' },
          cancelled: { ar: 'ملغي', en: 'Cancelled', class: 'bg-gray-100 text-gray-800' }
        };
        const config = statusConfig[value as keyof typeof statusConfig];
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.class || 'bg-gray-100 text-gray-800'}`}>
            {config?.[i18n.language as 'ar' | 'en'] || value}
          </span>
        );
      }
    },
    { 
      key: 'previousBalance', 
      label: { ar: 'الرصيد السابق', en: 'Previous Balance' },
      render: (value: number) => `${value.toLocaleString()} ${storeCurrency}`
    },
    { 
      key: 'newBalance', 
      label: { ar: 'الرصيد الجديد', en: 'New Balance' },
      render: (value: number) => `${value.toLocaleString()} ${storeCurrency}`
    },
  ];

  if (!open) return null;
//------------------------------------------- return -------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-2 relative flex flex-col max-h-[90vh] ${isRTL ? 'text-right' : 'text-left'}`}
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
            {/* <button
              className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'info' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-primary'} `}
              onClick={() => setActiveTab('info')}
            >
              {t('affiliation.affiliateInfo') || 'معلومات المسوق'}
            </button> */}
            {/* <button
              className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'form' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-primary'} `}
              onClick={() => setActiveTab('form')}
            >
              {t('affiliation.paymentForm')}
            </button> */}
            {/* <button
              className={`px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${activeTab === 'table' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-primary'} `}
              onClick={() => setActiveTab('table')}
            >
              {t('affiliation.paymentDetails')}
            </button> */}
          </div>

          {/* زر الإغلاق */}
          <button onClick={onClose} className="text-primary hover:text-red-500 text-2xl font-bold">×</button>
        </div>
        {/* Content */}
        {activeTab === 'info' ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header Card with Avatar and Status */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-2xl font-bold text-primary">
                          {affiliate?.firstName?.charAt(0)?.toUpperCase()}{affiliate?.lastName?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                        affiliate?.status === 'Active' ? 'bg-green-500' :
                        affiliate?.status === 'Inactive' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {affiliate?.fullName || `${affiliate?.firstName} ${affiliate?.lastName}`}
                      </h2>
                      <p className="text-gray-600">{affiliate?.affiliateCode}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          affiliate?.status === 'Active' ? 'bg-green-100 text-green-800' :
                          affiliate?.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {affiliate?.status}
                        </span>
                        {affiliate?.isVerified && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ✓ {t('affiliation.verified') || 'متحقق'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{t('affiliation.commissionRate') || 'نسبة العمولة'}</p>
                    <p className="text-3xl font-bold text-primary">{affiliate?.percent}%</p>
                  </div>
                </div>
              </div>

              {/* Performance Stats Cards */}
              <div className="grid grid-cols-2  gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('affiliation.totalSales') || 'إجمالي المبيعات'}</p>
                      <p className="text-xl font-bold text-gray-800">{affiliate?.totalSales?.toLocaleString() || 0} {storeCurrency}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('affiliation.totalCommission') || 'إجمالي العمولة'}</p>
                      <p className="text-xl font-bold text-blue-600">{affiliate?.totalCommission?.toLocaleString() || 0} {storeCurrency}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow ${isEditingTotalPaid ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{t('affiliation.totalPaid') || 'إجمالي المدفوع'}</p>
                      {isEditingTotalPaid ? (
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={editedTotalPaid}
                              onChange={(e) => {
                                setEditedTotalPaid(Number(e.target.value));
                                setValidationError(null); // Clear error when user types
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  // Only save if no validation errors
                                  if (!validationError && editedTotalPaid >= 0 && !isNaN(editedTotalPaid) && editedTotalPaid <= (affiliate?.totalCommission || 0)) {
                                    handleSaveTotalPaid();
                                  }
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit();
                                }
                              }}
                              className={`text-lg font-bold bg-white border-2 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 w-48 shadow-sm ${
                                validationError 
                                  ? 'text-red-600 border-red-300 focus:border-red-500 focus:ring-red-200' 
                                  : 'text-green-600 border-green-300 focus:border-green-500 focus:ring-green-200'
                              }`}
                              min="0"
                              step="0.01"
                              autoFocus
                              placeholder="0"
                            />
                            <span className="text-lg font-bold text-green-600">{storeCurrency}</span>
                          </div>
                          
                          {/* Max Amount Info */}
                          <div className="text-xs text-gray-500 mt-1">
                            {isRTL 
                              ? `الحد الأقصى المسموح: ${(affiliate?.totalCommission || 0).toLocaleString()} ${storeCurrency}`
                              : `Maximum allowed: ${(affiliate?.totalCommission || 0).toLocaleString()} ${storeCurrency}`
                            }
                          </div>
                          
                          {/* Validation Error Message */}
                          {validationError && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-sm text-red-600">{validationError}</p>
                            </div>
                          )}
                          
                          
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveTotalPaid}
                                disabled={updateLoading || validationError !== null || editedTotalPaid < 0 || isNaN(editedTotalPaid) || editedTotalPaid > (affiliate?.totalCommission || 0)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm ${
                                  updateLoading || validationError !== null || editedTotalPaid < 0 || isNaN(editedTotalPaid) || editedTotalPaid > (affiliate?.totalCommission || 0)
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                              {updateLoading ? (
                                <>
                                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  {t('common.saving') || 'جاري الحفظ...'}
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {t('common.save') || 'حفظ'}
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 flex items-center gap-2 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              {t('common.cancel') || 'إلغاء'}
                            </button>
                            </div>
                            
                            {/* Save Button Status Message */}
                            {(validationError !== null || editedTotalPaid < 0 || isNaN(editedTotalPaid) || editedTotalPaid > (affiliate?.totalCommission || 0)) && (
                              <p className="text-xs text-gray-500 mt-1">
                                {isRTL ? 'يجب إصلاح الأخطاء قبل الحفظ' : 'Fix errors before saving'}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-green-600">{affiliate?.totalPaid?.toLocaleString() || 0} {storeCurrency}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      {!isEditingTotalPaid && (
                        <button
                          onClick={() => setIsEditingTotalPaid(true)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors hover:bg-green-50 rounded-lg"
                          title={t('common.edit') || 'تعديل'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{t('affiliation.balance') || 'الرصيد'}</p>
                      <p className="text-xl font-bold text-orange-600">{affiliate?.balance?.toLocaleString() || 0} {storeCurrency}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('affiliation.contactInfo') || 'معلومات التواصل'}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t('affiliation.email') || 'البريد الإلكتروني'}</p>
                        <p className="font-medium text-gray-800">{affiliate?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t('affiliation.mobile') || 'رقم الهاتف'}</p>
                        <p className="font-medium text-gray-800">{affiliate?.mobile}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t('affiliation.address') || 'العنوان'}</p>
                        <p className="font-medium text-gray-800">{affiliate?.address || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                {/* <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('affiliation.bankInfo') || 'معلومات البنك'}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t('affiliation.bankName') || 'اسم البنك'}</p>
                        <p className="font-medium text-gray-800">{affiliate?.bankInfo?.bankName || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t('affiliation.accountNumber') || 'رقم الحساب'}</p>
                        <p className="font-medium text-gray-800">{affiliate?.bankInfo?.accountNumber || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">IBAN</p>
                        <p className="font-medium text-gray-800 text-sm">{affiliate?.bankInfo?.iban || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Additional Stats and Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Additional Statistics */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('affiliation.additionalStats') || 'إحصائيات إضافية'}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{affiliate?.totalOrders || 0}</p>
                      <p className="text-xs text-gray-600">{t('affiliation.totalOrders') || 'إجمالي الطلبات'}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800">{affiliate?.totalCustomers || 0}</p>
                      <p className="text-xs text-gray-600">{t('affiliation.totalCustomers') || 'إجمالي العملاء'}</p>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('affiliation.settings') || 'الإعدادات'}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{t('affiliation.autoPayment') || 'الدفع التلقائي'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        affiliate?.settings?.autoPayment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {affiliate?.settings?.autoPayment ? t('general.yes') : t('general.no')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{t('affiliation.paymentThreshold') || 'حد الدفع'}</span>
                      <span className="font-medium">{affiliate?.settings?.paymentThreshold || 0} {storeCurrency}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">{t('affiliation.registrationDate') || 'تاريخ التسجيل'}</span>
                      <span className="font-medium text-sm">
                        {affiliate?.registrationDate ? new Date(affiliate.registrationDate).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US') : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affiliate Link */}
              {affiliate?.affiliateLink && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('affiliation.affiliateLink') || 'رابط المسوق'}</h3>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input 
                      type="text" 
                      value={affiliate.affiliateLink} 
                      readOnly 
                      className="flex-1 bg-transparent border-none outline-none text-sm text-gray-600"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(affiliate.affiliateLink)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
                    >
                      {t('common.copy') || 'نسخ'}
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {affiliate?.notes && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">{t('affiliation.notes') || 'ملاحظات'}</h3>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
                    {affiliate.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'form' ? (
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1 flex flex-col min-h-0 ">
              <PaymentForm 
                form={form} 
                setForm={setForm} 
                onClose={onClose} 
                isRTL={isRTL} 
                affiliate={affiliate}
                payments={payments}
                loading={paymentsLoading}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
            {paymentsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-lg">{t('common.loading') || 'جاري التحميل...'}</div>
              </div>
            ) : paymentsError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>{t('common.error') || 'خطأ'}:</strong> {paymentsError}
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('affiliation.noPayments') || 'لا توجد مدفوعات لهذا المسوق'}
              </div>
            ) : (
              <CustomTable columns={columns as any} data={payments} />
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliatePaymentDrawer; 