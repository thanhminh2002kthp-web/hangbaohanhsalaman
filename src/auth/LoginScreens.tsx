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
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isConfigured) return <SetupNeeded />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    const result = await (mode === 'in' ? signIn : signUp)(email, password);
    setMessage(result ?? '');
    setBusy(false);
  }

  return (
    <Card title={mode === 'in' ? 'Đăng nhập để tiếp tục' : 'Tạo tài khoản'}>
      <p>
        {mode === 'in'
          ? 'Dùng email đã được quản trị viên cấp quyền.'
          : 'Dùng đúng email mà quản trị viên đã thêm vào danh sách. Có tài khoản chưa đủ để xem dữ liệu nếu email chưa được cấp quyền.'}
      </p>
      <form onSubmit={submit} className="authform">
        <input type="email" required placeholder="email@gmail.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Mật khẩu (tối thiểu 8 ký tự)"
          autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message && <div className="notice">{message}</div>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Đang xử lý…' : mode === 'in' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <button className="link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMessage(''); }}>
          {mode === 'in' ? 'Chưa có tài khoản? Tạo tài khoản' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </p>
    </Card>
  );
}

export function NoAccessScreen() {
  const { email, signOut, recheck } = useAuth();
  return (
    <Card title="Chưa được cấp quyền">
      <p>
        Tài khoản <b>{email}</b> chưa được quản trị viên cấp quyền, hoặc đã bị khóa. Hãy gửi email này cho quản trị viên để được thêm vào danh sách.
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
