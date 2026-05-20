export default function Header(): React.JSX.Element {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        height: '60px',
        borderBottom: '1px solid var(--foreground)',
        background: 'var(--background)',
      }}
    >
      <span style={{ fontWeight: 600 }}>Ustriy System</span>
    </header>
  );
}
