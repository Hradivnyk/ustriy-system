'use client';

import { Alert, Typography } from 'antd';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

const OAUTH_ERRORS: Record<string, string> = {
  not_registered: 'Обліковий запис не зареєстрований. Зверніться до диспетчера.',
  inactive: 'Обліковий запис деактивований.',
  access_denied: 'Доступ заборонено для цього Google-акаунта.',
  oauth_failed: 'Помилка входу через Google. Спробуйте ще раз.',
};

function OAuthErrorAlert() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setError(params.get('error'));
  }, []);

  if (!error) return null;
  return (
    <Alert
      type="error"
      title={OAUTH_ERRORS[error] ?? OAUTH_ERRORS.oauth_failed}
      showIcon
      style={{ marginBottom: 24 }}
    />
  );
}

export default function LoginPage(): React.JSX.Element {
  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <LeftPanel onGoogleLogin={handleGoogleLogin} />
      <RightPanel />
    </div>
  );
}

function LeftPanel({ onGoogleLogin }: { onGoogleLogin: () => void }) {
  return (
    <div
      style={{
        width: 460,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '56px 64px',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9.5L12 3l9 6.5V21H3V9.5z"
              stroke="white"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <rect x="9" y="14" width="6" height="7" rx="1" fill="white" />
          </svg>
        </div>
        <Typography.Text strong style={{ fontSize: 17, color: '#0a0a0a', letterSpacing: '-0.2px' }}>
          Ustriy System
        </Typography.Text>
      </div>

      <Typography.Title
        level={2}
        style={{ margin: '0 0 10px', color: '#0a0a0a', fontWeight: 700, fontSize: 28 }}
      >
        Ласкаво просимо
      </Typography.Title>
      <Typography.Paragraph
        style={{ marginBottom: 40, fontSize: 14, lineHeight: 1.65, color: '#475569' }}
      >
        Увійдіть для доступу до адмін-панелі управління заявками на ремонт у студентському містечку
      </Typography.Paragraph>

      <OAuthErrorAlert />

      <button
        onClick={onGoogleLogin}
        style={{
          width: '100%',
          height: 52,
          border: '1.5px solid #e2e8f0',
          borderRadius: 10,
          background: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          fontSize: 15,
          fontWeight: 500,
          color: '#1e293b',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          fontFamily: 'inherit',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#2563eb';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,0.14)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        }}
      >
        <GoogleLogo />
        Увійти через Google
      </button>

      <Typography.Text
        style={{
          display: 'block',
          marginTop: 20,
          textAlign: 'center',
          fontSize: 12,
          color: '#94a3b8',
        }}
      >
        Доступ лише для диспетчерів та фахівців
      </Typography.Text>
    </div>
  );
}

function RightPanel() {
  return (
    <div
      style={{
        flex: 1,
        background: 'linear-gradient(150deg, #2563eb 0%, #1d4ed8 40%, #1e1b4b 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
      }}
    >
      <MaintenanceIllustration />
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const CROSS_POSITIONS: ReadonlyArray<[number, number]> = [
  [42, 65],
  [108, 32],
  [188, 52],
  [308, 28],
  [398, 62],
  [458, 38],
  [478, 118],
  [26, 158],
  [490, 198],
  [22, 298],
  [498, 318],
  [26, 415],
  [478, 428],
  [58, 490],
  [420, 498],
  [158, 520],
  [340, 508],
  [248, 525],
  [85, 525],
];

function MaintenanceIllustration() {
  return (
    <svg
      width="500"
      height="540"
      viewBox="0 0 500 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Scattered × background marks */}
      {CROSS_POSITIONS.map(([x, y], i) => (
        <text
          key={i}
          x={x}
          y={y}
          fill="rgba(255,255,255,0.18)"
          fontSize="13"
          fontFamily="Arial, sans-serif"
          textAnchor="middle"
        >
          ×
        </text>
      ))}

      {/* Triple circle decoration */}
      {[0, 20, 40].map((offset) => (
        <circle
          key={offset}
          cx={445 + offset}
          cy={295}
          r={9}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
          fill="none"
        />
      ))}

      {/* Wavy line decorations */}
      <path
        d="M15 490 Q50 480 85 490 Q120 500 155 490"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M310 510 Q345 500 380 510 Q415 520 455 510"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        fill="none"
      />

      {/* ── LAPTOP ─────────────────────────────── */}
      <rect
        x="95"
        y="315"
        width="310"
        height="195"
        rx="14"
        fill="rgba(255,255,255,0.09)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <rect x="108" y="328" width="284" height="168" rx="8" fill="rgba(0,12,55,0.45)" />
      {/* Dashboard header text */}
      <rect x="122" y="341" width="95" height="10" rx="5" fill="rgba(255,255,255,0.55)" />
      <rect x="122" y="356" width="145" height="5" rx="2.5" fill="rgba(255,255,255,0.22)" />
      <rect x="122" y="366" width="120" height="5" rx="2.5" fill="rgba(255,255,255,0.22)" />
      {/* Request status rows */}
      {(
        [
          { y: 380, barW: 65, color: 'rgba(52,211,153,0.75)' },
          { y: 406, barW: 92, color: 'rgba(251,191,36,0.75)' },
          { y: 432, barW: 48, color: 'rgba(239,68,68,0.72)' },
        ] as const
      ).map(({ y, barW, color }, i) => (
        <g key={i}>
          <rect
            x="122"
            y={y}
            width="256"
            height="22"
            rx="6"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <rect x="128" y={y + 5} width="12" height="12" rx="3" fill={color} />
          <rect x="147" y={y + 7} width={barW} height="5" rx="2.5" fill={color} opacity={0.45} />
        </g>
      ))}
      {/* Laptop base */}
      <rect
        x="95"
        y="510"
        width="310"
        height="12"
        rx="6"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
      />
      <rect
        x="165"
        y="522"
        width="170"
        height="9"
        rx="4.5"
        fill="rgba(255,255,255,0.07)"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />

      {/* ── WORKER FIGURE ─────────────────────── */}
      {/* Legs */}
      <rect x="228" y="395" width="18" height="90" rx="9" fill="rgba(255,255,255,0.78)" />
      <rect x="254" y="395" width="18" height="90" rx="9" fill="rgba(255,255,255,0.78)" />
      {/* Torso / uniform */}
      <path
        d="M195 350 Q208 336 250 332 Q292 336 305 350 L312 415 L188 415 Z"
        fill="rgba(255,255,255,0.88)"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="1.5"
      />
      {/* Hi-vis stripe */}
      <path
        d="M200 388 L300 388"
        stroke="rgba(251,191,36,0.55)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Chest pocket */}
      <rect
        x="215"
        y="350"
        width="24"
        height="20"
        rx="4"
        fill="rgba(100,160,255,0.22)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
      />
      {/* Neck */}
      <rect x="242" y="284" width="16" height="24" rx="7" fill="rgba(255,255,255,0.88)" />
      {/* Head */}
      <ellipse
        cx="250"
        cy="248"
        rx="40"
        ry="42"
        fill="rgba(255,255,255,0.90)"
        stroke="rgba(255,255,255,1)"
        strokeWidth="1.5"
      />
      {/* Hard hat dome */}
      <path
        d="M207 238 Q210 202 250 200 Q290 202 293 238"
        fill="rgba(37,99,235,0.85)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      {/* Hard hat brim */}
      <rect
        x="200"
        y="234"
        width="100"
        height="11"
        rx="5.5"
        fill="rgba(37,99,235,0.85)"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="1.5"
      />
      {/* Hat highlight */}
      <rect x="205" y="237" width="90" height="3" rx="1.5" fill="rgba(255,255,255,0.22)" />
      {/* Eyes */}
      <circle cx="238" cy="252" r="4.5" fill="rgba(30,55,115,0.45)" />
      <circle cx="262" cy="252" r="4.5" fill="rgba(30,55,115,0.45)" />
      {/* Smile */}
      <path
        d="M242 268 Q250 276 258 268"
        stroke="rgba(30,55,115,0.45)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right arm → wrench */}
      <path
        d="M300 356 Q342 342 365 320"
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="17"
        strokeLinecap="round"
      />
      <rect
        x="354"
        y="290"
        width="10"
        height="42"
        rx="5"
        fill="rgba(255,255,255,0.85)"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth="1"
        transform="rotate(38 354 290)"
      />
      <circle
        cx="376"
        cy="298"
        r="12"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="3.5"
      />
      <circle cx="376" cy="298" r="5" fill="rgba(255,255,255,0.45)" />
      <circle
        cx="394"
        cy="288"
        r="10"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="3.5"
      />

      {/* Left arm */}
      <path
        d="M200 356 Q162 368 138 390"
        stroke="rgba(255,255,255,0.88)"
        strokeWidth="17"
        strokeLinecap="round"
      />

      {/* ── FLOATING ICON CARDS ───────────────── */}

      {/* Card: wrench – top-left */}
      <rect
        x="38"
        y="76"
        width="70"
        height="70"
        rx="16"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <circle cx="73" cy="97" r="9" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
      <rect x="70" y="105" width="6" height="22" rx="3" fill="rgba(255,255,255,0.8)" />
      <circle cx="73" cy="130" r="6" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />

      {/* Card: building – top-right */}
      <rect
        x="392"
        y="66"
        width="70"
        height="70"
        rx="16"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <rect
        x="408"
        y="100"
        width="36"
        height="28"
        rx="3"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
      />
      <polygon
        points="426,83 444,100 408,100"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="419" y="110" width="12" height="18" rx="2" fill="rgba(255,255,255,0.38)" />
      <rect x="410" y="106" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.3)" />
      <rect x="432" y="106" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.3)" />

      {/* Card: checkmark – right */}
      <rect
        x="430"
        y="208"
        width="70"
        height="70"
        rx="16"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <circle
        cx="465"
        cy="243"
        r="19"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
      />
      <path
        d="M455 243 L461 251 L476 234"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Card: bell – left */}
      <rect
        x="18"
        y="215"
        width="70"
        height="70"
        rx="16"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <line
        x1="53"
        y1="221"
        x2="53"
        y2="226"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M38 252 L38 239 Q38 225 53 225 Q68 225 68 239 L68 252 Z"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
      />
      <line
        x1="35"
        y1="252"
        x2="71"
        y2="252"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="53" cy="258" r="5" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" />
      <circle cx="64" cy="224" r="5" fill="rgba(239,68,68,0.85)" />

      {/* Card: clipboard – bottom-left */}
      <rect
        x="36"
        y="386"
        width="70"
        height="70"
        rx="16"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <rect
        x="50"
        y="397"
        width="42"
        height="52"
        rx="4"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
      />
      <rect
        x="63"
        y="393"
        width="16"
        height="8"
        rx="4"
        fill="rgba(255,255,255,0.45)"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="1.5"
      />
      <line
        x1="57"
        y1="413"
        x2="86"
        y2="413"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="57"
        y1="422"
        x2="82"
        y2="422"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="57"
        y1="431"
        x2="84"
        y2="431"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="57"
        y1="440"
        x2="80"
        y2="440"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Card: gear – bottom-right */}
      <rect
        x="390"
        y="378"
        width="70"
        height="70"
        rx="16"
        fill="rgba(255,255,255,0.12)"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
      <circle
        cx="425"
        cy="413"
        r="10"
        fill="none"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="2.5"
      />
      <circle cx="425" cy="413" r="4" fill="rgba(255,255,255,0.45)" />
      {/* Cardinal teeth */}
      <rect x="422" y="392" width="6" height="9" rx="2.5" fill="rgba(255,255,255,0.8)" />
      <rect x="422" y="426" width="6" height="9" rx="2.5" fill="rgba(255,255,255,0.8)" />
      <rect x="404" y="410" width="9" height="6" rx="2.5" fill="rgba(255,255,255,0.8)" />
      <rect x="437" y="410" width="9" height="6" rx="2.5" fill="rgba(255,255,255,0.8)" />
      {/* Diagonal teeth */}
      <rect
        x="408"
        y="396"
        width="6"
        height="9"
        rx="2.5"
        fill="rgba(255,255,255,0.8)"
        transform="rotate(45 411 400)"
      />
      <rect
        x="436"
        y="396"
        width="6"
        height="9"
        rx="2.5"
        fill="rgba(255,255,255,0.8)"
        transform="rotate(-45 439 400)"
      />
      <rect
        x="408"
        y="422"
        width="6"
        height="9"
        rx="2.5"
        fill="rgba(255,255,255,0.8)"
        transform="rotate(-45 411 426)"
      />
      <rect
        x="436"
        y="422"
        width="6"
        height="9"
        rx="2.5"
        fill="rgba(255,255,255,0.8)"
        transform="rotate(45 439 426)"
      />
    </svg>
  );
}
