import type { Filters, MoneyKey, Priority, Status, WarrantyRecord } from '../types';

export const STATUSES: Status[] = [
  'Chờ nhận hàng',
  'Chờ kiểm tra',
  'Đang xử lý',
  'Đã gửi hàng',
  'Hoàn tất',
  'Hoàn tiền',
  'Từ chối bảo hành'
];
export const PRIORITIES: Priority[] = ['Gấp', 'Bình thường', 'Hoãn lại'];
export const CHANNELS = ['SHOPEE', 'TIKTOK', 'WEBSITE', 'LYNKID', 'KHÁC'];
export const COST_KEYS: MoneyKey[] = ['shipIn', 'shipOut', 'parts', 'labor', 'other', 'refund'];
export const MONEY_KEYS: MoneyKey[] = [...COST_KEYS, 'extra'];
export const PAGE_SIZE = 12;

const FINISHED: Status[] = ['Hoàn tất', 'Hoàn tiền', 'Từ chối bảo hành'];

export const num = (n: number | null | undefined): number => Number(n) || 0;

/** Tổng các khoản chi (chưa trừ tiền thu thêm). */
export const fee = (r: WarrantyRecord): number => COST_KEYS.reduce((s, k) => s + num(r[k]), 0);

/** Chi phí ròng = tổng chi − tiền thu thêm. */
export const net = (r: WarrantyRecord): number => fee(r) - num(r.extra);

export const money = (n: number | null | undefined): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

export const isInProgress = (r: WarrantyRecord): boolean => !FINISHED.includes(r.status);

export const today = (): string =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

export const newId = (): string => 'BH-' + crypto.randomUUID().slice(0, 8).toUpperCase();

export function emptyRecord(): WarrantyRecord {
  return {
    id: newId(),
    version: 0,
    received: today(),
    channel: 'SHOPEE',
    order: '',
    customer: '',
    phone: '',
    address: '',
    product: '',
    reason: '',
    test: '',
    replacement: '',
    inbound: '',
    outbound: '',
    sent: '',
    due: '',
    priority: 'Bình thường',
    status: 'Chờ nhận hàng',
    shipFlag: false,
    shipIn: null,
    shipOut: null,
    parts: null,
    labor: null,
    other: null,
    refund: null,
    extra: null,
    costReviewed: false,
    note: ''
  };
}

export const emptyFilters: Filters = { query: '', status: '', channel: '', datePreset: '', dateFrom: '', dateTo: '' };

export const DATE_PRESETS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả ngày' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'day-before', label: 'Hôm kia' },
  { value: 'last7', label: '7 ngày gần đây' },
  { value: 'last30', label: '30 ngày gần đây' },
  { value: 'this-month', label: 'Tháng này' },
  { value: 'last-month', label: 'Tháng trước' },
  { value: 'custom', label: 'Tùy chọn khoảng ngày…' }
];

/** Tháng (YYYY-MM) cách tháng hiện tại `n` tháng về trước. */
function monthsAgo(n: number): string {
  const [year, month] = today().split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 - n, 1)).toISOString().slice(0, 7);
}

function dateDaysAgo(days: number): string {
  const [year, month, day] = today().split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day - days)).toISOString().slice(0, 10);
}

function matchesDate(received: string, f: Pick<Filters, 'datePreset' | 'dateFrom' | 'dateTo'>): boolean {
  const preset = f.datePreset;
  const current = today();
  if (preset === 'custom') return (!f.dateFrom || received >= f.dateFrom) && (!f.dateTo || received <= f.dateTo);
  if (preset === 'this-month') return received.startsWith(monthsAgo(0));
  if (preset === 'last-month') return received.startsWith(monthsAgo(1));
  if (preset === 'today') return received === current;
  if (preset === 'yesterday') return received === dateDaysAgo(1);
  if (preset === 'day-before') return received === dateDaysAgo(2);
  if (preset === 'last7') return received >= dateDaysAgo(6) && received <= current;
  if (preset === 'last30') return received >= dateDaysAgo(29) && received <= current;
  return true;
}

export function filterRecords(records: WarrantyRecord[], f: Filters): WarrantyRecord[] {
  const q = f.query.toLocaleLowerCase('vi');
  return records.filter(
    (r) =>
      (!q ||
        [r.id, r.order, r.customer, r.phone, r.product, r.inbound, r.outbound]
          .join(' ')
          .toLocaleLowerCase('vi')
          .includes(q)) &&
      (!f.status || r.status === f.status) &&
      (!f.channel || r.channel === f.channel) &&
      (!f.datePreset || matchesDate(r.received, f))
  );
}

