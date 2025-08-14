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
 
  ChatBubbleLeftRightIcon,
  CubeIcon,
 
  BuildingStorefrontIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export const getMenuAsText = (): MenuItem[] => [
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
    roles: ['admin']
    // children: [
    //   {
    //     id: 21,
    //     title: 'sideBar.subcategories',
    //     icon: Squares2X2Icon,
    //     path: '/subcategories',
    //   }
    // ]
  },
  {
    id: 2.5,
    title: 'sideBar.units',
    icon: CubeIcon,
    path: '/units',
    roles: ['admin']
  },
  {
    id: 2.6,
    title: 'sideBar.labels',
    icon: ViewColumnsIcon,
    path: '/labels',
    roles: ['admin']
  },  
  {
    id: 3,
    title: 'sideBar.products',
    icon: DocumentDuplicateIcon,
    path: '/products',
    roles: ['admin'],
   
  },      {
        id: 32,
        title: 'sideBar.productSpecifications',
        icon: DocumentTextIcon,
        path: '/specifications',
        roles: ['admin']
      },
  {
    id: 4,
    title: 'sideBar.customers',
    icon: UsersIcon,
    path: '/customers',
    roles: ['admin']
  },
  {
    id: 5,
    title: 'sideBar.orders',
    icon: ShoppingCartIcon,
    path: '/orders',
    roles: ['admin']
  },
  {
    id: 6,
    title: 'sideBar.store',
    icon: AdjustmentsHorizontalIcon,
    roles: ['admin'],
    children: [
      {
        id: 61,
        title: 'sideBar.storeSlider',
        icon: AdjustmentsHorizontalIcon,
        path: '/store-slider',
        roles: ['admin']
      },
      {
        id: 62,
        title: 'sideBar.storePreview',
        icon: EyeIcon,
        path: '/store-preview',
        roles: ['admin']
      },
      {
        id: 63,
        title: 'sideBar.storeVideos',
        icon: VideoCameraIcon,
        path: '/store-videos',
        roles: ['admin']
      },
      {
        id: 64,
        title: 'sideBar.users',
        icon: UsersIcon,
        path: '/users',
        roles: ['admin']
      },

    ],

  },
  {
    id: 7,
    title: 'sideBar.wholesalers',
    icon: AdjustmentsHorizontalIcon,
    path: '/wholesalers',
    roles: ['admin']
  },



  {
    id: 9,
    title: 'sideBar.affiliate',
    icon: DocumentTextIcon,
    path: '/affiliate',
    roles: ['admin']
  },

  {
      id: 10,
    title: 'sideBar.stockPreview',
    icon: ChartBarIcon,
    path: '/stock-preview',
    roles: ['admin']
  },
  {
    id: 12,
    title: 'sideBar.advertisement',
    icon: DocumentTextIcon,
    path: '/advertisement',
    roles: ['admin']
  },
  {
    id: 13,
    title: 'sideBar.termsConditions',
    icon: DocumentTextIcon,
    path: '/terms-conditions',
    roles: ['admin']
  },
  {
    id: 1001,
    title: 'sideBar.testimonials',
    icon: ChatBubbleLeftRightIcon,
    path: '/testimonials',
    roles: ['admin']
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
}
