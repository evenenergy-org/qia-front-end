import './globals.css';
import AntdRegistry from './AntdRegistry';
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import { theme } from '../theme';
import { ThemeProvider } from './ThemeProvider';

export const metadata = {
  title: '恰谷工厂',
  description: '恰谷工厂管理系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
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
            <AntdRegistry>{children}</AntdRegistry>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 