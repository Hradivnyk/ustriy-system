'use client';

import { SearchOutlined } from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import { api } from '@/lib/api';
import type { Dormitory, Specialist, StaffMember, Ticket, TicketStatus } from '@/types';

// ─── Display configs ───────────────────────────────────────────────────────────

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  Новий: { label: 'Новий', color: 'orange' },
  'в Обробці': { label: 'В роботі', color: 'blue' },
  Виконано: { label: 'Виконано', color: 'green' },
  Відхилено: { label: 'Відхилено', color: 'red' },
  'На паузі': { label: 'На паузі', color: 'default' },
};

const IN_PROGRESS_STATUS_NAME = 'в Обробці';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const ratingStars = (rating: number | null): string => (rating ? '⭐'.repeat(rating) : '—');

// ─── Status change modal ───────────────────────────────────────────────────────

interface StatusModalProps {
  ticket: Ticket | null;
  statuses: TicketStatus[];
  staffMembers: StaffMember[];
  onClose: () => void;
  onSuccess: () => void;
}

function StatusModal({
  ticket,
  statuses,
  staffMembers,
  onClose,
  onSuccess,
}: StatusModalProps): React.JSX.Element {
  const { message } = App.useApp();
  const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>(undefined);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  // Reset when ticket changes
  useEffect(() => {
    setSelectedStatusId(undefined);
    setSelectedAssigneeId(undefined);
  }, [ticket]);

  const selectedStatus = statuses.find((s) => s.id === selectedStatusId);
  const needsAssignee = selectedStatus?.name === IN_PROGRESS_STATUS_NAME;

  const eligibleStaff = useMemo(
    () =>
      ticket
        ? staffMembers.filter((m) => m.isActive && m.specialistId === ticket.specialistId)
        : [],
    [ticket, staffMembers],
  );

  const canSubmit =
    selectedStatusId !== undefined && (!needsAssignee || selectedAssigneeId !== undefined);

  const handleOk = async (): Promise<void> => {
    if (!ticket || !canSubmit) return;

    setSaving(true);
    try {
      await api.patch(`/tickets/${ticket.id}/status`, {
        statusId: selectedStatusId,
        ...(needsAssignee ? { assigneeId: selectedAssigneeId } : {}),
      });
      await message.success('Статус заявки змінено');
      onSuccess();
    } catch {
      await message.error('Не вдалося змінити статус. Спробуйте ще раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={ticket ? `Заявка #${ticket.ticketNumber} — зміна статусу` : ''}
      open={ticket !== null}
      onCancel={onClose}
      onOk={() => void handleOk()}
      okText="Зберегти"
      cancelText="Скасувати"
      okButtonProps={{ disabled: !canSubmit, loading: saving }}
      destroyOnHidden
    >
      {ticket && (
        <Flex vertical gap={12} style={{ marginTop: 8 }}>
          <div>
            <Typography.Text type="secondary">Поточний статус: </Typography.Text>
            {(() => {
              const cfg = STATUS_DISPLAY[ticket.status.name] ?? {
                label: ticket.status.name,
                color: 'default',
              };
              return <Tag color={cfg.color}>{cfg.label}</Tag>;
            })()}
          </div>

          <Flex vertical gap={4}>
            <Typography.Text strong>Новий статус</Typography.Text>
            <Select
              placeholder="Оберіть статус"
              value={selectedStatusId}
              onChange={(val) => {
                setSelectedStatusId(val);
                setSelectedAssigneeId(undefined);
              }}
              options={statuses.map((s) => ({
                value: s.id,
                label: STATUS_DISPLAY[s.name]?.label ?? s.name,
              }))}
            />
          </Flex>

          {needsAssignee && (
            <Flex vertical gap={4}>
              <Typography.Text strong>
                Виконавець <Typography.Text type="danger">*</Typography.Text>
              </Typography.Text>
              <Select
                placeholder={
                  eligibleStaff.length === 0 ? 'Немає доступних виконавців' : 'Оберіть виконавця'
                }
                value={selectedAssigneeId}
                onChange={setSelectedAssigneeId}
                disabled={eligibleStaff.length === 0}
                options={eligibleStaff.map((m) => ({ value: m.id, label: m.name }))}
              />
            </Flex>
          )}
        </Flex>
      )}
    </Modal>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RequestsPage(): React.JSX.Element {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dormitoryFilter, setDormitoryFilter] = useState<number | undefined>(undefined);
  const [specialistFilter, setSpecialistFilter] = useState<number | undefined>(undefined);

  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  const loadTickets = (): void => {
    setLoading(true);
    api
      .get<Ticket[]>('/tickets')
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTickets();
    api
      .get<TicketStatus[]>('/tickets/statuses')
      .then(setStatuses)
      .catch(() => {});
    api
      .get<Specialist[]>('/tickets/specialists')
      .then(setSpecialists)
      .catch(() => {});
    api
      .get<StaffMember[]>('/staff')
      .then(setStaffMembers)
      .catch(() => {});
  }, []);

  // Derive filter options from loaded data
  const dormitoryOptions = useMemo(() => {
    const seen = new Map<number, Dormitory>();
    tickets.forEach((t) => {
      if (!seen.has(t.dormitory.id)) seen.set(t.dormitory.id, t.dormitory);
    });
    return Array.from(seen.values())
      .sort((a, b) => a.number - b.number)
      .map((d) => ({ value: d.id, label: `Гуртожиток №${d.number}` }));
  }, [tickets]);

  const specialistOptions = useMemo(() => {
    const seen = new Map<number, Specialist>();
    tickets.forEach((t) => {
      if (!seen.has(t.specialist.id)) seen.set(t.specialist.id, t.specialist);
    });
    return Array.from(seen.values())
      .sort((a, b) => a.id - b.id)
      .map((s) => ({ value: s.id, label: s.name }));
  }, [tickets]);

  const statusOptions = useMemo(() => {
    const seen = new Set<string>();
    tickets.forEach((t) => seen.add(t.status.name));
    return Array.from(seen).map((name) => ({
      value: name,
      label: STATUS_DISPLAY[name]?.label ?? name,
    }));
  }, [tickets]);

  const hasFilters =
    search.length > 0 ||
    statusFilter.length > 0 ||
    dormitoryFilter !== undefined ||
    specialistFilter !== undefined;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (
        q &&
        !t.resident.name.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(t.status.name)) return false;
      if (dormitoryFilter !== undefined && t.dormitoryId !== dormitoryFilter) return false;
      if (specialistFilter !== undefined && t.specialistId !== specialistFilter) return false;
      return true;
    });
  }, [tickets, search, statusFilter, dormitoryFilter, specialistFilter]);

  const resetFilters = (): void => {
    setSearch('');
    setStatusFilter([]);
    setDormitoryFilter(undefined);
    setSpecialistFilter(undefined);
  };

  const columns: ColumnsType<Ticket> = [
    {
      title: '#',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 64,
      align: 'right' as const,
      sorter: (a, b) => a.ticketNumber - b.ticketNumber,
      render: (num: number) => <Typography.Text type="secondary">#{num}</Typography.Text>,
    },
    {
      title: 'Статус',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const cfg = STATUS_DISPLAY[record.status.name] ?? {
          label: record.status.name,
          color: 'default',
        };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Гуртожиток',
      key: 'location',
      width: 130,
      render: (_, record) => <span>Гурт. №{record.dormitory.number}</span>,
    },
    {
      title: 'Мешканець',
      key: 'resident',
      render: (_, record) => <span>{record.resident.name}</span>,
    },
    {
      title: 'Фахівець',
      key: 'specialist',
      render: (_, record) => (
        <Flex vertical gap={0}>
          <span>{record.specialist.name}</span>
        </Flex>
      ),
    },
    {
      title: 'Виконавець',
      key: 'assignee',
      render: (_, record) => <span>{record.assignee ? record.assignee.name : '—'}</span>,
    },
    {
      title: 'Опис',
      key: 'description',
      ellipsis: { showTitle: false },
      render: (_, record) => (
        <Tooltip title={record.description} placement="topLeft">
          {record.description}
        </Tooltip>
      ),
    },
    {
      title: 'Оцінка',
      key: 'rating',
      width: 90,
      align: 'center' as const,
      render: (_, record) => <Typography.Text>{ratingStars(record.rating)}</Typography.Text>,
    },
    {
      title: 'Дата подачі',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (_, record) => fmtDate(record.createdAt),
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Button size="small" onClick={() => setEditingTicket(record)}>
          Змінити статус
        </Button>
      ),
    },
  ];

  return (
    <App>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography.Title level={2} style={{ margin: 0 }}>
            Заявки
          </Typography.Title>
          <Typography.Text type="secondary">
            {filtered.length} із {tickets.length}
          </Typography.Text>
        </Space>

        <Card>
          <Space wrap style={{ marginBottom: 16, gap: 8 }}>
            <Input
              placeholder="Пошук за мешканцем або описом"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 300 }}
            />
            <Select
              placeholder="Статус"
              mode="multiple"
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              style={{ minWidth: 180 }}
              maxTagCount="responsive"
              allowClear
            />
            <Select
              placeholder="Гуртожиток"
              value={dormitoryFilter}
              onChange={setDormitoryFilter}
              options={dormitoryOptions}
              style={{ width: 155 }}
              allowClear
            />
            <Select
              placeholder="Фахівець"
              value={specialistFilter}
              onChange={setSpecialistFilter}
              options={specialistOptions}
              style={{ width: 190 }}
              allowClear
            />
            {hasFilters && <Button onClick={resetFilters}>Скинути фільтри</Button>}
          </Space>

          <Table<Ticket>
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `Всього: ${total}`,
            }}
            size="middle"
          />
        </Card>

        <StatusModal
          ticket={editingTicket}
          statuses={statuses}
          staffMembers={staffMembers}
          onClose={() => setEditingTicket(null)}
          onSuccess={() => {
            setEditingTicket(null);
            loadTickets();
          }}
        />
      </section>
    </App>
  );
}
