'use client';

import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Descriptions, Typography } from 'antd';

export default function ProfilePage(): React.JSX.Element {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Typography.Title level={3}>Профіль</Typography.Title>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <Avatar icon={<UserOutlined />} size={80} />
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Ім&apos;я користувача
            </Typography.Title>
            <Typography.Text type="secondary">dispatcher</Typography.Text>
          </div>
        </div>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Email">user@example.com</Descriptions.Item>
          <Descriptions.Item label="Роль">Диспетчер</Descriptions.Item>
          <Descriptions.Item label="Статус">Активний</Descriptions.Item>
        </Descriptions>
        <Typography.Paragraph type="secondary" style={{ marginTop: 24 }}>
          Налаштування профілю — в розробці.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
