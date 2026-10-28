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
  /** true khi vừa mở liên kết đặt lại mật khẩu từ email: phải đặt mật khẩu mới trước khi dùng app. */
  recovering: boolean;
  signIn(email: string, password: string): Promise<string | null>;
  signOut(): Promise<void>;
  recheck(): Promise<void>;
  /** Đổi mật khẩu khi đang đăng nhập: xác minh mật khẩu hiện tại, đổi, rồi đăng xuất các thiết bị khác. */
  changePassword(current: string, next: string): Promise<string | null>;
  /** Đặt mật khẩu mới sau khi mở liên kết từ email (không hỏi mật khẩu cũ). */
  completeRecovery(next: string): Promise<string | null>;
}

const Ctx = createContext<AuthValue | null>(null);

export const useAuth = (): AuthValue => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth phải nằm trong AuthProvider');
  return v;
};

// Liên kết từ email tạo sẵn một phiên đăng nhập. Ghi nhớ cờ này để dù tải lại trang hay đóng tab,
// người đó vẫn bị buộc đặt mật khẩu mới trước khi vào được ứng dụng.
const RECOVERY_KEY = 'salaman-recovery';
const readRecovery = (): boolean => {
  try {
    return localStorage.getItem(RECOVERY_KEY) === '1';
  } catch {
    return false;
  }
};
const writeRecovery = (on: boolean): void => {
  try {
    if (on) localStorage.setItem(RECOVERY_KEY, '1');
    else localStorage.removeItem(RECOVERY_KEY);
  } catch {
    /* bỏ qua */
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [recovering, setRecovering] = useState(readRecovery);

  const setRecoveryFlag = useCallback((on: boolean) => {
    writeRecovery(on);
    setRecovering(on);
  }, []);

  const resolve = useCallback(async (user: User | null | undefined) => {
    const userEmail = user?.email;
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
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) setRecoveryFlag(false);
      return resolve(data.session?.user);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecoveryFlag(true);
      if (event === 'SIGNED_OUT') setRecoveryFlag(false);
      // Tránh gọi Supabase trực tiếp trong callback (có thể gây deadlock); đẩy ra sau.
      setTimeout(() => void resolve(session?.user), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [resolve, setRecoveryFlag]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      email,
      role,
      recovering,
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
        if (error) return friendlyPasswordError(error.message);
        await supabase.auth.signOut({ scope: 'others' });
        return null;
      },
      async completeRecovery(next) {
        const { error } = await supabase.auth.updateUser({ password: next });
        if (error) return friendlyPasswordError(error.message);
        await supabase.auth.signOut({ scope: 'others' });
        setRecoveryFlag(false);
        return null;
      }
    }),
    [status, email, role, recovering, resolve, setRecoveryFlag]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function friendlyPasswordError(message: string): string {
  if (/different from the old/i.test(message)) return 'Mật khẩu mới phải khác mật khẩu cũ.';
  if (/weak|short|at least/i.test(message)) return 'Mật khẩu chưa đủ mạnh theo quy định của hệ thống.';
  return 'Không đổi được mật khẩu: ' + message;
}
