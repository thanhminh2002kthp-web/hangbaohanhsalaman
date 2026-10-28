import { useEffect, useRef, useState, type FormEvent } from 'react';
import { normalizeEmail, validateEmail, validatePassword } from '../domain/accountValidation';
import { PasswordRules } from './PasswordRules';
import type { Role } from '../types';

export interface AccountForm {
  email: string;
  password: string;
  role: Role;
}

interface Props {
  /** create: tạo tài khoản mới; reset: đặt lại mật khẩu cho `email`. */
  mode: 'create' | 'reset';
  email?: string;
  existingEmails: string[];
  onSubmit(form: AccountForm): Promise<void>;
  onClose(): void;
}

export function AccountModal({ mode, email: fixedEmail, existingEmails, onSubmit, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState(fixedEmail ?? '');
  const [role, setRole] = useState<Role>('editor');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({ email: false, confirm: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => dialog.current?.showModal(), []);

  const normalized = normalizeEmail(email);
  const emailError =
    mode === 'create'
      ? validateEmail(email) ?? (existingEmails.includes(normalized) ? 'Email này đã có trong danh sách.' : null)
      : null;
  const passwordErrors = validatePassword(password);
  const mismatch = confirm !== password;
  const valid = !emailError && passwordErrors.length === 0 && !mismatch && confirm !== '';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, confirm: true });
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit({ email: normalized, password, role });
      dialog.current?.close();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const kind = show ? 'text' : 'password';

  return (
    <dialog ref={dialog} onClose={onClose} onCancel={onClose} style={{ maxWidth: 520 }}>
      <form onSubmit={submit} noValidate>
        <div className="split">
          <div>
            <div className="eyebrow">{mode === 'create' ? 'TẠO TÀI KHOẢN MỚI' : 'ĐẶT LẠI MẬT KHẨU'}</div>
            <h1 style={{ fontSize: 23 }}>{mode === 'create' ? 'Thêm tài khoản' : fixedEmail}</h1>
          </div>
          <button type="button" className="btn" disabled={busy} onClick={() => dialog.current?.close()}>
            Đóng ×
          </button>
        </div>

        <div className="authform" style={{ marginTop: 18 }}>
          {mode === 'create' && (
            <>
              <label>
                Email
                <input
                  type="email"
                  autoFocus
                  placeholder="nhanvien@gmail.com"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={touched.email && !!emailError}
                />
                {touched.email && emailError && <span className="field-error">{emailError}</span>}
              </label>
              <label>
                Quyền
                <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="editor">Xem và chỉnh sửa đơn</option>
                  <option value="viewer">Chỉ xem</option>
                </select>
              </label>
            </>
          )}

          <label>
            {mode === 'create' ? 'Mật khẩu' : 'Mật khẩu mới'}
            <input
              type={kind}
              autoComplete="new-password"
              autoFocus={mode === 'reset'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <PasswordRules password={password} />

          <label>
            Nhập lại mật khẩu
            <input
              type={kind}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              aria-invalid={touched.confirm && mismatch}
            />
            {touched.confirm && confirm !== '' && mismatch && <span className="field-error">Mật khẩu nhập lại không khớp.</span>}
          </label>

          <label style={{ flexDirection: 'row', alignItems: 'center', fontWeight: 500 }}>
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Hiện mật khẩu
          </label>

          {error && <div className="notice">{error}</div>}
        </div>

        <div className="formfoot">
          <span className="muted">Gửi mật khẩu cho nhân viên qua kênh riêng.</span>
          <button className="primary" type="submit" disabled={busy || !valid}>
            {busy ? 'Đang xử lý…' : mode === 'create' ? 'Tạo tài khoản' : 'Đặt mật khẩu'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
