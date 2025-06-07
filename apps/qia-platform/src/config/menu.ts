import { UserOutlined, DashboardOutlined, ShopOutlined } from '@ant-design/icons';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { IconBaseProps } from '@ant-design/icons/lib/components/Icon';

type IconType = ForwardRefExoticComponent<Omit<IconBaseProps, "ref"> & RefAttributes<HTMLSpanElement>>;

interface MenuItem {
  key: string;
  icon: IconType;
  label: string;
  path: string;
  children?: {
    key: string;
    label: string;
    path: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: DashboardOutlined,
    label: '仪表盘',
    path: '/dashboard',
  },
  {
    key: '/platform_user',
    icon: UserOutlined,
    label: '平台用户管理',
    path: '/platform_user',
  },
  {
    key: '/factory',
    icon: ShopOutlined,
    label: '工厂',
    path: '/factory',
    children: [
      {
        key: '/factory/management',
        label: '工厂管理',
        path: '/factory/management',
      },
      {
        key: '/factory/user',
        label: '工厂用户管理',
        path: '/factory/user',
      },
    ],
  },
];

export default menuItems; 