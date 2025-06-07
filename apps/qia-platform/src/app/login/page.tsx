'use client';

import { useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, token, initialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && isAuthenticated && token) {
      router.replace('/dashboard');
    }
  }, [initialized, isAuthenticated, token, router]);

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      router.replace('/dashboard');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  if (!initialized || (initialized && isAuthenticated && token)) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card} title="恰谷平台登录">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 