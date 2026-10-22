import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { listMembers, upsertMember } from '../api/members';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/Toast';
import type { Member, Role } from '../types';

const ROLE_LABEL: Record<Role, string> = { admin: 'Quản trị viên', editor: 'Xem và chỉnh sửa', viewer: 'Chỉ xem' };

export function AccountsView() {
  const { email: me } = useAuth();
  const toast = useToast();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('editor');

  const load = useCallback(async () => {
    try {
      setMembers(await listMembers());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => void load(), [load]);

  async function update(m: Member) {
    try {
      await upsertMember(m);
      toast('Đã cập nhật quyền.');
      await load();
    } catch (e) {
      toast((e as Error).message);
    }
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    await update({ email: newEmail, role: newRole, active: true });
    setNewEmail('');
  }

  if (error) return <div className="notice">{error}</div>;
  if (!members) return <div className="panel">Đang tải danh sách tài khoản…</div>;

  return (
    <>
      <div className="titlebar">
        <div>
          <div className="eyebrow">QUẢN TRỊ ỨNG DỤNG</div>
          <h1>Quản lý tài khoản</h1>
          <p>Chỉ quản trị viên được thêm Gmail, đổi quyền và khóa tài khoản.</p>
        </div>
      </div>
      <div className="notice">
        Thêm email ở đây là cấp quyền sử dụng ứng dụng. Người được thêm cần tự bấm “Tạo tài khoản” ở màn hình đăng nhập bằng đúng email này (hoặc bạn tạo người dùng trong Supabase → Authentication). Hệ thống không gửi thư mời.
      </div>
      <div className="panel">
        <h2>Thêm Gmail</h2>
        <form className="filters" onSubmit={add}>
          <input type="email" required placeholder="nhanvien@gmail.com" aria-label="Gmail nhân viên" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <select aria-label="Quyền tài khoản" value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
            <option value="editor">Xem và chỉnh sửa đơn</option>
            <option value="viewer">Chỉ xem</option>
          </select>
          <button className="primary" type="submit">
            Thêm quyền
          </button>
        </form>
      </div>
      <div className="panel tablepanel" style={{ marginTop: 22 }}>
        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>GMAIL</th>
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
                          <button
                            className="link"
                            onClick={() => confirm((m.active ? 'Khóa' : 'Mở lại') + ' quyền của ' + m.email + '?') && void update({ ...m, active: !m.active })}
                          >
                            {m.active ? 'Khóa' : 'Mở lại'}
                          </button>
                          <button className="link" onClick={() => void update({ ...m, role: m.role === 'editor' ? 'viewer' : 'editor' })}>
                            {m.role === 'editor' ? 'Chuyển chỉ xem' : 'Cho chỉnh sửa'}
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
    </>
  );
}
