import { AuthProvider, useAuth } from './auth/AuthProvider';
import { LoginScreen, NoAccessScreen } from './auth/LoginScreens';
import { ToastProvider } from './components/Toast';
import { Workspace } from './workspace/Workspace';

function Gate() {
  const { status } = useAuth();
  if (status === 'loading') {
    return (
      <div className="panel authcard">
        <h1>Đang kiểm tra quyền truy cập…</h1>
      </div>
    );
  }
  if (status === 'signedOut') return <LoginScreen />;
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
