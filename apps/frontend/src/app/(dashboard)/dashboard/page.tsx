'use client';

import { Card, Col, Row, Skeleton, Typography } from 'antd';

const STAT_CARDS = ['Нові заявки', 'В роботі', 'Вирішено', 'Відхилено'];

export default function DashboardPage(): React.JSX.Element {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        Дашборд
      </Typography.Title>

      <Row gutter={[16, 16]}>
        {STAT_CARDS.map((label) => (
          <Col xs={24} sm={12} lg={6} key={label}>
            <Card>
              <Typography.Text type="secondary">{label}</Typography.Text>
              <Skeleton.Input active block style={{ marginTop: 8, height: 32 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Динаміка заявок">
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>

      <Card title="Останні заявки">
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    </section>
  );
}
