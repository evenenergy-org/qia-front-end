'use client';

import React from 'react';
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs';
import type Entity from '@ant-design/cssinjs/es/Cache';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const StyledComponentsRegistry = ({ children }: { children: React.ReactNode }) => {
  const cache = React.useMemo<Entity>(() => createCache(), []);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <StyleProvider cache={cache}>
      <ConfigProvider locale={zhCN}>
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
};

export default StyledComponentsRegistry; 