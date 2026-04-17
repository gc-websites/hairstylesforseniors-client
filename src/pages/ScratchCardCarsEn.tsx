import { useEffect, useRef, useState } from 'react';
import './ScratchCardCarsEn.css';

/* ── Obfuscated offer URL — https://routerix.tech/direct/carros-en/ ── */
const _u = [
  'aHR0cHM6Ly9y',
  'b3V0ZXJpeC50',
  'ZWNoL2RpcmVj',
  'dC9jYXJyb3Mt',
  'ZW4v',
];
function buildOfferUrl(): string {
  const base = new URL(atob(_u.join('')));
  const incoming = new URLSearchParams(window.location.search);
  incoming.forEach((v, k) => base.searchParams.set(k, v));
  return base.toString();
}

/* ── Options for the quiz question ── */
const CAR_OPTIONS = [
  { id: 'electric', icon: '⚡', label: 'Electric', sub: 'Tesla, Rivian, etc.' },
  { id: 'gasoline', icon: '🔥', label: 'Gasoline', sub: 'Toyota, Ford, etc.' },
  { id: 'any', icon: '🚗', label: 'Any Type', sub: 'Show me all deals' },
];

/* ── Confetti ── */
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = [
    '#f59e0b',
    '#3b82f6',
    '#10b981',
    '#ef4444',
    '#8b5cf6',
    '#f97316',
  ];
  const pieces = Array.from({ length: 140 }, () => ({
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

  /* ── Draw premium scratch overlay ── */
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width;
    const H = canvas.height;

    /* Rich dark-gold metallic gradient (bottom layer) */
    const base = ctx.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, '#b8860b');
    base.addColorStop(0.18, '#d4a017');
    base.addColorStop(0.38, '#c8960a');
    base.addColorStop(0.55, '#e8c030');
    base.addColorStop(0.72, '#c8960a');
    base.addColorStop(0.9, '#d4a017');
    base.addColorStop(1, '#a07010');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    /* Fine cross-hatch grid for texture */
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
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

    /* Diagonal shine lines */
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 8;
    for (let i = -H; i < W + H; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }

    /* Outer dark frame */
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 14;
    ctx.strokeRect(0, 0, W, H);

    /* Inner gold border */
    ctx.strokeStyle = 'rgba(255,215,0,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, W - 24, H - 24);

    /* Center panel: slightly lighter to draw attention */
    const panelGrad = ctx.createRadialGradient(
      W / 2,
      H / 2,
      0,
      W / 2,
      H / 2,
      W * 0.45,
    );
    panelGrad.addColorStop(0, 'rgba(255,215,0,0.18)');
    panelGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = panelGrad;
    ctx.fillRect(0, 0, W, H);

    /* Star decorations */
    const drawStar = (cx: number, cy: number, r: number) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const angle = (k * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    drawStar(40, H / 2, 14);
    drawStar(W - 40, H / 2, 14);
    drawStar(W / 2, 32, 10);
    drawStar(W / 2, H - 32, 10);

    /* Main text */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    /* Shadow for depth */
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;

    /* Coin emoji - large */
    ctx.font = '52px serif';
    ctx.fillStyle = '#fff';
    ctx.fillText('🪙', W / 2, H / 2 - 50);

    /* "SCRATCH HERE" */
    ctx.font = 'bold 26px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.letterSpacing = '0.08em';
    ctx.fillText('SCRATCH HERE', W / 2, H / 2 + 8);

    /* Sub-text */
    ctx.shadowBlur = 0;
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText('to reveal your exclusive offer', W / 2, H / 2 + 38);

    ctx.shadowColor = 'transparent';
  }, []);

  /* ── Erase pixels at pointer position ── */
  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (x - rect.left) * scaleX;
    const cy = (y - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    /* Soft eraser: layered circles for feathered edge */
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
    /* Sample every 4th pixel for perf */
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const total = canvas.width * canvas.height;
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 128) transparent++;
    }
    const pct = (transparent * 4) / total; // *4 because we skip 3 of 4 pixels
    if (pct > 0.85) {
      revealedRef.current = true;
      setHintVisible(false);
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
      /* Smooth fade-out */
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

  /* Mouse events */
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

  /* Touch events */
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
    <div className="sc-ticket-wrap">
      {/* Premium lottery ticket revealed underneath */}
      <div className="sc-reveal">
        <div className="sc-reveal-stars" aria-hidden="true">
          ★ ★ ★
        </div>
        <span className="sc-approved-pill">✓ Approved!</span>
        <p className="sc-reveal-title">
          Financing from <strong>$150/mo</strong>,{' '}
          <span className="sc-underline">no&nbsp;down&nbsp;payment</span>
        </p>
        <a href={buildOfferUrl()} className="sc-reveal-cta" rel="noopener">
          CHOOSE MY MODEL →
        </a>
        <div
          className="sc-reveal-stars sc-reveal-stars--btm"
          aria-hidden="true"
        >
          ★ ★ ★
        </div>
      </div>

      {/* Scratch overlay canvas */}
      <canvas
        ref={canvasRef}
        className="sc-canvas"
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

      {hintVisible && <p className="sc-hint">🪙 Scratch to reveal your deal</p>}
    </div>
  );
}

