'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import apiClient from '@/lib/apiClient';
import type { User } from '@/types';

export function useAuth(): {
  user: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<User>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    router.push('/login');
  };

  return { user, isLoading, logout };
}
