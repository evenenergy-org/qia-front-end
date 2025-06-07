'use client';

import { App as AntdApp } from 'antd';
import AntdRegistry from './AntdRegistry';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdApp>
      <AntdRegistry>{children}</AntdRegistry>
    </AntdApp>
  );
} 