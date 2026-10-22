import type { Status, WarrantyRecord } from '../types';
import { emptyRecord } from './records';

export type Cell = string | number | boolean | Date | null | undefined;

export interface SkippedRow {
  /** Số dòng trong file gốc (bắt đầu từ 1). */
  line: number;
  reason: string;
}

export interface ImportResult {
  records: WarrantyRecord[];
  skipped: SkippedRow[];
  /** Số dòng tiêu đề đã tìm thấy (bắt đầu từ 1); 0 nếu không nhận ra bảng. */
  headerLine: number;
}

/** Đọc CSV (hỗ trợ ô có dấu ngoặc kép, dấu phẩy và xuống dòng bên trong ô). */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cur);
      cur = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cur);
      cur = '';
      rows.push(row);
      row = [];
    } else cur += c;
  }
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

const norm = (v: Cell): string =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

type Field =
  | 'received' | 'channel' | 'order' | 'inbound' | 'test' | 'outbound' | 'sent' | 'customer'
  | 'phone' | 'address' | 'product' | 'reason' | 'replacement' | 'shipFlag' | 'extra' | 'note';

/** Tiêu đề cột (đã bỏ dấu, chữ thường) → trường dữ liệu. exact = phải khớp nguyên cụm. */
const HEADERS: [Field, string, boolean][] = [
  ['received', 'ngay', true],
  ['channel', 'san', false],
  ['order', 'ma don hang', false],
  ['inbound', 'ma van don thu hoi', false],
  ['test', 'ket qua test', false],
  ['outbound', 'ma van don giao khach', false],
  ['sent', 'ngay giao', false],
  ['customer', 'ten khach hang', false],
  ['phone', 'sdt', false],
  ['address', 'dia chi', false],
  ['product', 'mau ban dau', false],
  ['reason', 'ly do', false],
  ['replacement', 'mau doi', false],
  ['shipFlag', 'phi ship', false],
  ['extra', 'tong tien thu them', false],
  ['note', 'ghi chu', false]
];

function findHeader(rows: Cell[][]): { line: number; cols: Partial<Record<Field, number>> } | null {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const cells = rows[i].map(norm);
    if (!cells.includes('ngay') || !cells.some((c) => c.startsWith('ma don hang'))) continue;
    const cols: Partial<Record<Field, number>> = {};
    for (const [field, key, exact] of HEADERS) {
      const idx = cells.findIndex((c) => (exact ? c === key : c.startsWith(key)));
      if (idx >= 0) cols[field] = idx;
    }
    return { line: i + 1, cols };
  }
  return null;
}

const pad = (n: number) => String(n).padStart(2, '0');

