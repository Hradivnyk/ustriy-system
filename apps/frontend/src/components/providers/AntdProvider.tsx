'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App, ConfigProvider, theme } from 'antd';
import ukUA from 'antd/locale/uk_UA';

import { useTheme } from './ThemeProvider';

export default function AntdProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  const { mode } = useTheme();

  return (
    <AntdRegistry>
      <ConfigProvider
        locale={ukUA}
        theme={{
          algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            colorTextBase: '#141414',
            borderRadius: 6,
            fontFamily:
              'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
          },
          components: {
            Layout: {
              headerBg: mode === 'dark' ? '#1f1f1f' : '#ffffff',
            },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
