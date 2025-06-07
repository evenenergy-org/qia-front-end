'use client';

import { App as AntdApp } from 'antd';
import { Inter } from 'next/font/google';
import './globals.css';
import AntdRegistry from './AntdRegistry';
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import { theme } from '../theme';
import { ThemeProvider } from './ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '恰谷平台',
  description: '恰谷平台管理系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ThemeProvider>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: theme.colorPrimary,
                colorSuccess: theme.colorSuccess,
                colorWarning: theme.colorWarning,
                colorError: theme.colorError,
                colorText: 'var(--color-text)',
                fontSize: parseInt(theme.fontSizeBase, 10),
                borderRadius: parseInt(theme.borderRadius, 10),
              },
            }}
          >
            <AntdApp>
              <AntdRegistry>{children}</AntdRegistry>
            </AntdApp>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 