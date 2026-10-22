import { useEffect, useState } from 'react';
import { download, emptyFilters, fee, filterRecords, money, net, num, toCsv, today } from '../domain/records';
import type { Filters } from '../types';
import { Stat, TitleBar } from '../components/parts';
import { FilterBar, RecordList } from '../components/RecordList';
import { useWorkspace } from '../workspace/WorkspaceContext';

/** Dùng chung cho "Hồ sơ bảo hành" (mode = records) và "Chi phí & thu thêm" (mode = costs). */
export function RecordsView({ mode }: { mode: 'records' | 'costs' }) {
  const { records, canEdit, openEditor } = useWorkspace();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [filters]);

  const rows = filterRecords(records, filters);
  const cost = mode === 'costs';
  const reviewed = rows.filter((r) => r.costReviewed);

  return (
    <>
      <TitleBar
        title={cost ? 'Chi phí & thu thêm' : 'Hồ sơ bảo hành'}
        subtitle="Theo dõi chính xác · Xử lý dễ dàng · Chi phí minh bạch"
        canCreate={canEdit}
        onExport={() => download(toCsv(rows), 'bao-hanh-' + today() + '.csv', 'text/csv;charset=utf-8')}
        onCreate={() => openEditor(null)}
      />
      {cost && (
        <>
          <div className="notice">
            Cột “Phí ship” trong bảng gốc là dấu tích, không phải số tiền. Các khoản chưa nhập không được coi là chi phí đã xác nhận. Chi phí ròng = ship thu hồi + ship giao + hàng thay / linh kiện + công xử lý + chi khác + hoàn tiền − thu thêm.
          </div>
          <div className="stats">
            <Stat feature label="CHI ĐÃ ĐỐI SOÁT" value={money(reviewed.reduce((s, r) => s + fee(r), 0))} sub="Theo bộ lọc hiện tại" />
            <Stat label="THU THÊM ĐÃ NHẬP" value={money(rows.reduce((s, r) => s + num(r.extra), 0))} sub="Tiền thu thêm, không phải lợi nhuận" />
            <Stat label="CHƯA ĐỐI SOÁT" value={rows.filter((r) => !r.costReviewed).length} sub="Cần nhập và xác nhận chi phí" />
            <Stat label="CHI PHÍ RÒNG" value={money(reviewed.reduce((s, r) => s + net(r), 0))} sub="Chỉ tính hồ sơ đã đối soát" />
          </div>
        </>
      )}
      <FilterBar filters={filters} records={records} onChange={setFilters} />
      <RecordList rows={rows} cost={cost} page={page} onPage={setPage} canEdit={canEdit} onOpen={openEditor} />
    </>
  );
}
