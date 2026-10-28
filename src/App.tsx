import { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { LoginScreen, NoAccessScreen } from './auth/LoginScreens';
import { ActivateScreen, ForceChangeScreen, ForgotPasswordScreen } from './auth/ResetScreens';
import { ToastProvider } from './components/Toast';
import { parseActivationToken } from './domain/passwordReset';
import { Workspace } from './workspace/Workspace';

function Gate() {
  const { status, mustChangePassword } = useAuth();
  const [token, setToken] = useState(() => parseActivationToken(window.location.hash));
  const [forgot, setForgot] = useState(false);

  // Mở từ liên kết trong email: hiện màn hình kích hoạt, bất kể đang đăng nhập hay chưa.
  if (token) {
    return (
      <ActivateScreen
        token={token}
        onDone={() => {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          setToken(null);
        }}
      />
    );
  }
  if (status === 'loading') {
    return (
      <div className="panel authcard">
        <h1>Đang kiểm tra quyền truy cập…</h1>
      </div>
    );
  }
  if (status === 'signedOut') {
    return forgot ? <ForgotPasswordScreen onBack={() => setForgot(false)} /> : <LoginScreen onForgot={() => setForgot(true)} />;
  }
  if (status === 'noAccess') return <NoAccessScreen />;
  if (mustChangePassword) return <ForceChangeScreen />;
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
