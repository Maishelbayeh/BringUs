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
  CreditCardIcon,
  TruckIcon,
  EyeIcon,
  UserPlusIcon,
  ChartBarIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

export const getMenuAsText = (): MenuItem[] => [
  {
    id: 0,
    title: 'sideBar.dashboard',
    icon: ChartBarIcon,
    path: '/',
  },
  {
    id: 1,
    title: 'sideBar.xstore',
    icon: ShoppingCartIcon,
    children: [
      {
        id: 11,
        title: 'sideBar.paymentsSettings',
        icon: CreditCardIcon,
        path: '/payment-methods',
      },
      {
        id: 12,
        title: 'sideBar.deliverySettings',
        icon: TruckIcon,
        path: '/delivery-settings',
      },
    ],
  },
  {
    id: 2,
    title: 'sideBar.categories',
    icon: ViewColumnsIcon,
    path: '/categories',
    children: [
    

      {
        id: 21,
        title: 'sideBar.subcategories',
        icon: Squares2X2Icon,
        path: '/subcategories',
       

      }
    ]
  },
  {
    id: 3,
    title: 'sideBar.products',
    icon: DocumentDuplicateIcon,
    path: '/products',
    children: [
      {
        id: 31,
        title: 'sideBar.productVariants',
        icon: Squares2X2Icon,
        path: '/product-variants',
      }
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

    ],

  },
 
  
  {
    id: 9,
    title: 'sideBar.wholesalersRegistration',
    icon: DocumentTextIcon,
    path: '/wholesalers-registration',
  },
  {
    id: 10,
    title: 'sideBar.wholesalersDetails',
    icon: DocumentTextIcon,
    path: '/wholesalers-details',
  },
  {
    id: 11,
    title: 'sideBar.affiliateTeamRegistration',
    icon: UserPlusIcon,
    path: '/affiliate-team-registration',
  },
  {
    id: 12,
    title: 'sideBar.affiliateDetails',
    icon: DocumentTextIcon,
    path: '/affiliate-details',
  },
  {
    id: 13,
    title: 'sideBar.stockPreview',
    icon: ChartBarIcon,
    path: '/stock-preview',
  },
  {
    id: 14,
    title: 'sideBar.paymentMethods',
    icon: CreditCardIcon,
    path: '/payment-methods',
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
