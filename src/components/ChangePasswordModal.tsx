import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { checkPasswordChange } from '../domain/accountValidation';
import { PasswordRules } from './PasswordRules';
import { useToast } from './Toast';

/** Đổi mật khẩu khi đang đăng nhập (hỏi mật khẩu hiện tại). */
export function ChangePasswordModal({ onClose }: { onClose(): void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { changePassword } = useAuth();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => dialog.current?.showModal(), []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = checkPasswordChange({ current, next, confirm });
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    const result = await changePassword(current, next);
    if (result) {
      setError(result);
      setBusy(false);
      return;
    }
    toast('Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.');
    dialog.current?.close();
  }

  const kind = show ? 'text' : 'password';
  return (
    <dialog ref={dialog} onClose={onClose} onCancel={onClose} style={{ maxWidth: 480 }}>
      <form onSubmit={submit} noValidate>
        <div className="split">
          <div>
            <div className="eyebrow">TÀI KHOẢN CỦA BẠN</div>
            <h1 style={{ fontSize: 23 }}>Đổi mật khẩu</h1>
          </div>
          <button type="button" className="btn" disabled={busy} onClick={() => dialog.current?.close()}>
            Đóng ×
          </button>
        </div>

        <div className="authform" style={{ marginTop: 18 }}>
          <label>
            Mật khẩu hiện tại
            <input type={kind} autoFocus autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </label>
          <label>
            Mật khẩu mới
            <input type={kind} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </label>
          <PasswordRules password={next} />
          <label>
            Nhập lại mật khẩu mới
            <input type={kind} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>
          <label style={{ flexDirection: 'row', alignItems: 'center', fontWeight: 500 }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Hiện mật khẩu
          </label>
          {error && <div className="notice">{error}</div>}
        </div>

        <div className="formfoot">
          <span className="muted">Đổi xong, các thiết bị khác sẽ bị đăng xuất.</span>
          <button className="primary" type="submit" disabled={busy}>
            {busy ? 'Đang lưu…' : 'Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
