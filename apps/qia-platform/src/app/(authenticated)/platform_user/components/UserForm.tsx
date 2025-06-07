'use client';

import { Form, Input, Modal } from 'antd';
import { useEffect, useRef } from 'react';

interface UserFormData {
  username: string;
  mobile: string;
}

interface UserFormProps {
  open: boolean;
  loading: boolean;
  initialValues?: UserFormData;
  onCancel: () => void;
  onSubmit: (values: UserFormData) => void;
}

export default function UserForm({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: UserFormProps) {
  const createForm = useRef(Form.useForm()[0]);
  const editForm = useRef(Form.useForm()[0]);
  const isEdit = !!initialValues;
  const form = isEdit ? editForm.current : createForm.current;

  // 监听 open 和 initialValues 的变化
  useEffect(() => {
    if (open) {
      if (isEdit) {
        editForm.current.setFieldsValue(initialValues);
      } else {
        createForm.current.resetFields();
      }
    }
  }, [open, initialValues, isEdit]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialValues ? '编辑用户' : '添加用户'}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="mobile"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
      </Form>
    </Modal>
  );
} 