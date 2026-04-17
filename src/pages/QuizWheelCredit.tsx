import { useEffect, useRef, useState } from 'react';
import './QuizWheelCredit.css';

/* ── Obfuscated offer URL ── */
const _u = ['aHR0cHM6Ly9y', 'b3V0ZXJpeC50', 'ZWNoL2RpcmVj', 'dC9lbXAtZW4v'];
function buildOfferUrl(): string {
  const base = new URL(atob(_u.join('')));
  const incoming = new URLSearchParams(window.location.search);
  incoming.forEach((v, k) => base.searchParams.set(k, v));
  return base.toString();
}

/* ── Segments (index 0 = top-right, clockwise) ── */
const SEGMENTS = [
  { label: '$2,000', sub: 'LIMIT', icon: '💳', color: '#f43f7f' },
  { label: 'CREDIT', sub: 'APPROVED', icon: '🤝', color: '#22c55e' },
  { label: '$200', sub: 'LOAN', icon: '💵', color: '#f97316' },
  { label: '$1,000', sub: 'APPROVED', icon: '🏦', color: '#38bdf8' },
  { label: '$50', sub: 'EXTRA', icon: '🐷', color: '#14b8a6' },
  { label: '$1,500', sub: 'CASH', icon: '💰', color: '#7c3aed' }, // always wins
];

const TOTAL = SEGMENTS.length;
const SLICE = 360 / TOTAL; // 60°
const WIN_IDX = 5;

/** Mid-angle of a segment from 12-o'clock, clockwise (degrees) */
const segMidAngle = (idx: number) => idx * SLICE + SLICE / 2;

/**
 * Returns { final, overshoot }:
 * 1. Spin to `overshoot` (past winner)
 * 2. Ease back to `final` (exactly on winner)
 */
function calcAngles(currentAngle: number) {
  const mid = segMidAngle(WIN_IDX); // 330°
  const needed = (360 - mid) % 360; // 30° extra → brings mid to top
  const base = currentAngle + 1440 + needed; // 4 full rotations + alignment
  return { final: base, overshoot: base + 38 };
}

