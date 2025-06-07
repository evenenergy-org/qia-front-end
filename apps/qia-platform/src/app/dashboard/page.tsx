'use client';

import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, ShoppingCartOutlined, FileOutlined } from '@ant-design/icons';

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总用户数"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总订单数"
              value={93}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="总商品数"
              value={56}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
} 