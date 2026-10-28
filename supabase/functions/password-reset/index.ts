// Edge Function: QUÊN MẬT KHẨU.
//   action "request"  : người dùng nhập email → hệ thống sinh mật khẩu tạm, gửi email kèm liên kết kích hoạt.
//                       Mật khẩu tạm CHƯA có hiệu lực; mật khẩu cũ vẫn dùng được cho đến khi bấm liên kết.
//   action "activate" : người dùng bấm liên kết → mật khẩu tạm có hiệu lực, tài khoản bị buộc đổi mật khẩu ở lần đăng nhập đầu.
//
// Hàm này KHÔNG yêu cầu đăng nhập (verify_jwt = false), nên mọi kiểm tra nằm ở đây:
//  - luôn trả lời giống nhau dù email có tồn tại hay không (không cho dò email)
//  - giới hạn 3 yêu cầu/giờ cho mỗi email
//  - liên kết dùng một lần, hết hạn sau 30 phút, mã chỉ lưu dạng băm
//  - mật khẩu tạm lưu dạng mã hóa bằng chính mã trong liên kết (lộ database cũng không đọc được)
//
// Secret cần khai báo (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY  khóa API của Resend (https://resend.com)
//   MAIL_FROM       người gửi đã xác minh, ví dụ: Salaman <no-reply@tenmiencuaban.com>
//   SITE_URL        địa chỉ web, ví dụ: https://ten-du-an.vercel.app
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const RESET_TTL_MINUTES = 30;
const MAX_REQUESTS_PER_HOUR = 3;
const INVALID_LINK = 'Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu gửi lại mật khẩu mới.';

// ---------------------------------------------------------------------------
// Quy tắc email / mật khẩu (bản sao của src/domain/accountValidation.ts)
// ---------------------------------------------------------------------------
const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

function validateEmail(email: string): boolean {
  const local = email.split('@')[0] ?? '';
  return !(
    !email ||
    email.length > 254 ||
    local.length > 64 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    email.includes('..') ||
    !EMAIL_RE.test(email) ||
    !/\.[a-z]{2,}$/.test(email)
  );
}

function passwordIsValid(p: string): boolean {
  return p.length >= 8 && p.length <= 72 && /\p{L}/u.test(p) && /\d/.test(p) && /[^\p{L}\d\s]/u.test(p);
}

// ---------------------------------------------------------------------------
// Mã hóa và sinh ngẫu nhiên
// ---------------------------------------------------------------------------
const encoder = new TextEncoder();

async function sha256(text: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
}
const toHex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const toB64Url = (b: Uint8Array) => toB64(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Số ngẫu nhiên đều trong [0, n). */
function randomIndex(n: number): number {
  const limit = Math.floor(0x100000000 / n) * n;
  let x: number;
  do {
    x = crypto.getRandomValues(new Uint32Array(1))[0];
  } while (x >= limit);
  return x % n;
}

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGIT = '23456789';
const SPECIAL = '!@#$%*?-_+=';
const pick = (set: string) => set[randomIndex(set.length)];

/** Mật khẩu tạm 14 ký tự, bỏ các ký tự dễ nhầm (0/O, 1/l/I), luôn đủ chữ hoa, chữ thường, số, ký tự đặc biệt. */
function generatePassword(length = 14): string {
  for (;;) {
    const chars = [pick(UPPER), pick(LOWER), pick(DIGIT), pick(SPECIAL)];
    const all = UPPER + LOWER + DIGIT + SPECIAL;
    while (chars.length < length) chars.push(pick(all));
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    const password = chars.join('');
    if (passwordIsValid(password)) return password;
  }
}

/** Mã trong liên kết: 32 byte ngẫu nhiên. */
const newToken = () => toB64Url(crypto.getRandomValues(new Uint8Array(32)));
const lookupHash = async (token: string) => toHex(await sha256('lookup:' + token));
const aesKey = async (token: string) =>
  crypto.subtle.importKey('raw', await sha256('key:' + token), 'AES-GCM', false, ['encrypt', 'decrypt']);

async function seal(token: string, plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await aesKey(token), encoder.encode(plain)));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return toB64(out);
}

async function unseal(token: string, sealed: string): Promise<string> {
  const all = fromB64(sealed);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: all.slice(0, 12) }, await aesKey(token), all.slice(12));
  return new TextDecoder().decode(pt);
}

// ---------------------------------------------------------------------------
// Gửi thư (Resend)
// ---------------------------------------------------------------------------
function mailConfig() {
  const key = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('MAIL_FROM');
  const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
  return key && from && site ? { key, from, site } : null;
}

