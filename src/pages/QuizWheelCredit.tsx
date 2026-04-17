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
        {/* ── Pass 1: all slice fills ── */}
        {SEGMENTS.map((seg, i) => {
          const s = ((i * SLICE - 90) * Math.PI) / 180;
          const e = (((i + 1) * SLICE - 90) * Math.PI) / 180;
          return (
            <path
              key={i}
              d={`M ${CX} ${CY} L ${CX + R * Math.cos(s)} ${CY + R * Math.sin(s)} A ${R} ${R} 0 0 1 ${CX + R * Math.cos(e)} ${CY + R * Math.sin(e)} Z`}
              fill={seg.color}
              stroke="rgba(255,255,255,0)"
              strokeWidth="1"
            />
          );
        })}

        {/* ── Pass 2: labels — absolute coords, individual text rotation ── */}
        {SEGMENTS.map((seg, i) => {
          /**
           * rotDeg: mid-angle of segment i, measured CLOCKWISE FROM 12 O'CLOCK.
           * This is the angle in our "wheel space" where angle=0 is straight up.
           */
          const rotDeg = i * SLICE + SLICE / 2;

          /**
           * angleRad: same angle but in standard SVG math convention
           * (0 = right, positive = clockwise). Used for cos/sin to get x/y.
           */
          const rad = ((rotDeg - 90) * Math.PI) / 180;

          // Absolute SVG coords for each label row
          const iconR = R * 0.74;
          const ix = CX + iconR * Math.cos(rad);
          const iy = CY + iconR * Math.sin(rad);

          const lblR = R * 0.54;
          const lx = CX + lblR * Math.cos(rad);
          const ly = CY + lblR * Math.sin(rad);

          const subR = R * 0.37;
          const sx = CX + subR * Math.cos(rad);
          const sy = CY + subR * Math.sin(rad);

          /**
           * Text rotation angle:
           * - For top-right / top-left segments (rotDeg ≤ 90 or ≥ 270):
           *   rotate by rotDeg — text reads "from center outward" radially.
           * - For bottom segments (90 < rotDeg < 270):
           *   add 180° so the characters are NOT upside-down. Text then reads
           *   "from rim inward" which is perfectly readable.
           */
          const needsFlip = rotDeg > 90 && rotDeg < 270;
          const ta = needsFlip ? rotDeg - 180 : rotDeg;

          const rot = (px: number, py: number) => `rotate(${ta},${px},${py})`;

          return (
            <g key={i}>
              <text
                x={ix}
                y={iy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="24"
                transform={rot(ix, iy)}
              >
                {seg.icon}
              </text>
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="17"
                fontWeight="900"
                fill="#fff"
                fontFamily="Inter,system-ui,sans-serif"
                transform={rot(lx, ly)}
              >
                {seg.label}
              </text>
              <text
                x={sx}
                y={sy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="700"
                fill="rgba(255,255,255,0.92)"
                fontFamily="Inter,system-ui,sans-serif"
                letterSpacing="0.8"
                transform={rot(sx, sy)}
              >
                {seg.sub}
              </text>
            </g>
          );
        })}

        {/* Dividers on top of text */}
        {SEGMENTS.map((_, i) => {
          const a = ((i * SLICE - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={CX + R * Math.cos(a)}
              y2={CY + R * Math.sin(a)}
              stroke="rgba(255,255,255,0.75)"
              strokeWidth="2.5"
            />
          );
        })}

        {/* Outer ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="3.5"
        />

        {/* Centre hub */}
        <circle cx={CX} cy={CY} r={26} fill="white" />
        <circle cx={CX} cy={CY} r={17} fill="#4c1d95" />
        <circle cx={CX} cy={CY} r={7} fill="white" />
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
