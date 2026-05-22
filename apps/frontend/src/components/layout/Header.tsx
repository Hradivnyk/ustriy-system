'use client';

import {
  LogoutOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Layout, Space, Switch, theme, Typography } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useTheme } from '@/components/providers/ThemeProvider';
import { api } from '@/lib/api';

export default function Header(): React.JSX.Element {
  const { mode, toggle } = useTheme();
  const router = useRouter();
  const { token } = theme.useToken();
  const [logoError, setLogoError] = useState(false);

  const handleLogout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      router.push('/auth/login');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: 'Налаштування профілю',
      onClick: () => router.push('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Вийти',
      danger: true,
      onClick: () => void handleLogout(),
    },
  ];

  return (
    <Layout.Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 48,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        onClick={() => router.push('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
      >
        {!logoError && (
          <Image
            src="/logo.webp"
            alt="Ustriy System"
            width={24}
            height={24}
            style={{ borderRadius: 4 }}
            onError={() => setLogoError(true)}
          />
        )}
        <Typography.Text strong style={{ fontSize: 15, color: token.colorText }}>
          Ustriy System
        </Typography.Text>
      </div>

      <Space size={8}>
        <Switch
          checked={mode === 'dark'}
          onChange={toggle}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          title={mode === 'dark' ? 'Світла тема' : 'Темна тема'}
        />
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
          <Avatar icon={<UserOutlined />} size={28} style={{ cursor: 'pointer' }} />
        </Dropdown>
      </Space>
    </Layout.Header>
  );
}
