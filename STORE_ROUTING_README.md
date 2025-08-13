# Store-Based Routing System

## Overview

This document describes the implementation of store-based routing in the BringUs application. All pages now include the store slug in their URLs, providing better organization and multi-tenant support.

## URL Structure

### Before
```
/                    -> Dashboard
/products           -> Products page
/categories         -> Categories page
/orders             -> Orders page
```

### After
```
/{store-slug}                    -> Dashboard
/{store-slug}/products           -> Products page
/{store-slug}/categories         -> Categories page
/{store-slug}/orders             -> Orders page
/{store-slug}/orders/{id}        -> Order detail page
```

## Implementation Details

### 1. Store Context (`src/contexts/StoreContext.tsx`)

The StoreContext manages the current store information and provides it throughout the application:

```typescript
interface StoreContextType {
  currentStore: any;
  storeSlug: string | null;
  setCurrentStore: (store: any) => void;
  setStoreSlug: (slug: string) => void;
  loading: boolean;
  error: string | null;
}
```

### 2. Store Router (`src/routers/StoreRouter.tsx`)

The StoreRouter handles all store-based routing logic:

- **SuperAdmin Routes**: `/superadmin/stores` (no store slug needed)
- **Admin Routes**: All routes include store slug
- **Authentication**: Redirects to login if not authenticated
- **Store Validation**: Ensures store slug is available for admin users

### 3. URL Generation Hook (`src/hooks/useStoreUrls.ts`)

Provides utility functions to generate store-based URLs:

```typescript
const { urls, generateUrl, storeSlug } = useStoreUrls();

// Predefined URLs
urls.dashboard        // /{store-slug}
urls.products         // /{store-slug}/products
urls.categories       // /{store-slug}/categories
urls.orders           // /{store-slug}/orders

// Dynamic URL generation
generateUrl('products')           // /{store-slug}/products
generateUrl('orders/123')         // /{store-slug}/orders/123
```

### 4. Updated Components

#### Sidebar Navigation
- Updated to use `useStoreUrls` hook
- All navigation links now include store slug
- Maintains existing functionality with store-based URLs

#### Dashboard Stat Cards
- Updated to use store-based URLs for navigation
- Links to products, orders, customers, etc. now include store slug

## Usage Examples

### 1. Navigation in Components

```typescript
import { useStoreUrls } from '../hooks/useStoreUrls';
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const { urls, generateUrl } = useStoreUrls();
  const navigate = useNavigate();

  const handleNavigate = () => {
    // Using predefined URLs
    navigate(urls.products);
    
    // Using dynamic URL generation
    navigate(generateUrl('products'));
    
    // With parameters
    navigate(generateUrl(`orders/${orderId}`));
  };

  return (
    <div>
      <a href={urls.dashboard}>Dashboard</a>
      <a href={urls.products}>Products</a>
    </div>
  );
};
```

### 2. Route Parameters

For routes with parameters, the store slug is automatically included:

```typescript
// Route definition
<Route path={`/${storeSlug}/orders/:id`} element={<OrderDetailPage />} />

// Navigation
navigate(generateUrl(`orders/${orderId}`));
// Results in: /my-store/orders/123
```

### 3. Current URL Access

```typescript
import { useLocation } from 'react-router-dom';

const MyComponent = () => {
  const location = useLocation();
  
  // Current URL: /my-store/products
  console.log(location.pathname); // "/my-store/products"
  
  // Extract store slug and path
  const pathParts = location.pathname.split('/');
  const storeSlug = pathParts[1]; // "my-store"
  const pagePath = pathParts.slice(2).join('/'); // "products"
};
```

## Authentication Flow

1. **Login**: User logs in and store information is saved to localStorage
2. **Store Context**: StoreContext initializes with store data from localStorage
3. **Routing**: StoreRouter checks authentication and store availability
4. **Navigation**: All navigation uses store-based URLs

## SuperAdmin vs Admin Routing

### SuperAdmin
- Routes: `/superadmin/stores`
- No store slug required
- Manages all stores

### Admin
- All routes include store slug
- Access limited to their assigned store
- Store slug automatically included in all URLs

## Testing

A test component `StoreInfoDisplay` has been added to the homepage to verify:

- Current store information
- Generated URLs
- Store slug availability
- URL structure

## Migration Notes

### Existing Code
- All existing navigation logic continues to work
- URLs are automatically converted to store-based format
- No breaking changes to component logic

### New Development
- Always use `useStoreUrls` hook for navigation
- Use predefined URLs when possible
- Use `generateUrl` for dynamic paths

## Benefits

1. **Multi-tenant Support**: Each store has its own URL space
2. **Better Organization**: Clear separation between stores
3. **SEO Friendly**: Store-specific URLs
4. **Scalability**: Easy to add more stores
5. **Security**: Store isolation at URL level

## Future Enhancements

1. **Store Switching**: Allow users to switch between stores
2. **Custom Domains**: Support for custom store domains
3. **Subdomain Routing**: Use subdomains instead of path-based routing
4. **Store Analytics**: Track store-specific metrics

## Troubleshooting

### Common Issues

1. **Store slug not available**
   - Check if user is logged in
   - Verify store data in localStorage
   - Ensure StoreProvider is wrapping the app

2. **Navigation not working**
   - Use `useStoreUrls` hook
   - Check if store slug is set
   - Verify route definitions

3. **URLs not updating**
   - Clear browser cache
   - Check StoreContext state
   - Verify store data persistence

### Debug Tools

```typescript
// Add to any component for debugging
import { useStoreContext } from '../contexts/StoreContext';
import { useStoreUrls } from '../hooks/useStoreUrls';

const { currentStore, storeSlug } = useStoreContext();
const { urls } = useStoreUrls();

console.log('Store:', currentStore);
console.log('Slug:', storeSlug);
console.log('URLs:', urls);
``` 