import { supabase } from './supabase';
import type { User, Session, Factor } from '@supabase/supabase-js';

export type { User, Session, Factor };

export interface SignInResult {
  user: User | null;
  session: Session | null;
  mfaRequired: boolean;
  factorId?: string;
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Check if Multi-Factor Authentication (AAL2) is required on this account
  try {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
      const { data: factors, error: factorErr } = await supabase.auth.mfa.listFactors();
      if (!factorErr && factors && factors.totp && factors.totp.length > 0) {
        const verified = factors.totp.find((f: Factor) => f.status === 'verified') || factors.totp[0];
        return {
          user: data.user,
          session: data.session,
          mfaRequired: true,
          factorId: verified.id,
        };
      }
    }
  } catch (err) {
    console.warn('MFA check notice:', err);
  }

  return {
    user: data.user,
    session: data.session,
    mfaRequired: false,
  };
}

export async function verifyMfaCode(factorId: string, code: string) {
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: code.trim(),
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}

// ─── MFA Enrollment & Management ─────────────────────────────────────────────

export async function enrollMfa(friendlyName?: string) {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'Baby Games',
    friendlyName: friendlyName || 'Baby Games Admin',
  });
  if (error) throw error;
  return data;
}

export async function unenrollMfa(factorId: string) {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
  return data;
}

export async function listMfaFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return data;
}

export async function getMfaStatus(): Promise<{ enabled: boolean; factorId?: string; factors: Factor[] }> {
  try {
    const { data: factors, error } = await supabase.auth.mfa.listFactors();
    if (error || !factors) return { enabled: false, factors: [] };
    const verified = factors.totp?.find((f: Factor) => f.status === 'verified');
    return {
      enabled: !!verified,
      factorId: verified?.id,
      factors: factors.all || [],
    };
  } catch {
    return { enabled: false, factors: [] };
  }
}

export async function updateAdminPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
