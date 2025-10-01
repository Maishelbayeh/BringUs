import React from 'react';
import CustomButton from '../../components/common/CustomButton';

interface ProductsNavProps {
  isRTL: boolean;
  onAdd: () => void;
  search: string;
  setSearch: (s: string) => void;
  t: (key: string) => string;
  categories: { id: number; name: string }[];
  subcategories: { id: number; name: string }[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;
}

const ProductsNav: React.FC<ProductsNavProps> = ({ onAdd, search, setSearch, t}) => (
  <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-2 py-3 rounded-2xl shadow bg-primary-light w-full mx-auto`} style={{ minHeight: '56px' }}>

    <div className="flex-1 flex justify-end">
      <input
        type="text"
        placeholder={t('products.search')}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
      />
    </div>
    <CustomButton text={t('products.add')} color="primary" textColor="white" onClick={onAdd} />
  </div>
);

export default ProductsNav; 