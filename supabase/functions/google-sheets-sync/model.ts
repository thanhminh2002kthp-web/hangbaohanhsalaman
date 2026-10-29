// Shared, dependency-free conversion rules. Sheets values are always written as RAW.
export const COLUMNS = [
  ['id', 'Mã hồ sơ'], ['version', 'Phiên bản'], ['received_date', 'Ngày nhận'],
  ['channel', 'Kênh'], ['order_code', 'Mã đơn hàng'], ['customer', 'Khách hàng'],
  ['phone', 'Số điện thoại'], ['address', 'Địa chỉ'], ['product', 'Sản phẩm'],
  ['reason', 'Lý do'], ['test_result', 'Kết quả kiểm tra'], ['replacement', 'Sản phẩm đổi'],
  ['inbound_code', 'Vận đơn thu hồi'], ['outbound_code', 'Vận đơn gửi lại'],
  ['sent_date', 'Ngày gửi'], ['due_date', 'Hạn xử lý'], ['priority', 'Ưu tiên'],
  ['status', 'Trạng thái'], ['ship_flag', 'Ship gốc'], ['ship_in', 'Phí ship vào'],
  ['ship_out', 'Phí ship ra'], ['parts', 'Linh kiện'], ['labor', 'Công sửa'],
  ['other', 'Chi phí khác'], ['refund', 'Hoàn tiền'], ['extra', 'Thu thêm'],
  ['cost_reviewed', 'Đã đối soát'], ['note', 'Ghi chú']
] as const;
export const HEADERS = [...COLUMNS.map(([, label]) => label), '_sync_signature'];
export type RecordRow = Record<string, string | number | boolean | null>;
const MONEY = ['ship_in', 'ship_out', 'parts', 'labor', 'other', 'refund', 'extra'];
const DATES = ['received_date', 'sent_date', 'due_date'];
const FLAGS = ['ship_flag', 'cost_reviewed'];
const STATUSES = ['Chờ nhận hàng', 'Chờ kiểm tra', 'Đang xử lý', 'Đã gửi hàng', 'Hoàn tất', 'Hoàn tiền', 'Từ chối bảo hành'];

export function cellsFor(row: RecordRow): (string | number | boolean)[] {
  return COLUMNS.map(([key]) => row[key] ?? '');
}

export function parseCells(cells: unknown[]): RecordRow {
  const row: RecordRow = {};
  COLUMNS.forEach(([key, label], i) => {
    const value = cells[i] ?? '';
    const text = String(value).trim();
    if (key === 'version') {
      const n = text === '' ? 0 : Number(text);
      if (!Number.isSafeInteger(n) || n < 0) throw new Error('Phiên bản phải là số nguyên không âm.');
      row[key] = n;
    } else if (MONEY.includes(key)) {
      const n = text === '' ? null : Number(text);
      if (n !== null && (!Number.isSafeInteger(n) || n < 0)) throw new Error(label + ': nhập số nguyên không âm, không dùng dấu phân cách.');
      row[key] = n;
    } else if (FLAGS.includes(key)) {
      if (!['', 'TRUE', 'FALSE'].includes(text.toUpperCase())) throw new Error(label + ': chỉ nhận TRUE hoặc FALSE.');
      row[key] = text.toUpperCase() === 'TRUE';
    } else if (DATES.includes(key)) {
      if (text && (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !Number.isFinite(Date.parse(text + 'T00:00:00Z')) || new Date(text + 'T00:00:00Z').toISOString().slice(0, 10) !== text)) {
        throw new Error(label + ': dùng ngày YYYY-MM-DD hợp lệ.');
      }
      row[key] = text || null;
    } else {
      // Keep leading zeroes, whitespace and formula-looking strings intact.
      row[key] = String(value);
    }
  });
  if (!String(row.id).trim() || !row.received_date || !String(row.order_code).trim() || !String(row.customer).trim()) {
    throw new Error('Cần mã hồ sơ, ngày nhận, mã đơn hàng và khách hàng.');
  }
  if (!['Gấp', 'Bình thường', 'Hoãn lại'].includes(String(row.priority))) throw new Error('Ưu tiên không hợp lệ.');
  if (!STATUSES.includes(String(row.status))) throw new Error('Trạng thái không hợp lệ.');
  if (row.cost_reviewed && MONEY.some(key => row[key] === null)) throw new Error('Đã đối soát thì cần nhập đủ các khoản tiền, kể cả 0.');
  return row;
}

export function direction(row: RecordRow, current: RecordRow | undefined, unchanged: boolean): 'insert' | 'pull' | 'push' | 'same' | 'conflict' {
  if (!current) return row.version === 0 ? 'insert' : 'conflict';
  // A previous import can succeed while its Sheets write fails. Recognize the
  // same business values on retry and repair metadata without importing twice.
  if (cellsFor(row).every((v, i) => i === 1 || v === cellsFor(current)[i])) {
    return row.version === current.version ? 'same' : 'push';
  }
  if (unchanged) return 'push';
  return row.version === current.version ? 'pull' : 'conflict';
}
