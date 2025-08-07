# CustomCategorySelector Component

A dynamic and effective category selection component that supports up to 10 levels of nested categories with a pop-up modal interface.

## Features

- **Multi-level Category Support**: Supports up to 10 levels of nested categories
- **Pop-up Modal Interface**: Clean, modern modal with collapsible categories
- **Multiple Selection**: Select multiple categories at once
- **Search Functionality**: Search through categories by name
- **RTL Support**: Full right-to-left language support
- **Responsive Design**: Works on all screen sizes
- **Customizable**: Highly configurable with various props

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `categories` | `CategoryNode[]` | `[]` | Array of category nodes with hierarchical structure |
| `selectedCategories` | `string[]` | `[]` | Array of selected category IDs |
| `onSelectionChange` | `(selectedIds: string[]) => void` | - | Callback when selection changes |
| `isRTL` | `boolean` | `false` | Enable right-to-left layout |
| `placeholder` | `string` | `'Select Categories'` | Placeholder text when no categories selected |
| `label` | `string` | `'Categories'` | Label for the component |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable the component |
| `maxSelections` | `number` | `10` | Maximum number of categories that can be selected |
| `showSearch` | `boolean` | `true` | Show search input in modal |
| `showCount` | `boolean` | `true` | Show selection count below trigger |

## CategoryNode Interface

```typescript
interface CategoryNode {
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
```

## Usage Example

```tsx
import CustomCategorySelector from '@/components/common/CustomCategorySelector';

const MyComponent = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const categories = [
    {
      _id: '1',
      nameAr: 'الإلكترونيات',
      nameEn: 'Electronics',
      children: [
        {
          _id: '1-1',
          nameAr: 'الهواتف',
          nameEn: 'Phones',
          children: [
            {
              _id: '1-1-1',
              nameAr: 'آيفون',
              nameEn: 'iPhone'
            }
          ]
        }
      ]
    }
  ];

  return (
    <CustomCategorySelector
      categories={categories}
      selectedCategories={selectedCategories}
      onSelectionChange={setSelectedCategories}
      isRTL={true}
      label="اختر الفئات"
      placeholder="اختر الفئات المطلوبة"
      maxSelections={5}
    />
  );
};
```

## Integration with ProductsForm

The component has been integrated into the ProductsForm to replace the simple select dropdown. It now supports:

1. **Multiple Category Selection**: Products can belong to multiple categories
2. **Hierarchical Display**: Shows categories in a tree structure
3. **Search Capability**: Find categories quickly
4. **Backward Compatibility**: Still works with existing single category selection

### Form Data Structure

The component updates the form with:
- `categoryId`: Single category ID (for backward compatibility)
- `categoryIds`: Array of selected category IDs (new multi-selection support)

## Styling

The component uses Tailwind CSS classes and is fully responsive. It includes:

- Hover effects on category items
- Visual indicators for selected categories
- Expand/collapse animations
- Level indicators for nested categories
- Responsive modal design

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- Focus management
- ARIA labels and roles

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills if needed)

## Dependencies

- React 16.8+
- TypeScript (for type definitions)
- Tailwind CSS (for styling) 