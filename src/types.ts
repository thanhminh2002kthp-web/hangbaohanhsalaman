export type Role = 'admin' | 'editor' | 'viewer';
export type Priority = 'Gấp' | 'Bình thường' | 'Hoãn lại';
export type Status =
  | 'Chờ nhận hàng'
  | 'Chờ kiểm tra'
  | 'Đang xử lý'
  | 'Đã gửi hàng'
  | 'Hoàn tất'
  | 'Hoàn tiền'
  | 'Từ chối bảo hành';

export type MoneyKey = 'shipIn' | 'shipOut' | 'parts' | 'labor' | 'other' | 'refund' | 'extra';

export interface WarrantyRecord {
  id: string;
  /** Tăng mỗi lần lưu; dùng để phát hiện hai người cùng sửa. 0 = hồ sơ mới. */
  version: number;
  received: string;
  channel: string;
  order: string;
  customer: string;
  phone: string;
  address: string;
  product: string;
  reason: string;
  test: string;
  replacement: string;
  inbound: string;
  outbound: string;
  sent: string;
  due: string;
  priority: Priority;
  status: Status;
  shipFlag: boolean;
  shipIn: number | null;
  shipOut: number | null;
  parts: number | null;
  labor: number | null;
  other: number | null;
  refund: number | null;
  extra: number | null;
  costReviewed: boolean;
  note: string;
}

export interface HistoryEntry {
  at: string;
  actor: string;
  status: string;
}

export interface Member {
  email: string;
  role: Role;
  active: boolean;
}

export interface Filters {
  query: string;
  status: string;
  channel: string;
  /** '' = tất cả ngày; today | yesterday | … | custom (dùng dateFrom/dateTo). */
  datePreset: string;
  /** YYYY-MM-DD, chỉ dùng khi datePreset = 'custom'. */
  dateFrom: string;
  dateTo: string;
}
