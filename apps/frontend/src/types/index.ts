export type RequestStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export interface User {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  role: 'resident' | 'specialist' | 'dispatcher';
}

export interface RepairRequest {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  author: User;
}

export type ApiResponse<T> = {
  data: T;
  total?: number;
};