function validYmd(y: number, m: number, d: number): string | null {
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Đọc ngày: Date, số serial Excel, "dd/mm", "dd/mm/yyyy", "yyyy-mm-dd". Ngày không có năm dùng `year`. */
export function parseDate(v: Cell, year: number): string | null {
  if (v instanceof Date) return validYmd(v.getFullYear(), v.getMonth() + 1, v.getDate());
  if (typeof v === 'number') return new Date(Date.UTC(1899, 11, 30) + v * 86400000).toISOString().slice(0, 10);
  const s = String(v ?? '').trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return validYmd(+iso[1], +iso[2], +iso[3]);
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
  if (!m) return null;
  const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : year;
  return validYmd(y, +m[2], +m[1]);
}

const text = (v: Cell): string => (v instanceof Date ? '' : String(v ?? '').trim());

function phoneOf(v: Cell): string {
  if (typeof v === 'number') return '0' + String(Math.round(v));
  const s = text(v);
  return /^\d{9}$/.test(s) ? '0' + s : s;
}

function moneyOf(v: Cell): number | null {
  if (typeof v === 'number') return v >= 0 ? Math.round(v) : null;
  const s = text(v);
  if (!s || !/^[\d.,\s₫đ]+$/i.test(s)) return null;
  const digits = s.replace(/\D/g, '');
  return digits ? Number(digits) : null;
}

/** Suy trạng thái ban đầu từ cột vận đơn giao / kết quả test (cùng quy tắc với bảng gốc). */
export function inferStatus(outbound: string, test: string): Status {
  const s = outbound.toUpperCase();
  if (s.includes('KHÔNG ĐỦ ĐIỀU KIỆN')) return 'Từ chối bảo hành';
  if (s.includes('HOÀN TIỀN')) return 'Hoàn tiền';
  if (s.includes('CHƯA NHẬN')) return 'Chờ nhận hàng';
  if (/ĐỔI TẠI KHO|ĐÃ TỚI KHO|ĐÃ.*LẤY/.test(s)) return 'Hoàn tất';
  if (s) return 'Đã gửi hàng';
  return test ? 'Đang xử lý' : 'Chờ kiểm tra';
}

function fnv(str: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** Mã hồ sơ ổn định theo nội dung, để nhập lại cùng một file không tạo trùng. */
function stableId(key: string): string {
  const hex = fnv(key, 2166136261).toString(16).padStart(8, '0') + fnv(key, 40503).toString(16).padStart(8, '0');
  return 'BH-' + hex.slice(0, 10).toUpperCase();
}

const DAY = 86400000;

/**
 * Chuyển các dòng đọc từ Excel/CSV thành hồ sơ. Không ghi gì vào cơ sở dữ liệu.
 * `year`: năm áp dụng cho các ngày chỉ có "dd/mm".
 */
export function rowsToRecords(rows: Cell[][], opts: { year: number }): ImportResult {
  const header = findHeader(rows);
  if (!header) return { records: [], skipped: [], headerLine: 0 };
  const { cols, line: headerLine } = header;

  const records: WarrantyRecord[] = [];
  const skipped: SkippedRow[] = [];
  const ids = new Set<string>();
  const seen = new Map<string, number>();

  for (let i = headerLine; i < rows.length; i++) {
    const row = rows[i];
    const get = (f: Field): Cell => (cols[f] === undefined ? undefined : row[cols[f] as number]);
    const order = text(get('order'));
    const customer = text(get('customer'));
    const product = text(get('product'));
    if (!order && !customer && !product) continue; // dòng trống / dòng tiêu đề phụ

    const received = parseDate(get('received'), opts.year);
    if (!received) {
      skipped.push({ line: i + 1, reason: 'Thiếu hoặc không đọc được ngày nhận' });
      continue;
    }
    let sent = parseDate(get('sent'), opts.year);
    if (sent && sent < received) {
      // Ngày giao sang năm sau (ví dụ nhận 28/12, giao 03/01).
      const next = parseDate(get('sent'), opts.year + 1);
      if (next && Date.parse(next) - Date.parse(received) <= 120 * DAY) sent = next;
    }

    const outbound = text(get('outbound'));
    const test = text(get('test'));
    const phone = phoneOf(get('phone'));
    const inbound = text(get('inbound'));

    const key = [received, order, customer, phone, product, inbound].join('|').toLowerCase();
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    let id = stableId(key + '#' + n);
    for (let salt = 1; ids.has(id); salt++) id = stableId(key + '#' + n + '/' + salt);
    ids.add(id);

    const shipRaw = get('shipFlag');
    records.push({
      ...emptyRecord(),
      id,
      received,
      channel: text(get('channel')).toUpperCase() || 'KHÁC',
      order,
      customer,
      phone,
      address: text(get('address')),
      product,
      reason: text(get('reason')),
      test,
      replacement: text(get('replacement')),
      inbound,
      outbound,
      sent: sent ?? '',
      status: inferStatus(outbound, test),
      shipFlag: shipRaw === true || String(shipRaw ?? '').toUpperCase() === 'TRUE',
      extra: moneyOf(get('extra')),
      note: text(get('note'))
    });
  }
  return { records, skipped, headerLine };
}
