import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import CategoriesDrawer from './components/CategoriesDrawer';
import CategoriesNav from './components/CategoriesNav';
import useLanguage from '../../hooks/useLanguage';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';

// Types
interface Node {
  id: number;
  name: string;
  parentId: number | null;
  type: 'category' | 'subcategory';
  childrenIds: number[];
  productsIds: number[];
}
interface Product {
  id: number;
  name: string;
  parentId: number;
  image: string;
}

// n-level nodes (categories & subcategories)
const nodes: Node[] = [
  { id: 1, name: 'Electronics', parentId: null, type: 'category', childrenIds: [2, 3], productsIds: [1, 2] },
  { id: 2, name: 'Phones', parentId: 1, type: 'subcategory', childrenIds: [4], productsIds: [3] },
  { id: 3, name: 'Laptops', parentId: 1, type: 'subcategory', childrenIds: [], productsIds: [4] },
  { id: 4, name: 'Android Phones', parentId: 2, type: 'subcategory', childrenIds: [], productsIds: [5] },
  { id: 5, name: 'Fashion', parentId: null, type: 'category', childrenIds: [6], productsIds: [] },
  { id: 6, name: 'Men', parentId: 5, type: 'subcategory', childrenIds: [], productsIds: [6] },
];

const products: Product[] = [
  { id: 1, name: 'iPhone 15', parentId: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'MacBook Pro', parentId: 1, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Samsung S24', parentId: 2, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Dell XPS', parentId: 3, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Pixel 8', parentId: 4, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Men T-shirt', parentId: 6, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' },
];

function getNodeById(id: number | null): Node | undefined {
  if (id === null) return undefined;
  return nodes.find(n => n.id === id);
}
function getChildren(nodeId: number | null): Node[] {
  if (nodeId === null) return nodes.filter(n => n.parentId === null);
  return nodes.filter(n => n.parentId === nodeId);
}
function getProducts(nodeId: number | null): Product[] {
  if (nodeId === null) return [];
  return products.filter(p => p.parentId === nodeId);
}
function getBreadcrumb(nodeId: number | null): Node[] {
  const path: Node[] = [];
  let current = getNodeById(nodeId);
  while (current) {
    path.unshift(current);
    current = current.parentId !== null ? getNodeById(current.parentId) : undefined;
  }
  return path;
}

// const categoryNames: { [key: number]: { en: string; ar: string } } = {
//   1: { en: 'Electronics', ar: 'إلكترونيات' },
//   2: { en: 'Fashion', ar: 'موضة' },
//   3: { en: 'Groceries', ar: 'بقالة' },
//   4: { en: 'Books', ar: 'كتب' },
//   5: { en: 'Toys', ar: 'ألعاب' },
//   6: { en: 'Beauty', ar: 'تجميل' },
//   7: { en: 'Sports', ar: 'رياضة' },
// };
// const categoryDescriptions: { [key: number]: { en: string; ar: string } } = {
//   1: { en: 'Devices and gadgets', ar: 'أجهزة وإلكترونيات' },
//   2: { en: 'Clothes and accessories', ar: 'ملابس وإكسسوارات' },
//   3: { en: 'Food and drinks', ar: 'أطعمة ومشروبات' },
//   4: { en: 'Books and literature', ar: 'كتب وأدب' },
//   5: { en: 'Toys and games', ar: 'ألعاب وهوايات' },
//   6: { en: 'Beauty and personal care', ar: 'تجميل وعناية شخصية' },
//   7: { en: 'Sports and outdoors', ar: 'رياضة وأنشطة خارجية' },
// };
// const subCategoryNames: { [key: number]: { en: string; ar: string } } = {
//   1: { en: 'Smartphones', ar: 'هواتف ذكية' },
//   2: { en: 'Laptops', ar: 'حاسبات محمولة' },
//   3: { en: 'Men', ar: 'رجالي' },
//   4: { en: 'Women', ar: 'نسائي' },
//   5: { en: 'Fruits', ar: 'فواكه' },
//   6: { en: 'Vegetables', ar: 'خضروات' },
//   7: { en: 'Novels', ar: 'روايات' },
//   8: { en: 'Comics', ar: 'قصص مصورة' },
//   9: { en: 'Dolls', ar: 'دمى' },
//   10: { en: 'Board Games', ar: 'ألعاب لوحية' },
//   11: { en: 'Makeup', ar: 'مكياج' },
//   12: { en: 'Skincare', ar: 'عناية بالبشرة' },
//   13: { en: 'Football', ar: 'كرة قدم' },
//   14: { en: 'Tennis', ar: 'تنس' },
// };
// const subCategoryDescriptions: { [key: number]: { en: string; ar: string } } = {
//   1: { en: 'Mobile phones and smartphones', ar: 'هواتف محمولة وذكية' },
//   2: { en: 'Laptops and notebooks', ar: 'حاسبات محمولة ودفاتر' },
//   3: { en: 'Men clothing', ar: 'ملابس رجالية' },
//   4: { en: 'Women clothing', ar: 'ملابس نسائية' },
//   5: { en: 'Fresh fruits', ar: 'فواكه طازجة' },
//   6: { en: 'Fresh vegetables', ar: 'خضروات طازجة' },
//   7: { en: 'Fiction and novels', ar: 'روايات وقصص' },
//   8: { en: 'Comics and graphic novels', ar: 'قصص مصورة وروايات مصورة' },
//   9: { en: 'Dolls and plush toys', ar: 'دمى وألعاب قماشية' },
//   10: { en: 'Board and family games', ar: 'ألعاب لوحية وعائلية' },
//   11: { en: 'Makeup and cosmetics', ar: 'مكياج ومستحضرات تجميل' },
//   12: { en: 'Skincare products', ar: 'منتجات العناية بالبشرة' },
//   13: { en: 'Football and soccer', ar: 'كرة قدم' },
//   14: { en: 'Tennis and rackets', ar: 'تنس ومضارب' },
// };

const CategoriesPage: React.FC = () => {
  // const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ARABIC';
  const { t } = useTranslation();
  const [currentNodeId, setCurrentNodeId] = useState<number | null>(null); // null = root
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '' });

  const currentChildren = getChildren(currentNodeId);
  const currentProducts = getProducts(currentNodeId);
  const breadcrumb = currentNodeId !== null ? getBreadcrumb(currentNodeId) : [];
  const parentId = currentNodeId !== null ? getNodeById(currentNodeId)?.parentId ?? null : null;
  const categoriesCount = currentChildren.filter(child => child.type === 'category').length;
  const subCategoriesCount = currentChildren.filter(child => child.type === 'subcategory').length;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, image: URL.createObjectURL(e.target.files[0]) });
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ... add logic to add category or subcategory ...
    setShowDrawer(false);
  };

  return (
    <div className={`p-4 w-full ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}> 
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.categories') || 'Categories', href: '/categories' }
      ]} isRtl={isRTL} />
      {parentId !== null && parentId !== undefined && (
        <button className="mb-4 px-4 py-2 bg-primary text-white rounded-full" onClick={() => setCurrentNodeId(parentId)}>{isRTL ? 'رجوع' : 'Back'}</button>
      )}
      <CategoriesNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRTL={isRTL}
        categoriesCount={categoriesCount}
        subCategoriesCount={subCategoriesCount}
        onAdd={() => setShowDrawer(true)}
        search={search}
        setSearch={setSearch}
      />
      <CategoriesDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        isRTL={isRTL}
        title={activeTab === 'categories' ? (isRTL ? 'إضافة فئة' : 'Add Category') : (isRTL ? 'إضافة فئة فرعية' : 'Add Subcategory')}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
      />
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
        {currentChildren.map(child => (
          <div key={child.id} className="p-4 flex flex-col items-center gap-2 cursor-pointer hover:ring-2 hover:ring-primary rounded-xl" onClick={() => setCurrentNodeId(child.id)}>
            <div className="h-40 w-40 flex items-center justify-center bg-primary/10 rounded-full text-primary text-3xl font-bold">{child.name[0]}</div>
            <h2 className="text-lg font-semibold text-primary">{child.name}</h2>
            <p className="text-gray-500 text-sm">{child.type === 'category' ? t('categories.category') : t('categories.subcategory')}</p>
            <p className="text-xs text-gray-400">{child.childrenIds.length > 0 ? `${child.childrenIds.length} ${isRTL ? 'تصنيف فرعي' : 'Subcategories'}` : ''}</p>
            <p className="text-xs text-gray-400">{child.productsIds.length > 0 ? `${child.productsIds.length} ${isRTL ? 'منتج' : 'Products'}` : ''}</p>
          </div>
        ))}
        {currentProducts.map(product => (
          <div key={product.id} className="p-4 flex flex-col items-center gap-2 ring-1 ring-primary/20 hover:ring-primary transition rounded-xl cursor-pointer" onClick={() => alert(product.name)}>
            <img src={product.image} alt={product.name} className="h-40 w-40 object-cover rounded-full" />
            <h2 className="text-lg font-semibold text-primary">{product.name}</h2>
          </div>
        ))}
        {currentChildren.length === 0 && currentProducts.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">{isRTL ? 'لا يوجد عناصر' : 'No items found.'}</div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage; 