async function sendResetMail(cfg: NonNullable<ReturnType<typeof mailConfig>>, to: string, password: string, token: string) {
  const link = `${cfg.site}/#activate=${token}`;
  const subject = '[Salaman] Mật khẩu mới và liên kết kích hoạt';
  const text = [
    'Xin chào,',
    '',
    `Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản ${to}.`,
    '',
    `Mật khẩu mới: ${password}`,
    '',
    `Mật khẩu này CHƯA có hiệu lực. Hãy mở liên kết sau để kích hoạt (dùng một lần, hết hạn sau ${RESET_TTL_MINUTES} phút):`,
    link,
    '',
    'Sau khi kích hoạt, đăng nhập bằng mật khẩu mới ở trên; hệ thống sẽ yêu cầu bạn đổi sang mật khẩu của riêng mình.',
    'Nếu bạn không yêu cầu, hãy bỏ qua thư này. Mật khẩu hiện tại của bạn vẫn dùng bình thường.'
  ].join('\n');
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p>Xin chào,</p>
<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <b>${to}</b>.</p>
<p>Mật khẩu mới của bạn:</p>
<p style="font-size:20px;font-family:Consolas,Menlo,monospace;background:#f1f5f2;padding:12px 16px;border-radius:8px;display:inline-block;letter-spacing:.5px">${password}</p>
<p>Mật khẩu này <b>chưa có hiệu lực</b>. Bấm nút dưới đây để kích hoạt (dùng một lần, hết hạn sau ${RESET_TTL_MINUTES} phút):</p>
<p><a href="${link}" style="background:#167252;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:700">Kích hoạt mật khẩu mới</a></p>
<p style="color:#555;font-size:13px">Nếu nút không bấm được, hãy dán liên kết này vào trình duyệt:<br>${link}</p>
<p>Sau khi kích hoạt, đăng nhập bằng mật khẩu mới ở trên; hệ thống sẽ yêu cầu bạn đổi sang mật khẩu của riêng mình.</p>
<p style="color:#555;font-size:13px">Nếu bạn không yêu cầu, hãy bỏ qua thư này. Mật khẩu hiện tại của bạn vẫn dùng bình thường.</p>
</div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: cfg.from, to: [to], subject, html, text })
  });
  if (!res.ok) throw new Error(`Gửi thư thất bại (${res.status}): ${(await res.text()).slice(0, 300)}`);
}

// ---------------------------------------------------------------------------
// Tìm tài khoản đăng nhập theo email
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? '');

    // ---- Yêu cầu gửi mật khẩu mới -------------------------------------------------
    if (action === 'request') {
      const cfg = mailConfig();
      if (!cfg) return json({ error: 'Hệ thống chưa cấu hình gửi thư. Hãy liên hệ quản trị viên.' }, 500);

      const email = String(body.email ?? '').trim().toLowerCase();
      if (!validateEmail(email)) return json({ error: 'Email không hợp lệ.' }, 400);

      const generic = json({ ok: true });
      const work = (async () => {
        const { data: member } = await admin.from('members').select('active').eq('email', email).maybeSingle();
        if (!member || !member.active) return;
        if (!(await findUserId(admin, email))) return;

        const since = new Date(Date.now() - 3600_000).toISOString();
        const { count } = await admin
          .from('password_resets')
          .select('id', { count: 'exact', head: true })
          .eq('email', email)
          .gte('created_at', since);
        if ((count ?? 0) >= MAX_REQUESTS_PER_HOUR) return;

        // Hủy các yêu cầu cũ chưa dùng: mỗi lúc chỉ một liên kết có hiệu lực.
        await admin.from('password_resets').update({ used_at: new Date().toISOString() }).eq('email', email).is('used_at', null);

        const token = newToken();
        const password = generatePassword();
        const { data: row, error } = await admin
          .from('password_resets')
          .insert({
            email,
            token_hash: await lookupHash(token),
            pw_cipher: await seal(token, password),
            expires_at: new Date(Date.now() + RESET_TTL_MINUTES * 60_000).toISOString()
          })
          .select('id')
          .single();
        if (error) throw new Error(error.message);

        try {
          await sendResetMail(cfg, email, password, token);
        } catch (e) {
          await admin.from('password_resets').update({ used_at: new Date().toISOString(), pw_cipher: '' }).eq('id', row.id);
          throw e;
        }
      })().catch((e) => console.error('password-reset/request:', (e as Error).message));

      // Xử lý nền để thời gian phản hồi không tiết lộ email có tồn tại hay không.
      const runtime = (globalThis as { EdgeRuntime?: { waitUntil(p: Promise<unknown>): void } }).EdgeRuntime;
      if (runtime) runtime.waitUntil(work);
      else await work;
      return generic;
    }

    // ---- Kích hoạt mật khẩu mới từ liên kết ---------------------------------------
    if (action === 'activate') {
      const token = String(body.token ?? '');
      if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return json({ error: INVALID_LINK }, 400);

      const { data: row } = await admin
        .from('password_resets')
        .select('id, email, pw_cipher, expires_at, used_at')
        .eq('token_hash', await lookupHash(token))
        .maybeSingle();
      if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) return json({ error: INVALID_LINK }, 400);

      // "Chiếm" liên kết trước để không dùng được hai lần.
      const { data: claimed } = await admin
        .from('password_resets')
        .update({ used_at: new Date().toISOString() })
        .eq('id', row.id)
        .is('used_at', null)
        .select('id');
      if (!claimed?.length) return json({ error: INVALID_LINK }, 400);

      const release = () => admin.from('password_resets').update({ used_at: null }).eq('id', row.id);
      try {
        const userId = await findUserId(admin, row.email);
        if (!userId) return json({ error: INVALID_LINK }, 400);
        const password = await unseal(token, row.pw_cipher);
        const { error } = await admin.auth.admin.updateUserById(userId, {
          password,
          user_metadata: { must_change_password: true }
        });
        if (error) throw new Error(error.message);
        await admin.from('password_resets').update({ pw_cipher: '' }).eq('id', row.id);
        return json({ ok: true, email: row.email });
      } catch (e) {
        await release();
        console.error('password-reset/activate:', (e as Error).message);
        return json({ error: 'Chưa kích hoạt được. Hãy thử bấm lại liên kết.' }, 500);
      }
    }

    return json({ error: 'Thao tác không hợp lệ.' }, 400);
  } catch (e) {
    console.error('password-reset:', (e as Error).message);
    return json({ error: 'Có lỗi xảy ra. Hãy thử lại sau.' }, 500);
  }
});
