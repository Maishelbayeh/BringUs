import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductsNav from './ProductsNav';
import ProductsDrawer from './ProductsDrawer';
import { ChevronRightIcon } from '@heroicons/react/solid';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');
  const subcategoryIdParam = params.get('subcategoryId');

  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', id: null },
    { name: t('products.title') || 'Products', id: 1 }
  ];

  useEffect(() => {
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
    if (subcategoryIdParam) setSelectedSubcategoryId(subcategoryIdParam);
  }, [categoryIdParam, subcategoryIdParam]);

  const filteredProducts = products.filter(product =>
    (selectedCategoryId ? product.categoryId === Number(selectedCategoryId) : true) &&
    (selectedSubcategoryId ? product.subcategoryId === Number(selectedSubcategoryId) : true) &&
    product.name.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="p-4 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="flex items-center text-gray-500 text-sm mb-4" aria-label="Breadcrumb">
        {breadcrumb.map((item, idx) => (
          <React.Fragment key={item.id}>
            <span className={`text-primary font-semibold cursor-pointer ${idx === breadcrumb.length - 1 ? 'underline' : ''}`} onClick={() => setSelectedCategoryId('')}>{item.name}</span>
            {idx < breadcrumb.length - 1 && <ChevronRightIcon className={`h-4 w-4 mx-2 ${isRTL ? 'rotate-180' : ''}`} />}
          </React.Fragment>
        ))}
      </nav>
      <ProductsNav
        isRTL={isRTL}
        t={t}
        onAdd={() => setShowDrawer(true)}
        search={search}
        setSearch={setSearch}
        categories={categories}
        subcategories={subcategories}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        selectedSubcategoryId={selectedSubcategoryId}
        setSelectedSubcategoryId={setSelectedSubcategoryId}
      />
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="p-4 flex flex-col items-center gap-2 ring-1 ring-primary/20 hover:ring-primary transition"
          >
            <img
              src={product.image || 'https://via.placeholder.com/150'}
              alt={product.name}
              className="h-40 w-40 object-cover rounded-full"
            />
            <h2 className="text-lg font-semibold text-primary">{product.name}</h2>
            {product.description && <p className="text-gray-500 text-sm">{product.description}</p>}
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