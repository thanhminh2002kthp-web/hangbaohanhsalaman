import { useEffect, useMemo, useRef, useState } from 'react';
import { insertMissing } from '../api/records';
import { parseCsv, rowsToRecords, type Cell } from '../domain/importSheet';
import { useToast } from './Toast';

interface Props {
  existingIds: Set<string>;
  onImported(): Promise<unknown>;
  onClose(): void;
}

type XlsxModule = typeof import('read-excel-file');

export function ImportDialog({ existingIds, onImported, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [sheet, setSheet] = useState('');
  const [rows, setRows] = useState<Cell[][] | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => dialog.current?.showModal(), []);

  const isCsv = (f: File) => /\.(csv|txt)$/i.test(f.name);

  async function loadRows(f: File, sheetName?: string) {
    setError('');
    setRows(null);
    try {
      if (isCsv(f)) {
        setRows(parseCsv(await f.text()));
        return;
      }
      const mod: XlsxModule = await import('read-excel-file');
      const read = mod.default as unknown as (file: File, opts?: Record<string, unknown>) => Promise<Cell[][]>;
      if (!sheetName) {
        const list = (await read(f, { getSheets: true })) as unknown as { name: string }[];
        const names = list.map((s) => s.name);
        setSheets(names);
        sheetName = names[0];
        setSheet(sheetName);
      }
      setRows(await read(f, { sheet: sheetName }));
    } catch {
      setError('Không đọc được file. Hãy dùng file .xlsx hoặc .csv tải từ Google Sheets (Tệp → Tải xuống).');
    }
  }

  async function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setSheets([]);
    setSheet('');
    await loadRows(f);
  }

  const parsed = useMemo(() => (rows ? rowsToRecords(rows, { year }) : null), [rows, year]);
  const fresh = parsed?.records.filter((r) => !existingIds.has(r.id)) ?? [];
  const duplicates = (parsed?.records.length ?? 0) - fresh.length;

  async function run() {
    setBusy(true);
    try {
      const added = await insertMissing(fresh);
      await onImported();
      toast('Đã nhập ' + added + ' hồ sơ.');
      dialog.current?.close();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <dialog ref={dialog} onClose={onClose} onCancel={onClose}>
      <div className="split">
        <div>
          <div className="eyebrow">NHẬP DỮ LIỆU</div>
          <h1 style={{ fontSize: 23 }}>Nhập từ Excel / Google Sheets</h1>
        </div>
        <button type="button" className="btn" onClick={() => dialog.current?.close()}>
          Đóng ×
        </button>
      </div>

      <p>
        Trong Google Sheets: <b>Tệp → Tải xuống → Microsoft Excel (.xlsx)</b> hoặc <b>Giá trị phân tách bằng dấu phẩy (.csv)</b> (CSV chỉ lấy tab đang mở). Hệ thống nhận cột theo tên tiêu đề (NGÀY, SÀN, MÃ ĐƠN HÀNG…). Chỉ <b>thêm hồ sơ mới</b>, không ghi đè hồ sơ đã có; nhập lại cùng một file sẽ không bị trùng.
      </p>

      <div className="filters">
        <input type="file" accept=".xlsx,.csv,.txt" onChange={(e) => void pick(e.target.files?.[0])} />
      </div>

      {sheets.length > 1 && (
        <label style={{ maxWidth: 360 }}>
          Chọn tab (sheet) cần nhập
          <select
            value={sheet}
            onChange={(e) => {
              setSheet(e.target.value);
              if (file) void loadRows(file, e.target.value);
            }}
          >
            {sheets.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      )}

      {error && <div className="notice">{error}</div>}

      {parsed && parsed.headerLine === 0 && (
        <div className="notice">
          Không nhận ra bảng. Cần có hàng tiêu đề chứa ít nhất “NGÀY” và “MÃ ĐƠN HÀNG”. Hãy kiểm tra file hoặc tab đã chọn.
        </div>
      )}

      {parsed && parsed.headerLine > 0 && (
        <>
          <label style={{ maxWidth: 360, margin: '16px 0' }}>
            Năm của các ngày dạng “dd/mm” (file không ghi năm)
            <input type="number" min={2000} max={2100} value={year} onChange={(e) => setYear(Number(e.target.value) || new Date().getFullYear())} />
          </label>

          <div className="stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="stat feature">
              <small>SẼ NHẬP MỚI</small>
              <strong>{fresh.length}</strong>
              <em>hồ sơ</em>
            </div>
            <div className="stat">
              <small>ĐÃ CÓ, BỎ QUA</small>
              <strong>{duplicates}</strong>
              <em>không ghi đè</em>
            </div>
            <div className="stat">
              <small>DÒNG LỖI, BỎ QUA</small>
              <strong>{parsed.skipped.length}</strong>
              <em>cần sửa trong file</em>
            </div>
          </div>

          {parsed.skipped.length > 0 && (
            <details style={{ marginBottom: 16 }}>
              <summary>Xem các dòng bị bỏ qua</summary>
              {parsed.skipped.slice(0, 50).map((s) => (
                <p key={s.line}>
                  Dòng {s.line}: {s.reason}
                </p>
              ))}
              {parsed.skipped.length > 50 && <p>… và {parsed.skipped.length - 50} dòng nữa.</p>}
            </details>
          )}

          <div className="notice">
            Trạng thái được suy ra từ cột “MÃ VẬN ĐƠN GIAO KHÁCH” và “KẾT QUẢ TEST”, cần xác nhận lại sau khi nhập. Cột “PHÍ SHIP” trong file là dấu tích nên chỉ được lưu làm dấu, không tính thành tiền. Các khoản chi phí để trống, chưa đối soát.
          </div>

          <div className="formfoot">
            <span className="muted">Ví dụ ngày nhận đầu tiên: {parsed.records[0]?.received ?? '—'}</span>
            <button className="primary" disabled={busy || fresh.length === 0} onClick={() => void run()}>
              {busy ? 'Đang nhập…' : `Nhập ${fresh.length} hồ sơ`}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
