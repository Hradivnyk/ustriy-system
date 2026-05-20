import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Дашборд' },
  { href: '/dashboard/requests', label: 'Заявки' },
] as const;

export default function Sidebar(): React.JSX.Element {
  return (
    <aside
      style={{
        width: '240px',
        flexShrink: 0,
        borderRight: '1px solid var(--foreground)',
        padding: '1.5rem 1rem',
        background: 'var(--background)',
      }}
    >
      <nav>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {NAV_ITEMS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href}>{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
