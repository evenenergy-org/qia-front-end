'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Tag, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import http from '@/utils/http';
import { API_PATHS } from '@/config/env';

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
          <a>编辑</a>
          <a>删除</a>
          <Popconfirm
            title={`确定要${record.status ? '禁用' : '启用'}该用户吗？`}
            onConfirm={() => handleStatusChange(record.id, record.status)}
            okText="确定"
            cancelText="取消"
          >
            <a>{record.status ? '禁用' : '启用'}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">平台用户管理</h1>
        <Button type="primary" icon={<PlusOutlined />}>
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
    </div>
  );
} 