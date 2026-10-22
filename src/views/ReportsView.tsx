import { useState } from 'react';
import { download, emptyFilters, fee, filterRecords, money, net, num, toCsv, today, uniqueChannels } from '../domain/records';
import type { Filters } from '../types';
import { ChannelBadge, TitleBar } from '../components/parts';
import { FilterBar } from '../components/RecordList';
import { useWorkspace } from '../workspace/WorkspaceContext';

export function ReportsView() {
  const { records, canEdit, openEditor } = useWorkspace();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const rows = filterRecords(records, filters);

  return (
    <>
      <TitleBar
        title="Báo cáo"
        subtitle="Theo dõi chính xác · Xử lý dễ dàng · Chi phí minh bạch"
        canCreate={canEdit}
        onExport={() => download(toCsv(rows), 'bao-hanh-' + today() + '.csv', 'text/csv;charset=utf-8')}
        onCreate={() => openEditor(null)}
      />
      <FilterBar filters={filters} records={records} onChange={setFilters} />
      <div className="panel">
        <div className="panelhead">
          <h2>Báo cáo theo kênh bán</h2>
          <button className="btn" onClick={() => window.print()}>
            In báo cáo
          </button>
        </div>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>KÊNH</th>
                <th>HỒ SƠ</th>
                <th>HOÀN TẤT</th>
                <th>ĐÃ ĐỐI SOÁT</th>
                <th>TỔNG CHI ĐÃ ĐỐI SOÁT</th>
                <th>THU THÊM ĐÃ ĐỐI SOÁT</th>
                <th>CHI PHÍ RÒNG</th>
              </tr>
            </thead>
            <tbody>
              {uniqueChannels(rows).map((c) => {
                const group = rows.filter((r) => r.channel === c);
                const done = group.filter((r) => r.costReviewed);
                return (
                  <tr key={c}>
                    <td>
                      <ChannelBadge value={c} />
                    </td>
                    <td>{group.length}</td>
                    <td>{group.filter((r) => r.status === 'Hoàn tất').length}</td>
                    <td>
                      {done.length}/{group.length}
                    </td>
                    <td>{money(done.reduce((s, r) => s + fee(r), 0))}</td>
                    <td>{money(done.reduce((s, r) => s + num(r.extra), 0))}</td>
                    <td>{money(done.reduce((s, r) => s + net(r), 0))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p>Khoản trống chưa được đối soát. Báo cáo không suy ra giá vốn từ giá bán trong mô tả sản phẩm.</p>
      </div>
    </>
  );
}
