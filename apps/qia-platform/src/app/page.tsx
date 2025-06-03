'use client';

import { Typography } from 'antd';

const { Title } = Typography;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Title level={1}>欢迎使用恰谷平台</Title>
    </main>
  );
} 