import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import SubcategoriesDrawer from './SubcategoriesDrawer';


import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import SubcategoryCard from './components/SubcategoryCard';
import { useStoreUrls } from '@/hooks/useStoreUrls';

const initialCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 4, name: 'Books' },
  { id: 7, name: 'Sports' },
  { id: 5, name: 'Toys' },
];

export const initialSubcategories: any[] = [
  { id: 1, nameEn: 'Smartphones', nameAr: 'هواتف ذكية',descriptionEn: 'Smartphones are mobile devices that can make calls, send texts, and access the internet.',descriptionAr: 'هواتف ذكية هي أجهزة محمولة تستطيع الاتصال والإرسال والاستقبال والتصفح.', categoryId: 1, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' },
  { id: 2, nameEn: 'Laptops', nameAr: 'لابتوبات',descriptionEn: 'Laptops are portable computers that can be used for various tasks.',descriptionAr: 'لابتوبات هي أجهزة محمولة تستطيع الاستخدام لمختلف المهام.', categoryId: 1, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80' },
  { id: 3, nameEn: 'Men', nameAr: 'رجال',descriptionEn: 'Men are the male gender.',descriptionAr: 'الرجال هم الجنس الذكر.', categoryId: 2, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80' },
  { id: 4, nameEn: 'Women', nameAr: 'نساء',descriptionEn: 'Women are the   female gender.',descriptionAr: 'النساء هم الجنس الأنثى.', categoryId: 2, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { id: 7, nameEn: 'Novels', nameAr: 'روايات',descriptionEn: 'Novels are books that tell stories.',descriptionAr: 'الروايات هي كتب تخبر القصص.', categoryId: 4, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80' },
  { id: 13, nameEn: 'Football', nameAr: 'كرة القدم',descriptionEn: 'Football is a sport that is played with a ball.',descriptionAr: 'كرة القدم هي رياضة يلعب بها الأشخاص بكرة.', categoryId: 7, image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80' },
];

const SubcategoriesPage: React.FC = () => {
  const [categories] = useState(initialCategories);
  const [subcategories, setSubcategories] = useState<any[]>(initialSubcategories);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    image: '',
    categoryId: ''
  });
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const categoryIdParam = params.get('categoryId');
  const { storeSlug } = useStoreUrls();
  useEffect(() => {
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
  }, [categoryIdParam]);

  const filteredSubcategories = subcategories.filter(sub =>
    (selectedCategoryId ? sub.categoryId === Number(selectedCategoryId) : true) &&
    (i18n.language === 'ARABIC' ? sub.nameAr.toLowerCase().includes(search.toLowerCase()) : sub.nameEn.toLowerCase().includes(search.toLowerCase()))
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

  const handleAdd = () => {
    setEditingSubcategory(null);
    setForm({
      nameEn: '',
      nameAr: '',
      descriptionEn: '',
      descriptionAr: '',
      image: '',
      categoryId: ''
    });
    setShowDrawer(true);
  };

  const handleEdit = (sub: any) => {
    setEditingSubcategory(sub);
    setForm({
      nameEn: sub.nameEn || '',
      nameAr: sub.nameAr || '',
      descriptionEn: sub.descriptionEn || '',
      descriptionAr: sub.descriptionAr || '',
      image: sub.image || '',
      categoryId: sub.categoryId || ''
    });
    setShowDrawer(true);
  };

  const handleDrawerClose = () => {
    setShowDrawer(false);
    setEditingSubcategory(null);
  };

  return (
    <div className="sm:p-4 w-full" >
      <CustomBreadcrumb items={[
        { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
        { name: t('sideBar.subcategories') || 'Subcategories', href: '/subcategories' }
      ]} isRtl={isRTL} />
     
      <HeaderWithAction
        title={t('subcategories.title')}
        addLabel={t('subcategories.addSubcategory')}
        onAdd={handleAdd}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={isRTL ? 'ابحث باسم الفئة أو التصنيف...' : 'Search by category or sub-category...'}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        count={filteredSubcategories.length}
      />
      <div className={`bg-white rounded-2xl flex flex-wrap gap-6 p-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
        {filteredSubcategories.map((sub) => (
          <SubcategoryCard
            key={sub.id}
            sub={sub}
            isRTL={isRTL}
            onEdit={() => handleEdit(sub)}
            onDelete={() => {/* TODO: handleDelete(sub) */}}
            onClick={() => navigate(`/${storeSlug}/products?subcategoryId=${sub.id}`)}
          />
        ))}
      </div>
      <SubcategoriesDrawer
        open={showDrawer}
        onClose={handleDrawerClose}
        isRTL={isRTL}
        title={editingSubcategory ? (isRTL ? 'تعديل تصنيف فرعي' : 'Edit Subcategory') : (isRTL ? 'إضافة تصنيف فرعي' : 'Add Subcategory')}
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