/* ── Page ── */

type Phase = 'question' | 'scratch';

export default function ScratchCardCarsEn() {
  const [phase, setPhase] = useState<Phase>('question');
  const [choice, setChoice] = useState('');
  const confettiRef = useRef<HTMLCanvasElement>(null);

  const handleChoice = (id: string) => {
    setChoice(id);
    setTimeout(() => setPhase('scratch'), 180);
  };

  /* Canvas fades away — ticket stays visible as final result */
  const handleRevealed = () => {
    if (confettiRef.current) launchConfetti(confettiRef.current);
  };

  return (
    <div className="sc-page">
      <canvas ref={confettiRef} className="sc-confetti" aria-hidden="true" />

      {/* Blobs */}
      <div className="sc-blob sc-blob--tl" aria-hidden="true" />
      <div className="sc-blob sc-blob--br" aria-hidden="true" />

      {/* Header */}
      <header className="sc-header">
        <div className="sc-logo">
          🚗 WorldCars<span>.deals</span>
        </div>
        <div className="sc-header-badges">
          <span>🔒 Secure</span>
          <span>⚡ Instant</span>
        </div>
      </header>

      {/* Main card */}
      <main className="sc-main">
        <div
          className={`sc-card ${phase !== 'question' ? 'sc-card--glow' : ''}`}
        >
          {/* ─── STEP 1: Question ─── */}
          {phase === 'question' && (
            <div className="sc-step sc-step--question">
              <p className="sc-step-tag">Step 1 of 1</p>
              <h1 className="sc-heading">
                Drive from <span className="sc-hl">$150/mo</span>
              </h1>
              <p className="sc-subheading">
                Answer 1 quick question. Scratch to reveal your{' '}
                <strong>no&nbsp;money&nbsp;down</strong> deal.
              </p>

              <p className="sc-q">Which type of car do you prefer?</p>

              <div className="sc-options">
                {CAR_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`sc-opt-btn ${choice === opt.id ? 'sc-opt-btn--active' : ''}`}
                    onClick={() => handleChoice(opt.id)}
                  >
                    <div className="sc-opt-icon">{opt.icon}</div>
                    <div className="sc-opt-text">
                      <span className="sc-opt-label">{opt.label}</span>
                      <span className="sc-opt-sub">{opt.sub}</span>
                    </div>
                    <span className="sc-opt-arrow">›</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── STEP 2: Scratch card ─── */}
          {phase === 'scratch' && (
            <div className="sc-step sc-step--scratch">
              <p className="sc-step-tag">
                🎉 Your deal is ready — scratch to unlock it!
              </p>
              <ScratchCard onRevealed={handleRevealed} />
            </div>
          )}
        </div>

        {/* Trust bar */}
        <div className="sc-trust">
          <span>⭐ 4.8/5 rating</span>
          <span>📋 2-min application</span>
          <span>🏦 50+ lenders</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="sc-footer">
        <p className="sc-disclaimer">
          For informational purposes only. Not financial advice. Results and
          approval are not guaranteed and may vary. This is an advertisement.
        </p>
        <p className="sc-legal">
          By continuing you agree to our{' '}
          <a href="/terms" className="sc-link">
            Terms
          </a>{' '}
          &amp;{' '}
          <a href="/privacy" className="sc-link">
            Privacy Policy
          </a>
          . © 2026 VV7 HOLDING LLC · GB107069528 ·{' '}
          <a href="mailto:contact@vv7.tech" className="sc-link">
            contact@vv7.tech
          </a>
        </p>
      </footer>
    </div>
  );
}
