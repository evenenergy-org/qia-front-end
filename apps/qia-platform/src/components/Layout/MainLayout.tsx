'use client';

import { useEffect, useState, memo } from 'react';
import { Layout, Menu, theme, Button, Dropdown } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import menuItems from '@/config/menu';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Content, Sider } = Layout;

const MainLayout = memo(function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  
  console.log('rrrrr',router)
  const pathname = usePathname();
  const { isAuthenticated, token, initialized, initialize, user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [defaultOpenKeys, setDefaultOpenKeys] = useState<string[]>([]);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [initialized, isAuthenticated, router]);

  useEffect(() => {
    const parentMenu = menuItems.find(item =>
      item.children?.some(child => child.path === pathname)
    );
    console.log('初始化展开')
    setDefaultOpenKeys(parentMenu ? [parentMenu.path] : []);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('退出失败:', error);
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const getMenuItems = (items: typeof menuItems) => {
    return items.map(item => {
      if (item.children) {
        return {
          key: item.path,
          icon: <item.icon />,
          label: item.label,
          children: item.children.map(child => ({
            key: child.path,
            label: child.label,
            onClick: () => router.push(child.path),
          })),
        };
      }
      return {
        key: item.path,
        icon: <item.icon />,
        label: item.label,
        onClick: () => router.push(item.path),
      };
    });
  };

  if (!initialized || !isAuthenticated || !token) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div style={{
          height: '64px',
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
        }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[pathname]}
          defaultOpenKeys={defaultOpenKeys}
          openKeys={defaultOpenKeys}
          onOpenChange={setDefaultOpenKeys}
          items={getMenuItems(menuItems)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{
          padding: 0,
          background: colorBgContainer,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{
              padding: '0 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <UserOutlined />
              <span>{user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
});

export default MainLayout; 