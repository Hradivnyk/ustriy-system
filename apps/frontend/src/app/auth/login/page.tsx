'use client';

import { GoogleOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function LoginPage(): React.JSX.Element {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card style={{ width: 380, textAlign: 'center' }}>
        <Typography.Title level={3} style={{ marginBottom: 8 }}>
          Ustriy System
        </Typography.Title>
        <Typography.Text type="secondary">
          Адмін-панель для персоналу студентського містечка
        </Typography.Text>

        <Button
          type="primary"
          icon={<GoogleOutlined />}
          size="large"
          block
          onClick={handleGoogleLogin}
          style={{ marginTop: 32 }}
        >
          Увійти через Google
        </Button>

        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16, fontSize: 12 }}>
          Доступ лише для зареєстрованих диспетчерів та фахівців
        </Typography.Text>
      </Card>
    </div>
  );
}
