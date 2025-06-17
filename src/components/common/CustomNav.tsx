import React from 'react';
import CustomButton from './CustomButton';
import CustomSelect from './CustomSelect';

interface CustomNavProps {
  isRTL: boolean;
  onAdd: () => void;
  search: string;
  setSearch: (s: string) => void;
  t: (key: string) => string;
  title: string;
  categories?: { id: number; name: string }[];
  subcategories?: { id: number; name: string }[];
  selectedCategoryId?: string;
  setSelectedCategoryId?: (id: string) => void;
  selectedSubcategoryId?: string;
  setSelectedSubcategoryId?: (id: string) => void;
  addLabel?: string;
  showCategory?: boolean;
  showSubcategory?: boolean;
  showAddButton?: boolean;
  addButtonText?: string;
  searchPlaceholder?: string;
}

const CustomNav: React.FC<CustomNavProps> = ({
  isRTL,
  onAdd,
  search,
  setSearch,
  t,
  title,
  categories = [],
  subcategories = [],
  selectedCategoryId = '',
  setSelectedCategoryId,
  selectedSubcategoryId = '',
  setSelectedSubcategoryId,
  addLabel,
  showCategory = true,
  showSubcategory = true,
  showAddButton = true,
  addButtonText,
  searchPlaceholder,
}) => (
  <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-2 py-3 rounded-2xl shadow bg-primary-light w-full mx-auto`} style={{ minHeight: '56px' }}>
    <div className={`flex gap-2 items-center`}>
      <h2 className="text-xl font-bold text-primary">{title}</h2>
      {showCategory && setSelectedCategoryId && (
        <CustomSelect
          value={selectedCategoryId}
          onChange={e => setSelectedCategoryId(e.target.value)}
          options={[{ value: '', label: t('products.allCategories') }, ...categories.map(cat => ({ value: String(cat.id), label: cat.name }))]}
        />
      )}
      {showSubcategory && setSelectedSubcategoryId && (
        <CustomSelect
          value={selectedSubcategoryId}
          onChange={e => setSelectedSubcategoryId(e.target.value)}
          options={[{ value: '', label: t('products.allSubcategories') }, ...subcategories.map(sub => ({ value: String(sub.id), label: sub.name }))]}
        />
      )}
    </div>
    <div className="flex-1 flex justify-end">
      <input
        type="text"
        placeholder={searchPlaceholder || t('products.search')}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
      />
    </div>
    {showAddButton && <CustomButton text={addButtonText || addLabel || t('products.add')} color="primary" textColor="white" onClick={onAdd} />}
  </div>
);

export default CustomNav; 