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
import { useLayoutEffect, useRef, useState } from 'react';

const NAV_ITEMS = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/requests', icon: <FileTextOutlined />, label: 'Заявки' },
  { key: '/residents', icon: <UserOutlined />, label: 'Мешканці' },
  { key: '/dormitories', icon: <HomeOutlined />, label: 'Гуртожитки' },
  { key: '/administration', icon: <SettingOutlined />, label: 'Адміністрація' },
];

const COLLAPSED_WIDTH = 64;
const EXTRA_WIDTH = 24;

export default function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const measureRef = useRef<HTMLDivElement>(null);
  const [siderWidth, setSiderWidth] = useState(220);

  useLayoutEffect(() => {
    if (measureRef.current) {
      setSiderWidth(measureRef.current.offsetWidth + EXTRA_WIDTH);
    }
  }, []);

  return (
    <>
      {/* Invisible element that measures the natural width of the widest menu item */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          padding: `0 ${token.paddingMD}px`,
          fontSize: token.fontSize,
          fontFamily: token.fontFamily,
          gap: token.marginXS,
        }}
      >
        <span style={{ fontSize: token.fontSize, lineHeight: 1 }}>
          <SettingOutlined />
        </span>
        <span>Адміністрація</span>
      </div>

      <Layout.Sider
        collapsed={collapsed}
        width={siderWidth}
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
    </>
  );
}
