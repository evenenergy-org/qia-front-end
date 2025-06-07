'use client';

import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

interface FactoryFormData {
  name: string;
}

interface FactoryFormProps {
  open: boolean;
  loading: boolean;
  initialValues?: FactoryFormData;
  onCancel: () => void;
  onSubmit: (values: FactoryFormData) => void;
}

export default function FactoryForm({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: FactoryFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title={initialValues ? '编辑工厂' : '新建工厂'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="工厂名称"
          rules={[{ required: true, message: '请输入工厂名称' }]}
        >
          <Input placeholder="请输入工厂名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
} 