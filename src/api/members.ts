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

export async function upsertMember(m: Member): Promise<void> {
  const { error } = await supabase
    .from('members')
    .upsert({ email: m.email.trim().toLowerCase(), role: m.role, active: m.active }, { onConflict: 'email' });
  if (error) throw new ApiError(error.message);
}
