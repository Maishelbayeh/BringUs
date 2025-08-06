import React, { useState, useEffect } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import CustomSelect from '../../components/common/CustomSelect';
import CustomTextArea from '../../components/common/CustomTextArea';
import { useTranslation } from 'react-i18next';
import useAffiliatePayments from '../../hooks/useAffiliatePayments';
import { validateAffiliatePayment, AffiliatePaymentFormData } from '../../validation/affiliatePaymentValidation';

interface PaymentFormProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  isRTL: boolean;
  affiliate?: any;
  payments?: any[];
  loading?: boolean;
  onPaymentSuccess?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  form, 
  setForm, 
  onClose, 
  
  affiliate,
 
  loading = false,
  onPaymentSuccess
}) => {
  const { t } = useTranslation();
  const { createPayment } = useAffiliatePayments(affiliate?._id || affiliate?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Payment method options
  const paymentMethods = [
    { value: 'bank_transfer', label: t('affiliation.bankTransfer') || 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cash', label: t('affiliation.cash') || 'Cash' },
    { value: 'check', label: t('affiliation.check') || 'Check' },
    { value: 'credit_card', label: t('affiliation.creditCard') || 'Credit Card' }
  ];

  // Initialize form with payment method
  useEffect(() => {
    if (!form.paymentMethod) {
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      setForm((prev: any) => ({ 
        ...prev, 
        paymentMethod: 'bank_transfer',
        paymentDate: prev.paymentDate || today,
        paid: prev.paid || '',
        description: prev.description || '',
        notes: prev.notes || '',
        bankTransfer: prev.bankTransfer || {},
        paypal: prev.paypal || {}
      }));
    }
  }, [form.paymentMethod, setForm]);

  const validateForm = () => {
    const formData: AffiliatePaymentFormData = {
      paid: form.paid,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      description: form.description,
      notes: form.notes,
      bankTransfer: form.bankTransfer,
      paypal: form.paypal
    };

    const validationResult = validateAffiliatePayment(formData, t, form.remaining);
    setErrors(validationResult.errors);
    return validationResult.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData = {
        amount: parseFloat(form.paid),
        paymentMethod: form.paymentMethod,
        paymentDate: form.paymentDate,
        description: form.description,
        notes: form.notes || '',
        ...(form.paymentMethod === 'bank_transfer' && {
          bankTransfer: {
            bankName: form.bankTransfer?.bankName || '',
            accountNumber: form.bankTransfer?.accountNumber || '',
            iban: form.bankTransfer?.iban || '',
            swiftCode: form.bankTransfer?.swiftCode || '',
            beneficiaryName: `${affiliate?.firstName} ${affiliate?.lastName}`
          }
        }),
        ...(form.paymentMethod === 'paypal' && {
          paypal: {
            paypalEmail: form.paypal?.paypalEmail || '',
            paypalTransactionId: form.paypal?.paypalTransactionId || ''
          }
        })
      };

      await createPayment(paymentData);
      onClose();
      onPaymentSuccess?.();
    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t('affiliation.paymentDetails') || 'تفاصيل الدفع'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              label={t('affiliation.paymentAmount') || 'مبلغ الدفع'}
              type="number"
              value={form.paid}
              onChange={(e) => handleFormChange('paid', e.target.value)}
              error={errors.paid}
              placeholder="0.00"
              min="0"
              max={form.remaining}
              step="0.01"
              required
            />
            
            <CustomInput
              label={t('affiliation.paymentDate') || 'تاريخ الدفع'}
              type="date"
              value={form.paymentDate}
              onChange={(e) => handleFormChange('paymentDate', e.target.value)}
              error={errors.paidDate}
              required
            />
          </div>

          <div className="mt-4">
            <CustomSelect
              label={t('affiliation.paymentMethod') || 'طريقة الدفع'}
              value={form.paymentMethod || 'bank_transfer'}
              
              onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
              options={paymentMethods}
            />
          </div>

          <div className="mt-4">
            <CustomTextArea
              label={t('affiliation.description') || 'الوصف'}
              value={form.description || ''}
              onChange={(e) => handleFormChange('description', e.target.value)}
              error={errors.description}
              placeholder={t('affiliation.descriptionPlaceholder') || 'وصف الدفع...'}
              rows={3}
              required
            />
          </div>

          <div className="mt-4">
            <CustomTextArea
              label={t('affiliation.notes') || 'ملاحظات'}
              value={form.notes || ''}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              placeholder={t('affiliation.notesPlaceholder') || 'ملاحظات إضافية...'}
              rows={2}
            />
          </div>
        </div>

        {/* Bank Transfer Details */}
        {form.paymentMethod === 'bank_transfer' && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              {t('affiliation.bankTransferDetails') || 'تفاصيل التحويل البنكي'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                label={t('affiliation.bankName') || 'اسم البنك'}
                value={form.bankTransfer?.bankName || ''}
                onChange={(e) => handleNestedChange('bankTransfer', 'bankName', e.target.value)}
                error={errors.bankName}
                required
              />
              
              <CustomInput
                label={t('affiliation.accountNumber') || 'رقم الحساب'}
                value={form.bankTransfer?.accountNumber || ''}
                onChange={(e) => handleNestedChange('bankTransfer', 'accountNumber', e.target.value)}
                error={errors.accountNumber}
                required
              />
              
              <CustomInput
                label="IBAN"
                value={form.bankTransfer?.iban || ''}
                onChange={(e) => handleNestedChange('bankTransfer', 'iban', e.target.value)}
                error={errors.iban}
                required
              />
              
              <CustomInput
                label={t('affiliation.swiftCode') || 'Swift Code'}
                value={form.bankTransfer?.swiftCode || ''}
                onChange={(e) => handleNestedChange('bankTransfer', 'swiftCode', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PayPal Details */}
        {form.paymentMethod === 'paypal' && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              {t('affiliation.paypalDetails') || 'تفاصيل PayPal'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomInput
                label={t('affiliation.paypalEmail') || 'بريد PayPal'}
                type="email"
                value={form.paypal?.paypalEmail || ''}
                onChange={(e) => handleNestedChange('paypal', 'paypalEmail', e.target.value)}
                error={errors.paypalEmail}
                required
              />
              
              <CustomInput
                label={t('affiliation.transactionId') || 'رقم المعاملة'}
                value={form.paypal?.paypalTransactionId || ''}
                onChange={(e) => handleNestedChange('paypal', 'paypalTransactionId', e.target.value)}
                placeholder={t('affiliation.transactionIdOptional') || 'اختياري'}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between gap-2 p-6 border-t bg-white rounded-b-2xl">
        <CustomButton
          color="white"
          textColor="primary"
          text={t('common.cancel') || 'إلغاء'}
          action={onClose}
          bordercolor="primary"
          disabled={isSubmitting}
        />
        <CustomButton
          color="primary"
          textColor="white"
          text={isSubmitting ? (t('common.saving') || 'جاري الحفظ...') : (t('common.save') || 'حفظ')}
          action={() => {}}
          type="submit"
          disabled={isSubmitting || loading}
        />
      </div>
    </form>
  );
};

export default PaymentForm; 