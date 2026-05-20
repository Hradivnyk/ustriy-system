'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App } from 'antd';
import ukUA from 'antd/locale/uk_UA';

const THEME = {
  token: {
    colorPrimary: '#1677ff',
    borderRadius: 8,
    fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
  },
} as const;

export default function AntdProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <AntdRegistry>
      <ConfigProvider locale={ukUA} theme={THEME}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
