// src/constants/sideBarData.ts
import { MenuItem } from '../Types';
import {
  ShoppingCartIcon,
  ViewColumnsIcon,
  DocumentDuplicateIcon,
  UsersIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  EyeIcon,
  ChartBarIcon,
  CalculatorIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

// Function to get store status from localStorage
const getStoreStatus = (): string => {
  try {
    const status = localStorage.getItem('status');
    console.log(localStorage.getItem('status'))
    return status || 'inactive';
  } catch (error) {
    return 'inactive';
  }
};

// Function to check if store is active
export const isStoreActive = (): boolean => {
  return getStoreStatus() === 'active';
};

// Function to get current store status for debugging
export const getCurrentStoreStatus = (): string => {
  return getStoreStatus();
};

export const getMenuAsText = (): MenuItem[] => {
  
  return [
    {
      id: 0,
      title: 'sideBar.dashboard',
      icon: ChartBarIcon,
      path: '/',
      roles: ['admin']
    },
    {
      id: 2,
      title: 'sideBar.categories',
      icon: ViewColumnsIcon,
      path: '/categories',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 2.5,
      title: 'sideBar.units',
      icon: CubeIcon,
      path: '/units',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 2.6,
      title: 'sideBar.labels',
      icon: ViewColumnsIcon,
      path: '/labels',
      roles: ['admin'],
      requireActiveStore: true
    },  
    {
      id: 3,
      title: 'sideBar.products',
      icon: DocumentDuplicateIcon,
      path: '/products',
      roles: ['admin'],
      requireActiveStore: true,
      children: [
        {
          id: 32,
          title: 'sideBar.productSpecifications',
          icon: DocumentTextIcon,
          path: '/specifications',
          roles: ['admin'],
          requireActiveStore: true
        },
      ]
    },
    {
      id: 4,
      title: 'sideBar.customers',
      icon: UsersIcon,
      path: '/customers',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 5,
      title: 'sideBar.orders',
      icon: ShoppingCartIcon,
      path: '/orders',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 5.5,
      title: 'sideBar.pointOfSale',
      icon: CalculatorIcon,
      path: '/pos',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 6,
      title: 'sideBar.store',
      icon: AdjustmentsHorizontalIcon,
      roles: ['admin'],
      requireActiveStore: true,
      children: [
        {
          id: 61,
          title: 'sideBar.storeSlider',
          icon: AdjustmentsHorizontalIcon,
          path: '/store-slider',
          roles: ['admin'],
          requireActiveStore: true
        },
        {
          id: 62,
          title: 'sideBar.storePreview',
          icon: EyeIcon,
          path: '/store-preview',
          roles: ['admin'],
          requireActiveStore: true
        },
        {
          id: 63,
          title: 'sideBar.storeVideos',
          icon: VideoCameraIcon,
          path: '/store-videos',
          roles: ['admin'],
          requireActiveStore: true
        },
        {
          id: 64,
          title: 'sideBar.users',
          icon: UsersIcon,
          path: '/users',
          roles: ['admin'],
          requireActiveStore: true
        },
      ],
    },
    {
      id: 7,
      title: 'sideBar.wholesalers',
      icon: AdjustmentsHorizontalIcon,
      path: '/wholesalers',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 9,
      title: 'sideBar.affiliate',
      icon: DocumentTextIcon,
      path: '/affiliate',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 10,
      title: 'sideBar.stockPreview',
      icon: ChartBarIcon,
      path: '/stock-preview',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 12,
      title: 'sideBar.advertisement',
      icon: DocumentTextIcon,
      path: '/advertisement',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 13,
      title: 'sideBar.termsConditions',
      icon: DocumentTextIcon,
      path: '/terms-conditions',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 1001,
      title: 'sideBar.testimonials',
      icon: ChatBubbleLeftRightIcon,
      path: '/testimonials',
      roles: ['admin'],
      requireActiveStore: true
    },
    {
      id: 1002,
      title: 'sideBar.storesManagement',
      icon: BuildingStorefrontIcon,
      path: '/superadmin/stores',
      roles: ['superadmin']
    },
    {
      id: 1003,
      title: 'sideBar.subscriptionPlans',
      icon: CreditCardIcon,
      path: '/superadmin/subscription-plans',
      roles: ['superadmin']
    },
    {
      id: 1004,
      title: 'sideBar.subscriptionHistory',
      icon: CreditCardIcon,
      path: '/subscription-history',
      roles: ['admin']
    },
  ];
};

// Function to filter menu items based on store status and user role
export const getFilteredMenuItems = (userRole: string): MenuItem[] => {
  const allMenuItems = getMenuAsText();
  const storeActive = isStoreActive();
  
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Check role permissions
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      
      // Check if store needs to be active for this item
      if (item.requireActiveStore && !storeActive) {
        return false;
      }
      
      // Filter children recursively
      if (item.children) {
        item.children = filterItems(item.children);
        // Remove parent if all children are filtered out
        if (item.children.length === 0) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  return filterItems(allMenuItems);
};

export class MenuModel {
  private static instance: MenuModel;
  private items: MenuItem[];

  private constructor() {
    this.items = getMenuAsText();
  }

  static getInstance(): MenuModel {
    if (!MenuModel.instance) {
      MenuModel.instance = new MenuModel();
    }
    return MenuModel.instance;
  }

  getMenuItems(): MenuItem[] {
    return this.items;
  }

  // New method to get filtered menu items
  getFilteredMenuItems(userRole: string): MenuItem[] {
    return getFilteredMenuItems(userRole);
  }
}
