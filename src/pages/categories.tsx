import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/outline';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '@heroicons/react/solid';
import { ViewListIcon, CollectionIcon } from '@heroicons/react/outline';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  createdAt: string;
}

interface SubCategory {
  id: number;
  name: string;
  description: string;
  image: string;
  categoryId: number;
  createdAt: string;
}

const initialCategories: Category[] = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Devices and gadgets',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-06-01',
  },
  {
    id: 2,
    name: 'Fashion',
    description: 'Clothes and accessories',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-06-02',
  },
  {
    id: 3,
    name: 'Groceries',
    description: 'Food and drinks',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-06-03',
  },
  {
    id: 4,
    name: 'Books',
    description: 'Books and literature',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-06-04',
  },
  {
    id: 5,
    name: 'Toys',
    description: 'Toys and games',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-06-05',
  },
  {
    id: 6,
    name: 'Beauty',
    description: 'Beauty and personal care',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-06-06',
  },
  {
    id: 7,
    name: 'Sports',
    description: 'Sports and outdoors',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    createdAt: '2024-06-07',
  },
];

const initialSubCategories: SubCategory[] = [
  { id: 1, name: 'Smartphones', description: 'Mobile phones and smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', categoryId: 1, createdAt: '2024-06-01' },
  { id: 2, name: 'Laptops', description: 'Laptops and notebooks', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', categoryId: 1, createdAt: '2024-06-01' },
  { id: 3, name: 'Men', description: 'Men clothing', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', categoryId: 2, createdAt: '2024-06-02' },
  { id: 4, name: 'Women', description: 'Women clothing', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', categoryId: 2, createdAt: '2024-06-02' },
  { id: 5, name: 'Fruits', description: 'Fresh fruits', image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80', categoryId: 3, createdAt: '2024-06-03' },
  { id: 6, name: 'Vegetables', description: 'Fresh vegetables', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', categoryId: 3, createdAt: '2024-06-03' },
  { id: 7, name: 'Novels', description: 'Fiction and novels', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', categoryId: 4, createdAt: '2024-06-04' },
  { id: 8, name: 'Comics', description: 'Comics and graphic novels', image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=400&q=80', categoryId: 4, createdAt: '2024-06-04' },
  { id: 9, name: 'Dolls', description: 'Dolls and plush toys', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', categoryId: 5, createdAt: '2024-06-05' },
  { id: 10, name: 'Board Games', description: 'Board and family games', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', categoryId: 5, createdAt: '2024-06-05' },
  { id: 11, name: 'Makeup', description: 'Makeup and cosmetics', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', categoryId: 6, createdAt: '2024-06-06' },
  { id: 12, name: 'Skincare', description: 'Skincare products', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', categoryId: 6, createdAt: '2024-06-06' },
  { id: 13, name: 'Football', description: 'Football and soccer', image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', categoryId: 7, createdAt: '2024-06-07' },
  { id: 14, name: 'Tennis', description: 'Tennis and rackets', image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', categoryId: 7, createdAt: '2024-06-07' },
];

const categoryNames: { [key: number]: { en: string; ar: string } } = {
  1: { en: 'Electronics', ar: 'إلكترونيات' },
  2: { en: 'Fashion', ar: 'موضة' },
  3: { en: 'Groceries', ar: 'بقالة' },
  4: { en: 'Books', ar: 'كتب' },
  5: { en: 'Toys', ar: 'ألعاب' },
  6: { en: 'Beauty', ar: 'تجميل' },
  7: { en: 'Sports', ar: 'رياضة' },
};
const categoryDescriptions: { [key: number]: { en: string; ar: string } } = {
  1: { en: 'Devices and gadgets', ar: 'أجهزة وإلكترونيات' },
  2: { en: 'Clothes and accessories', ar: 'ملابس وإكسسوارات' },
  3: { en: 'Food and drinks', ar: 'أطعمة ومشروبات' },
  4: { en: 'Books and literature', ar: 'كتب وأدب' },
  5: { en: 'Toys and games', ar: 'ألعاب وهوايات' },
  6: { en: 'Beauty and personal care', ar: 'تجميل وعناية شخصية' },
  7: { en: 'Sports and outdoors', ar: 'رياضة وأنشطة خارجية' },
};
const subCategoryNames: { [key: number]: { en: string; ar: string } } = {
  1: { en: 'Smartphones', ar: 'هواتف ذكية' },
  2: { en: 'Laptops', ar: 'حاسبات محمولة' },
  3: { en: 'Men', ar: 'رجالي' },
  4: { en: 'Women', ar: 'نسائي' },
  5: { en: 'Fruits', ar: 'فواكه' },
  6: { en: 'Vegetables', ar: 'خضروات' },
  7: { en: 'Novels', ar: 'روايات' },
  8: { en: 'Comics', ar: 'قصص مصورة' },
  9: { en: 'Dolls', ar: 'دمى' },
  10: { en: 'Board Games', ar: 'ألعاب لوحية' },
  11: { en: 'Makeup', ar: 'مكياج' },
  12: { en: 'Skincare', ar: 'عناية بالبشرة' },
  13: { en: 'Football', ar: 'كرة قدم' },
  14: { en: 'Tennis', ar: 'تنس' },
};
const subCategoryDescriptions: { [key: number]: { en: string; ar: string } } = {
  1: { en: 'Mobile phones and smartphones', ar: 'هواتف محمولة وذكية' },
  2: { en: 'Laptops and notebooks', ar: 'حاسبات محمولة ودفاتر' },
  3: { en: 'Men clothing', ar: 'ملابس رجالية' },
  4: { en: 'Women clothing', ar: 'ملابس نسائية' },
  5: { en: 'Fresh fruits', ar: 'فواكه طازجة' },
  6: { en: 'Fresh vegetables', ar: 'خضروات طازجة' },
  7: { en: 'Fiction and novels', ar: 'روايات وقصص' },
  8: { en: 'Comics and graphic novels', ar: 'قصص مصورة وروايات مصورة' },
  9: { en: 'Dolls and plush toys', ar: 'دمى وألعاب قماشية' },
  10: { en: 'Board and family games', ar: 'ألعاب لوحية وعائلية' },
  11: { en: 'Makeup and cosmetics', ar: 'مكياج ومستحضرات تجميل' },
  12: { en: 'Skincare products', ar: 'منتجات العناية بالبشرة' },
  13: { en: 'Football and soccer', ar: 'كرة قدم' },
  14: { en: 'Tennis and rackets', ar: 'تنس ومضارب' },
};

const CategoriesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'createdAtAsc' | 'createdAtDesc'>('name');
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>(initialSubCategories);
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState({ name: '', description: '', image: '', categoryId: '' });
  const [subSearch, setSubSearch] = useState('');

  const handleAddCategory = () => {
    setShowForm(true);
    setForm({ name: '', description: '', image: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setForm({ ...form, image: url });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCategories([
      ...categories,
      {
        id: Date.now(),
        name: form.name,
        description: form.description,
        image: form.image || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setShowForm(false);
  };

  const handleAddSubCategory = () => {
    setShowSubForm(true);
    setSubForm({ name: '', description: '', image: '', categoryId: selectedCategoryId ? String(selectedCategoryId) : '' });
  };

  const handleSubFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSubForm({ ...subForm, [e.target.name]: e.target.value });
  };

  const handleSubImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setSubForm({ ...subForm, image: url });
    }
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubCategories([
      ...subCategories,
      {
        id: Date.now(),
        name: subForm.name,
        description: subForm.description,
        image: subForm.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
        categoryId: Number(subForm.categoryId),
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setShowSubForm(false);
  };

  const isRTL = i18n.language === 'ARABIC';

  // Filter and sort categories
  const filteredCategories = categories
    .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'createdAtAsc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'createdAtDesc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  // Helper to get subcategory count for selected category
  const subCount = selectedCategoryId ? subCategories.filter(sub => sub.categoryId === selectedCategoryId).length : subCategories.length;

  return (
    <div className={`p-4 w-full ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}> 
      {/* Breadcrumb */}
      <nav className={`flex items-center text-gray-500 text-sm mb-4 `}
        aria-label="Breadcrumb">
        <span className="text-primary font-bold">{t('sideBar.dashboard') || 'Dashboard'}</span>
        <ChevronRightIcon className={`h-4 w-4 mx-2 ${isRTL ? 'rotate-180' : ''}`} />
        <span className="text-gray-700 font-semibold">{t('sideBar.categories') || 'Categories'}</span>
        {activeTab === 'subcategories' && selectedCategoryId && (
          <>
            <ChevronRightIcon className={`h-4 w-4 mx-2 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-primary font-semibold">{categories.find(c => c.id === selectedCategoryId)?.name}</span>
          </>
        )}
      </nav>

      {/* Tabs + Controls Bar */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 px-2 py-3 rounded-2xl shadow bg-primary-light w-full mx-auto `}
        style={{ minHeight: '56px' }}>
        <div className={`flex gap-2 items-center `}>
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition border-2 text-base relative
              ${activeTab === 'categories' ? 'bg-primary text-white border-primary shadow' : ' text-primary border-transparent hover:bg-primary/10'}
            `}
            onClick={() => {
              setActiveTab('categories');
              setSelectedCategoryId(null);
            }}
          >
            <ViewListIcon className="h-5 w-5" />
            <span>{isRTL ? 'الفئات' : 'Categories'}</span>
            <span className={`${isRTL ? 'mr-2' : 'ml-2'} bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold`}>{categories.length}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition border-2 text-base relative
              ${activeTab === 'subcategories' ? 'bg-primary text-white border-primary shadow' : ' text-primary border-transparent hover:bg-primary/10'}
            `}
            onClick={() => setActiveTab('subcategories')}
          >
            <CollectionIcon className="h-5 w-5" />
            <span>{isRTL ? 'الفئات الفرعية' : 'Subcategories'}</span>
            <span className={`${isRTL ? 'mr-2' : 'ml-2'} bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold`}>{subCount}</span>
          </button>
        </div>
        {/* Centered Search Field */}
        <div className="flex-1 flex justify-end">
          <input
            type="text"
            placeholder={activeTab === 'categories' ? (isRTL ? 'بحث في الفئات...' : 'Search categories...') : (isRTL ? 'بحث في الفئات الفرعية...' : 'Search subcategories...')}
            value={activeTab === 'categories' ? search : subSearch}
            onChange={e => activeTab === 'categories' ? setSearch(e.target.value) : setSubSearch(e.target.value)}
            className="rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
            style={isRTL ? { direction: 'rtl' } : {}}
          />
        </div>
        {/* Sort and Add Button */}
        <div className={`flex gap-2 items-center `}>
          <select
            value={activeTab === 'categories' ? sort : sort}
            onChange={e => setSort(e.target.value as 'name' | 'createdAtAsc' | 'createdAtDesc')}
            className="rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-40"
            style={isRTL ? { direction: 'rtl' } : {}}
          >
            <option value="name">{isRTL ? 'الترتيب حسب الاسم' : 'Sort by Name'}</option>
            <option value="createdAtDesc">{isRTL ? 'الأحدث أولاً' : 'Newest First'}</option>
            <option value="createdAtAsc">{isRTL ? 'الأقدم أولاً' : 'Oldest First'}</option>
          </select>
          <button
            onClick={activeTab === 'categories' ? handleAddCategory : handleAddSubCategory}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition"
          >
            <PlusIcon className="h-5 w-5" />
            <span>{activeTab === 'categories' ? (isRTL ? 'إضافة فئة' : 'Add Category') : (isRTL ? 'إضافة فئة فرعية' : 'Add Subcategory')}</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {activeTab === 'categories' && (
        <div className=" bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`p-4 flex flex-col items-center gap-2 cursor-pointer ${selectedCategoryId === cat.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setActiveTab('subcategories');
              }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-40 w-40 object-cover rounded-full"
              />
              <h2 className="text-lg font-semibold text-primary">{categoryNames[cat.id] ? (isRTL ? categoryNames[cat.id].ar : categoryNames[cat.id].en) : cat.name}</h2>
              <p className="text-gray-500 text-sm">{categoryDescriptions[cat.id] ? (isRTL ? categoryDescriptions[cat.id].ar : categoryDescriptions[cat.id].en) : cat.description}</p>
              <p className="text-xs text-gray-400">{t('Created At') || 'Created At'}: {cat.createdAt}</p>
            </div>
          ))}
        </div>
      )}

      {/* Subcategories Tab: Category Filter Buttons + Search */}
      {activeTab === 'subcategories' && (
        <>
          <div className={`flex flex-col gap-4 mb-6`}>
            <div className={`flex flex-wrap gap-2 `}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full border font-semibold transition ${selectedCategoryId === cat.id ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/30'}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {categoryNames[cat.id] ? (isRTL ? categoryNames[cat.id].ar : categoryNames[cat.id].en) : cat.name}
                </button>
              ))}
            </div>
           
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              {selectedCategoryId ? (
                <h2 className="text-xl font-bold text-primary">{selectedCategoryId ? (isRTL ? 'الفئات الفرعية لـ' : 'Subcategories for') + ' ' + (categoryNames[selectedCategoryId] ? (isRTL ? categoryNames[selectedCategoryId].ar : categoryNames[selectedCategoryId].en) : categories.find(c => c.id === selectedCategoryId)?.name) : (isRTL ? 'كل الفئات الفرعية' : 'All Subcategories')}</h2>
              ) : (
                <h2 className="text-xl font-bold text-primary">{isRTL ? 'كل الفئات الفرعية' : 'All Subcategories'}</h2>
              )}
            </div>
            <div className="bg-white rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6">
              {(selectedCategoryId
                ? subCategories.filter(sub => sub.categoryId === selectedCategoryId && (sub.name.toLowerCase().includes(subSearch.toLowerCase()) || sub.description.toLowerCase().includes(subSearch.toLowerCase())))
                : subCategories.filter(sub => sub.name.toLowerCase().includes(subSearch.toLowerCase()) || sub.description.toLowerCase().includes(subSearch.toLowerCase()))
              ).sort((a, b) => {
                if (sort === 'name') return a.name.localeCompare(b.name);
                if (sort === 'createdAtAsc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                if (sort === 'createdAtDesc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                return 0;
              }).map(sub => (
                <div key={sub.id} className=" p-4 flex flex-col items-center gap-2 ">
                  <img src={sub.image} alt={sub.name} className="h-40 w-40 object-cover rounded-full" />
                  <h3 className="text-lg font-semibold text-primary">{subCategoryNames[sub.id] ? (isRTL ? subCategoryNames[sub.id].ar : subCategoryNames[sub.id].en) : sub.name}</h3>
                  <p className="text-gray-500 text-sm">{subCategoryDescriptions[sub.id] ? (isRTL ? subCategoryDescriptions[sub.id].ar : subCategoryDescriptions[sub.id].en) : sub.description}</p>
                  <p className="text-xs text-gray-400">{t('Created At') || 'Created At'}: {sub.createdAt}</p>
                </div>
              ))}
              {((selectedCategoryId
                ? subCategories.filter(sub => sub.categoryId === selectedCategoryId && (sub.name.toLowerCase().includes(subSearch.toLowerCase()) || sub.description.toLowerCase().includes(subSearch.toLowerCase())))
                : subCategories.filter(sub => sub.name.toLowerCase().includes(subSearch.toLowerCase()) || sub.description.toLowerCase().includes(subSearch.toLowerCase()))
              ).length === 0) && (
                <div className="col-span-full text-center text-gray-400 py-8">{isRTL ? 'لا يوجد فئات فرعية' : 'No subcategories found.'}</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className={`bg-white rounded-2xl p-6 w-full max-w-md shadow-lg flex flex-col gap-4 ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <h2 className="text-xl font-bold text-primary mb-2">{t('Add Category') || 'Add Category'}</h2>
            <input
              name="name"
              type="text"
              placeholder={t('Category Name') || 'Category Name'}
              value={form.name}
              onChange={handleFormChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <textarea
              name="description"
              placeholder={t('Description') || 'Description'}
              value={form.description}
              onChange={handleFormChange}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded-lg px-3 py-2"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition flex-1"
              >
                {t('Save') || 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex-1"
              >
                {t('Cancel') || 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Subcategory Form Modal */}
      {showSubForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubSubmit}
            className={`bg-white rounded-xl p-6 w-full max-w-md shadow-lg flex flex-col gap-4 ${isRTL ? 'text-right' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <h2 className="text-xl font-bold text-primary mb-2">{isRTL ? 'إضافة فئة فرعية' : 'Add Subcategory'}</h2>
            <select
              name="categoryId"
              value={subForm.categoryId}
              onChange={handleSubFormChange}
              className="border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">{isRTL ? 'اختر الفئة الرئيسية' : 'Select Category'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{categoryNames[cat.id] ? (isRTL ? categoryNames[cat.id].ar : categoryNames[cat.id].en) : cat.name}</option>
              ))}
            </select>
            <input
              name="name"
              type="text"
              placeholder={isRTL ? 'اسم الفئة الفرعية' : 'Subcategory Name'}
              value={subForm.name}
              onChange={handleSubFormChange}
              className="border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <textarea
              name="description"
              placeholder={isRTL ? 'الوصف' : 'Description'}
              value={subForm.description}
              onChange={handleSubFormChange}
              className="border rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleSubImageChange}
              className="border rounded-full px-3 py-2"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition flex-1"
              >
                {isRTL ? 'حفظ' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setShowSubForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition flex-1"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage; 