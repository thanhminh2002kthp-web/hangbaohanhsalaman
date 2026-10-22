import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

const Ctx = createContext<(message: string) => void>(() => {});

export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const timer = useRef<number>();

  const show = useCallback((m: string) => {
    setMessage(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(''), 3500);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <div id="toast" role="status" style={{ display: message ? 'block' : 'none' }}>
        {message}
      </div>
    </Ctx.Provider>
  );
}
