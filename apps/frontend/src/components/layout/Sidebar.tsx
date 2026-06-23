'use client';

import {
  DashboardOutlined,
  FileTextOutlined,
  HomeOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/requests', icon: <FileTextOutlined />, label: 'Заявки' },
  { key: '/residents', icon: <UserOutlined />, label: 'Мешканці' },
  { key: '/dormitories', icon: <HomeOutlined />, label: 'Гуртожитки' },
  { key: '/administration', icon: <SettingOutlined />, label: 'Адміністрація' },
];

// Fixed width that comfortably fits the widest label ("Адміністрація").
// Deterministic on purpose: a runtime-measured width differs between the SSR
// markup and the hydrated client render, which causes the whole content area
// to shift horizontally on load.
const SIDER_WIDTH = 220;
const COLLAPSED_WIDTH = 64;

export default function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  return (
    <Layout.Sider
      collapsed={collapsed}
      width={SIDER_WIDTH}
      collapsedWidth={COLLAPSED_WIDTH}
      style={{ overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={NAV_ITEMS}
          inlineCollapsed={collapsed}
          style={{ flex: 1, borderRight: 0, paddingTop: 8 }}
          onSelect={({ key }) => router.push(key)}
        />
        <div style={{ borderTop: `1px solid ${token.colorSplit}` }}>
          <Menu
            mode="inline"
            selectedKeys={[]}
            items={[
              {
                key: '__collapse',
                icon: collapsed ? <RightOutlined /> : <LeftOutlined />,
                label: 'Згорнути',
              },
            ]}
            inlineCollapsed={collapsed}
            style={{ borderRight: 0 }}
            onSelect={() => setCollapsed((prev) => !prev)}
          />
        </div>
      </div>
    </Layout.Sider>
  );
}
