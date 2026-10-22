import { useRef } from 'react';
import { insertMissing } from '../api/records';
import { download, parseBackup, today, toCsv } from '../domain/records';
import { TitleBar } from '../components/parts';
import { useToast } from '../components/Toast';
import { useWorkspace } from '../workspace/WorkspaceContext';

export function SettingsView() {
  const { records, role, canEdit, reload, openEditor } = useWorkspace();
  const toast = useToast();
  const file = useRef<HTMLInputElement>(null);

  async function restore(f: File | undefined) {
    if (!f) return;
    try {
      const incoming = parseBackup(await f.text());
      const known = new Set(records.map((r) => r.id));
      const fresh = incoming.filter((r) => !known.has(r.id));
      if (!fresh.length) return toast('Không có hồ sơ mới cần nhập. Hồ sơ đã tồn tại được giữ nguyên.');
      if (!confirm(`Nhập ${fresh.length} hồ sơ chưa có trong dữ liệu chung? Hồ sơ đã tồn tại sẽ không bị ghi đè.`)) return;
      const added = await insertMissing(fresh.map((r) => ({ ...r, version: 0 })));
      await reload();
      toast('Đã nhập ' + added + ' hồ sơ.');
    } catch (e) {
      toast(e instanceof SyntaxError || (e as Error).message === 'format' || (e as Error).message === 'record'
        ? 'Bản sao lưu không hợp lệ. Dữ liệu hiện tại được giữ nguyên.'
        : (e as Error).message);
    } finally {
      if (file.current) file.current.value = '';
    }
  }

  return (
    <>
      <TitleBar
        title="Dữ liệu & hướng dẫn"
        subtitle="Theo dõi chính xác · Xử lý dễ dàng · Chi phí minh bạch"
        canCreate={canEdit}
        onExport={() => download(toCsv(records), 'bao-hanh-' + today() + '.csv', 'text/csv;charset=utf-8')}
        onCreate={() => openEditor(null)}
      />
      <div className="grid">
        <div className="panel help">
          <h2>Dữ liệu & sao lưu</h2>
          <p>
            Dữ liệu bảo hành được lưu dùng chung trên cơ sở dữ liệu Supabase. Hiện có {records.length} hồ sơ. Hệ thống kiểm tra phiên bản để tránh ghi đè khi cùng sửa, và ghi lại ai sửa lúc nào.
          </p>
          <p>Hãy sao lưu JSON định kỳ (ví dụ mỗi tuần) để giữ một bản độc lập bên ngoài.</p>
          <div className="actions" style={{ margin: '20px 0' }}>
            <button
              className="primary"
              onClick={() =>
                download(
                  JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records }, null, 2),
                  'salaman-backup-' + today() + '.json',
                  'application/json'
                )
              }
            >
              ↓ Sao lưu JSON
            </button>
            {role === 'admin' && (
              <button className="btn" onClick={() => file.current?.click()}>
                ↑ Nhập từ bản sao lưu
              </button>
            )}
          </div>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => void restore(e.target.files?.[0])} />
        </div>
        <div className="panel help">
          <h2>Quy trình sử dụng</h2>
          <ol>
            <li>Tiếp nhận: ghi đơn gốc, khách hàng, sản phẩm và lý do.</li>
            <li>Kho nhận: cập nhật vận đơn thu hồi và kết quả test.</li>
            <li>Xử lý: chọn phương án, mẫu đổi và chi phí thực tế.</li>
            <li>Giao lại: nhập vận đơn, ngày gửi và theo dõi nhận hàng.</li>
            <li>Hoàn tất: xác nhận khách đã nhận và đối soát các khoản tiền.</li>
          </ol>
        </div>
      </div>
      <div className="notice">
        Dấu tích ship gốc được giữ để đối chiếu, chưa xác định ai trả phí. Trạng thái “Đã gửi hàng” chưa có nghĩa khách đã nhận. Nhập từ bản sao lưu chỉ thêm hồ sơ mới, không ghi đè hồ sơ đã có.
      </div>
    </>
  );
}
