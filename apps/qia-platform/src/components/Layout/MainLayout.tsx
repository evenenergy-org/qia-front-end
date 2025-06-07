'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, theme, Button, Dropdown } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import menuItems from '@/config/menu';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header, Content, Sider } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token, initialized, initialize, user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG, colorPrimary },
  } = theme.useToken();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [initialized, isAuthenticated, router]);

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

  if (!initialized || !isAuthenticated || !token) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={200} 
        collapsible 
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ 
          background: colorBgContainer,
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1
        }}
        trigger={null}
      >
        <div style={{ 
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: colorPrimary,
          color: '#fff',
          fontSize: collapsed ? '14px' : '18px',
          fontWeight: 'bold',
          transition: 'all 0.2s',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          恰谷平台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
          items={menuItems.map(item => ({
            key: item.path,
            icon: <item.icon />,
            label: item.label,
            onClick: () => router.push(item.path),
          }))}
        />
        <div style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          width: '24px',
          height: '24px',
          background: colorBgContainer,
          border: '1px solid #f0f0f0',
          borderLeft: 'none',
          borderRadius: '0 4px 4px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          marginRight: '-1px'
        }} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <MenuUnfoldOutlined style={{ color: colorPrimary, fontSize: '14px' }} /> : <MenuFoldOutlined style={{ color: colorPrimary, fontSize: '14px' }} />}
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          background: colorPrimary,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end'
        }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ 
              color: '#fff',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'all 0.3s',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}>
              <UserOutlined style={{ marginRight: '8px' }} />
              {user?.username}
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            padding: '24px',
            margin: 0,
            minHeight: 'calc(100vh - 64px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
} 