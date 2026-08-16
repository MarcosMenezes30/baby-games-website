import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
