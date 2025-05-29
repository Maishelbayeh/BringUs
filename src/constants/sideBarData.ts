// src/constants/sideBarData.ts
import { MenuItem } from '../Types';
import {
  ShoppingCartIcon,
  ViewListIcon,
  TemplateIcon,
  UsersIcon,
  AdjustmentsIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  CreditCardIcon,
  TruckIcon,
  EyeIcon,
  UserAddIcon,
  ChartBarIcon
} from '@heroicons/react/outline';

export const getMenuAsText = (): MenuItem[] => [
  {
    id: 1,
    title: 'sideBar.xstore',
    icon: ShoppingCartIcon,
    path: '/dashboard',
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
    icon: ViewListIcon,
    path: '/categories',
  },
  {
    id: 3,
    title: 'sideBar.products',
    icon: TemplateIcon,
    path: '/products',
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
    title: 'sideBar.storeSlider',
    icon: AdjustmentsIcon,
    path: '/store-slider',
  },
  {
    id: 7,
    title: 'sideBar.storePreview',
    icon: EyeIcon,
    path: '/store-preview',
  },
  {
    id: 8,
    title: 'sideBar.storeVideos',
    icon: VideoCameraIcon,
    path: '/store-videos',
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
    icon: UserAddIcon,
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
