import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { myMembership } from '../api/members';
import { isConfigured, supabase } from '../api/supabase';
import type { Role } from '../types';

type Status = 'loading' | 'signedOut' | 'noAccess' | 'ready';

interface AuthValue {
  status: Status;
  email: string;
  role: Role | null;
  signIn(email: string, password: string): Promise<string | null>;
  signUp(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
  recheck(): Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export const useAuth = (): AuthValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth phải nằm trong AuthProvider');
  return v;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | null>(null);

  const resolve = useCallback(async (userEmail: string | undefined) => {
    if (!userEmail) {
      setEmail('');
      setRole(null);
      setStatus('signedOut');
      return;
    }
    setEmail(userEmail);
    try {
      const m = await myMembership(userEmail);
      setRole(m?.role ?? null);
      setStatus(m ? 'ready' : 'noAccess');
    } catch {
      setRole(null);
      setStatus('noAccess');
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setStatus('signedOut');
      return;
    }
    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user.email));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Tránh gọi Supabase trực tiếp trong callback (có thể gây deadlock); đẩy ra sau.
      setTimeout(() => void resolve(session?.user.email), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [resolve]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      email,
      role,
      async signIn(e, p) {
        const { error } = await supabase.auth.signInWithPassword({ email: e.trim(), password: p });
        return error ? 'Email hoặc mật khẩu không đúng.' : null;
      },
      async signUp(e, p) {
        const { data, error } = await supabase.auth.signUp({ email: e.trim(), password: p });
        if (error) return error.message;
        return data.session ? null : 'Đã tạo tài khoản. Hãy mở email để xác nhận rồi đăng nhập.';
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async recheck() {
        const { data } = await supabase.auth.getSession();
        await resolve(data.session?.user.email);
      }
    }),
    [status, email, role, resolve]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
