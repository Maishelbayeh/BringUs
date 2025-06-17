import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { ChevronRightIcon } from '@heroicons/react/solid';
import CustomNav from '../../components/common/CustomNav';
import StoreSliderDrawer from './componant/StoreDrawer';
import { useTranslation } from 'react-i18next';





const initialProducts: any[] = [
  { id: 1, name: 'iPhone 15', categoryId: 1, subcategoryId: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', description: 'Latest Apple smartphone' },
  { id: 2, name: 'MacBook Pro', categoryId: 1, subcategoryId: 2, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', description: 'Apple laptop' },
  { id: 3, name: 'T-shirt', categoryId: 2, subcategoryId: 3, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', description: 'Cotton T-shirt' },
  { id: 4, name: 'Novel XYZ', categoryId: 4, subcategoryId: 7, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', description: 'Fiction novel' },
  { id: 5, name: 'Football', categoryId: 7, subcategoryId: 13, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', description: 'Sports ball' },
  { id: 6, name: 'General Product', categoryId: 5, subcategoryId: '', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', description: 'A general product' },
];

// Minimal form state for StoreSlider
const initialForm = { image: '' };

const StoreSliderPage: React.FC = () => {

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
    { name: t('sideBar.store') || 'Store', id: 1 },
    { name: t('sideBar.storeSlider') || 'Store Slider', id: 2 }
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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setForm({ ...form, image: '' });
      return;
    }
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    setForm({ ...form, image: imageUrl });
  };
  const handleSave = (formData: any) => {
    setProducts([...products, { ...formData, id: Date.now() }]);
    setShowDrawer(false);
    setForm(initialForm);
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
      <CustomNav
        isRTL={isRTL}
        t={t}
        onAdd={() => setShowDrawer(true)}
        search={search}
        setSearch={setSearch}
        title={t('sideBar.storeSlider') || 'Store Slider'}
        addButtonText={t('storeSlider.addButton') || t('products.add')}
        searchPlaceholder={t('storeSlider.searchPlaceholder') || t('products.search')}
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
            {/* {product.description && <p className="text-gray-500 text-sm">{product.description}</p>} */}
          </div>
        ))}
      </div>
      <StoreSliderDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        onSave={handleSave}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        isRTL={isRTL}
      />
    </div>
  );
};

export default StoreSliderPage; 