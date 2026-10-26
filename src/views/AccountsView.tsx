import { useCallback, useEffect, useState } from 'react';
import { createAccount, listMembers, resetPassword, upsertMember } from '../api/members';
import { useAuth } from '../auth/AuthProvider';
import { AccountModal, type AccountForm } from '../components/AccountModal';
import { useToast } from '../components/Toast';
import type { Member, Role } from '../types';

const ROLE_LABEL: Record<Role, string> = { admin: 'Quản trị viên', editor: 'Xem và chỉnh sửa', viewer: 'Chỉ xem' };

type ModalState = { mode: 'create' } | { mode: 'reset'; email: string } | null;

export function AccountsView() {
  const { email: me } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const load = useCallback(async () => {
    try {
      setMembers(await listMembers());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => void load(), [load]);

  async function run(action: () => Promise<void>, done: string) {
    setBusy(true);
    try {
      await action();
      toast(done);
      await load();
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /** Lỗi được ném lại để hộp thoại hiển thị ngay trong form. */
  async function submitModal(form: AccountForm) {
    if (modal?.mode === 'reset') {
      await resetPassword(modal.email, form.password);
      toast('Đã đặt lại mật khẩu cho ' + modal.email);
    } else {
      await createAccount(form.email, form.password, form.role);
      toast('Đã tạo tài khoản ' + form.email);
    }
    await load();
  }

  if (error) return <div className="notice">{error}</div>;
  if (!members) return <div className="panel">Đang tải danh sách tài khoản…</div>;

  return (
    <>
      <div className="titlebar">
        <div>
          <div className="eyebrow">QUẢN TRỊ ỨNG DỤNG</div>
          <h1>Quản lý tài khoản</h1>
          <p>Chỉ quản trị viên được tạo tài khoản, đổi quyền, đặt lại mật khẩu và khóa tài khoản.</p>
        </div>
        <div className="actions">
          <button className="primary" onClick={() => setModal({ mode: 'create' })}>
            ＋ Thêm tài khoản
          </button>
        </div>
      </div>
      <div className="notice">
        Hệ thống nội bộ: không ai tự đăng ký được. Bạn tạo tài khoản ở đây rồi gửi email và mật khẩu cho nhân viên qua kênh riêng; nên dùng mật khẩu tạm và nhờ nhân viên giữ kín.
      </div>
      <div className="panel tablepanel">
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>EMAIL</th>
                <th>QUYỀN</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const self = m.email === me.toLowerCase();
                return (
                  <tr key={m.email}>
                    <td>
                      <b>{m.email}</b>
                      {self && <span className="sub">Tài khoản của bạn</span>}
                    </td>
                    <td>{ROLE_LABEL[m.role]}</td>
                    <td>{m.active ? <span className="badge">Đang hoạt động</span> : <span className="badge wait">Đã khóa</span>}</td>
                    <td>
                      {self || m.role === 'admin' ? (
                        '—'
                      ) : (
                        <>
                          <button className="link" disabled={busy} onClick={() => confirm((m.active ? 'Khóa' : 'Mở lại') + ' quyền của ' + m.email + '?') && void run(() => upsertMember({ ...m, active: !m.active }), 'Đã cập nhật quyền.')}>
                            {m.active ? 'Khóa' : 'Mở lại'}
                          </button>
                          <button className="link" disabled={busy} onClick={() => void run(() => upsertMember({ ...m, role: m.role === 'editor' ? 'viewer' : 'editor' }), 'Đã cập nhật quyền.')}>
                            {m.role === 'editor' ? 'Chuyển chỉ xem' : 'Cho chỉnh sửa'}
                          </button>
                          <button className="link" disabled={busy} onClick={() => setModal({ mode: 'reset', email: m.email })}>
                            Đặt mật khẩu
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="panel help" style={{ marginTop: 22 }}>
        <h2>Phân quyền hoạt động thế nào?</h2>
        <p>
          Nhân viên chỉ được sửa hồ sơ, không được thêm người khác. Quyền được kiểm tra ở cơ sở dữ liệu, nên không thể vượt quyền bằng cách sửa giao diện. Khóa tài khoản có hiệu lực ở lần đọc hoặc lưu tiếp theo. Lịch sử hồ sơ ghi email người sửa và thời điểm lưu. Hai người cùng sửa sẽ được cảnh báo thay vì tự ghi đè.
        </p>
      </div>

      {modal && (
        <AccountModal
          mode={modal.mode}
          email={modal.mode === 'reset' ? modal.email : undefined}
          existingEmails={members.map((m) => m.email)}
          onSubmit={submitModal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
