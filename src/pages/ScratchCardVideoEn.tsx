import { useEffect, useRef, useState } from 'react';
import './ScratchCardVideoEn.css';

/* ── Obfuscated offer URL — https://routerix.tech/direct/marketing-digital-en/ ── */
const _u = [
  'aHR0cHM6Ly9y',
  'b3V0ZXJpeC50',
  'ZWNoL2RpcmVj',
  'dC9tYXJrZXRp',
  'bmctZGlnaXRh',
  'bC1lbi8=',
];
function buildOfferUrl(): string {
  const base = new URL(atob(_u.join('')));
  const incoming = new URLSearchParams(window.location.search);
  incoming.forEach((v, k) => base.searchParams.set(k, v));
  return base.toString();
}

/* ── Quiz options ── */
const VIDEO_OPTIONS = [
  { id: '10min', icon: '⚡', label: '10–20 min', sub: 'Quick sessions' },
  { id: '30min', icon: '⏳', label: '30–60 min', sub: 'Moderate pace' },
  { id: '1hr', icon: '🎯', label: '1–2 hours', sub: 'Serious earner' },
  { id: '2hr', icon: '🏆', label: '2+ hours', sub: 'Max earnings' },
];

/* ── Confetti ── */
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = [
    '#cc00ff',
    '#9900cc',
    '#ff66ff',
    '#e040fb',
    '#fff',
    '#ba68c8',
    '#f59e0b',
  ];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * 5 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    w: Math.random() * 12 + 4,
    h: Math.random() * 7 + 3,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 12,
  }));
  let raf: number;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      p.vy += 0.18;
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
  }, 5500);
}

/* ────────────────────────────────────────
   Scratch Card Canvas Component
   ──────────────────────────────────────── */
function ScratchCard({ onRevealed }: { onRevealed: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const revealedRef = useRef(false);
  const [hintVisible, setHintVisible] = useState(true);

  /* ── Draw premium purple scratch overlay ── */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    /* Rich dark indigo metallic gradient — refined, not neon */
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, '#0e0825');
    base.addColorStop(0.2, '#1a1040');
    base.addColorStop(0.42, '#251655');
    base.addColorStop(0.58, '#1e1248');
    base.addColorStop(0.78, '#160e38');
    base.addColorStop(1, '#0b0620');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    /* Fine cross-hatch grid texture */
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    /* Subtle diagonal shine lines */
    ctx.strokeStyle = 'rgba(124, 58, 237, 0.12)';
    ctx.lineWidth = 10;
    for (let i = -H; i < W + H; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }

    /* Outer dark frame */
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, W, H);

    /* Inner gold border — luxury touch */
    ctx.strokeStyle = 'rgba(212,175,55,0.45)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    /* Subtle center glow */
    const panelGrad = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      W * 0.42,
    );
    panelGrad.addColorStop(0, 'rgba(109, 40, 217, 0.18)');
    panelGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = panelGrad;
    ctx.fillRect(0, 0, W, H);

    /* Diamond decorations */
    const drawDiamond = (cx: number, cy: number, r: number) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.6, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r * 0.6, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawDiamond(40, H / 2, 14);
    drawDiamond(W - 40, H / 2, 14);
    drawDiamond(W / 2, 32, 10);
    drawDiamond(W / 2, H - 32, 10);

    /* Main text */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(204,0,255,0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 0;

    /* Coin emoji */
    ctx.font = '50px serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🪙', W / 2, H / 2 - 50);

    /* SCRATCH HERE */
    ctx.font = 'bold 26px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('SCRATCH HERE', W / 2, H / 2 + 8);

    /* Sub-text */
    ctx.shadowBlur = 0;
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText('to unlock your earning apps', W / 2, H / 2 + 38);
    ctx.shadowColor = 'transparent';
  }, []);

  /* ── Erase pixels ── */
  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const cx = (x - rect.left) * (canvas.width / rect.width);
    const cy = (y - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(0.7, 'rgba(0,0,0,0.9)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    if (!revealedRef.current) checkCoverage(canvas);
  };

  const checkCoverage = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const total = canvas.width * canvas.height;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 128) transparent++;
    }
    const pct = (transparent * 4) / total;
    if (pct > 0.85) {
      revealedRef.current = true;
      setHintVisible(false);
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
      let alpha = 1;
      const fadeOut = () => {
        alpha -= 0.05;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (alpha > 0) requestAnimationFrame(fadeOut);
        else {
          ctx.globalAlpha = 1;
          onRevealed();
        }
      };
      requestAnimationFrame(fadeOut);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (isDrawing.current) scratch(e.clientX, e.clientY);
  };
  const onMouseUp = () => {
    isDrawing.current = false;
  };
  const onTouchStart = (e: React.TouchEvent) => {
    isDrawing.current = true;
    scratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isDrawing.current) scratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = () => {
    isDrawing.current = false;
  };

  return (
    <div className="sv-ticket-wrap">
      {/* Revealed content underneath */}
      <div className="sv-reveal">
        <div className="sv-reveal-stars" aria-hidden="true">
          ◆ ◆ ◆
        </div>
        <span className="sv-eligible-pill">✓ Eligible for earnings</span>
        <p className="sv-reveal-amount">
          $500<span>/day</span>
        </p>
        <p className="sv-reveal-title">watching videos</p>
        <p className="sv-reveal-desc">
          Based on your profile, we found options with fast cashout and tasks on
          your schedule.
        </p>
        <a href={buildOfferUrl()} className="sv-reveal-cta" rel="noopener">
          ACCESS DIGITAL MARKETING →
        </a>
        <div
          className="sv-reveal-stars sv-reveal-stars--btm"
          aria-hidden="true"
        >
          ◆ ◆ ◆
        </div>
      </div>

      {/* Scratch overlay canvas */}
      <canvas
        ref={canvasRef}
        className="sv-canvas"
        width={500}
        height={380}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />

      {hintVisible && (
        <p className="sv-hint">🪙 Scratch to reveal your earning potential</p>
      )}
    </div>
  );
}

