import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { LoginScreen, NoAccessScreen } from './auth/LoginScreens';
import { ForgotPasswordScreen, ResetPasswordScreen } from './auth/ResetScreens';
import { ToastProvider } from './components/Toast';
import { parseAuthLinkError } from './domain/passwordReset';
import { Workspace } from './workspace/Workspace';

function Gate() {
  const { status, recovering } = useAuth();
  const [forgot, setForgot] = useState(false);
  // Liên kết email hết hạn: Supabase chuyển về web kèm lỗi ở phần "#". Đọc một lần rồi xóa khỏi địa chỉ.
  const [linkError] = useState(() => parseAuthLinkError(window.location.hash));
  useEffect(() => {
    if (linkError) window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [linkError]);

  // Vừa mở liên kết đặt lại mật khẩu: bắt buộc đặt mật khẩu mới trước khi vào ứng dụng.
  if (recovering && status !== 'loading') return <ResetPasswordScreen />;
  if (status === 'loading') {
    return (
      <div className="panel authcard">
        <h1>Đang kiểm tra quyền truy cập…</h1>
      </div>
    );
  }
  if (status === 'signedOut') {
    return forgot ? (
      <ForgotPasswordScreen onBack={() => setForgot(false)} />
    ) : (
      <LoginScreen onForgot={() => setForgot(true)} notice={linkError ?? undefined} />
    );
  }
  if (status === 'noAccess') return <NoAccessScreen />;
  return <Workspace />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </ToastProvider>
  );
}
