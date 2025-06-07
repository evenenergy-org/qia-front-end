'use client';

import { useEffect } from 'react';
import { Layout, Menu, theme } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import menuItems from '@/config/menu';

const { Header, Content, Sider } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token, initialized, initialize } = useAuthStore();
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

  if (!initialized || !isAuthenticated || !token) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: colorBgContainer,
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px'
      }}>
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold',
          color: '#1890ff'
        }}>
          恰谷平台
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems.map(item => ({
              key: item.path,
              icon: <item.icon />,
              label: item.label,
              onClick: () => router.push(item.path),
            }))}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
} 