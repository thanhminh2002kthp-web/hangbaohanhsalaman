import { emptyFilters, fee, money, net, PAGE_SIZE, STATUSES, uniqueChannels } from '../domain/records';
import type { Filters, WarrantyRecord } from '../types';
import { ChannelBadge, PriorityBadge, StatusBadge } from './parts';

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
      <input type="month" value={f.month} aria-label="Lọc theo tháng tiếp nhận" onChange={(e) => set({ month: e.target.value })} />
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
}

export function RecordList({ rows, cost = false, paged = true, page = 1, onPage, canEdit, onOpen }: Props) {
  const start = paged ? (page - 1) * PAGE_SIZE : 0;
  const shown = rows.slice(start, start + (paged ? PAGE_SIZE : 6));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  return (
    <div className="panel tablepanel">
      <div className="tablewrap">
        <table className={cost ? 'records-table records-table-cost' : 'records-table'}>
          <colgroup>
            {(cost ? [15, 14, 12, 24, 9, 9, 10, 7] : [15, 14, 12, 27, 12, 13, 7]).map((width, i) => (
              <col key={i} style={{ width: `${width}%` }} />
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
                  <th>MÃ VẬN ĐƠN GỬI HÀNG MỚI</th>
                </>
              )}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={cost ? 8 : 7} className="empty">
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
                      <StatusBadge status={r.status} />
                      <span className="sub">
                        <PriorityBadge priority={r.priority} />
                      </span>
                    </td>
                    <td>{r.outbound.slice(0, 32) || '—'}</td>
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
