import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit, FiTrash2, FiPlus, FiFolder,} from 'react-icons/fi';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CategoriesDrawer from './components/CategoriesDrawer';

import CategoryTree from './CategoryTree';
import { initialCategories } from './initialCategories';

// تعريف نوع الفئة المتداخلة
interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  image: string; // صورة مصغرة إلزامية
  order: number; // ترتيب إلزامي
  visible: boolean; // مفعّل إلزامي
  parentId: number | null;
  descriptionAr: string;
  descriptionEn: string;
}

// مكون بطاقات الفئات المتداخلة
const CategoryCards: React.FC<{
  categories: Category[];
  isRTL: boolean;
  onAdd: (parentId?: number | null) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  level?: number;
}> = ({ categories, isRTL, onAdd, onEdit, onDelete, level = 0 }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className={`flex flex-col gap-4`}> {/* مسافة بين البطاقات */}
      {categories.map(cat => (
        <div key={cat.id} className={`py-3 bg-white rounded-2xl shadow-md border border-primary/10 p-5 flex flex-col gap-2 relative`} style={{ [isRTL ? 'marginRight' : 'marginLeft']: level * 32 }}>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* صورة الفئة */}
            {cat.image ? (
              <img src={cat.image} alt={cat.nameAr} className="w-14 h-14 rounded-xl object-cover border-2 border-primary/30 shadow" />
            ) : (
              <span className="flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary rounded-xl w-14 h-14 shadow-lg"><FiFolder className="w-7 h-7" /></span>
            )}
            {/* اسم الفئة */}
            <div className="flex flex-col flex-1 min-w-0">
              <span
                className={`truncate font-bold cursor-pointer hover:underline hover:text-blue-600 transition ${level === 0 ? 'text-lg text-primary' : 'text-base text-gray-700'}`}
                onClick={e => {
                  e.stopPropagation();
                }}
                title={lang === 'ar' || lang === 'ARABIC' ? cat.nameAr : cat.nameEn}
              >
                {lang === 'ar' || lang === 'ARABIC' ? cat.nameAr : cat.nameEn}
              </span>
              {(lang === 'ar' || lang === 'ARABIC' ? cat.descriptionAr : cat.descriptionEn) && (
                <span className={`block w-full text-xs mt-0.5 ${level === 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                  {lang === 'ar' || lang === 'ARABIC' ? cat.descriptionAr : cat.descriptionEn}
                </span>
              )}
            </div>

            {/* حالة التفعيل */}
            <span className={cat.visible ? 'text-green-500' : 'text-gray-400'}>{cat.visible ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}</span>
            {/* أزرار الإدارة */}
            <div className="flex items-center gap-1">
              <button onClick={() => onAdd(cat.id)} className="p-2 rounded-full hover:bg-primary/10 text-primary bg-white shadow" title="إضافة فرعية"><FiPlus /></button>
              <button onClick={() => onEdit(cat)} className="p-2 rounded-full hover:bg-blue-100 text-blue-600 bg-white shadow" title="تعديل"><FiEdit /></button>
              <button onClick={() => onDelete(cat)} className="p-2 rounded-full hover:bg-red-100 text-red-600 bg-white shadow" title="حذف"><FiTrash2 /></button>
            </div>
          </div>
          {/* الفروع الفرعية كبطاقات أصغر */}
          {'children' in cat && Array.isArray((cat as any).children) && (cat as any).children.length > 0 && (
            <div className="mt-2">
              <CategoryCards
                categories={(cat as any).children}
                isRTL={isRTL}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// دالة لتسطيح شجرة الفئات
function flattenCategories(categories: Category[], isRTL: boolean): { id: number; name: string; parentId: number | null }[] {
  let result: { id: number; name: string; parentId: number | null }[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: isRTL ? cat.nameAr : cat.nameEn, parentId: cat.parentId ?? null });
    if ('children' in cat && Array.isArray((cat as any).children) && (cat as any).children.length > 0) {
      result = result.concat(flattenCategories((cat as any).children, isRTL));
    }
  }
  return result;
}

// أضف دالة buildCategoryTree(categories: Category[], parentId: number | null): Category[]
function buildCategoryTree(categories: Category[], parentId: number | null): Category[] {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => {
      const children = buildCategoryTree(categories, cat.id);
      return children.length > 0 ? { ...(cat as any), children } : { ...(cat as any) };
    });
}

const CategoriesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ nameAr: string; nameEn: string; parentId: number | null; image: string; order: number; visible: boolean; descriptionAr: string; descriptionEn: string }>(
    { nameAr: '', nameEn: '', parentId: null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '' }
  );
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
 
  // إدارة الإضافة والتعديل
  const handleAdd = (parentId?: number | null) => {
    setForm({ nameAr: '', nameEn: '', parentId: parentId !== undefined ? parentId : null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '' });
    setEditId(null);
    setShowForm(true);
  };
  const handleEdit = (cat: Category) => {
    setForm({
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      parentId: cat.parentId !== undefined ? cat.parentId : null,
      image: cat.image,
      order: cat.order,
      visible: cat.visible,
      descriptionAr: cat.descriptionAr || '',
      descriptionEn: cat.descriptionEn || '',
    });
    setEditId(cat.id);
    setShowForm(true);
  };
  // حذف فئة
  const handleDelete = (cat: Category) => {
    setCategories((prev: Category[]) => prev.filter(c => c.id !== cat.id && c.parentId !== cat.id));
  };
  // حفظ (إضافة أو تعديل)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr.trim() && !form.nameEn.trim()) return;
    if (editId) {
      // تعديل
      setCategories((prev: Category[]) => prev.map(c =>
        c.id === editId
          ? { ...c, nameAr: form.nameAr, nameEn: form.nameEn, image: form.image || c.image || 'https://via.placeholder.com/40x40?text=C', order: form.order, visible: form.visible, parentId: form.parentId, descriptionAr: form.descriptionAr || '', descriptionEn: form.descriptionEn || '' }
          : c
      ));
    } else {
      // إضافة
      const newCat: Category = {
        id: Date.now(),
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        image: form.image || 'https://via.placeholder.com/40x40?text=N',
        order: form.order,
        visible: form.visible,
        parentId: form.parentId,
        descriptionAr: form.descriptionAr || '',
        descriptionEn: form.descriptionEn || '',
      };
      setCategories((prev: Category[]) => [...prev, newCat]);
    }
    setShowForm(false);
    setForm({ nameAr: '', nameEn: '', parentId: null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '' });
    setEditId(null);
  };
  // إغلاق الفورم
  const handleCancel = () => {
    setShowForm(false);
    setForm({ nameAr: '', nameEn: '', parentId: null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '' });
    setEditId(null);
  };

  // دالة لإيجاد اسم الفئة حسب id
  // const getCategoryNameById = (id: number | null): string => {
  //   if (!id) return '';
  //   const search = (cats: Category[]): string | null => {
  //     for (const cat of cats) {
  //       if (cat.id === id) return isRTL ? cat.nameAr : cat.nameEn;
  //       const found = search(cat.children ?? []);
  //       if (found) return found;
  //     }
  //     return null;
  //   };
  //   return search(categories) || '';
  // };

  // Breadcrumb
  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
    { name: t('sideBar.categories') || 'Categories', href: '/categories' },
  ];

  return (
    <div className="p-6 w-full">
      <CustomBreadcrumb items={breadcrumb} isRtl={isRTL} />
      <HeaderWithAction
        title={t('sideBar.categories') || 'Categories'}
        addLabel={t('categories.add') || 'Add Category'}
        onAdd={() => handleAdd()}
        isRtl={isRTL}
        showSearch={true}
        searchValue={search}
        onSearchChange={e => setSearch(e.target.value)}
        searchPlaceholder={t('categories.search') || 'Search categories...'}
      />
      {/* شجرة الفئات */}
      <div className="bg-white rounded-2xl shadow p-6">
        <CategoryTree
          categories={buildCategoryTree(categories, null)}
          isRTL={isRTL}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <CategoriesDrawer
        open={showForm}
        onClose={handleCancel}
        isRTL={isRTL}
        title={editId ? t('categories.edit') || 'Edit Category' : t('categories.add') || 'Add Category'}
        form={form}
        onFormChange={e => {
          const { name, value, type } = e.target;
          setForm(f => ({
            ...f,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
          }));
        }}
        onImageChange={e => {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = ev => setForm(f => ({ ...f, image: ev.target?.result as string }));
            reader.readAsDataURL(file);
          }
        }}
        onSubmit={handleSave}
        categories={flattenCategories(categories, isRTL)}
      />
    </div>
  );
};

export default CategoriesPage; 