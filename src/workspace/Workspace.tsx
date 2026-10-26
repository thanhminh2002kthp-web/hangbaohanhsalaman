import { useCallback, useEffect, useMemo, useState } from 'react';
import { listRecords, saveRecord } from '../api/records';
import { useAuth } from '../auth/AuthProvider';
import { NavIcon } from '../components/NavIcon';
import { RecordEditor } from '../components/RecordEditor';
import { useToast } from '../components/Toast';
import { emptyRecord } from '../domain/records';
import type { Status, WarrantyRecord } from '../types';
import { AccountsView } from '../views/AccountsView';
import { OverviewView } from '../views/OverviewView';
import { RecordsView } from '../views/RecordsView';
import { ReportsView } from '../views/ReportsView';
import { SettingsView } from '../views/SettingsView';
import { WorkspaceCtx, type WorkspaceValue } from './WorkspaceContext';

type View = 'overview' | 'records' | 'costs' | 'reports' | 'settings' | 'accounts';

const LABELS: Record<View, string> = {
  overview: 'Tổng quan',
  records: 'Hồ sơ bảo hành',
  costs: 'Chi phí & thu thêm',
  reports: 'Báo cáo',
  settings: 'Dữ liệu & hướng dẫn',
  accounts: 'Quản lý tài khoản'
};

const NAV: View[] = ['overview', 'records', 'costs', 'reports', 'settings'];

const REFRESH_MS = 30000;

export function Workspace() {
  const { email, role, signOut } = useAuth();
  const toast = useToast();
  const [view, setView] = useState<View>('overview');
  const [records, setRecords] = useState<WarrantyRecord[]>([]);
  const [online, setOnline] = useState(true);
  const [editing, setEditing] = useState<{ record: WarrantyRecord; existing: boolean } | null>(null);

  const reload = useCallback(async (): Promise<boolean> => {
    try {
      setRecords(await listRecords());
      setOnline(true);
      return true;
    } catch (e) {
      setOnline(false);
      toast((e as Error).message);
      return false;
    }
  }, [toast]);

  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !editing) void reload();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [reload, editing]);

  const canEdit = role !== 'viewer';
  const ctx = useMemo<WorkspaceValue>(
    () => ({
      records,
      role: role ?? 'viewer',
      canEdit,
      reload,
      openEditor: (r) => {
        if (!r && !canEdit) return toast('Tài khoản chỉ được xem.');
        setEditing(r ? { record: r, existing: true } : { record: emptyRecord(), existing: false });
      }
    }),
    [records, role, canEdit, reload, toast]
  );

  async function onSave(r: WarrantyRecord) {
    const saved = await saveRecord(r);
    setRecords((prev) => (prev.some((x) => x.id === saved.id) ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev]));
    setEditing(null);
    toast('Đã lưu lên dữ liệu chung · ' + saved.id);
  }

  async function onStatusChange(record: WarrantyRecord, status: Status) {
    try {
      const saved = await saveRecord({ ...record, status });
      setRecords((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      toast('Đã cập nhật trạng thái · ' + saved.id);
    } catch (e) {
      if ((e as { status?: number }).status === 409) void reload();
      toast((e as Error).message);
      throw e;
    }
  }

  async function onSaveFailed409() {
    await reload();
  }

  const nav: View[] = role === 'admin' ? [...NAV, 'accounts'] : NAV;

  return (
    <WorkspaceCtx.Provider value={ctx}>
      <aside>
        <a className="brand" href="#">
          <span>
            SALAMAN<small>TRUNG TÂM BẢO HÀNH</small>
          </span>
        </a>
        <div className="navlabel">KHÔNG GIAN LÀM VIỆC</div>
        <nav>
          {nav.map((v) => (
            <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              <NavIcon name={v} />
              <span>{LABELS[v]}</span>
            </button>
          ))}
        </nav>
        <div className="asidebottom">
          <span className="dot"></span> Dữ liệu dùng chung<small>Kiểm tra quyền mỗi lần lưu đơn</small>
        </div>
      </aside>
      <main>
        <header>
          <span>
            Vận hành / <b>{LABELS[view]}</b>
          </span>
          <span className="owner">
            <b>{email}</b>
            <button
              className="btn"
              onClick={async () => {
                if (await reload()) toast('Đã tải dữ liệu mới nhất.');
              }}
            >
              ↻ Tải mới
            </button>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                void signOut();
              }}
            >
              Đăng xuất
            </a>
          </span>
        </header>
        <section>
          {!online && (
            <div className="notice">
              Chưa kết nối được máy chủ. Dữ liệu hiển thị có thể chưa mới; chỉ xác nhận lưu sau khi máy chủ trả thành công.
            </div>
          )}
          {view === 'overview' && (
            <OverviewView goRecords={() => setView('records')} onStatusChange={onStatusChange} />
          )}
          {view === 'records' && <RecordsView mode="records" onStatusChange={onStatusChange} />}
          {view === 'costs' && <RecordsView mode="costs" onStatusChange={onStatusChange} />}
          {view === 'reports' && <ReportsView />}
          {view === 'settings' && <SettingsView />}
          {view === 'accounts' && role === 'admin' && <AccountsView />}
          <div className="source">SALAMAN · Quản lý bảo hành & đổi trả &nbsp; / &nbsp; Tiền tệ VND · Múi giờ Việt Nam</div>
        </section>
      </main>
      {editing && (
        <RecordEditor
          key={editing.record.id}
          record={editing.record}
          existing={editing.existing}
          readOnly={!canEdit}
          others={records}
          onSave={async (r) => {
            try {
              await onSave(r);
            } catch (e) {
              if ((e as { status?: number }).status === 409) await onSaveFailed409();
              throw e;
            }
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </WorkspaceCtx.Provider>
  );
}
