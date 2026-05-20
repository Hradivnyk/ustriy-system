'use client';

import { Flex, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import apiClient from '@/lib/apiClient';
import type { User } from '@/types';

export default function AuthCallbackPage(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    apiClient
      .get<User>('/auth/me')
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login?error=oauth_failed'));
  }, [router]);

  return (
    <Flex align="center" justify="center" style={{ minHeight: '100vh' }}>
      <Spin size="large" />
    </Flex>
  );
}
