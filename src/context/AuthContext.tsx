import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signIn, signOut, getSession, onAuthStateChange, verifyMfaCode, SignInResult } from '../lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<SignInResult>;
  confirmMfa: (factorId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount
    getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((u) => setUser(u));
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<SignInResult> => {
    const res = await signIn(email, password);
    if (!res.mfaRequired && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const confirmMfa = async (factorId: string, code: string) => {
    const res = await verifyMfaCode(factorId, code);
    const session = await getSession();
    setUser(session?.user ?? res.user ?? null);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, confirmMfa, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
