import React, { useEffect } from 'react';
import CustomInput from '../../components/common/CustomInput';
import CustomFileInput from '../../components/common/CustomFileInput';
import CustomSelect from '../../components/common/CustomSelect';
import CustomSwitch from '../../components/common/CustomSwitch';
import CustomShuttle from '../../components/common/CustomShuttle';
import CustomColorPicker from '../../components/common/CustomColorPicker';
import CustomTextArea from '../../components/common/CustomTextArea';

import { t } from 'i18next';
import { initialProductSpecifications } from '@/data/initialProductSpecifications';
import { useTranslation } from 'react-i18next';
import MultiSelect from '@/components/common/MultiSelect';
//-------------------------------------------- ColorVariant -------------------------------------------
interface ColorVariant {
  id: string;
  colors: string[];
}
//-------------------------------------------- ProductsFormProps -------------------------------------------
interface ProductsFormProps {
  form: any;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onTagsChange: (values: string[]) => void;
  onImageChange: (files: File | File[] | null) => void;
  categories?: { id: number; nameAr: string; nameEn: string }[];
  tags?: any[];
  units?: any[];
}

//-------------------------------------------- ProductsForm -------------------------------------------
const ProductsForm: React.FC<ProductsFormProps> = ({ form, onFormChange, onTagsChange, onImageChange, categories = [], tags = [], units = [] }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar' || i18n.language === 'ar-SA' || i18n.language === 'ARABIC';
  

  

  const specOptions = initialProductSpecifications.map(spec => ({
    value: spec.id.toString(),
    label: isRtl ? spec.descriptionAr : spec.descriptionEn
  }));
  //-------------------------------------------- handleShuttleChange -------------------------------------------
  const handleShuttleChange = (e: React.ChangeEvent<{ name: string; value: string[] }>) => {
    onFormChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      }
    } as any);
  };
  //-------------------------------------------- handleColorChange -------------------------------------------
  const handleColorChange = (e: React.ChangeEvent<{ name: string; value: ColorVariant[] }>) => {
    onFormChange({
      target: {
        name: e.target.name,
        value: e.target.value,
      }
    } as any);
  };
  //-------------------------------------------- handleInputChange -------------------------------------------
  const handleInputChange = (name: string, value: string) => {
    onFormChange({
      target: {
        name,
        value,
      }
    } as any);
  };
  //-------------------------------------------- handleSelectChange -------------------------------------------
  const handleSelectChange = (name: string, value: string) => {
    onFormChange({
      target: {
        name,
        value,
      }
    } as any);
  };
  // handle multi-select for product labels
  const handleTagsChange = (values: string[]) => {
    onTagsChange(values);
  };
  //-------------------------------------------- return -------------------------------------------
    return (
    <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[70vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-4">
        <div >
          <CustomInput
            label={isRtl ? t('products.productName') : 'Product Name'}
            name="nameAr"
            value={form.nameAr || ''}
            onChange={(e) => handleInputChange('nameAr', e.target.value)}
            required
          />
        </div>
        <div >
          <CustomInput
            label={isRtl ? t('products.productName') : 'Product Name'}
            name="nameEn"
            value={form.nameEn || ''}
            onChange={(e) => handleInputChange('nameEn', e.target.value)}
            required
          />
        </div>
        <div >
          <CustomTextArea
            label={isRtl ? t('products.description') : 'Description'}
            name="descriptionAr"
            value={form.descriptionAr || ''}
            onChange={(e) => handleInputChange('descriptionAr', e.target.value)}
          />
        </div>
        <div >
          <CustomTextArea
            label={isRtl ? t('products.description') : 'Description'}
            name="descriptionEn"
            value={form.descriptionEn || ''}
            onChange={(e) => handleInputChange('descriptionEn', e.target.value)}
          />
        </div>
        <CustomSelect
          label={isRtl ? t('products.category') : 'Category'}
                      value={form.categoryId || ''}
          onChange={(e) => handleSelectChange('categoryId', e.target.value)}
          options={[
            { value: '', label: isRtl ? t('products.selectCategory') : 'Select Category' },
            ...categories.map((cat: any) => ({ 
              value: String(cat._id || cat.id), 
              label: isRtl ? cat.nameAr : cat.nameEn 
            }))
          ]}
        />
      
        <CustomSelect
          label={isRtl ? t('products.unit') : 'Unit'}
          value={form.unitId || ''}
          onChange={(e) => handleSelectChange('unitId', e.target.value)}
          options={[
            { value: '', label: isRtl ? t('products.selectUnit') : 'Select Unit' },
            ...units.map((u: any) => ({ 
              value: String(u._id || u.id), 
              label: isRtl ? u.nameAr : u.nameEn 
            }))
          ]}
        />
        <CustomInput
          label={isRtl ? t('products.productOrder') : 'Product Order'}
          name="productOrder"
          value={form.productOrder || ''}
          onChange={(e) => handleInputChange('productOrder', e.target.value)}
          type="number"
        />
        <CustomInput
          label={isRtl ? t('products.price') : 'Price'}
          name="price"
          value={form.price || ''}
          onChange={(e) => handleInputChange('price', e.target.value)}
          type="number"
          required
        />
        <CustomInput
          label={isRtl ? 'سعر التكلفة' : 'Cost Price'}
          name="costPrice"
          value={form.costPrice || ''}
          onChange={(e) => handleInputChange('costPrice', e.target.value)}
          type="number"
        />
        <CustomInput
          label={isRtl ? 'سعر الجملة' : 'Wholesale Price'}
          name="compareAtPrice"
          value={form.compareAtPrice || ''}
          onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
          type="number"
        />
       
        <MultiSelect
          label={isRtl ? t('products.productLabel') : 'Product Label'}
          value={Array.isArray(form.tags) ? form.tags : []}
          onChange={handleTagsChange}
          options={[
            ...tags.map((opt: any) => ({
              value: String(opt._id || opt.id),
              label: isRtl ? opt.nameAr : opt.nameEn
            }))
          ]}
          placeholder={isRtl ? 'اختر علامات المنتج' : 'Select product labels'}
        />

        <CustomSwitch
          label={isRtl ? t('products.visibility') : 'Visibility'}
          name="visibility"
          checked={form.visibility === 'Y'}
          onChange={onFormChange}
          isRTL={isRtl}
        />

        <CustomInput
            label={isRtl ? 'الباركود' : 'Barcode'}
          name="barcode"
          value={form.barcode || ''}
          onChange={(e) => handleInputChange('barcode', e.target.value)}
        />
        <CustomSwitch
          label={isRtl ? t('products.maintainStock') : 'Maintain Stock'}
          name="maintainStock"
          checked={form.maintainStock === 'Y'}
          onChange={e => {
            onFormChange(e);
            if (e.target.value === 'N') {
              handleInputChange('availableQuantity', '');
            }
          }}
          isRTL={isRtl}
        />
        <CustomInput
          label={isRtl ? t('products.availableQuantity') : 'Available Quantity'}
          name="availableQuantity"
          value={form.availableQuantity || ''}
          onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
          type="number"
          disabled={form.maintainStock !== 'Y'}
        />
        <div className="col-span-full">
          <CustomShuttle
            label={isRtl ? t('products.productSpecifications') : 'Product Specifications'}
            name="productSpecifications"
            value={form.productSpecifications || []}
            options={specOptions}
            onChange={handleShuttleChange}
            isRTL={isRtl}
          />
        </div>
        <div className="col-span-full">
          <CustomColorPicker
            label={isRtl ? t('products.colors') : 'Colors'}
            name="colors"
            value={form.colors || []}
            onChange={handleColorChange}
            isRTL={isRtl}
          />
        </div>
        <div className="col-span-full">
          <CustomFileInput
            label={isRtl ? t('products.pictures') : 'Pictures'}
            id="images"
            value={form.images || []}
            onChange={files => onImageChange(files)}
            multiple={true}
          />
        </div>
        <div className="col-span-full">
          <CustomInput
            label={isRtl ? t('products.productVideo') : 'Product Video'}
            name="productVideo"
            value={form.productVideo || ''}
            onChange={(e) => handleInputChange('productVideo', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsForm; 