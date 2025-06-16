import React from 'react';
import CustomButton from '../../../components/common/CustomButton';

interface CategoriesNavProps {
  activeTab: 'categories' | 'subcategories';
  setActiveTab: (tab: 'categories' | 'subcategories') => void;
  isRTL: boolean;
  categoriesCount: number;
  subCategoriesCount: number;
  onAdd: () => void;
  search: string;
  setSearch: (s: string) => void;
}

const CategoriesNav: React.FC<CategoriesNavProps> = ({ activeTab, setActiveTab, isRTL, categoriesCount, subCategoriesCount, onAdd, search, setSearch }) => (
  <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-2 py-3 rounded-2xl shadow bg-primary-light w-full mx-auto`} style={{ minHeight: '56px' }}>
    <div className={`flex gap-2 items-center`}>
      <CustomButton
        text={isRTL ? 'الفئات' : 'Categories'}
        color={activeTab === 'categories' ? 'primary' : 'white'}
        textColor={activeTab === 'categories' ? 'white' : 'primary'}
        onClick={() => setActiveTab('categories')}
      />
      <span className={`${isRTL ? 'mr-2' : 'ml-2'} bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold`}>{categoriesCount}</span>
      <CustomButton
        text={isRTL ? 'الفئات الفرعية' : 'Subcategories'}
        color={activeTab === 'subcategories' ? 'primary' : 'white'}
        textColor={activeTab === 'subcategories' ? 'white' : 'primary'}
        onClick={() => setActiveTab('subcategories')}
      />
      <span className={`${isRTL ? 'mr-2' : 'ml-2'} bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold`}>{subCategoriesCount}</span>
    </div>
    <div className="flex-1 flex justify-end">
      <input
        type="text"
        placeholder={activeTab === 'categories' ? (isRTL ? 'بحث في الفئات...' : 'Search categories...') : (isRTL ? 'بحث في الفئات الفرعية...' : 'Search subcategories...')}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
        style={isRTL ? { direction: 'rtl' } : {}}
      />
    </div>
    <CustomButton
      text={activeTab === 'categories' ? (isRTL ? 'إضافة فئة' : 'Add Category') : (isRTL ? 'إضافة فئة فرعية' : 'Add Subcategory')}
      color="primary"
      textColor="white"
      onClick={onAdd}
    />
  </div>
);

export default CategoriesNav; 