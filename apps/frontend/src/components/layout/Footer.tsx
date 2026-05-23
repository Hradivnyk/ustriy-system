'use client';

import { Layout, Typography } from 'antd';

export default function Footer(): React.JSX.Element {
  return (
    <Layout.Footer style={{ textAlign: 'center', padding: '16px 24px' }}>
      <Typography.Text type="secondary">© {new Date().getFullYear()} Ustriy System</Typography.Text>
    </Layout.Footer>
  );
}
