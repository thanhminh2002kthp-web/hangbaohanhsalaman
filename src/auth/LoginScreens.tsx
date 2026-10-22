import { useState, type FormEvent } from 'react';
import { isConfigured } from '../api/supabase';
import { useAuth } from './AuthProvider';

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel authcard">
      <div className="eyebrow">SALAMAN SERVICE CENTER</div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

export function SetupNeeded() {
  return (
    <Card title="Chưa cấu hình Supabase">
      <p>
        Tạo tệp <b>.env</b> (hoặc khai báo biến môi trường trên Vercel) với <b>VITE_SUPABASE_URL</b> và <b>VITE_SUPABASE_ANON_KEY</b>, rồi chạy lại. Xem README để biết chi tiết.
      </p>
    </Card>
  );
}

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isConfigured) return <SetupNeeded />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setMessage((await signIn(email, password)) ?? '');
    setBusy(false);
  }

  return (
    <Card title="Đăng nhập để tiếp tục">
      <p>Hệ thống nội bộ. Dùng tài khoản do quản trị viên cấp; nếu chưa có hoặc quên mật khẩu, hãy liên hệ quản trị viên.</p>
      <form onSubmit={submit} className="authform">
        <input type="email" required placeholder="email@gmail.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Mật khẩu" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {message && <div className="notice">{message}</div>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Đang xử lý…' : 'Đăng nhập'}
        </button>
      </form>
    </Card>
  );
}

export function NoAccessScreen() {
  const { email, signOut, recheck } = useAuth();
  return (
    <Card title="Chưa được cấp quyền">
      <p>
        Tài khoản <b>{email}</b> chưa được quản trị viên cấp quyền, hoặc đã bị khóa. Hãy liên hệ quản trị viên.
      </p>
      <div className="actions" style={{ marginTop: 22 }}>
        <button className="btn" onClick={() => void recheck()}>
          Kiểm tra lại
        </button>
        <button className="btn" onClick={() => void signOut()}>
          Đăng xuất
        </button>
      </div>
    </Card>
  );
}
