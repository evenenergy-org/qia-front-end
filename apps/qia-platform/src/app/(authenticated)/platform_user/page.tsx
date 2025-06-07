'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import http from '@/utils/http';
import { API_PATHS } from '@/config/env';
import UserForm from './components/UserForm';

interface UserData {
  id: number;
  uuid: string;
  username: string;
  mobile: string;
  status: boolean;
}

interface QueryParams {
  username?: string;
  mobile?: string;
  pageNum: number;
  pageSize: number;
}

export default function UserPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [data, setData] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (params: QueryParams) => {
    try {
      setLoading(true);
      const response = await http.post(API_PATHS.USER.PAGE, params);
      const { records, total, current, size } = response.data;
      setData(records);
      setPagination({
        current,
        pageSize: size,
        total,
      });
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
    });
  }, []);

  const handleTableChange = (newPagination: any) => {
    const values = form.getFieldsValue();
    fetchData({
      ...values,
      pageNum: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    fetchData({
      ...values,
      pageNum: 1,
      pageSize: pagination.pageSize,
    });
  };

  const handleReset = () => {
    form.resetFields();
    fetchData({
      pageNum: 1,
      pageSize: pagination.pageSize,
    });
  };

  const handleStatusChange = async (id: number, status: boolean) => {
    try {
      await http.put(API_PATHS.USER.STATUS(id), null, {
        params: { status: !status }
      });
      message.success(`${status ? '禁用' : '启用'}成功`);
      fetchData({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      message.error(`${status ? '禁用' : '启用'}失败`);
      console.error(`${status ? '禁用' : '启用'}失败:`, error);
    }
  };

  // 打开新增用户弹窗
  const showCreateModal = () => {
    setEditingUser(null);
    setIsModalVisible(true);
  };

  // 打开编辑用户弹窗
  const showEditModal = (user: UserData) => {
    setEditingUser(user);
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  // 提交表单
  const handleSubmit = async (values: { username: string; mobile: string }) => {
    try {
      setFormLoading(true);
      if (editingUser) {
        // 编辑用户
        await http.put(API_PATHS.USER.UPDATE(editingUser.id), values);
        message.success('更新成功');
      } else {
        // 新增用户
        await http.post(API_PATHS.USER.CREATE, values);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      setEditingUser(null);
      fetchData({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      console.error(editingUser ? '更新用户失败:' : '创建用户失败:', error);
      message.error(editingUser ? '更新失败' : '创建失败');
    } finally {
      setFormLoading(false);
    }
  };

  // 删除用户
  const handleDelete = async (id: number) => {
    try {
      await http.delete(API_PATHS.USER.DELETE(id));
      message.success('删除成功');
      fetchData({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: 'UUID',
      dataIndex: 'uuid',
      key: 'uuid',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'default'}>
          {status ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserData) => (
        <Space size="middle">
          <a onClick={() => showEditModal(record)}>编辑</a>
          <Popconfirm
            title={`确定要${record.status ? '禁用' : '启用'}该用户吗？`}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="确定"
            cancelText="取消"
          >
            <a>{record.status ? '禁用' : '启用'}</a>
          </Popconfirm>
          <Popconfirm
            title="确定要删除该用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <a className="text-red-500 hover:text-red-600">删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">平台用户管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
          添加用户
        </Button>
      </div>
      
      <Card className="mb-6">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="username" label="用户名">
            <Input placeholder="请输入用户名" allowClear />
          </Form.Item>
          <Form.Item name="mobile" label="手机号">
            <Input placeholder="请输入手机号" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>

      <UserForm
        open={isModalVisible}
        loading={formLoading}
        initialValues={editingUser ? {
          username: editingUser.username,
          mobile: editingUser.mobile,
        } : undefined}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 