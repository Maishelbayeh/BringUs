import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiEdit, FiTrash2, FiPlus, FiFolder,} from 'react-icons/fi';
import CustomBreadcrumb from '../../components/common/CustomBreadcrumb';
import HeaderWithAction from '@/components/common/HeaderWithAction';
import CategoriesDrawer from './components/CategoriesDrawer';
import PermissionModal from '../../components/common/PermissionModal';

import CategoryTree from './CategoryTree';

import useCategories from '@/hooks/useCategories';

// تعريف نوع الفئة المتداخلة
interface Category {
  id: number | string;
  nameAr: string;
  nameEn: string;
  image: string; // صورة مصغرة كـ string مباشر
  order: number; // ترتيب إلزامي
  visible: boolean; // مفعّل إلزامي
  parentId: number | string | null;
  descriptionAr: string;
  descriptionEn: string;
  icon?: string;
}

// مكون بطاقات الفئات المتداخلة
const CategoryCards: React.FC<{
  categories: Category[];
  isRTL: boolean;
  onAdd: (parentId?: string | number | null) => void;
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
            {(() => {
              const imageUrl = cat.image || '';
              //CONSOLE.log('CATEGORY IMAGE URL:', imageUrl);
              return imageUrl ? (
                <img src={imageUrl} alt={cat.nameAr} className="w-14 h-14 rounded-xl object-cover border-2 border-primary/30 shadow" />
              ) : (
                <span className="flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40 text-primary rounded-xl w-14 h-14 shadow-lg"><FiFolder className="w-7 h-7" /></span>
              );
            })()}
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
              <button onClick={() => onDelete(cat)} className="p-2 rounded-full hover:bg-red-100 text-red-600 bg-white " title="حذف"><FiTrash2 /></button>
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
function flattenCategories(categories: any[], isRTL: boolean): { id: any; name: string; parentId: any }[] {
  if (!Array.isArray(categories)) return [];
  let result: { id: any; name: string; parentId: any }[] = [];
  for (const cat of categories) {
    result.push({ id: cat.id, name: isRTL ? cat.nameAr : cat.nameEn, parentId: cat.parentId ?? null });
    if ('children' in cat && Array.isArray((cat as any).children) && (cat as any).children.length > 0) {
      result = result.concat(flattenCategories((cat as any).children, isRTL));
    }
  }
  return result;
}



const CategoriesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || i18n.language === 'ARABIC';
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ id?: string | number; nameAr: string; nameEn: string; parentId: string | number | null; image: string; order: number; visible: boolean; descriptionAr: string; descriptionEn: string; icon: string }>(
    { nameAr: '', nameEn: '', parentId: null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '', icon: '' }
  );
  const [editId, setEditId] = useState<string | number | null>(null);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // استخدم الهوك الجديد
  const { categories,fetchCategories, saveCategory, deleteCategory, uploadCategoryImage } = useCategories();

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const filterCategories = (categories: any[], searchTerm: string): any[] => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return categories.map(category => {
      // Check if the category itself matches
      const selfMatch = (isRTL ? category.nameAr : category.nameEn).toLowerCase().includes(lowerCaseSearchTerm);

      // Recursively filter children
      const filteredChildren = category.children ? filterCategories(category.children, searchTerm) : [];

      // If the category itself matches or has matching children, include it
      if (selfMatch || filteredChildren.length > 0) {
        return {
          ...category,
          children: filteredChildren,
        };
      }

      return null;
    }).filter(category => category !== null);
  };

  const filteredCategories = search ? filterCategories(categories, search) : categories;

  // إدارة الإضافة والتعديل
  const handleAdd = (parentId?: string | number | null) => {
    setForm({ nameAr: '', nameEn: '', parentId: parentId !== undefined ? parentId : null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '', icon: '' });
    setEditId(null);
    setShowForm(true);
  };
  const handleEdit = (cat: Category) => {
    //CONSOLE.log('handleEdit - Original category:', cat);
    //CONSOLE.log('handleEdit - cat.image:', cat.image);
    //CONSOLE.log('handleEdit - cat.image type:', typeof cat.image);
    
    const formData = {
      ...cat,
      id: cat.id || (cat as any)._id,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      parentId: (cat as any).parent && typeof (cat as any).parent === 'object' ? (cat as any).parent.id : (cat.parentId !== undefined ? cat.parentId : null),
      image: typeof cat.image === 'string' ? cat.image : (cat.image && typeof cat.image === 'object' && (cat.image as any).url ? (cat.image as any).url : ''),
      order: cat.order,
      visible: cat.visible,
      descriptionAr: cat.descriptionAr || '',
      descriptionEn: cat.descriptionEn || '',
      icon: cat.icon || '',
    };
    
    //CONSOLE.log('handleEdit - Final form data:', formData);
    setForm(formData);
    setEditId(cat.id || (cat as any)._id);
    setShowForm(true);
  };
  // حذف فئة
  const handleDelete = (cat: Category) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };
  // حفظ (إضافة أو تعديل)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr.trim() && !form.nameEn.trim()) return;
    
    try {
      await saveCategory(form, editId);
      setShowForm(false);
      setForm({ nameAr: '', nameEn: '', parentId: null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '', icon: '' });
      setEditId(null);
    } catch (error) {
      //CONSOLE.error('Error in handleSave:', error);
      // الخطأ سيتم عرضه من خلال التوست في saveCategory
    }
  };
  // إغلاق الفورم
  const handleCancel = () => {
    setShowForm(false);
    setForm({ nameAr: '', nameEn: '', parentId: null, image: '', order: 1, visible: true, descriptionAr: '', descriptionEn: '', icon: '' });
    setEditId(null);
  };
  // إغلاق المودال الحذف
  const handleDeleteConfirm = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id);
      setSelectedCategory(null);
    }
    setShowDeleteModal(false);
  };
  // رفع صورة التصنيف
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = await uploadCategoryImage(file);
      setForm(f => ({ ...f, image: url }));
    }
  };

  // Breadcrumb
  const breadcrumb = [
    { name: t('sideBar.dashboard') || 'Dashboard', href: '/' },
    { name: t('sideBar.categories') || 'Categories', href: '/categories' },
  ];

  return (
    <div className="sm:p-4 w-full ">
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
        count={(categories || []).length}
      />
      
      {/* زر اختبار التوست - يمكن حذفه لاحقاً */}
      {/* <div className="mb-4">
        <button
          onClick={testToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          اختبار التوست / Test Toast
        </button>
      </div> */}
      
      {/* شجرة الفئات */}
      <div className="">
        <CategoryTree
          categories={filteredCategories}
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
        onImageChange={handleImageChange}
        onSubmit={handleSave}
        categories={flattenCategories(categories || [], isRTL) as any}
        allCategories={categories || []}
      />
      <PermissionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title={t('categories.deleteConfirmTitle') || 'Confirm Delete Category'}
        message={t('categories.deleteConfirmMessage') || 'Are you sure you want to delete this category?'}
        itemName={selectedCategory ? (isRTL ? selectedCategory.nameAr : selectedCategory.nameEn) : ''}
        itemType={t('categories.category') || 'category'}
        isRTL={isRTL}
        severity="danger"
      />
    </div>
  );
};

export default CategoriesPage; 