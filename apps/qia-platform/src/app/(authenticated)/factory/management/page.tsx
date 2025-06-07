'use client';

import { useEffect, useState } from 'react';
import { Table, Card, Button, Space, Form, Input, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import http from '@/utils/http';
import { API_PATHS } from '@/config/env';
import FactoryForm from './components/FactoryForm';

interface FactoryData {
  id: number;
  uuid: string;
  name: string;
  status: boolean;
  createDatetime: string;
}

interface QueryParams {
  name?: string;
  status?: boolean;
  pageNum: number;
  pageSize: number;
}

export default function FactoryManagementPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFactory, setEditingFactory] = useState<FactoryData | null>(null);
  const [data, setData] = useState<FactoryData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = async (params: QueryParams) => {
    try {
      setLoading(true);
      const response = await http.post(API_PATHS.FACTORY.PAGE, params);
      const { records, total, current, size } = response.data;
      setData(records);
      setPagination({
        current,
        pageSize: size,
        total,
      });
    } catch (error) {
      message.error('获取工厂列表失败');
      console.error('获取工厂列表失败:', error);
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
    const params: QueryParams = {
      pageNum: newPagination.current,
      pageSize: newPagination.pageSize,
    };
    
    // 只有当搜索条件有值时才添加到参数中
    if (values.name?.trim()) {
      params.name = values.name.trim();
    }
    if (values.status !== undefined) {
      params.status = values.status;
    }
    
    fetchData(params);
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    const params: QueryParams = {
      pageNum: 1,
      pageSize: pagination.pageSize,
    };
    
    // 只有当搜索条件有值时才添加到参数中
    if (values.name?.trim()) {
      params.name = values.name.trim();
    }
    if (values.status !== undefined) {
      params.status = values.status;
    }
    
    fetchData(params);
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
      await http.put(API_PATHS.FACTORY.STATUS(id), null, {
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

  const handleDelete = async (id: number) => {
    try {
      await http.delete(API_PATHS.FACTORY.DELETE(id));
      message.success('删除成功');
      fetchData({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    }
  };

  // 打开新增工厂弹窗
  const showCreateModal = () => {
    setEditingFactory(null);
    setIsModalVisible(true);
  };

  // 打开编辑工厂弹窗
  const showEditModal = (factory: FactoryData) => {
    setEditingFactory(factory);
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingFactory(null);
  };

  // 提交表单
  const handleSubmit = async (values: { name: string }) => {
    try {
      setFormLoading(true);
      if (editingFactory) {
        // 编辑工厂
        await http.put(API_PATHS.FACTORY.UPDATE(editingFactory.id), values);
        message.success('更新成功');
      } else {
        // 新增工厂
        await http.post(API_PATHS.FACTORY.CREATE, values);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      setEditingFactory(null);
      fetchData({
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      });
    } catch (error) {
      console.error(editingFactory ? '更新工厂失败:' : '创建工厂失败:', error);
      message.error(editingFactory ? '更新失败' : '创建失败');
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      title: '工厂名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean, record: FactoryData) => (
        <Switch
          checked={status}
          onChange={() => handleStatusChange(record.id, status)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createDatetime',
      key: 'createDatetime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FactoryData) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个工厂吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">工厂管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
          添加工厂
        </Button>
      </div>
      
      <Card className="mb-6">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="工厂名称">
            <Input placeholder="请输入工厂名称" allowClear />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Switch
              checkedChildren="启用"
              unCheckedChildren="禁用"
              onChange={(checked) => form.setFieldsValue({ status: checked })}
            />
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

      <FactoryForm
        open={isModalVisible}
        loading={formLoading}
        initialValues={editingFactory ? {
          name: editingFactory.name,
        } : undefined}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </div>
  );
} 