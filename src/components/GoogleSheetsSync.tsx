import { useState } from 'react';
import { invokeFunction } from '../api/functions';
import { useToast } from './Toast';
import { useWorkspace } from '../workspace/WorkspaceContext';

const URL = 'https://docs.google.com/spreadsheets/d/168W-IbuIKa742qK7YnWcA-JlfzUD_dJ-b5bwPAqDIks/edit';

export function GoogleSheetsSync() {
  const { role, reload } = useWorkspace();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('Chưa kiểm tra kết nối.');
  if (role !== 'admin') return null;

  async function run(action: 'status' | 'sync') {
    if (busy) return;
    setBusy(true);
    setMessage(action === 'sync' ? 'Đang đồng bộ. Vui lòng tạm ngừng sửa trang Salaman Sync.' : 'Đang kiểm tra kết nối…');
    try {
      const result = await invokeFunction('google-sheets-sync', { action });
      setMessage(action === 'status'
        ? 'Đã kết nối Google Sheets.' + (result.tabExists ? '' : ' Trang Salaman Sync sẽ được tạo khi đồng bộ lần đầu.')
        : `Đã đồng bộ: nhận ${result.imported} hồ sơ từ Sheets; gửi ${result.exported} hồ sơ từ website.`);
      if (action === 'sync') { await reload(); toast('Đồng bộ Google Sheets hoàn tất.'); }
    } catch (e) {
      setMessage((e as Error).message);
      // A remote request may have imported some rows before failing.
      if (action === 'sync') await reload();
    } finally { setBusy(false); }
  }

  return <div className="panel help">
    <h2>Đồng bộ Google Sheets hai chiều</h2>
    <p>Bấm “Đồng bộ ngay” để nhận thay đổi từ Sheets và gửi dữ liệu mới nhất từ website. Chỉ quản trị viên được thực hiện; chưa tự chạy nền.</p>
    <p>Dữ liệu dùng trang <b>Salaman Sync</b>. Giữ nguyên mã hồ sơ, phiên bản, tiêu đề và cột _sync_signature. Không sắp xếp hoặc sửa bảng trong lúc đồng bộ.</p>
    <p>Nếu hai nơi cùng sửa một hồ sơ, hệ thống báo xung đột để bạn đối chiếu. Xóa dòng trên Sheets không xóa hồ sơ trên website.</p>
    <div className="actions" style={{ margin: '20px 0' }}>
      <button className="btn" disabled={busy} onClick={() => void run('status')}>Kiểm tra kết nối</button>
      <button className="primary" disabled={busy} onClick={() => void run('sync')}>{busy ? 'Đang xử lý…' : '↔ Đồng bộ ngay'}</button>
      <a className="btn" href={URL} target="_blank" rel="noreferrer">Mở Google Sheets</a>
    </div>
    <p role="status" aria-live="polite">{message}</p>
  </div>;
}
