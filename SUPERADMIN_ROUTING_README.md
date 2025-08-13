# SuperAdmin Routing System

## نظرة عامة

السوبر أدمن لديه نظام routing مختلف عن التاجر العادي. السوبر أدمن يدير جميع المتاجر ولا يحتاج إلى store slug في URLs.

## الفرق بين Admin و SuperAdmin

### Admin (التاجر العادي)
```
URLs: /{store-slug}/products
      /{store-slug}/categories
      /{store-slug}/orders
```

### SuperAdmin (السوبر أدمن)
```
URLs: /superadmin/stores
      /superadmin/users (إذا كان موجود)
      /superadmin/settings (إذا كان موجود)
```

## كيفية عمل النظام

### 1. في StoreRouter

```typescript
export default function StoreRouter() {
  const { isAuthenticated, isAuthenticatedSuperAdmin } = useAuth();
  const { storeSlug } = useStoreContext();

  // If user is superadmin, use the original router structure
  if (isAuthenticatedSuperAdmin()) {
    return (
      <Routes>
        <Route path="/superadmin/stores" element={<StoresManagement />} />
        <Route path="*" element={<Navigate to="/superadmin/stores" replace />} />
      </Routes>
    );
  }

  // For admin users, use store-based routing
  if (!storeSlug) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Store-based routes with slug */}
      <Route path={`/${storeSlug}`} element={<Homepage />} />
      <Route path={`/${storeSlug}/products`} element={<ProductsPage />} />
      {/* ... */}
    </Routes>
  );
}
```

### 2. في useStoreUrls

```typescript
export const useStoreUrls = () => {
  const { storeSlug } = useStoreContext();
  const { isAuthenticatedSuperAdmin } = useAuth();

  const generateUrl = (path: string): string => {
    // If user is superadmin, don't add store slug
    if (isAuthenticatedSuperAdmin()) {
      return path;
    }
    
    // For admin users, add store slug
    if (!storeSlug) {
      return path;
    }
    
    return `/${storeSlug}/${path}`;
  };

  const urls = {
    // Admin URLs (with store slug)
    dashboard: generateUrl(''),
    products: generateUrl('products'),
    categories: generateUrl('categories'),
    
    // SuperAdmin URLs (without store slug)
    superAdminStores: '/superadmin/stores',
  };

  return { urls, generateUrl, storeSlug };
};
```

## مثال على الاستخدام

### في مكون Admin
```typescript
const MyComponent = () => {
  const { urls } = useStoreUrls();
  const navigate = useNavigate();

  const handleNavigate = () => {
    // سيصبح: /mystore/products
    navigate(urls.products);
  };

  return (
    <div>
      <a href={urls.dashboard}>Dashboard</a> {/* /mystore */}
      <a href={urls.products}>Products</a>   {/* /mystore/products */}
    </div>
  );
};
```

### في مكون SuperAdmin
```typescript
const SuperAdminComponent = () => {
  const { urls } = useStoreUrls();
  const navigate = useNavigate();

  const handleNavigate = () => {
    // سيصبح: /superadmin/stores
    navigate(urls.superAdminStores);
  };

  return (
    <div>
      <a href={urls.superAdminStores}>Manage Stores</a> {/* /superadmin/stores */}
    </div>
  );
};
```

## اختبار النظام

مكون `StoreDebugger` يعرض معلومات مختلفة حسب نوع المستخدم:

### للمستخدم العادي (Admin):
```
Current User: John Doe (admin)
Store Slug: mystore
Store Name: MyStore
Generated URLs:
- Dashboard: /mystore
- Products: /mystore/products
- Categories: /mystore/categories
```

### للسوبر أدمن (SuperAdmin):
```
Current User: Admin User (superadmin)
Store Slug: Not set
Store Name: Not set
Generated URLs:
- SuperAdmin Stores: /superadmin/stores
- SuperAdmin URLs don't include store slug
```

## إضافة صفحات جديدة للسوبر أدمن

### 1. إضافة Route في StoreRouter
```typescript
if (isAuthenticatedSuperAdmin()) {
  return (
    <Routes>
      <Route path="/superadmin/stores" element={<StoresManagement />} />
      <Route path="/superadmin/users" element={<UsersManagement />} />
      <Route path="/superadmin/settings" element={<SystemSettings />} />
      <Route path="*" element={<Navigate to="/superadmin/stores" replace />} />
    </Routes>
  );
}
```

### 2. إضافة URL في useStoreUrls
```typescript
const urls = {
  // ... existing URLs
  
  // SuperAdmin URLs (without store slug)
  superAdminStores: '/superadmin/stores',
  superAdminUsers: '/superadmin/users',
  superAdminSettings: '/superadmin/settings',
};
```

### 3. استخدام في المكونات
```typescript
const { urls } = useStoreUrls();

// في مكون السوبر أدمن
<a href={urls.superAdminUsers}>Manage Users</a>
<a href={urls.superAdminSettings}>System Settings</a>
```

## الفوائد

1. **فصل واضح**: Admin و SuperAdmin لهما routing مختلف
2. **أمان محسن**: السوبر أدمن لا يمكنه الوصول لصفحات المتجر
3. **سهولة الاستخدام**: URLs واضحة ومفهومة
4. **قابلية التوسع**: سهولة إضافة صفحات جديدة للسوبر أدمن

## استكشاف الأخطاء

### إذا لم تعمل صفحات السوبر أدمن:
1. تأكد من أن المستخدم لديه role = 'superadmin'
2. تحقق من أن `isAuthenticatedSuperAdmin()` تعيد true
3. تأكد من أن Route موجود في StoreRouter

### للتصحيح:
```typescript
import { useAuth } from '../hooks/useAuth';
import { useStoreUrls } from '../hooks/useStoreUrls';

const { isAuthenticatedSuperAdmin } = useAuth();
const { urls } = useStoreUrls();

console.log('Is SuperAdmin:', isAuthenticatedSuperAdmin());
console.log('SuperAdmin URLs:', urls.superAdminStores);
``` 