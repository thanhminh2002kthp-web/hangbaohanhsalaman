import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { myMembership } from '../api/members';
import { isConfigured, supabase } from '../api/supabase';
import type { Role } from '../types';

type Status = 'loading' | 'signedOut' | 'noAccess' | 'ready';

interface AuthValue {
  status: Status;
  email: string;
  role: Role | null;
  /** true sau khi kích hoạt mật khẩu tạm từ email: bắt buộc đặt mật khẩu mới trước khi dùng app. */
  mustChangePassword: boolean;
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
  recheck(): Promise<void>;
  /** Đổi mật khẩu khi đang đăng nhập: xác minh mật khẩu hiện tại, đổi, rồi đăng xuất các thiết bị khác. */
  changePassword(current: string, next: string): Promise<string | null>;
  /** Đặt mật khẩu mới sau khi vào bằng mật khẩu tạm (không hỏi mật khẩu hiện tại), rồi gỡ cờ bắt buộc đổi. */
  setNewPassword(next: string): Promise<string | null>;
}

const Ctx = createContext<AuthValue | null>(null);

export const useAuth = (): AuthValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth phải nằm trong AuthProvider');
  return v;
};

const mustChange = (user?: User | null): boolean => user?.user_metadata?.must_change_password === true;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [forceChange, setForceChange] = useState(false);

  const resolve = useCallback(async (user: User | null | undefined) => {
    const userEmail = user?.email;
    if (!userEmail) {
      setEmail('');
      setRole(null);
      setForceChange(false);
      setStatus('signedOut');
      return;
    }
    setEmail(userEmail);
    setForceChange(mustChange(user));
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
    supabase.auth.getSession().then(({ data }) => resolve(data.session?.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Tránh gọi Supabase trực tiếp trong callback (có thể gây deadlock); đẩy ra sau.
      setTimeout(() => void resolve(session?.user), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [resolve]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      email,
      role,
      mustChangePassword: forceChange,
      async signIn(e, p) {
        const { error } = await supabase.auth.signInWithPassword({ email: e.trim(), password: p });
        return error ? 'Email hoặc mật khẩu không đúng.' : null;
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async recheck() {
        const { data } = await supabase.auth.getSession();
        await resolve(data.session?.user);
      },
      async changePassword(current, next) {
        // Xác minh lại mật khẩu hiện tại, phòng khi người khác ngồi nhầm máy đang mở sẵn.
        const verify = await supabase.auth.signInWithPassword({ email, password: current });
        if (verify.error) return 'Mật khẩu hiện tại không đúng.';
        const { error } = await supabase.auth.updateUser({ password: next });
        if (error) return 'Không đổi được mật khẩu: ' + error.message;
        await supabase.auth.signOut({ scope: 'others' });
        return null;
      },
      async setNewPassword(next) {
        const { error } = await supabase.auth.updateUser({ password: next, data: { must_change_password: false } });
        if (error) return 'Không đổi được mật khẩu: ' + error.message;
        await supabase.auth.signOut({ scope: 'others' });
        await resolve((await supabase.auth.getUser()).data.user);
        return null;
      }
    }),
    [status, email, role, forceChange, resolve]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
