'use client';

import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import { Badge, Card, Col, Flex, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import type { Ticket } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  Новий: { label: 'Новий', color: 'orange' },
  'в Обробці': { label: 'В роботі', color: 'blue' },
  Виконано: { label: 'Виконано', color: 'green' },
  Відхилено: { label: 'Відхилено', color: 'red' },
  'На паузі': { label: 'На паузі', color: 'default' },
};

// ─── Stat cards ────────────────────────────────────────────────────────────────
// Sync with analytics/page.tsx: total 247, open 58 (35+23), closed 189 (176+13)

const STAT_CARDS = [
  { label: 'Нові заявки', value: 35, diff: +5, accent: '#fa8c16' },
  { label: 'В роботі', value: 23, diff: -2, accent: '#1677ff' },
  { label: 'Вирішено', value: 176, diff: +12, accent: '#52c41a' },
  { label: 'Відхилено', value: 13, diff: +1, accent: '#ff4d4f' },
];

// ─── Monthly bar chart data (Dec 2025 – May 2026) ──────────────────────────────
// Submissions sum to 247 (analytics total); May is partial (01–26.05.2026)

const CHART_DATA = [
  { month: 'Груд', submitted: 35, resolved: 28 },
  { month: 'Січ', submitted: 38, resolved: 31 },
  { month: 'Лют', submitted: 41, resolved: 35 },
  { month: 'Бер', submitted: 45, resolved: 38 },
  { month: 'Квіт', submitted: 48, resolved: 42 },
  { month: 'Тра', submitted: 40, resolved: 15 },
];

const MAX_VAL = Math.max(...CHART_DATA.flatMap((d) => [d.submitted, d.resolved]));

// ─── Recent tickets ────────────────────────────────────────────────────────────

const fmtDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const COLUMNS: ColumnsType<Ticket> = [
  {
    title: '#',
    dataIndex: 'ticketNumber',
    key: 'ticketNumber',
    width: 60,
    render: (n: number) => <Typography.Text type="secondary">#{n}</Typography.Text>,
  },
  {
    title: 'Статус',
    key: 'status',
    width: 120,
    render: (_, r: Ticket) => {
      const cfg = STATUS_CONFIG[r.status.name] ?? { label: r.status.name, color: 'default' };
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
  {
    title: 'Гуртожиток',
    key: 'location',
    width: 120,
    render: (_, r: Ticket) => <span>Гурт. №{r.dormitory.number}</span>,
  },
  {
    title: 'Мешканець',
    key: 'resident',
    width: 170,
    render: (_, r: Ticket) => r.resident.name,
  },
  {
    title: 'Фахівець',
    key: 'specialist',
    width: 170,
    render: (_, r: Ticket) => r.specialist.name,
  },
  {
    title: 'Опис',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: 'Дата',
    key: 'date',
    width: 110,
    render: (_, r: Ticket) => fmtDate(r.createdAt),
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, diff, accent }: (typeof STAT_CARDS)[number]) {
  const trendIcon =
    diff > 0 ? (
      <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
    ) : diff < 0 ? (
      <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
    ) : (
      <MinusOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
    );
  const trendColor = diff > 0 ? '#52c41a' : diff < 0 ? '#ff4d4f' : '#8c8c8c';

  return (
    <Card style={{ borderTop: `3px solid ${accent}` }} styles={{ body: { padding: '20px 24px' } }}>
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Typography.Text>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: accent }}>{value}</span>
        <Flex align="center" gap={4} style={{ marginBottom: 4 }}>
          {trendIcon}
          <Typography.Text style={{ fontSize: 12, color: trendColor }}>
            {diff > 0 ? `+${diff}` : diff === 0 ? '—' : diff} за тиждень
          </Typography.Text>
        </Flex>
      </div>
    </Card>
  );
}

function BarChart() {
  const BAR_H = 160;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 28,
          minWidth: 400,
          paddingBottom: 8,
        }}
      >
        {CHART_DATA.map(({ month, submitted, resolved }) => (
          <div
            key={month}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: BAR_H }}>
              <div
                title={`Подано: ${submitted}`}
                style={{
                  width: 22,
                  height: (submitted / MAX_VAL) * BAR_H,
                  background: '#1677ff',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease',
                  cursor: 'default',
                }}
              />
              <div
                title={`Вирішено: ${resolved}`}
                style={{
                  width: 22,
                  height: (resolved / MAX_VAL) * BAR_H,
                  background: '#52c41a',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s ease',
                  cursor: 'default',
                }}
              />
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {month}
            </Typography.Text>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <Flex align="center" gap={6}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#1677ff' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Подано
          </Typography.Text>
        </Flex>
        <Flex align="center" gap={6}>
          <div style={{ width: 12, height: 12, borderRadius: 2, background: '#52c41a' }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Вирішено
          </Typography.Text>
        </Flex>
      </div>
    </div>
  );
}

function StatusDistribution() {
  const total = STAT_CARDS.reduce((s, c) => s + c.value, 0); // 247
  const bars = [
    { label: 'Очікує', value: 35, color: '#fa8c16' },
    { label: 'В роботі', value: 23, color: '#1677ff' },
    { label: 'Вирішено', value: 176, color: '#52c41a' },
    { label: 'Відхилено', value: 13, color: '#ff4d4f' },
  ];

  return (
    <Flex vertical gap={14}>
      {bars.map(({ label, value, color }) => (
        <div key={label}>
          <Flex justify="space-between" style={{ marginBottom: 4 }}>
            <Typography.Text style={{ fontSize: 13 }}>{label}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {value} ({Math.round((value / total) * 100)}%)
            </Typography.Text>
          </Flex>
          <div style={{ height: 8, borderRadius: 4, background: '#f0f0f0', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(value / total) * 100}%`,
                background: color,
                borderRadius: 4,
              }}
            />
          </div>
        </div>
      ))}
    </Flex>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage(): React.JSX.Element {
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    api
      .get<Ticket[]>('/tickets')
      .then((tickets) => setRecentTickets(tickets.slice(0, 5)))
      .catch(() => setRecentTickets([]))
      .finally(() => setLoadingRecent(false));
  }, []);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={2} style={{ margin: 0 }}>
          Дашборд
        </Typography.Title>
        <Flex align="center" gap={8}>
          <Badge status="processing" color="#52c41a" />
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Оновлено: 26.05.2026, 14:30
          </Typography.Text>
        </Flex>
      </Flex>

      <Row gutter={[16, 16]}>
        {STAT_CARDS.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.label}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Динаміка заявок (грудень 2025 – травень 2026)">
            <BarChart />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Розподіл по статусах" style={{ height: '100%' }}>
            <StatusDistribution />
          </Card>
        </Col>
      </Row>

      <Card title="Останні заявки">
        <Table<Ticket>
          dataSource={recentTickets}
          columns={COLUMNS}
          rowKey="id"
          loading={loadingRecent}
          pagination={false}
          size="middle"
        />
      </Card>
    </section>
  );
}
