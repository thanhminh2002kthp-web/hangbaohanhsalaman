// Edge Function: admin tạo tài khoản và đặt lại mật khẩu cho nhân viên.
// Chạy phía máy chủ nên mới được dùng khóa service_role (không bao giờ đưa khóa này vào web).
// Chỉ người gọi có quyền admin trong bảng public.members mới được thực hiện.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Bản sao của src/domain/accountValidation.ts — sửa một nơi thì phải sửa nơi kia.
const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function validateEmail(email: string): string | null {
  const local = email.split('@')[0] ?? '';
  if (
    !email ||
    email.length > 254 ||
    local.length > 64 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    email.includes('..') ||
    !EMAIL_RE.test(email) ||
    !/\.[a-z]{2,}$/.test(email)
  ) {
    return 'Email không hợp lệ.';
  }
  return null;
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('tối thiểu 8 ký tự');
  if (!/\p{L}/u.test(password)) errors.push('có chữ cái');
  if (!/\d/.test(password)) errors.push('có chữ số');
  if (!/[^\p{L}\d\s]/u.test(password)) errors.push('có ký tự đặc biệt');
  if (password.length > 72) errors.push('tối đa 72 ký tự');
  return errors;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

/** Tìm id tài khoản đăng nhập theo email (duyệt tối đa 4000 người dùng). */
async function findUserId(admin: ReturnType<typeof createClient>, email: string): Promise<string | undefined> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  return undefined;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // 1. Xác định người gọi từ JWT.
    const caller = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: userData } = await caller.auth.getUser();
    const callerEmail = userData.user?.email?.toLowerCase();
    if (!callerEmail) return json({ error: 'Chưa đăng nhập.' }, 401);

    // 2. Chỉ admin đang hoạt động mới được thực hiện.
    const admin = createClient(url, service);
    const { data: me } = await admin.from('members').select('role, active').eq('email', callerEmail).maybeSingle();
    if (!me || !me.active || me.role !== 'admin') return json({ error: 'Chỉ quản trị viên được thực hiện thao tác này.' }, 403);

    const body = await req.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const role = String(body.role ?? 'editor');
    const action = String(body.action ?? '');
    const emailError = validateEmail(email);
    if (emailError) return json({ error: emailError }, 400);
    if (action === 'create' || action === 'reset') {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length) return json({ error: 'Mật khẩu chưa đạt: ' + passwordErrors.join('; ') + '.' }, 400);
    }

    if (action === 'create') {
      if (!['editor', 'viewer'].includes(role)) return json({ error: 'Quyền không hợp lệ.' }, 400);
      const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (error) {
        const exists = /already|registered|exists/i.test(error.message);
        return json({ error: exists ? 'Email này đã có tài khoản.' : error.message }, 400);
      }
      const { error: memberError } = await admin.from('members').upsert({ email, role, active: true }, { onConflict: 'email' });
      if (memberError) return json({ error: memberError.message }, 400);
      return json({ ok: true });
    }

    if (action === 'reset') {
      const { data: target } = await admin.from('members').select('role').eq('email', email).maybeSingle();
      if (!target) return json({ error: 'Email chưa nằm trong danh sách thành viên.' }, 404);
      if (target.role === 'admin' && email !== callerEmail) return json({ error: 'Không đặt lại mật khẩu của quản trị viên khác.' }, 403);
      const id = await findUserId(admin, email);
      if (!id) return json({ error: 'Người này chưa có tài khoản đăng nhập.' }, 404);
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    if (action === 'delete') {
      if (email === callerEmail) return json({ error: 'Không thể xóa chính tài khoản của bạn.' }, 403);
      const { data: target } = await admin.from('members').select('role').eq('email', email).maybeSingle();
      if (!target) return json({ error: 'Email không có trong danh sách thành viên.' }, 404);
      if (target.role === 'admin') return json({ error: 'Không xóa tài khoản quản trị viên.' }, 403);
      // Xóa tài khoản đăng nhập trước; nếu lỗi thì giữ nguyên danh sách thành viên.
      const id = await findUserId(admin, email);
      if (id) {
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) return json({ error: error.message }, 400);
      }
      const { error: memberError } = await admin.from('members').delete().eq('email', email);
      if (memberError) return json({ error: memberError.message }, 400);
      return json({ ok: true });
    }

    return json({ error: 'Thao tác không hợp lệ.' }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
