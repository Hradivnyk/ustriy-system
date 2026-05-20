import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1.5rem' }}>{children}</main>
      </div>
    </div>
  );
}
