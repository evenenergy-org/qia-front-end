import { UserOutlined, DashboardOutlined } from '@ant-design/icons';

const menuItems = [
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
] as const;

export default menuItems; 