export const uniqueChannels = (records: WarrantyRecord[]): string[] =>
  [...new Set(records.map((r) => r.channel))].sort();

export function channelClass(value: string): string {
  const map: Record<string, string> = {
    SHOPEE: 'channel-shopee',
    TIKTOK: 'channel-tiktok',
    WEBSITE: 'channel-website',
    LYNKID: 'channel-lynkid'
  };
  return map[String(value || '').trim().toUpperCase()] ?? 'channel-other';
}

/** Trả về thông báo lỗi nếu chọn "đã đối soát" mà còn ô tiền trống. */
export function costReviewError(r: WarrantyRecord): string | null {
  if (r.costReviewed && MONEY_KEYS.some((k) => r[k] === null)) {
    return 'Nhập đủ các ô tiền trước khi xác nhận đối soát. Khoản không phát sinh nhập 0.';
  }
  return null;
}

const CSV_FIELDS: [string, (r: WarrantyRecord) => unknown][] = [
  ['Mã hồ sơ', (r) => r.id],
  ['Ngày nhận', (r) => r.received],
  ['Kênh', (r) => r.channel],
  ['Mã đơn', (r) => r.order],
  ['Khách hàng', (r) => r.customer],
  ['SĐT', (r) => r.phone],
  ['Địa chỉ', (r) => r.address],
  ['Sản phẩm', (r) => r.product],
  ['Lý do', (r) => r.reason],
  ['Kết quả test', (r) => r.test],
  ['Mẫu đổi', (r) => r.replacement],
  ['Trạng thái', (r) => r.status],
  ['Mức độ cần xử lý', (r) => r.priority],
  ['Mã vận đơn thu hồi hàng lỗi', (r) => r.inbound],
  ['Mã vận đơn gửi hàng mới', (r) => r.outbound],
  ['Ngày gửi', (r) => r.sent],
  ['Hạn xử lý', (r) => r.due],
  ['Dấu tích ship gốc', (r) => r.shipFlag],
  ['Người gửi trả phí', (r) => r.shipIn],
  ['Người nhận trả phí', (r) => r.shipOut],
  ['Hàng đổi / linh kiện', (r) => r.parts],
  ['Công xử lý', (r) => r.labor],
  ['Chi khác', (r) => r.other],
  ['Hoàn tiền', (r) => r.refund],
  ['Thu thêm', (r) => r.extra],
  ['Đã đối soát', (r) => r.costReviewed],
  ['Ghi chú', (r) => r.note]
];

/** Ô CSV; chặn công thức Excel (=, +, @, -) ở đầu ô. */
const cell = (v: unknown): string => '"' + String(v ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';

export function toCsv(records: WarrantyRecord[]): string {
  const head = CSV_FIELDS.map(([label]) => cell(label)).join(',');
  const body = records.map((r) => CSV_FIELDS.map(([, get]) => cell(get(r))).join(','));
  return '﻿' + [head, ...body].join('\r\n');
}

export const download = (text: string, name: string, type: string): void => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const TEXT_KEYS = ['customer', 'phone', 'order', 'product', 'reason', 'channel', 'received', 'outbound'] as const;

/** Đọc và kiểm tra tệp sao lưu JSON; ném lỗi nếu sai định dạng. */
export function parseBackup(text: string): WarrantyRecord[] {
  const d = JSON.parse(text) as { version?: number; records?: unknown };
  if (d.version !== 1 || !Array.isArray(d.records) || d.records.length > 50000) throw new Error('format');
  const ids = new Set<string>();
  for (const r of d.records as WarrantyRecord[]) {
    if (
      !r ||
      typeof r.id !== 'string' ||
      ids.has(r.id) ||
      !STATUSES.includes(r.status) ||
      !TEXT_KEYS.every((k) => typeof r[k] === 'string') ||
      !MONEY_KEYS.every((k) => r[k] === null || (typeof r[k] === 'number' && Number.isFinite(r[k]) && (r[k] as number) >= 0))
    ) {
      throw new Error('record');
    }
    ids.add(r.id);
  }
  return d.records as WarrantyRecord[];
}
