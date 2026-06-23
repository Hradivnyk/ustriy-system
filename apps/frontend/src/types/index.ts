export interface User {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'specialist' | 'dispatcher';
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'specialist' | 'dispatcher';
  isActive: boolean;
  specialistId: number | null;
  specialist: Specialist | null;
}

export interface Resident {
  id: string;
  telegramId: string;
  name: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialist {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Dormitory {
  id: number;
  number: number;
  isActive: boolean;
}

export interface TicketStatus {
  id: number;
  name: string; // backend: "Новий" | "в Обробці" | "Виконано" | "Відхилено" | "На паузі"
}

export interface Ticket {
  id: string;
  ticketNumber: number;
  resident: Resident;
  residentId: string;
  specialist: Specialist;
  specialistId: number;
  status: TicketStatus;
  statusId: number;
  dormitory: Dormitory;
  dormitoryId: number;
  description: string;
  rating: number | null;
  assigneeId: string | null;
  assignee: StaffMember | null;
  createdAt: string;
  updatedAt: string;
}

export type ApiResponse<T> = {
  data: T;
  total?: number;
};
