'use client';

import { GoogleOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Flex, Typography } from 'antd';
import { useSearchParams } from 'next/navigation';

const { Title } = Typography;

export default function LoginPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const hasError = searchParams.get('error') === 'oauth_failed';

  const handleLogin = (): void => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/auth/google`;
  };

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Card style={{ width: 360, borderRadius: 8 }}>
        <Flex vertical align="center" gap={24}>
          <Title level={3} style={{ margin: 0 }}>
            Ustriy System
          </Title>

          {hasError && (
            <Alert
              type="error"
              message="Помилка авторизації"
              description="Не вдалося увійти через Google. Спробуйте ще раз."
              showIcon
              style={{ width: '100%' }}
            />
          )}

          <Button
            type="primary"
            icon={<GoogleOutlined />}
            size="large"
            style={{ width: '100%' }}
            onClick={handleLogin}
          >
            Увійти через Google
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}
