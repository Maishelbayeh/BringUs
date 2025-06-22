import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsDrawer from './ProductsDrawer';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import * as XLSX from 'xlsx';

// Add ColorVariant type for form
interface ColorVariant {
  id: string;
  colors: string[];
}

const initialCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 4, name: 'Books' },
  { id: 7, name: 'Sports' },
  { id: 5, name: 'Toys' },
];
const initialSubcategories = [
  { id: 1, name: 'Smartphones', categoryId: 1 },
  { id: 2, name: 'Laptops', categoryId: 1 },
  { id: 3, name: 'Men', categoryId: 2 },
  { id: 4, name: 'Women', categoryId: 2 },
  { id: 7, name: 'Novels', categoryId: 4 },
  { id: 13, name: 'Football', categoryId: 7 },
];

const initialProducts: any[] = [
  { id: 1, name: 'iPhone 15', categoryId: 1, subcategoryId: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', description: 'Latest Apple smartphone' },
  { id: 2, name: 'MacBook Pro', categoryId: 1, subcategoryId: 2, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', description: 'Apple laptop' },
  { id: 3, name: 'T-shirt', categoryId: 2, subcategoryId: 3, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', description: 'Cotton T-shirt' },
  { id: 4, name: 'Novel XYZ', categoryId: 4, subcategoryId: 7, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', description: 'Fiction novel' },
  { id: 5, name: 'Football', categoryId: 7, subcategoryId: 13, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', description: 'Sports ball' },
  { id: 6, name: 'General Product', categoryId: 5, subcategoryId: '', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', description: 'A general product' },
];

const initialForm: {
  name: string;
  categoryId: string;
  subcategoryId: string;
  visibility: string;
  unit: string;
  price: string;
  originalPrice: string;
  wholesalePrice: string;
  productLabel: string;
  productOrder: string;
  maintainStock: string;
  availableQuantity: string;
  description: string;
  parcode: string;
  productSpecifications: string[];
  colors: ColorVariant[];
  images: string[];
  productVideo: string;
} = {
  name: '',
  categoryId: '',
  subcategoryId: '',
  visibility: 'Y',
  unit: '',
  price: '',
  originalPrice: '',
  wholesalePrice: '',
  productLabel: '',
  productOrder: '',
  maintainStock: 'Y',
  availableQuantity: '',
  description: '',
  parcode: '',
  productSpecifications: [],
  colors: [],
  images: [],
  productVideo: '',
};

const ProductsPage: React.FC = () => {
  const [categories] = useState(initialCategories);
  const [subcategories] = useState(initialSubcategories);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState(initialForm);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');
  const subcategoryIdParam = params.get('subcategoryId');

  const sortOptions = [
    { value: 'default', label: t('products.sort.default') || 'Default' },
    { value: 'alpha', label: t('products.sort.alpha') || 'A-Z' },
    { value: 'newest', label: t('products.sort.newest') || 'Newest' },
    { value: 'oldest', label: t('products.sort.oldest') || 'Oldest' },
  ];

  useEffect(() => {
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
    if (subcategoryIdParam) setSelectedSubcategoryId(subcategoryIdParam);
  }, [categoryIdParam, subcategoryIdParam]);

  let filteredProducts = products.filter(product =>
    (selectedCategoryId ? product.categoryId === Number(selectedCategoryId) : true) &&
    (selectedSubcategoryId ? product.subcategoryId === Number(selectedSubcategoryId) : true) &&
    product.name.toLowerCase().includes(search.toLowerCase())
  );
  if (sort === 'alpha') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'newest') {
    filteredProducts = [...filteredProducts].sort((a, b) => b.id - a.id);
  } else if (sort === 'oldest') {
    filteredProducts = [...filteredProducts].sort((a, b) => a.id - b.id);
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleImageChange = (files: File | File[] | null) => {
    if (!files) {
      setForm({ ...form, images: [] });
      return;
    }
    const fileArray = Array.isArray(files) ? files : [files];
    const imageUrls = fileArray.map(file => URL.createObjectURL(file));
    setForm({ ...form, images: imageUrls });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProducts([...products, { ...form, id: Date.now() }]);
    setShowDrawer(false);
  };

  const handleDownloadExcel = () => {
    const rows: any[] = [];
    filteredProducts.forEach((product) => {
      rows.push({
        [isRTL ? 'اسم المنتج' : 'Product Name']: product.name,
        [isRTL ? 'الفئة' : 'Category']: categories.find(c => c.id === product.categoryId)?.name || '',
        [isRTL ? 'الفئة الفرعية' : 'Subcategory']: subcategories.find(s => s.id === product.subcategoryId)?.name || '',
        [isRTL ? 'الوصف' : 'Description']: product.description,
      });
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, 'products.xlsx');
  };

  return (
    <div className="p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.products') || 'Products', href: '/products' }
      ]} isRtl={isRTL} />

      
      <HeaderWithAction
        title={t('sideBar.products') || 'Products'}
        addLabel={t('products.add') || 'Add'}
        onAdd={() => setShowDrawer(true)}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('products.search') || 'Search products...'}
        showSort={true}
        sortValue={sort}
        onSortChange={e => setSort(e.target.value)}
        sortOptions={sortOptions}
        onDownload={handleDownloadExcel}
      />
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col group"
          >
            <div className="relative">
              <img
                src={product.image || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="h-40 w-full object-cover rounded-xl"
              />
              <span className="absolute top-2 left-2 bg-primary text-white text-xs px-3 py-1 rounded-full shadow">
                {categories.find(c => c.id === product.categoryId)?.name}
              </span>
            </div>
            <h2 className="text-xl font-bold text-primary mt-3">{product.name}</h2>
            <p className="line-clamp-2 text-gray-500 text-sm mb-2">{product.description}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-lg font-bold text-green-600">$99.99</span>
              <button className="bg-primary text-white px-4 py-1 rounded-lg text-sm hover:bg-primary-dark transition">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
      <ProductsDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        isRTL={isRTL}
        title={t('products.add')}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        categories={categories}
        subcategories={subcategories}
      />
    </div>
  );
};

export default ProductsPage; 