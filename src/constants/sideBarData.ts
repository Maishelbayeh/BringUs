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
  Squares2X2Icon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export const getMenuAsText = (): MenuItem[] => [
  {
    id: 0,
    title: 'sideBar.dashboard',
    icon: ChartBarIcon,
    path: '/',
  },
  {
    id: 2,
    title: 'sideBar.categories',
    icon: ViewColumnsIcon,
    path: '/categories',
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
  },
  {
    id: 2.6,
    title: 'sideBar.labels',
    icon: ViewColumnsIcon,
    path: '/labels',
  },  
  {
    id: 3,
    title: 'sideBar.products',
    icon: DocumentDuplicateIcon,
    path: '/products',
    children: [
      // {
      //   id: 31,
      //   title: 'sideBar.productVariants',
      //   icon: Squares2X2Icon,
      //   path: '/product-variants',
      // },
      {
        id: 32,
        title: 'sideBar.productSpecifications',
        icon: DocumentTextIcon,
        path: '/products/specifications',
        
      },
      
    ]
  },
  {
    id: 4,
    title: 'sideBar.customers',
    icon: UsersIcon,
    path: '/customers',
  },
  {
    id: 5,
    title: 'sideBar.orders',
    icon: ShoppingCartIcon,
    path: '/orders',
  },
  {
    id: 6,
    title: 'sideBar.store',
    icon: AdjustmentsHorizontalIcon,
   
    children: [
      {
        id: 61,
        title: 'sideBar.storeSlider',
        icon: AdjustmentsHorizontalIcon,
        path: '/store-slider',
      },
      {
        id: 62,
        title: 'sideBar.storePreview',
        icon: EyeIcon,
        path: '/store-preview',
      },
      {
        id: 63,
        title: 'sideBar.storeVideos',
        icon: VideoCameraIcon,
        path: '/store-videos',
      },
      {
        id: 64,
        title: 'sideBar.users',
        icon: UsersIcon,
        path: '/users',
      },

    ],

  },
  {
    id: 7,
    title: 'sideBar.wholesalers',
    icon: AdjustmentsHorizontalIcon,
    path: '/wholesalers',
 
  },



  {
    id: 9,
    title: 'sideBar.affiliate',
    icon: DocumentTextIcon,
    path: '/affiliate',
  
  },

  {
      id: 10,
    title: 'sideBar.stockPreview',
    icon: ChartBarIcon,
    path: '/stock-preview',
  },
  {
    id: 12,
    title: 'sideBar.advertisement',
    icon: DocumentTextIcon,
    path: '/advertisement',
  },
  {
    id: 13,
    title: 'sideBar.termsConditions',
    icon: DocumentTextIcon,
    path: '/terms-conditions',
  },
  {
    id: 1001,
    title: 'sideBar.testimonials',
    icon: ChatBubbleLeftRightIcon,
    path: '/testimonials',
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
