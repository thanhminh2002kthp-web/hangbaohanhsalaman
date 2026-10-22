import { download, isInProgress, money, net, STATUSES, toCsv, today, uniqueChannels } from '../domain/records';
import { ChannelBadge, Stat, TitleBar } from '../components/parts';
import { RecordList } from '../components/RecordList';
import { useWorkspace } from '../workspace/WorkspaceContext';

export function OverviewView({ goRecords }: { goRecords(): void }) {
  const { records, canEdit, openEditor } = useWorkspace();
  const reviewed = records.filter((r) => r.costReviewed);
  const recent = [...records].sort((a, b) => b.received.localeCompare(a.received));

  return (
    <>
      <TitleBar
        title="Tổng quan"
        subtitle="Mọi hồ sơ bảo hành, trong một không gian rõ ràng."
        canCreate={canEdit}
        onExport={() => download(toCsv(records), 'bao-hanh-' + today() + '.csv', 'text/csv;charset=utf-8')}
        onCreate={() => openEditor(null)}
      />
      <div className="stats">
        <Stat feature label="TỔNG HỒ SƠ" value={records.length} sub="Tất cả hồ sơ trong dữ liệu chung" />
        <Stat label="CẦN TIẾP TỤC XỬ LÝ" value={records.filter(isInProgress).length} sub="Bao gồm đơn đã gửi, chưa xác nhận nhận hàng" />
        <Stat label="CHỜ NHẬN HÀNG" value={records.filter((r) => r.status === 'Chờ nhận hàng').length} sub="Cần kiểm tra với kho / vận chuyển" />
        <Stat
          label="CHI PHÍ ĐÃ ĐỐI SOÁT"
          value={money(reviewed.reduce((s, r) => s + net(r), 0))}
          sub={reviewed.length + ' hồ sơ đã xác nhận chi phí'}
        />
      </div>
      <div className="grid">
        <div className="panel">
          <div className="panelhead">
            <h2>Tiến độ xử lý</h2>
            <span className="muted">Toàn bộ hồ sơ</span>
          </div>
          {STATUSES.map((s) => {
            const n = records.filter((r) => r.status === s).length;
            return (
              <div className="barrow" key={s}>
                <span>{s}</span>
                <div className="track">
                  <div className="fill" style={{ width: (records.length ? (n / records.length) * 100 : 0) + '%' }} />
                </div>
                <b>{n}</b>
              </div>
            );
          })}
        </div>
        <div className="panel">
          <div className="panelhead">
            <h2>Phân bổ theo kênh</h2>
            <span className="muted">Nguồn tiếp nhận</span>
          </div>
          {uniqueChannels(records).map((c) => (
            <div className="reportrow" key={c}>
              <ChannelBadge value={c} />
              <b>
                {records.filter((r) => r.channel === c).length} <span className="muted">hồ sơ</span>
              </b>
            </div>
          ))}
          <p style={{ marginTop: 18, fontSize: 11 }}>Trạng thái cần được xác nhận trước khi chốt hồ sơ.</p>
        </div>
      </div>
      <div className="panelhead">
        <h2>Hồ sơ tiếp nhận gần nhất</h2>
        <button className="link" onClick={goRecords}>
          Xem tất cả →
        </button>
      </div>
      <RecordList rows={recent} paged={false} canEdit={canEdit} onOpen={openEditor} />
    </>
  );
}
