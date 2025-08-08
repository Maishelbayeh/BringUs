import React, { useState, useEffect, useCallback } from 'react';
import { CategoryNode } from '../../utils/categoryUtils';

interface CustomCategorySelectorProps {
  categories: CategoryNode[];
  selectedCategories: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  isRTL?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  maxSelections?: number;
  showSearch?: boolean;
  showCount?: boolean;
}

interface CategoryItemProps {
  category: CategoryNode;
  level: number;
  isExpanded: boolean;
  onToggle: (categoryId: string) => void;
  isSelected: boolean;
  onSelect: (categoryId: string, checked: boolean) => void;
  isRTL: boolean;
  maxLevel: number;
  isCategoryExpanded: (categoryId: string) => boolean;
  isCategorySelected: (categoryId: string) => boolean;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  level,
  isExpanded,
  onToggle,
  isSelected,
  onSelect,
  isRTL,
  maxLevel,
  isCategoryExpanded,
  isCategorySelected
}) => {
  const categoryId = category._id || category.id;
  const categoryName = isRTL ? category.nameAr : category.nameEn;
  const hasChildren = category.children && category.children.length > 0;
  const canExpand = level < maxLevel && hasChildren;

  const handleToggle = () => {
    if (canExpand) {
      onToggle(String(categoryId));
    }
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(String(categoryId), e.target.checked);
  };

  return (
    <div className="category-item">
      <div 
        className={`flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
          isSelected ? 'bg-blue-50 border border-blue-200' : ''
        }`}
        onClick={handleToggle}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          onClick={(e) => e.stopPropagation()}
          className="mr-3 ml-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        
        {/* Expand/Collapse Icon */}
        {canExpand && (
          <svg
            className={`w-4 h-4 mr-2 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
        
        {/* Category Name */}
        <span className="flex-1 text-sm font-medium text-gray-700">
          {categoryName}
        </span>
        
        {/* Level Indicator */}
        <span className="text-xs text-gray-400 ml-2">
          {isRTL ? `المستوى ${level + 1}` : `Level ${level + 1}`}
        </span>
      </div>
      
      {/* Children */}
      {canExpand && isExpanded && (
        <div className="ml-6 border-l-2 border-gray-200 pl-2">
          {category.children?.map((child) => (
            <CategoryItem
              key={child._id || child.id}
              category={child}
              level={level + 1}
              isExpanded={isCategoryExpanded(String(child._id || child.id))}
              onToggle={onToggle}
              isSelected={isCategorySelected(String(child._id || child.id))}
              onSelect={onSelect}
              isRTL={isRTL}
              maxLevel={maxLevel}
              isCategoryExpanded={isCategoryExpanded}
              isCategorySelected={isCategorySelected}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomCategorySelector: React.FC<CustomCategorySelectorProps> = ({
  categories,
  selectedCategories,
  onSelectionChange,
  isRTL = false,
  placeholder = 'Select Categories',
  label = 'Categories',
  className = '',
  disabled = false,
  maxSelections = 10,
  showSearch = true,
  showCount = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedCategories);

  // Update internal state when props change
  useEffect(() => {
    console.log('🔍 CustomCategorySelector - selectedCategories prop changed:', selectedCategories);
    setSelectedIds(selectedCategories);
  }, [selectedCategories]);

  // Filter categories based on search term
  const filteredCategories = useCallback(() => {
    if (!searchTerm.trim()) return categories;

    const searchLower = searchTerm.toLowerCase();
    
    const filterCategory = (cat: CategoryNode): CategoryNode | null => {
      const nameAr = cat.nameAr?.toLowerCase() || '';
      const nameEn = cat.nameEn?.toLowerCase() || '';
      
      if (nameAr.includes(searchLower) || nameEn.includes(searchLower)) {
        return cat;
      }
      
      if (cat.children && cat.children.length > 0) {
        const filteredChildren = cat.children
          .map(filterCategory)
          .filter(Boolean) as CategoryNode[];
        
        if (filteredChildren.length > 0) {
          return { ...cat, children: filteredChildren };
        }
      }
      
      return null;
    };

    return categories
      .map(filterCategory)
      .filter(Boolean) as CategoryNode[];
  }, [categories, searchTerm]);

  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedIds, categoryId].slice(0, maxSelections)
      : selectedIds.filter(id => id !== categoryId);
    
    console.log('🔍 CustomCategorySelector - handleSelectCategory:', { categoryId, checked, newSelectedIds });
    setSelectedIds(newSelectedIds);
    onSelectionChange(newSelectedIds);
  };

  const isCategorySelected = (categoryId: string): boolean => {
    return selectedIds.includes(categoryId);
  };

  const isCategoryExpanded = (categoryId: string): boolean => {
    return expandedCategories.has(categoryId);
  };

  const getSelectedCategoryNames = (): string[] => {
    return selectedIds.map(id => {
      const findCategory = (cats: CategoryNode[]): string | null => {
        for (const cat of cats) {
          if (String(cat._id || cat.id) === id) {
            return isRTL ? cat.nameAr : cat.nameEn;
          }
          if (cat.children && cat.children.length > 0) {
            const found = findCategory(cat.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findCategory(categories) || id;
    });
  };

  const handleClearAll = () => {
    setSelectedIds([]);
    onSelectionChange([]);
  };

  const selectedNames = getSelectedCategoryNames();
  
  // Debug logging
  console.log('🔍 CustomCategorySelector render:', {
    selectedIds,
    selectedNames,
    categoriesCount: categories.length,
    isOpen
  });

  return (
    <div className={`custom-category-selector ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
      >
        {selectedNames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedNames.slice(0, 3).map((name, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {name}
              </span>
            ))}
            {selectedNames.length > 3 && (
              <span className="text-gray-500 text-xs">
                {isRTL ? `+${selectedNames.length - 3} أخرى` : `+${selectedNames.length - 3} more`}
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
        
        {/* Dropdown Arrow */}
        {/* <svg
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 ${
            isRTL ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg> */}
      </button>

      {/* Selection Count */}
      {showCount && selectedNames.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {isRTL 
            ? `${selectedNames.length} فئة مختارة`
            : `${selectedNames.length} category${selectedNames.length !== 1 ? 'ies' : ''} selected`
          }
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col ${
            isRTL ? 'text-right' : 'text-left'
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isRTL ? 'اختيار الفئات' : 'Select Categories'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Search */}
            {showSearch && (
              <div className="p-4 border-b border-gray-200">
                <input
                  type="text"
                  placeholder={isRTL ? 'البحث في الفئات...' : 'Search categories...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredCategories().length > 0 ? (
                <div className="space-y-1">
                                     {filteredCategories().map((category) => (
                     <CategoryItem
                       key={category._id || category.id}
                       category={category}
                       level={0}
                       isExpanded={isCategoryExpanded(String(category._id || category.id))}
                       onToggle={handleToggleCategory}
                       isSelected={isCategorySelected(String(category._id || category.id))}
                       onSelect={handleSelectCategory}
                       isRTL={isRTL}
                       maxLevel={10}
                       isCategoryExpanded={isCategoryExpanded}
                       isCategorySelected={isCategorySelected}
                     />
                   ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {isRTL ? 'لا توجد فئات متاحة' : 'No categories available'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {isRTL 
                  ? `${selectedIds.length} من ${maxSelections} فئة مختارة`
                  : `${selectedIds.length} of ${maxSelections} categories selected`
                }
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                >
                  {isRTL ? 'مسح الكل' : 'Clear All'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isRTL ? 'تم' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCategorySelector; 