import type { HistoryEntry, Priority, Status, WarrantyRecord } from '../types';
import { ApiError, supabase } from './supabase';

type Row = Record<string, any>;

export function fromRow(r: Row): WarrantyRecord {
  return {
    id: r.id,
    version: r.version,
    received: r.received_date ?? '',
    channel: r.channel,
    order: r.order_code,
    customer: r.customer,
    phone: r.phone,
    address: r.address,
    product: r.product,
    reason: r.reason,
    test: r.test_result,
    replacement: r.replacement,
    inbound: r.inbound_code,
    outbound: r.outbound_code,
    sent: r.sent_date ?? '',
    due: r.due_date ?? '',
    priority: r.priority as Priority,
    status: r.status as Status,
    shipFlag: r.ship_flag,
    shipIn: r.ship_in,
    shipOut: r.ship_out,
    parts: r.parts,
    labor: r.labor,
    other: r.other,
    refund: r.refund,
    extra: r.extra,
    costReviewed: r.cost_reviewed,
    note: r.note
  };
}

export function toRow(r: WarrantyRecord): Row {
  return {
    id: r.id,
    received_date: r.received,
    channel: r.channel,
    order_code: r.order,
    customer: r.customer,
    phone: r.phone,
    address: r.address,
    product: r.product,
    reason: r.reason,
    test_result: r.test,
    replacement: r.replacement,
    inbound_code: r.inbound,
    outbound_code: r.outbound,
    sent_date: r.sent || null,
    due_date: r.due || null,
    priority: r.priority,
    status: r.status,
    ship_flag: r.shipFlag,
    ship_in: r.shipIn,
    ship_out: r.shipOut,
    parts: r.parts,
    labor: r.labor,
    other: r.other,
    refund: r.refund,
    extra: r.extra,
    cost_reviewed: r.costReviewed,
    note: r.note
  };
}

const CHUNK = 1000;

/** Đọc toàn bộ hồ sơ (PostgREST giới hạn 1000 dòng/lần nên đọc theo trang). */
export async function listRecords(): Promise<WarrantyRecord[]> {
  const all: WarrantyRecord[] = [];
  for (let from = 0; ; from += CHUNK) {
    const { data, error } = await supabase
      .from('warranty_records')
      .select('*')
      .is('deleted_at', null)
      .order('received_date', { ascending: false })
      .order('id')
      .range(from, from + CHUNK - 1);
    if (error) throw new ApiError(error.message);
    all.push(...(data ?? []).map(fromRow));
    if (!data || data.length < CHUNK) return all;
  }
}

/** Lưu hồ sơ. Hồ sơ mới có version 0. Sửa hồ sơ chỉ thành công nếu version khớp (chống ghi đè). */
export async function saveRecord(r: WarrantyRecord): Promise<WarrantyRecord> {
  if (r.version === 0) {
    const { data, error } = await supabase.from('warranty_records').insert(toRow(r)).select('*').single();
    if (error) throw new ApiError(error.message);
    return fromRow(data);
  }
  const { id, ...row } = toRow(r);
  const { data, error } = await supabase
    .from('warranty_records')
    .update(row)
    .eq('id', id)
    .eq('version', r.version)
    .select('*');
  if (error) throw new ApiError(error.message);
  if (!data || data.length === 0) {
    throw new ApiError('Hồ sơ vừa được người khác cập nhật hoặc bạn không có quyền sửa.', 409);
  }
  return fromRow(data[0]);
}

/** Nhập hàng loạt, bỏ qua mã hồ sơ đã tồn tại. Trả về số hồ sơ đã thêm. */
export async function insertMissing(records: WarrantyRecord[]): Promise<number> {
  let added = 0;
  for (let i = 0; i < records.length; i += 200) {
    const rows = records.slice(i, i + 200).map(toRow);
    const { data, error } = await supabase
      .from('warranty_records')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
      .select('id');
    if (error) throw new ApiError(error.message);
    added += data?.length ?? 0;
  }
  return added;
}

export async function loadHistory(id: string): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from('record_history')
    .select('at, actor, status')
    .eq('record_id', id)
    .order('at', { ascending: false })
    .limit(4);
  if (error) throw new ApiError(error.message);
  return (data ?? []) as HistoryEntry[];
}
