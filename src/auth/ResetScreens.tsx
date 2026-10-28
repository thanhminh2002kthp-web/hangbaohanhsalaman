import { useEffect, useState, type FormEvent } from 'react';
import { activatePasswordReset, requestPasswordReset } from '../api/passwordReset';
import { PasswordRules } from '../components/PasswordRules';
import { checkPasswordChange, validateEmail } from '../domain/accountValidation';
import { useAuth } from './AuthProvider';
import { Card } from './LoginScreens';

const COOLDOWN_SECONDS = 60;

/** Màn hình "Quên mật khẩu": nhập email → nhận mật khẩu mới và liên kết kích hoạt. */
export function ForgotPasswordScreen({ onBack }: { onBack(): void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait(wait - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateEmail(email);
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSent(true);
      setWait(COOLDOWN_SECONDS);
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  return (
    <Card title="Quên mật khẩu">
      {sent ? (
        <>
          <div className="notice" style={{ marginTop: 14 }}>
            Nếu email này có trong hệ thống, chúng tôi đã gửi <b>mật khẩu mới</b> kèm <b>liên kết kích hoạt</b>. Hãy mở thư (kiểm tra cả mục Spam) và bấm liên kết trong vòng 30 phút. Mật khẩu cũ vẫn dùng được cho đến khi bạn kích hoạt.
          </div>
          <form onSubmit={submit} className="authform">
            <button className="btn" type="submit" disabled={busy || wait > 0}>
              {wait > 0 ? `Gửi lại sau ${wait} giây` : 'Gửi lại'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p>Nhập email tài khoản. Chúng tôi sẽ gửi mật khẩu mới và một liên kết để kích hoạt mật khẩu đó.</p>
          <form onSubmit={submit} className="authform" noValidate>
            <input type="email" autoFocus placeholder="email@gmail.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <div className="notice">{error}</div>}
            <button className="primary" type="submit" disabled={busy}>
              {busy ? 'Đang gửi…' : 'Gửi mật khẩu mới'}
            </button>
          </form>
        </>
      )}
      {sent && error && <div className="notice">{error}</div>}
      <p style={{ marginTop: 16 }}>
        <button className="link" type="button" onClick={onBack}>
          ← Quay lại đăng nhập
        </button>
      </p>
    </Card>
  );
}

/** Màn hình mở từ liên kết trong email: bấm nút để mật khẩu mới có hiệu lực. */
export function ActivateScreen({ token, onDone }: { token: string; onDone(): void }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function activate() {
    setState('busy');
    try {
      const email = await activatePasswordReset(token);
      setMessage(email);
      setState('done');
    } catch (err) {
      setMessage((err as Error).message);
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <Card title="Đã kích hoạt mật khẩu mới">
        <div className="notice" style={{ marginTop: 14 }}>
          Mật khẩu mới của <b>{message}</b> đã có hiệu lực. Hãy đăng nhập bằng mật khẩu ghi trong email; hệ thống sẽ yêu cầu bạn đổi sang mật khẩu của riêng mình.
        </div>
        <div className="actions" style={{ marginTop: 20 }}>
          <button className="primary" onClick={onDone}>
            Đến trang đăng nhập
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Kích hoạt mật khẩu mới">
      <p>Bấm nút bên dưới để mật khẩu mới trong email có hiệu lực. Liên kết chỉ dùng được một lần.</p>
      {state === 'error' && <div className="notice">{message}</div>}
      <div className="actions" style={{ marginTop: 20 }}>
        <button className="primary" disabled={state === 'busy'} onClick={() => void activate()}>
          {state === 'busy' ? 'Đang kích hoạt…' : 'Kích hoạt mật khẩu mới'}
        </button>
        <button className="btn" disabled={state === 'busy'} onClick={onDone}>
          Hủy
        </button>
      </div>
    </Card>
  );
}

/** Sau khi đăng nhập bằng mật khẩu tạm: buộc đặt mật khẩu riêng trước khi vào app. */
export function ForceChangeScreen() {
  const { email, setNewPassword, signOut } = useAuth();
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = checkPasswordChange({ next, confirm });
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    const result = await setNewPassword(next);
    if (result) {
      setError(result);
      setBusy(false);
    }
  }

  const kind = show ? 'text' : 'password';
  return (
    <Card title="Đặt mật khẩu của bạn">
      <p>
        Tài khoản <b>{email}</b> đang dùng mật khẩu tạm gửi qua email. Hãy đặt mật khẩu mới của riêng bạn để tiếp tục.
      </p>
      <form onSubmit={submit} className="authform" noValidate>
        <input type={kind} autoFocus placeholder="Mật khẩu mới" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
        <PasswordRules password={next} />
        <input type={kind} placeholder="Nhập lại mật khẩu mới" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <label style={{ flexDirection: 'row', alignItems: 'center', fontWeight: 500 }}>
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Hiện mật khẩu
        </label>
        {error && <div className="notice">{error}</div>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Đang lưu…' : 'Lưu mật khẩu mới'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <button className="link" type="button" onClick={() => void signOut()}>
          Đăng xuất
        </button>
      </p>
    </Card>
  );
}
