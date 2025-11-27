// Authentication related constants
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'authToken',
  REDIRECT_URL: 'redirectAfterLogin',
} as const;

// API endpoints
export const AUTH_ENDPOINTS = {
  GOOGLE_LOGIN: 'auth/google',
  GOOGLE_EXCHANGE: 'auth/google/exchange',
  VERIFY_TOKEN: 'auth/verify',
} as const;

// Default routes
export const DEFAULT_ROUTES = {
  HOME: '/',
  AUTH_CALLBACK: '/auth/callback',
} as const;
