import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SubcategoriesNav from './SubcategoriesNav';
import SubcategoriesDrawer from './SubcategoriesDrawer';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';

const initialCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 4, name: 'Books' },
  { id: 7, name: 'Sports' },
  { id: 5, name: 'Toys' },
];

const initialSubcategories: any[] = [
  { id: 1, name: 'Smartphones', categoryId: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Laptops', categoryId: 1, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Men', categoryId: 2, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Women', categoryId: 2, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Novels', categoryId: 4, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80' },
  { id: 13, name: 'Football', categoryId: 7, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80' },
];

const SubcategoriesPage: React.FC = () => {
  const [categories] = useState(initialCategories);
  const [subcategories, setSubcategories] = useState<any[]>(initialSubcategories);
  const [showDrawer, setShowDrawer] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '', categoryId: '' });
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');

  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', id: null, path: '/' },
    { name: t('subcategories.title') || 'Subcategories', id: 1, path: '/subcategories' }
  ];

  useEffect(() => {
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
  }, [categoryIdParam]);

  const filteredSubcategories = subcategories.filter(sub =>
    (selectedCategoryId ? sub.categoryId === Number(selectedCategoryId) : true) &&
    sub.name.toLowerCase().includes(search.toLowerCase())
  );

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
    setSubcategories([...subcategories, { ...form, id: Date.now() }]);
    setShowDrawer(false);
  };

  return (
    <div className="p-4 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.subcategories') || 'Subcategories', href: '/subcategories' }
      ]} isRtl={isRTL} />
      <SubcategoriesNav
        isRTL={isRTL}
        t={t}
        onAdd={() => setShowDrawer(true)}
        search={search}
        setSearch={setSearch}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
      />
      <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
        {filteredSubcategories.map((sub) => (
          <div
            key={sub.id}
            className="p-4 flex flex-col items-center gap-2 cursor-pointer ring-1 ring-primary/20 hover:ring-primary transition"
            onClick={() => navigate(`/products?subcategoryId=${sub.id}`)}
          >
            <img
              src={sub.image}
              alt={sub.name}
              className="h-40 w-40 object-cover rounded-full"
            />
            <h2 className="text-lg font-semibold text-primary">{sub.name}</h2>
          </div>
        ))}
      </div>
      <SubcategoriesDrawer
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        isRTL={isRTL}
        title={t('subcategories.add')}
        form={form}
        onFormChange={handleFormChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </div>
  );
};

export default SubcategoriesPage; 