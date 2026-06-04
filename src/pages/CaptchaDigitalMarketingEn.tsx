import { useState, useEffect } from 'react';
import './CaptchaCredit.css'; // Reuse the shared captcha stylesheet

const CaptchaDigitalMarketingEn = () => {
  const [clicked, setClicked] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 6,
    }));
    setParticles(generated);
  }, []);

  const handleButtonClick = () => {
    // One click is enough to pass. No redirect for now — we just show the
    // success state. To enable a redirect later, navigate from here, e.g.:
    // window.location.href = 'https://...';
    setClicked(true);
  };

  return (
    <div className="captcha-page">
      {/* Animated background particles */}
      <div className="captcha-bg" aria-hidden="true">
        {particles.map(p => (
          <span
            key={p.id}
            className="captcha-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
        <div className="captcha-glow captcha-glow--top-left" />
        <div className="captcha-glow captcha-glow--bottom-right" />
      </div>

      {/* Main card */}
      <main className="captcha-card" role="main">
        {/* Shield icon */}
        <div
          className={`captcha-shield-wrap ${clicked ? 'captcha-shield-wrap--success' : ''}`}
        >
          {clicked ? (
            <svg
              className="captcha-shield-icon captcha-shield-icon--check"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M32 4L8 14v18c0 13.255 10.32 24.594 24 27 13.68-2.406 24-13.745 24-27V14L32 4z"
                fill="url(#shieldGradSuccessDigitalEn)"
              />
              <path
                d="M20 32l8 8 16-16"
                stroke="#fff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient
                  id="shieldGradSuccessDigitalEn"
                  x1="8"
                  y1="4"
                  x2="56"
                  y2="58"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#22c55e" />
                  <stop offset="1" stopColor="#16a34a" />
                </linearGradient>
              </defs>
            </svg>
          ) : (
            <svg
              className="captcha-shield-icon"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M32 4L8 14v18c0 13.255 10.32 24.594 24 27 13.68-2.406 24-13.745 24-27V14L32 4z"
                fill="url(#shieldGradDigitalEn)"
              />
              <path
                d="M32 22v10M32 38h.01"
                stroke="#fff"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="shieldGradDigitalEn"
                  x1="8"
                  y1="4"
                  x2="56"
                  y2="58"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4BC8BE" />
                  <stop offset="1" stopColor="#039185" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {/* Heading */}
        <h1
          className={`captcha-heading ${clicked ? 'captcha-heading--success' : ''}`}
        >
          {clicked
            ? 'Verification Successful!'
            : "Please confirm you're not a robot to continue"}
        </h1>

        {/* Subtext */}
        <p className="captcha-subtext">
          {clicked
            ? "You're all set — thanks for confirming."
            : 'This quick check helps us keep the experience safe and spam-free.'}
        </p>

        {/* Trust badges row */}
        {!clicked && (
          <div className="captcha-badges" aria-label="Security features">
            <div className="captcha-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              SSL Secured
            </div>
            <div className="captcha-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Private & Safe
            </div>
            <div className="captcha-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Source
            </div>
          </div>
        )}

        {/* CTA Button — one click passes the check */}
        {!clicked && (
          <button
            id="captcha-digital-marketing-en-btn"
            className="captcha-btn captcha-btn--verify"
            onClick={handleButtonClick}
            aria-label="I'm not a robot"
          >
            <span className="captcha-btn-text">I'M NOT A ROBOT</span>
            <svg
              className="captcha-btn-arrow"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
};

export default CaptchaDigitalMarketingEn;
