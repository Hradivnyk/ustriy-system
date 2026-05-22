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

export default function Header(): React.JSX.Element {
  const { mode, toggle } = useTheme();
  const router = useRouter();
  const { token } = theme.useToken();
  const [logoError, setLogoError] = useState(false);

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
      onClick: () => router.push('/auth/login'),
    },
  ];

  return (
    <Layout.Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        onClick={() => router.push('/dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
      >
        {!logoError && (
          <Image
            src="/logo.webp"
            alt="Ustriy System"
            width={32}
            height={32}
            style={{ borderRadius: 4 }}
            onError={() => setLogoError(true)}
          />
        )}
        <Typography.Text strong style={{ fontSize: 18, color: token.colorText }}>
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
          <Avatar icon={<UserOutlined />} size={36} style={{ cursor: 'pointer' }} />
        </Dropdown>
      </Space>
    </Layout.Header>
  );
}
