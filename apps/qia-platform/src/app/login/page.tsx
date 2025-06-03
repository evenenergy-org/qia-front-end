'use client';

import React from 'react';
import { Card, Form, Input, Button, Checkbox, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-bg"
      style={{ minHeight: '100vh' }}
    >
      <Card
        style={{
          width: 'var(--card-width, 350px)',
          // boxShadow: '0 2px 8px var(--color-shadow, #f0f1f2)',
        }}
      >
        <div className="text-center mb-lg">
          <Title
            level={3}
            style={{
              marginBottom: 0,
              color: 'var(--color-primary)',
            }}
          >
            恰谷平台登录
          </Title>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={(values) => {
            // 这里可以处理登录逻辑
            console.log('登录信息:', values);
          }}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
            label="用户名"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            label="密码"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" className="mb-0">
            <Checkbox>记住我</Checkbox>
          </Form.Item>
          <Form.Item className="mt-md">
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 