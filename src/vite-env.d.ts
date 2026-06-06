/// <reference types="vite/client" />

// React 18.3's runtime does not recognise the camelCase `fetchPriority` prop
// (it warns and asks for the lowercase HTML attribute). We pass the lowercase
// `fetchpriority` on <img> instead; declare it here so TSX still type-checks.
import 'react';

declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

declare global {
  interface CookieConsentInstance {
    initialise: (options: Record<string, unknown>) => void;
  }

  interface Window {
    cookieconsent?: CookieConsentInstance;
  }
}