/* ── Confetti ── */
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = [
    '#7c3aed',
    '#f43f7f',
    '#22c55e',
    '#f97316',
    '#38bdf8',
    '#fbbf24',
    '#14b8a6',
  ];
  const pieces = Array.from({ length: 160 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    vx: (Math.random() - 0.5) * 7,
    vy: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 3,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 10,
  }));
  let raf: number;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      p.vy += 0.15;
      if (p.y < canvas.height + 30) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) raf = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  raf = requestAnimationFrame(tick);
  setTimeout(() => {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}

/* ── Wheel SVG ── */
const CX = 200,
  CY = 200,
  R = 188;

function WheelSVG({
  angle,
  transition,
}: {
  angle: number;
  transition: string;
}) {
  return (
    <div
      className="qw-wheel"
      style={{ transform: `rotate(${angle}deg)`, transition }}
      aria-label="Prize wheel"
      role="img"
    >
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        {/* Segments */}
        {SEGMENTS.map((seg, i) => {
          const startRad = ((i * SLICE - 90) * Math.PI) / 180;
          const endRad = (((i + 1) * SLICE - 90) * Math.PI) / 180;
          const x1 = CX + R * Math.cos(startRad);
          const y1 = CY + R * Math.sin(startRad);
          const x2 = CX + R * Math.cos(endRad);
          const y2 = CY + R * Math.sin(endRad);

          // Mid-angle in SVG coords (0° = right, clockwise)
          const midSVG = i * SLICE + SLICE / 2 - 90;

          return (
            <g key={i}>
              <path
                d={`M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
                fill={seg.color}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
              />
              {/*
                Rotate group to the mid-angle of this segment,
                then place content along the radius.
                Within the rotated frame "up" = toward outer edge.
              */}
              <g transform={`rotate(${midSVG}, ${CX}, ${CY})`}>
                {/* Icon — at outer area */}
                <text
                  x={CX}
                  y={CY - R * 0.72}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="22"
                >
                  {seg.icon}
                </text>
                {/* Line 1 */}
                <text
                  x={CX}
                  y={CY - R * 0.52}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="15"
                  fontWeight="900"
                  fontFamily="Inter, system-ui, sans-serif"
                  fill="#fff"
                >
                  {seg.label}
                </text>
                {/* Line 2 */}
                <text
                  x={CX}
                  y={CY - R * 0.36}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Inter, system-ui, sans-serif"
                  fill="rgba(255,255,255,0.88)"
                  letterSpacing="1"
                >
                  {seg.sub}
                </text>
              </g>
            </g>
          );
        })}

        {/* Dividers */}
        {SEGMENTS.map((_, i) => {
          const a = ((i * SLICE - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={CX + R * Math.cos(a)}
              y2={CY + R * Math.sin(a)}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />
          );
        })}

        {/* Outer border */}
        <circle
          cx={CX}
          cy={CY}
          r={R + 1}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="3"
        />

        {/* Centre hub */}
        <circle cx={CX} cy={CY} r={28} fill="white" />
        <circle cx={CX} cy={CY} r={18} fill="#4c1d95" />
        <circle cx={CX} cy={CY} r={8} fill="white" />
      </svg>
    </div>
  );
}

/* ── Page component ── */
type Phase = 'idle' | 'spinning' | 'won';

export default function QuizWheelCredit() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [angle, setAngle] = useState(0);
  const [wheelTransition, setWheelTransition] = useState('none');
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  const handleSpin = () => {
    if (phase !== 'idle') return;
    setPhase('spinning');

    const { final, overshoot } = calcAngles(angleRef.current);

    // Step 1: fast spin to overshoot position
    setWheelTransition('transform 4.6s cubic-bezier(0.12, 0.8, 0.2, 1)');
    setAngle(overshoot);

    // Step 2: elastic snap back to exact winner
    setTimeout(() => {
      setWheelTransition('transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)');
      setAngle(final);
      angleRef.current = final;
    }, 4700);

    // Step 3: show win panel + confetti
    setTimeout(() => {
      setPhase('won');
      if (confettiRef.current) launchConfetti(confettiRef.current);
    }, 5350);
  };

  return (
    <div className="qw-page">
      <canvas ref={confettiRef} className="qw-confetti" aria-hidden="true" />
      <div className="qw-blob qw-blob--tl" aria-hidden="true" />
      <div className="qw-blob qw-blob--br" aria-hidden="true" />

      <main className="qw-main">
        {/* Heading */}
        <h1 className="qw-heading">
          <span className="qw-hl-spin">Spin</span> the{' '}
          <span className="qw-hl-acc">Financial Wheel</span> and Win Prizes
        </h1>

        {/* Wheel */}
        <div className="qw-wheel-wrap">
          <div className="qw-pointer" aria-hidden="true" />
          <WheelSVG angle={angle} transition={wheelTransition} />
        </div>

        {/* CTA area — fixed height to prevent layout shift */}
        <div className="qw-cta-area">
          {phase !== 'won' ? (
            <>
              <button
                id="qw-spin-btn"
                className="qw-spin-btn"
                onClick={handleSpin}
                disabled={phase === 'spinning'}
                aria-label="Spin the wheel"
              >
                {phase === 'spinning' ? (
                  <>
                    <span className="qw-dot" />
                    &nbsp;Spinning…
                  </>
                ) : (
                  '🎡 Spin Now'
                )}
              </button>
              {phase === 'idle' && (
                <p className="qw-trust">
                  🔒 Verified &nbsp;·&nbsp; 🎁 Real Prizes &nbsp;·&nbsp; ⚡
                  Instant
                </p>
              )}
            </>
          ) : (
            <div className="qw-win-panel" role="status" aria-live="polite">
              <p className="qw-win-top">🎉 You Won!</p>
              <p className="qw-win-prize">$1,500 CASH 💰</p>
              <a
                id="qw-claim-btn"
                href={buildOfferUrl()}
                className="qw-claim-btn"
              >
                CLAIM NOW ✅
              </a>
              <p className="qw-win-notice">⏳ Offer expires soon</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="qw-footer">
        <p className="qw-disclaimer">
          For informational purposes only. Not financial advice. Results may
          vary. Browser notifications are optional and can be disabled at any
          time.
        </p>
        <p className="qw-legal">
          By continuing you agree to our{' '}
          <a href="/terms" className="qw-link">
            Terms
          </a>{' '}
          &amp;{' '}
          <a href="/privacy" className="qw-link">
            Privacy Policy
          </a>
          . &nbsp;© 2026 VV7 HOLDING LLC · GB107069528 ·{' '}
          <a href="mailto:contact@vv7.tech" className="qw-link">
            contact@vv7.tech
          </a>
        </p>
      </footer>
    </div>
  );
}
