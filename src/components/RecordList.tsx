import { useState } from 'react';
import { DATE_PRESETS, emptyFilters, fee, money, net, PAGE_SIZE, STATUSES, uniqueChannels } from '../domain/records';
import type { Filters, Status, WarrantyRecord } from '../types';
import { ChannelBadge, PriorityBadge, StatusBadge } from './parts';

export const STATUS_COLOR_CLASS: Record<Status, string> = {
  'Chờ nhận hàng': 'status-pending-shipment',
  'Chờ kiểm tra': 'status-checking',
  'Đang xử lý': 'status-processing',
  'Đã gửi hàng': 'status-sent',
  'Hoàn tất': 'status-complete',
  'Hoàn tiền': 'status-refund',
  'Từ chối bảo hành': 'status-rejected'
};

export function FilterBar(props: {
  filters: Filters;
  records: WarrantyRecord[];
  onChange(f: Filters): void;
}) {
  const { filters: f, onChange } = props;
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  return (
    <div className="filters">
      <input
        placeholder="Tìm mã đơn, khách hàng, SĐT, sản phẩm…"
        value={f.query}
        onChange={(e) => set({ query: e.target.value })}
      />
      <select value={f.status} onChange={(e) => set({ status: e.target.value })}>
        <option value="">Tất cả trạng thái</option>
        {STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select value={f.channel} onChange={(e) => set({ channel: e.target.value })}>
        <option value="">Tất cả kênh</option>
        {uniqueChannels(props.records).map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
      <select
        value={f.datePreset}
        aria-label="Lọc theo ngày tiếp nhận"
        onChange={(e) => set({ datePreset: e.target.value, dateFrom: '', dateTo: '' })}
      >
        {DATE_PRESETS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      {f.datePreset === 'custom' && (
        <div className="daterange">
          <label>
            Từ ngày
            <input
              type="date"
              value={f.dateFrom}
              max={f.dateTo || undefined}
              onChange={(e) => set({ dateFrom: e.target.value })}
            />
          </label>
          <label>
            Đến ngày
            <input
              type="date"
              value={f.dateTo}
              min={f.dateFrom || undefined}
              onChange={(e) => set({ dateTo: e.target.value })}
            />
          </label>
        </div>
      )}
      <button className="btn" onClick={() => onChange(emptyFilters)}>
        Xóa lọc
      </button>
    </div>
  );
}

interface Props {
  rows: WarrantyRecord[];
  cost?: boolean;
  /** Có phân trang (trang đầy đủ) hay chỉ hiện 6 dòng đầu (tổng quan). */
  paged?: boolean;
  page?: number;
  onPage?(page: number): void;
  canEdit: boolean;
  onOpen(r: WarrantyRecord): void;
  onStatusChange(r: WarrantyRecord, status: Status): Promise<void>;
}

export function RecordList({ rows, cost = false, paged = true, page = 1, onPage, canEdit, onOpen, onStatusChange }: Props) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const start = paged ? (page - 1) * PAGE_SIZE : 0;
  const shown = rows.slice(start, start + (paged ? PAGE_SIZE : 6));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  function changeStatus(record: WarrantyRecord, status: Status) {
    if (status === record.status) return;
    setSavingId(record.id);
    void onStatusChange(record, status)
      .catch(() => {
        // The workspace reports save errors and keeps the previous status selected.
      })
      .finally(() => setSavingId(null));
  }

  return (
    <div className="panel tablepanel">
      <div className="tablewrap">
        <table className={cost ? 'records-table records-table-cost' : 'records-table'}>
          <colgroup>
            {(cost
              ? ['190px', '170px', '150px', 'auto', '120px', '120px', '130px', '100px']
              : ['190px', '170px', '150px', 'auto', '160px', '190px', '190px', '100px']
            ).map((width, i) => (
              <col key={i} style={{ width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th>HỒ SƠ / NGÀY NHẬN</th>
              <th>KHÁCH HÀNG / KÊNH</th>
              <th>SĐT KHÁCH HÀNG</th>
              <th>SẢN PHẨM</th>
              {cost ? (
                <>
                  <th>TỔNG CHI</th>
                  <th>THU THÊM</th>
                  <th>CHI PHÍ RÒNG</th>
                </>
              ) : (
                <>
                  <th>TRẠNG THÁI</th>
                  <th>MÃ VẬN ĐƠN THU HỒI HÀNG LỖI</th>
                  <th>MÃ VẬN ĐƠN GỬI HÀNG MỚI</th>
                </>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={8} className="empty">
                  Không có hồ sơ phù hợp.
                </td>
              </tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.id}</strong>
                  <span className="sub">{r.received || 'Chưa có ngày'}</span>
                  <span className="sub">{r.order}</span>
                </td>
                <td>
                  <strong>{r.customer || 'Chưa có tên'}</strong>
                  <span className="sub">
                    <ChannelBadge value={r.channel} />
                  </span>
                </td>
                <td className="customer-phone">{r.phone || '—'}</td>
                <td title={[r.product, r.reason].filter(Boolean).join(' — ')}>
                  <div className="record-product">{r.product || '—'}</div>
                  <span className="sub record-reason">{r.reason}</span>
                </td>
                {cost ? (
                  <>
                    <td>{r.costReviewed ? money(fee(r)) : 'Chưa đối soát'}</td>
                    <td>{r.extra === null ? 'Chưa nhập' : money(r.extra)}</td>
                    <td>{r.costReviewed ? money(net(r)) : '—'}</td>
                  </>
                ) : (
                  <>
                    <td>
                      {canEdit ? (
                        <select
                          className={`status-select ${STATUS_COLOR_CLASS[r.status]}`}
                          aria-label={`Trạng thái hồ sơ ${r.id}`}
                          value={r.status}
                          disabled={savingId === r.id}
                          onChange={(e) => changeStatus(r, e.target.value as Status)}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} className={STATUS_COLOR_CLASS[status]}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <StatusBadge status={r.status} />
                      )}
                      <span className="sub">
                        <PriorityBadge priority={r.priority} />
                      </span>
                    </td>
                    <td>{r.inbound || '—'}</td>
                    <td>{r.outbound || '—'}</td>
                  </>
                )}
                <td>
                  <button className="link" onClick={() => onOpen(r)}>
                    {canEdit ? 'Chi tiết ↗' : 'Xem hồ sơ ↗'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paged && (
        <div className="pagination">
          <span className="muted">
            {rows.length ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, rows.length)} / {rows.length} hồ sơ
          </span>
          <div className="actions">
            <button className="btn" disabled={page <= 1} onClick={() => onPage?.(page - 1)}>
              ←
            </button>
            <span className="muted">
              Trang {page}/{pages}
            </span>
            <button className="btn" disabled={start + PAGE_SIZE >= rows.length} onClick={() => onPage?.(page + 1)}>
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

