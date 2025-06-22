// src/components/PaymentMethods/componant/PaymentForm.tsx
import React, { useState, useEffect } from 'react';
  import { PaymentMethod } from '../../../Types';
import { useTranslation } from 'react-i18next';


import CustomFileInput from '../../../components/common/CustomFileInput';
import CustomSelect from '../../../components/common/CustomSelect';

interface Props {
  method: PaymentMethod | null;
  onSubmit: (m: PaymentMethod) => void;
  onCancel: () => void;
  language: 'ENGLISH' | 'ARABIC';
  isEditMode?: boolean;
}

const PaymentForm: React.FC<Props> = ({ method, onSubmit, language }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>(method?.title || '');
  const [file, setFile] = useState<File | null>(null);
  const isRTL = language === 'ARABIC';

  const AVAILABLE_METHODS = [
    { value: 'Cash on Delivery', label: t('Cash on Delivery') },
    { value: 'PayPal', label: t('PayPal') },
    { value: 'Visa and Master', label: t('Visa and Master') },
  ];

  useEffect(() => {
    setSelected(method?.title || '');
    setFile(null);
  }, [method]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const logoUrl = file ? URL.createObjectURL(file) : method?.logoUrl;
    const newMethod: PaymentMethod = {
      id: method?.id || Date.now(),
      title: selected,
      logoUrl,
      isDefault: method?.isDefault || false,
    };
    onSubmit(newMethod);
  };

  const handleFileChange = (files: File | File[] | null) => {
    if (files instanceof File) {
      setFile(files);
    } else if (Array.isArray(files) && files.length > 0) {
      setFile(files[0]);
    } else {
      setFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col  p-4">
      <div className="flex-1 overflow-y-auto ">
        <div className="space-y-6">
          <CustomSelect
            label={t('paymentMethods.paymentMethod')}
            value={selected}
            onChange={e => setSelected(e.target.value)}
            options={AVAILABLE_METHODS}
          />
          <CustomFileInput
            label={t('paymentMethods.qrPicture')}
            id="qr_picture"
            value={file ? file.name : ''}
            onChange={handleFileChange}
            placeholder={t('paymentMethods.chooseFile')}
            labelAlign={isRTL ? 'right' : 'left'}
            style={{ textAlign: isRTL ? 'right' : 'left' }}
          />
        </div>
      </div>

      {/* <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-end space-x-3">
          <CustomButton
            color="white"
            textColor="primary"
            text={t('common.cancel')}
            action={onCancel}
          />
          <CustomButton
            color="primary"
            textColor="white"
            text={isEditMode ? t('common.edit') : t('common.save')}
            type="submit"
          />
        </div>
      </div> */}
    </form>
  );
};

export default PaymentForm;
