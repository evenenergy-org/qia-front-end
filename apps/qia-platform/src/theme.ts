import { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    colorText: 'var(--color-text)',
    fontSize: 14,
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Menu: {
      itemBg: '#ffffff',
      itemSelectedBg: '#e6f7ff',
      itemSelectedColor: '#1890ff',
      itemHoverBg: '#f5f5f5',
      itemHoverColor: '#1890ff',
    },
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(24, 144, 255, 0.1)',
    },
  },
};

export default theme; 