import { useEffect, useMemo, useRef, useState } from 'react';
import { insertMissing, saveRecord } from '../api/records';
import { parseCsv, planImport, rowsToRecords, type Cell } from '../domain/importSheet';
import type { WarrantyRecord } from '../types';
import { useToast } from './Toast';

interface Props {
  existing: WarrantyRecord[];
  onImported(): Promise<unknown>;
  onClose(): void;
}

type XlsxModule = typeof import('read-excel-file');
type Mode = 'add' | 'update';

const PREVIEW_LIMIT = 200;
const CONCURRENCY = 4;

export function ImportDialog({ existing, onImported, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [sheet, setSheet] = useState('');
  const [rows, setRows] = useState<Cell[][] | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState<Mode>('update');
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => dialog.current?.showModal(), []);

  async function loadRows(f: File, sheetName?: string) {
    setError('');
    setRows(null);
    try {
      if (/\.(csv|txt)$/i.test(f.name)) {
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
  const plan = useMemo(() => (parsed ? planImport(parsed.records, existing) : null), [parsed, existing]);

  // Lưu các hồ sơ bị bỏ chọn (mặc định chọn hết) để lựa chọn không mất khi dữ liệu tự tải lại.
  const chosen = mode === 'update' && plan ? plan.updates.filter((u) => !skipped.has(u.current.id)) : [];
  const fresh = plan?.fresh ?? [];
  const total = fresh.length + chosen.length;

  function toggle(id: string) {
    setSkipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function run() {
    setBusy(true);
    setError('');
    let added = 0;
    let updated = 0;
    const failed: string[] = [];
    try {
      if (fresh.length) {
        setProgress('Đang thêm hồ sơ mới…');
        added = await insertMissing(fresh);
      }
      const queue = [...chosen];
      let done = 0;
      const worker = async () => {
        for (let u = queue.shift(); u; u = queue.shift()) {
          try {
            await saveRecord(u.next);
            updated++;
          } catch (e) {
            failed.push(u.current.id + ': ' + (e as Error).message);
          }
          setProgress(`Đang cập nhật ${++done}/${chosen.length}…`);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
      await onImported();
      toast(`Đã thêm ${added}, cập nhật ${updated} hồ sơ.` + (failed.length ? ` ${failed.length} hồ sơ chưa cập nhật.` : ''));
      if (failed.length) {
        setError('Một số hồ sơ chưa cập nhật (có thể vừa được người khác sửa). Hãy mở lại hộp thoại và nhập lần nữa:\n' + failed.slice(0, 10).join('\n'));
        setBusy(false);
        setProgress('');
        return;
      }
      dialog.current?.close();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
      setProgress('');
    }
  }

  return (
    <dialog ref={dialog} onClose={onClose} onCancel={onClose}>
      <div className="split">
        <div>
          <div className="eyebrow">NHẬP DỮ LIỆU</div>
          <h1 style={{ fontSize: 23 }}>Nhập từ Excel / Google Sheets</h1>
        </div>
        <button type="button" className="btn" disabled={busy} onClick={() => dialog.current?.close()}>
          Đóng ×
        </button>
      </div>

      <p>
        Trong Google Sheets: <b>Tệp → Tải xuống → Microsoft Excel (.xlsx)</b> hoặc <b>CSV</b> (CSV chỉ lấy tab đang mở). Hệ thống nhận cột theo tên tiêu đề (NGÀY, SÀN, MÃ ĐƠN HÀNG…).
      </p>

      <div className="filters">
        <input type="file" accept=".xlsx,.csv,.txt" disabled={busy} onChange={(e) => void pick(e.target.files?.[0])} />
      </div>

      {sheets.length > 1 && (
        <label style={{ maxWidth: 360 }}>
          Chọn tab (sheet) cần nhập
          <select
            value={sheet}
            disabled={busy}
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

      {error && <div className="notice" style={{ whiteSpace: 'pre-line' }}>{error}</div>}

      {parsed && parsed.headerLine === 0 && (
        <div className="notice">
          Không nhận ra bảng. Cần có hàng tiêu đề chứa ít nhất “NGÀY” và “MÃ ĐƠN HÀNG”. Hãy kiểm tra file hoặc tab đã chọn.
        </div>
      )}

      {parsed && plan && parsed.headerLine > 0 && (
        <>
          <div className="formgrid" style={{ margin: '16px 0' }}>
            <label>
              Năm của các ngày dạng “dd/mm” (file không ghi năm)
              <input type="number" min={2000} max={2100} value={year} disabled={busy} onChange={(e) => setYear(Number(e.target.value) || new Date().getFullYear())} />
            </label>
            <label>
              Chế độ nhập
              <select value={mode} disabled={busy} onChange={(e) => setMode(e.target.value as Mode)}>
                <option value="update">Thêm mới + cập nhật hồ sơ đã có (lấy file làm chuẩn)</option>
                <option value="add">Chỉ thêm hồ sơ mới (không đụng hồ sơ đã có)</option>
              </select>
            </label>
          </div>

          <div className="stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
            <div className="stat feature">
              <small>THÊM MỚI</small>
              <strong>{fresh.length}</strong>
              <em>hồ sơ</em>
            </div>
            <div className="stat">
              <small>CẬP NHẬT</small>
              <strong>{mode === 'update' ? chosen.length : 0}</strong>
              <em>{mode === 'update' ? `trên ${plan.updates.length} hồ sơ có thay đổi` : 'đang tắt'}</em>
            </div>
            <div className="stat">
              <small>GIỮ NGUYÊN</small>
              <strong>{plan.unchanged + (mode === 'add' ? plan.updates.length : 0)}</strong>
              <em>không có gì mới</em>
            </div>
            <div className="stat">
              <small>DÒNG LỖI</small>
              <strong>{parsed.skipped.length}</strong>
              <em>bị bỏ qua</em>
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

          {mode === 'update' && plan.updates.length > 0 && (
            <div className="panel tablepanel" style={{ marginBottom: 16 }}>
              <div className="panelhead">
                <h2>Các thay đổi sẽ áp dụng</h2>
                <div className="actions">
                  <button className="link" onClick={() => setSkipped(new Set())}>
                    Chọn tất cả
                  </button>
                  <button className="link" onClick={() => setSkipped(new Set(plan.updates.map((u) => u.current.id)))}>
                    Bỏ chọn
                  </button>
                </div>
              </div>
              <div className="tablewrap" style={{ maxHeight: '38vh' }}>
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      <th>HỒ SƠ</th>
                      <th>THAY ĐỔI (hiện tại → theo file)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.updates.slice(0, PREVIEW_LIMIT).map((u) => (
                      <tr key={u.current.id}>
                        <td>
                          <input type="checkbox" checked={!skipped.has(u.current.id)} onChange={() => toggle(u.current.id)} aria-label={'Chọn ' + u.current.id} />
                        </td>
                        <td>
                          <strong>{u.current.id}</strong>
                          <span className="sub">{u.current.order} · {u.current.customer}</span>
                        </td>
                        <td>
                          {u.changes.map((c) => (
                            <span className="sub" key={c.key}>
                              <b>{c.label}:</b> {c.from || '—'} → {c.to || '—'}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {plan.updates.length > PREVIEW_LIMIT && (
                <p className="muted" style={{ padding: '0 22px 16px' }}>
                  Chỉ hiển thị {PREVIEW_LIMIT} hồ sơ đầu; “Chọn tất cả” vẫn áp dụng cho toàn bộ {plan.updates.length} hồ sơ.
                </p>
              )}
            </div>
          )}

          <div className="notice">
            Chế độ cập nhật chỉ đổi: trạng thái, vận đơn giao, ngày gửi, kết quả test, mẫu đổi, lý do, kênh, địa chỉ, ghi chú, dấu tích ship, tiền thu thêm. Ô trống trong file không xóa dữ liệu đang có. Trạng thái chỉ đổi khi vận đơn giao hoặc kết quả test trong file khác bản hiện tại; tiền thu thêm của hồ sơ đã đối soát được giữ nguyên. Chi phí, mức độ ưu tiên và hạn xử lý không bị thay đổi. Mọi thay đổi được ghi vào lịch sử hồ sơ.
          </div>

          <div className="formfoot">
            <span className="muted">{progress}</span>
            <button className="primary" disabled={busy || total === 0} onClick={() => void run()}>
              {busy ? 'Đang xử lý…' : `Áp dụng (${fresh.length} mới, ${chosen.length} cập nhật)`}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
