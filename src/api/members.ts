import type { Member, Role } from '../types';
import { ApiError, supabase } from './supabase';

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from('members').select('email, role, active').order('created_at');
  if (error) throw new ApiError(error.message);
  return (data ?? []) as Member[];
}

/** Quyền của chính người đang đăng nhập; null nếu chưa được cấp hoặc đã bị khóa. */
export async function myMembership(email: string): Promise<{ role: Role } | null> {
  const { data, error } = await supabase
    .from('members')
    .select('role, active')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw new ApiError(error.message);
  return data && data.active ? { role: data.role as Role } : null;
}

/** Gọi Edge Function admin-users (tạo tài khoản / đặt lại mật khẩu). */
async function callAdminFunction(body: Record<string, string>): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-users', { body });
  if (!error) return;
  let message = error.message;
  const res = (error as { context?: Response }).context;
  if (res && typeof res.json === 'function') {
    try {
      message = (await res.json()).error ?? message;
    } catch {
      /* giữ message mặc định */
    }
  }
  throw new ApiError(message);
}

export const createAccount = (email: string, password: string, role: Role) =>
  callAdminFunction({ action: 'create', email, password, role });

export const resetPassword = (email: string, password: string) =>
  callAdminFunction({ action: 'reset', email, password });

/** Xóa vĩnh viễn tài khoản đăng nhập và quyền của nhân viên (admin khác và chính mình không xóa được). */
export const deleteAccount = (email: string) => callAdminFunction({ action: 'delete', email });

export async function upsertMember(m: Member): Promise<void> {
  const { error } = await supabase
    .from('members')
    .upsert({ email: m.email.trim().toLowerCase(), role: m.role, active: m.active }, { onConflict: 'email' });
  if (error) throw new ApiError(error.message);
}
