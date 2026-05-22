'use client';

import { Button, Card, Skeleton, Space, Typography } from 'antd';

export default function RequestsPage(): React.JSX.Element {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Заявки
        </Typography.Title>
        <Button type="primary" disabled>
          Нова заявка
        </Button>
      </Space>

      <Card>
        <Typography.Text type="secondary">
          Список заявок на ремонт від мешканців гуртожитків.
        </Typography.Text>
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 16 }} />
      </Card>
    </section>
  );
}
