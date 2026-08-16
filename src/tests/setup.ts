import '@testing-library/jest-dom';
import React from 'react';
import { vi, beforeEach, afterEach } from 'vitest';

// ─── Mock localStorage ───────────────────────────────────────────────────────
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
});

// ─── Mock Supabase ────────────────────────────────────────────────────────────
// Evita chamadas reais à API durante os testes unitários/integração.
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      mfa: {
        getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
          data: { currentLevel: null, nextLevel: null },
          error: null,
        }),
        listFactors: vi.fn().mockResolvedValue({
          data: { all: [], totp: [] },
          error: null,
        }),
        enroll: vi.fn().mockResolvedValue({
          data: { id: 'mock-factor-id', totp: { qr_code: '<svg></svg>', secret: 'MOCKSECRET123' } },
          error: null,
        }),
        challengeAndVerify: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
        unenroll: vi.fn().mockResolvedValue({ data: {}, error: null }),
      },
    },
  },
}));

// ─── Mock motion/react ───────────────────────────────────────────────────────
vi.mock('motion/react', async () => {
  const React = await import('react');
  const motion = new Proxy({} as Record<string, React.FC<React.HTMLAttributes<HTMLElement> & { [key: string]: unknown }>>, {
    get: (_target, tag: string) =>
      ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { [key: string]: unknown }) =>
        React.createElement(tag as keyof React.JSX.IntrinsicElements, props as object, children),
  });
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    useMotionValue: () => ({ set: vi.fn(), get: vi.fn(() => 0) }),
    useSpring: (v: unknown) => v,
    useTransform: () => 0,
    useScroll: () => ({ scrollY: { onChange: vi.fn() }, scrollYProgress: 0 }),
    useMotionValueEvent: vi.fn(),
    useInView: () => true,
  };
});

// ─── Mock react-router-dom ───────────────────────────────────────────────────
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  };
});

// ─── Silence console.error/warn em testes ───────────────────────────────────
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});
