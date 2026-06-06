/// <reference types="vite/client" />

interface CookieConsentInstance {
  initialise: (options: Record<string, unknown>) => void;
}

interface Window {
  cookieconsent?: CookieConsentInstance;
}