/* ── Page ── */
type Phase = 'question' | 'scratch';

export default function ScratchCardVideoEn() {
  const [phase, setPhase] = useState<Phase>('question');
  const [choice, setChoice] = useState('');
  const confettiRef = useRef<HTMLCanvasElement>(null);

  const handleChoice = (id: string) => {
    setChoice(id);
    setTimeout(() => setPhase('scratch'), 180);
  };

  const handleRevealed = () => {
    if (confettiRef.current) launchConfetti(confettiRef.current);
  };

  return (
    <div className="sv-page">
      <canvas ref={confettiRef} className="sv-confetti" aria-hidden="true" />

      {/* Blobs */}
      <div className="sv-blob sv-blob--tl" aria-hidden="true" />
      <div className="sv-blob sv-blob--br" aria-hidden="true" />

      {/* Header */}
      <header className="sv-header">
        <div className="sv-logo">
          📹 VideoCash<span>+</span>
        </div>
        <div className="sv-header-badges">
          <span>🔒 Secure</span>
          <span>💸 Get Paid</span>
        </div>
      </header>

      {/* Main */}
      <main className="sv-main">
        <div
          className={`sv-card ${phase === 'scratch' ? 'sv-card--glow' : ''}`}
        >
          {/* STEP 1 */}
          {phase === 'question' && (
            <div className="sv-step sv-step--question">
              <p className="sv-step-tag">Step 1 of 1</p>
              <h1 className="sv-heading">
                Earn money <span className="sv-hl">watching videos</span>
              </h1>
              <p className="sv-subheading">
                Answer 1 question. Scratch the card and unlock the apps that
                pay.
              </p>

              <p className="sv-q">
                How much time per day can you watch videos?
              </p>

              <div className="sv-options">
                {VIDEO_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`sv-opt-btn ${choice === opt.id ? 'sv-opt-btn--active' : ''}`}
                    onClick={() => handleChoice(opt.id)}
                  >
                    <div className="sv-opt-icon">{opt.icon}</div>
                    <div className="sv-opt-text">
                      <span className="sv-opt-label">{opt.label}</span>
                      <span className="sv-opt-sub">{opt.sub}</span>
                    </div>
                    <span className="sv-opt-arrow">›</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {phase === 'scratch' && (
            <div className="sv-step sv-step--scratch">
              <p className="sv-step-tag">🎉 Scratch to unlock your deal</p>
              <ScratchCard onRevealed={handleRevealed} />
            </div>
          )}
        </div>

        {/* Trust bar */}
        <div className="sv-trust">
          <span>⭐ 4.7/5 rating</span>
          <span>📱 Works on any device</span>
          <span>💰 Instant cashout</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="sv-footer">
        <p className="sv-disclaimer">
          Note: illustrative values. Rules and availability vary by app and
          country. This is an advertisement.
        </p>
        <p className="sv-legal">
          By continuing you agree to our{' '}
          <a href="/terms" className="sv-link">
            Terms
          </a>{' '}
          &amp;{' '}
          <a href="/privacy" className="sv-link">
            Privacy Policy
          </a>
          . © 2026 VV7 HOLDING LLC · GB107069528 ·{' '}
          <a href="mailto:contact@vv7.tech" className="sv-link">
            contact@vv7.tech
          </a>
        </p>
      </footer>
    </div>
  );
}
