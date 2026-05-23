'use client';

import { Card, Skeleton, Typography } from 'antd';

export default function AdministrationPage(): React.JSX.Element {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Адміністрація
      </Typography.Title>

      <Card>
        <Typography.Text type="secondary">
          Налаштування системи, управління ролями та конфігурація сповіщень.
        </Typography.Text>
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 16 }} />
      </Card>
    </section>
  );
}
