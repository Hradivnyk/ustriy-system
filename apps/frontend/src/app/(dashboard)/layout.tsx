'use client';

import { Layout } from 'antd';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header />
      <Layout hasSider style={{ flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <Layout style={{ flexDirection: 'column', overflowY: 'auto' }}>
          <Layout.Content style={{ padding: 24, flex: 1 }}>{children}</Layout.Content>
          <Footer />
        </Layout>
      </Layout>
    </Layout>
  );
}
