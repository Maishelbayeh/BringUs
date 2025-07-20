import React from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import { useTranslation } from 'react-i18next';

interface PaymentFormProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  isRTL: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ form, setForm, onClose }) => {
  const { t } = useTranslation();
  return (
    <form className="p-4 flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 pb-4">
        <CustomInput
          label={t('affiliation.totalSale')}
          value={form.totalSale.toLocaleString()}
          readOnly
          name="totalSale"
        />
        <CustomInput
          label={t('affiliation.remaining')}
          value={form.remaining.toLocaleString()}
          readOnly
          name="remaining"
        />
        <CustomInput
          label={t('affiliation.paid')}
          type="number"
          value={form.paid}
          name="paid"
          onChange={e => setForm((f: any) => ({ ...f, paid: e.target.value }))}
        />
        <CustomInput
          label={t('affiliation.paidDate')}
          type="date"
          value={form.paidDate}
          name="paidDate"
          onChange={e => setForm((f: any) => ({ ...f, paidDate: e.target.value }))}
        />
        <CustomInput
          label={t('affiliation.balance')}
          type="number"
          value={form.balance}
          name="balance"
          onChange={e => setForm((f: any) => ({ ...f, balance: e.target.value }))}
        />
      </div>

        <div className={`flex justify-between gap-2  pt-4 border-t bg-white rounded-b-2xl `}>
          <CustomButton
            color="primary"
            textColor="white"
            text={t('common.save') || 'Save'} 
            action={() => {}}
            type="submit"
          />
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel') || 'Cancel'}
            action={onClose}
          />
        </div>
     
    </form>
  );
};

export default PaymentForm; 