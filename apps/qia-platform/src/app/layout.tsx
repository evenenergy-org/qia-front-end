import { Inter } from 'next/font/google';
import './globals.css';
import AntdRegistry from './AntdRegistry';
import { ConfigProvider } from 'antd';
import { theme } from '../theme';
import { ThemeProvider } from './ThemeProvider';
import ClientLayout from './ClientLayout';

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
              token: theme,
            }}
          >
            <ClientLayout>{children}</ClientLayout>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 