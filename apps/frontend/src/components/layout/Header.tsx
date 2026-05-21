'use client';

import { LogoutOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';
import Image from 'next/image';

import { useAuth } from '@/hooks/useAuth';

const { Text } = Typography;

export default function Header(): React.JSX.Element {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: '60px',
        borderBottom: '1px solid var(--foreground)',
        background: 'var(--background)',
      }}
    >
      <Flex align="center" gap={8}>
        <Image src="/logo_500.webp" alt="Ustriy System" width={32} height={32} unoptimized />
        <span style={{ fontWeight: 600 }}>Ustriy System</span>
      </Flex>
      <Flex align="center" gap={12}>
        {user && <Text type="secondary">{user.name}</Text>}
        <Button icon={<LogoutOutlined />} onClick={logout}>
          Вийти
        </Button>
      </Flex>
    </header>
  );
}
