/**
 * أدوات التعامل مع الفئات الهرمية
 * Category hierarchy utilities
 */

export interface CategoryNode {
  _id?: string | number;
  id?: string | number;
  nameAr: string;
  nameEn: string;
  parent?: any;
  children?: CategoryNode[];
  isActive?: boolean;
  visible?: boolean;
  sortOrder?: number;
}

export interface FlatCategory {
  value: string;
  label: string;
  level: number;
  isActive?: boolean;
}

/**
 * تحويل الفئات الهرمية إلى قائمة مسطحة مرتبة
 * Convert hierarchical categories to a flat ordered list
 */
export function flattenCategoriesForSelect(
  categories: CategoryNode[], 
  isRTL: boolean = false,
  level: number = 0
): FlatCategory[] {
  if (!Array.isArray(categories)) return [];

  const result: FlatCategory[] = [];

  // ترتيب الفئات حسب sortOrder ثم حسب الاسم
  const sortedCategories = [...categories].sort((a, b) => {
    // أولاً ترتيب حسب sortOrder
    const orderA = a.sortOrder || 0;
    const orderB = b.sortOrder || 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // ثم ترتيب حسب الاسم
    const nameA = isRTL ? (a.nameAr || '') : (a.nameEn || '');
    const nameB = isRTL ? (b.nameAr || '') : (b.nameEn || '');
    return nameA.localeCompare(nameB, isRTL ? 'ar' : 'en');
  });

  sortedCategories.forEach(category => {
    // إضافة الفئة الحالية
    const categoryId = category._id || category.id;
    const categoryName = isRTL ? category.nameAr : category.nameEn;
    
    if (categoryId && categoryName) {
      // إنشاء التنسيق المناسب للمستوى الحالي
      let formattedLabel = '';
      
      if (level === 0) {
        // الفئات الأساسية - استخدام رمز معين أنيق
        formattedLabel = `❖ ${categoryName}`;
      } else {
        // الفئات الفرعية
        const indent = '  '.repeat(level);
        const prefix = level === 1 ? '›' : '»';
        formattedLabel = `${indent}${prefix} ${categoryName}`;
      }
      
      result.push({
        value: String(categoryId),
        label: formattedLabel,
        level,
        isActive: category.isActive !== false && category.visible !== false
      });
    }

    // إضافة الفئات الفرعية بشكل تكراري
    if (category.children && Array.isArray(category.children) && category.children.length > 0) {
      const subCategories = flattenCategoriesForSelect(category.children, isRTL, level + 1);
      result.push(...subCategories);
    }
  });

  return result;
}

/**
 * فلترة الفئات النشطة فقط
 * Filter only active categories
 */
export function getActiveCategoriesOnly(flatCategories: FlatCategory[]): FlatCategory[] {
  return flatCategories.filter(cat => cat.isActive !== false);
}

/**
 * إنشاء خيارات للـ Select مع خيار افتراضي
 * Create select options with default option
 */
export function createCategorySelectOptions(
  categories: CategoryNode[], 
  isRTL: boolean = false,
  includeDefault: boolean = true,
  defaultLabel?: string
): { value: string; label: string }[] {
  const flatCategories = flattenCategoriesForSelect(categories, isRTL);
  const activeCategories = getActiveCategoriesOnly(flatCategories);
  
  // إضافة فواصل بصرية بين الفئات الأساسية
  const optionsWithSeparators: { value: string; label: string }[] = [];
  let lastLevel = -1;
  
  activeCategories.forEach((cat, index) => {
    // إضافة فاصل بصري قبل الفئات الأساسية الجديدة (ما عدا الأولى)
    if (cat.level === 0 && index > 0 && lastLevel >= 0) {
      optionsWithSeparators.push({
        value: `separator-${index}`,
        label: '─────────────────────'
      });
    }
    
    optionsWithSeparators.push({
      value: cat.value,
      label: cat.label
    });
    
    lastLevel = cat.level;
  });

  if (includeDefault) {
    const defaultOption = {
      value: '',
      label: defaultLabel || (isRTL ? 'اختر الفئة' : 'Select Category')
    };
    return [defaultOption, ...optionsWithSeparators];
  }

  return optionsWithSeparators;
}

/**
 * البحث عن فئة معينة في الشجرة
 * Find a specific category in the tree
 */
export function findCategoryById(categories: CategoryNode[], categoryId: string): CategoryNode | null {
  if (!Array.isArray(categories) || !categoryId) return null;

  for (const category of categories) {
    const id = category._id || category.id;
    if (String(id) === String(categoryId)) {
      return category;
    }

    if (category.children && Array.isArray(category.children)) {
      const found = findCategoryById(category.children, categoryId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * الحصول على مسار الفئة (الفئة الأساسية > الفئة الفرعية)
 * Get category path (Main Category > Sub Category)
 */
export function getCategoryPath(
  categories: CategoryNode[], 
  categoryId: string, 
  isRTL: boolean = false
): string {
  const category = findCategoryById(categories, categoryId);
  if (!category) return '';

  const path: string[] = [];
  
  // العثور على المسار من الجذر إلى الفئة
  function buildPath(cats: CategoryNode[], targetId: string, currentPath: CategoryNode[]): boolean {
    for (const cat of cats) {
      const id = cat._id || cat.id;
      const newPath = [...currentPath, cat];
      
      if (String(id) === String(targetId)) {
        path.push(...newPath.map(c => isRTL ? c.nameAr : c.nameEn));
        return true;
      }

      if (cat.children && Array.isArray(cat.children)) {
        if (buildPath(cat.children, targetId, newPath)) {
          return true;
        }
      }
    }
    return false;
  }

  buildPath(categories, categoryId, []);
  
  return path.join(isRTL ? ' ← ' : ' → ');
} 