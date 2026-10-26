import { useMemo } from 'react';
import { ChannelBadge, TitleBar } from '../components/parts';
import { STATUS_COLOR_CLASS } from '../components/RecordList';
import { download, isInProgress, maskPhone, money, net, STATUSES, toCsv, today, uniqueChannels } from '../domain/records';
import { useWorkspace } from '../workspace/WorkspaceContext';
import './overview.css';

const RECENT_LIMIT = 8;
const percent = (n: number, total: number) => (total ? (n / total) * 100 : 0);
const share = (n: number, total: number) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(percent(n, total))}%`;

export function OverviewView({ goRecords, goReports }: { goRecords(): void; goReports(): void }) {
  const { records, canEdit, openEditor } = useWorkspace();
  const total = records.length;

  const { reviewed, inProgress, waiting, byStatus, byChannel, recent } = useMemo(() => {
    const byStatus = new Map<string, number>();
    const byChannel = new Map<string, number>();
    for (const r of records) {
      byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
      byChannel.set(r.channel, (byChannel.get(r.channel) ?? 0) + 1);
    }
    return {
      reviewed: records.filter((r) => r.costReviewed),
      inProgress: records.filter(isInProgress).length,
      waiting: byStatus.get('Chờ nhận hàng') ?? 0,
      byStatus,
      byChannel,
      recent: [...records].sort((a, b) => b.received.localeCompare(a.received)).slice(0, RECENT_LIMIT)
    };
  }, [records]);

  return (
    <div className="ov">
      <TitleBar
        title="Tổng quan"
        subtitle="Mọi hồ sơ bảo hành, trong một không gian rõ ràng."
        canCreate={canEdit}
        onExport={() => download(toCsv(records), 'bao-hanh-' + today() + '.csv', 'text/csv;charset=utf-8')}
        onCreate={() => openEditor(null)}
      />

      <div className="ov-stats">
        <div className="ov-card feature">
          <div>
            <div className="ov-card-head">
              <span className="ov-label">Tổng hồ sơ</span>
            </div>
            <div className="ov-value">{total}</div>
          </div>
          <p className="ov-sub">Tất cả hồ sơ trong dữ liệu chung</p>
        </div>
        <div className="ov-card">
          <div>
            <div className="ov-card-head">
              <span className="ov-label">Cần tiếp tục xử lý</span>
              <span className="ov-tag amber">Đang mở</span>
            </div>
            <div className="ov-value">{inProgress}</div>
          </div>
          <p className="ov-sub">Bao gồm đơn đã gửi, chưa xác nhận nhận hàng</p>
        </div>
        <div className="ov-card">
          <div>
            <div className="ov-card-head">
              <span className="ov-label">Chờ nhận hàng</span>
              <span className="ov-tag sky">Vận chuyển</span>
            </div>
            <div className="ov-value">{waiting}</div>
          </div>
          <p className="ov-sub">Cần kiểm tra với kho / vận chuyển</p>
        </div>
        <div className="ov-card">
          <div>
            <div className="ov-card-head">
              <span className="ov-label">Chi phí đã đối soát</span>
              <span className="ov-tag slate">VND</span>
            </div>
            <div className="ov-value">{money(reviewed.reduce((s, r) => s + net(r), 0))}</div>
          </div>
          <p className="ov-sub">{reviewed.length} hồ sơ đã xác nhận chi phí</p>
        </div>
      </div>

      <div className="ov-grid">
        <div className="ov-panel">
          <div className="ov-panel-head">
            <h2>Tiến độ xử lý</h2>
            <span className="ov-muted">Toàn bộ hồ sơ</span>
          </div>
          {STATUSES.map((s) => {
            const n = byStatus.get(s) ?? 0;
            return (
              <div className="ov-row" key={s} title={share(n, total)}>
                <span>{s}</span>
                <div className="ov-track">
                  <div className={`ov-fill ${STATUS_COLOR_CLASS[s]}`} style={{ width: percent(n, total) + '%', minWidth: n ? 4 : 0 }} />
                </div>
                <b className="ov-count">{n}</b>
              </div>
            );
          })}
        </div>

        <div className="ov-panel">
          <div className="ov-panel-head">
            <h2>Phân bổ theo kênh</h2>
            <span className="ov-muted">Nguồn tiếp nhận</span>
          </div>
          {uniqueChannels(records).map((c) => {
            const n = byChannel.get(c) ?? 0;
            return (
              <div className="ov-chan" key={c}>
                <ChannelBadge value={c} />
                <span className="ov-chan-share">{share(n, total)}</span>
                <span className="ov-chan-count">
                  {n} <span className="ov-muted">hồ sơ</span>
                </span>
              </div>
            );
          })}
          {total === 0 && <p className="ov-muted">Chưa có hồ sơ.</p>}
          <div className="ov-panel-foot">
            <span>Trạng thái cần được xác nhận trước khi chốt hồ sơ.</span>
            <button className="link" onClick={goReports}>
              Chi tiết báo cáo →
            </button>
          </div>
        </div>
      </div>

      <div className="ov-panel ov-recent">
        <div className="ov-panel-head">
          <div>
            <h2>Hồ sơ tiếp nhận gần nhất</h2>
            <p className="ov-muted">{RECENT_LIMIT} hồ sơ mới nhất theo ngày tiếp nhận</p>
          </div>
          <button className="link" onClick={goRecords}>
            Xem tất cả →
          </button>
        </div>
        <div className="tablewrap">
          <table className="ov-table">
            <thead>
              <tr>
                <th>Mã hồ sơ</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Kênh</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    Chưa có hồ sơ nào.
                  </td>
                </tr>
              )}
              {recent.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="ov-id">{r.id}</span>
                    <span className="ov-line">{r.received}</span>
                  </td>
                  <td>
                    <span className="ov-name">{r.customer || 'Chưa có tên'}</span>
                    <span className="ov-line">{maskPhone(r.phone)}</span>
                  </td>
                  <td>
                    <span className="ov-trunc" title={r.product}>
                      {r.product || '—'}
                    </span>
                  </td>
                  <td>
                    <ChannelBadge value={r.channel} />
                  </td>
                  <td>
                    <span className={`ov-pill ${STATUS_COLOR_CLASS[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="ov-action">
                    <button className="link" onClick={() => openEditor(r)}>
                      {canEdit ? 'Chi tiết' : 'Xem'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
