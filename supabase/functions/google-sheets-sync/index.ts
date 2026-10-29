import { createClient } from 'npm:@supabase/supabase-js@2';
import { importPKCS8, SignJWT } from 'npm:jose@5';
import { COLUMNS, HEADERS, cellsFor, parseCells, direction, type RecordRow } from './model.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json' }
});
const SHEET_ID = '168W-IbuIKa742qK7YnWcA-JlfzUD_dJ-b5bwPAqDIks';
const TAB = 'Salaman Sync';
const RANGE = "'Salaman Sync'!A1:AC5001";
const enc = new TextEncoder();

async function googleToken(): Promise<string> {
  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('Chưa cấu hình GOOGLE_SERVICE_ACCOUNT_JSON trên Supabase.');
  let credentials, key;
  try {
    credentials = JSON.parse(raw);
    key = await importPKCS8(credentials.private_key, 'RS256');
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON không hợp lệ. Kiểm tra lại tệp khóa JSON.');
  }
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/spreadsheets' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(credentials.client_email).setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt().setExpirationTime('5m').sign(key);
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error('Google không chấp nhận tài khoản dịch vụ. Kiểm tra khóa và Google Sheets API.');
  return (await response.json()).access_token;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Chỉ hỗ trợ POST.' }, 405);
  let release: (() => Promise<void>) | undefined;
  let imported = 0;
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const caller = createClient(url, anon, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
    const { data: user } = await caller.auth.getUser();
    if (!user.user?.email) return json({ error: 'Chưa đăng nhập.' }, 401);
    const { data: member, error: memberError } = await caller.from('members').select('role,active')
      .eq('email', user.user.email.toLowerCase()).maybeSingle();
    if (memberError || !member?.active || member.role !== 'admin') return json({ error: 'Chỉ quản trị viên đang hoạt động được đồng bộ.' }, 403);
    const { action } = await req.json();
    if (!['status', 'sync'].includes(action)) return json({ error: 'Thao tác không hợp lệ.' }, 400);
    const token = await googleToken();
    const base = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
    async function google(path: string, method = 'GET', body?: unknown) {
      const response = await fetch(base + path, {
        method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error(`Google Sheets trả lỗi ${response.status}. Kiểm tra quyền chia sẻ cho tài khoản dịch vụ; thay đổi đã nhập vào website: ${imported}.`);
      return await response.json();
    }
    const meta = await google('?fields=sheets.properties');
    let tab = meta.sheets?.find((s: any) => s.properties.title === TAB);
    if (action === 'status') return json({ ok: true, tabExists: !!tab, spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit` });

    // Serialize sync sessions. Records themselves are still saved through caller RLS + version checks.
    const admin = createClient(url, service);
    const lockToken = crypto.randomUUID();
    const { data: acquired, error: lockError } = await admin.rpc('acquire_google_sync_lock', { token: lockToken });
    if (lockError) throw new Error('Chưa cài SQL khóa đồng bộ. Chạy supabase/google-sheets-sync.sql trước.');
    if (!acquired) return json({ error: 'Một phiên đồng bộ đang chạy. Hãy thử lại sau.' }, 409);
    release = async () => { await admin.rpc('release_google_sync_lock', { token: lockToken }); };
    if (!tab) {
      const created = await google(':batchUpdate', 'POST', { requests: [{ addSheet: { properties: {
        title: TAB, gridProperties: { rowCount: 5001, columnCount: 29, frozenRowCount: 1 }
      } } }] });
      tab = { properties: created.replies[0].addSheet.properties };
    }
    if (tab.properties.gridProperties.rowCount < 5001 || tab.properties.gridProperties.columnCount < 29) {
      throw new Error('Trang Salaman Sync cần ít nhất 5001 dòng và 29 cột. Không thu nhỏ vùng đồng bộ.');
    }
    const read = () => google('/values/' + encodeURIComponent(RANGE) + '?valueRenderOption=UNFORMATTED_VALUE');
    const original: unknown[][] = (await read()).values ?? [];
    if (original.length && JSON.stringify(original[0]) !== JSON.stringify(HEADERS)) throw new Error('Tiêu đề Salaman Sync đã thay đổi. Khôi phục đủ tiêu đề trước khi đồng bộ.');

    const key = await crypto.subtle.importKey('raw', enc.encode(service), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    async function signature(row: RecordRow) {
      const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(JSON.stringify(cellsFor(row)))));
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    }
    const current = new Map<string, RecordRow>();
    for (let from = 0; ; from += 1000) {
      const { data, error } = await caller.from('warranty_records').select('*').is('deleted_at', null)
        .order('id').range(from, from + 999);
      if (error) throw new Error(error.message);
      for (const row of data ?? []) current.set(row.id, row);
      if ((data?.length ?? 0) < 1000) break;
    }
    if (current.size > 5000) throw new Error('Vượt giới hạn 5000 hồ sơ của cấu hình đồng bộ này.');
    const seen = new Set<string>();
    const jobs: { row: RecordRow; index: number; mode: string }[] = [];
    const conflicts: string[] = [];
    // Validate every row before importing anything.
    for (let index = 1; index < original.length; index++) {
      const cells = original[index];
      if (!cells.some(v => v !== '' && v !== null)) continue;
      let row: RecordRow;
      try { row = parseCells(cells); } catch (e) { throw new Error(`Dòng ${index + 1}: ${(e as Error).message}`); }
      const id = String(row.id);
      if (seen.has(id)) throw new Error('Mã hồ sơ bị trùng trong Sheets: ' + id);
      seen.add(id);
      const mode = direction(row, current.get(id), cells[28] === await signature(row));
      if (mode === 'conflict') conflicts.push(id);
      jobs.push({ row, index, mode });
    }
    if (conflicts.length) return json({ error: 'Chưa đồng bộ vì có hồ sơ xung đột: ' + conflicts.join(', ') + '. Đối chiếu và lưu bản cuối trên website, sao lưu dòng Sheets rồi xóa dòng xung đột khỏi Sheets. Đồng bộ lại sẽ đưa bản website sang Sheets.', conflicts }, 409);
    const additions = [...current.values()].filter(row => !seen.has(String(row.id)));
    if (original.length + additions.length > 5001) throw new Error('Trang đồng bộ đã đầy. Liên hệ quản trị để tăng giới hạn.');
    const updates: { range: string; values: unknown[][] }[] = [];
    let exported = additions.length;
    for (const job of jobs) {
      let row = current.get(String(job.row.id));
      if (job.mode === 'pull' || job.mode === 'insert') {
        const { id, version, ...fields } = job.row;
        let query = job.mode === 'insert'
          ? caller.from('warranty_records').insert({ id, ...fields })
          : caller.from('warranty_records').update(fields).eq('id', id).eq('version', version).is('deleted_at', null);
        const { data, error } = await query.select('*').single();
        if (error || !data) throw new Error(`Không lưu được ${id}; dữ liệu có thể vừa thay đổi. Đã nhập ${imported} hồ sơ, hãy tải mới và đồng bộ lại.`);
        row = data;
        imported++;
      }
      if (!row) throw new Error('Không tìm thấy hồ sơ ' + job.row.id);
      if (job.mode === 'push') exported++;
      updates.push({ range: `'${TAB}'!A${job.index + 1}:AC${job.index + 1}`, values: [[...cellsFor(row), await signature(row)]] });
    }
    // Google Sheets has no atomic compare-and-swap. Stop if edits/reordering were observed during import.
    const latest = (await read()).values ?? [];
    if (JSON.stringify(latest) !== JSON.stringify(original)) throw new Error(`Sheets vừa thay đổi trong lúc đồng bộ. Đã nhập ${imported} hồ sơ vào website; chưa ghi lại Sheets. Tải mới rồi thử lại khi không ai đang sửa.`);
    updates.unshift({ range: `'${TAB}'!A1:AC1`, values: [HEADERS] });
    if (additions.length) {
      const start = Math.max(original.length, 1) + 1;
      const values = [];
      for (const row of additions) values.push([...cellsFor(row), await signature(row)]);
      updates.push({ range: `'${TAB}'!A${start}:AC${start + values.length - 1}`, values });
    }
    await google('/values:batchUpdate', 'POST', { valueInputOption: 'RAW', data: updates });
    return json({ ok: true, imported, exported, completedAt: new Date().toISOString() });
  } catch (e) {
    return json({ error: (e as Error).message, imported }, 500);
  } finally {
    if (release) { try { await release(); } catch { /* lease expires automatically */ } }
  }
});
