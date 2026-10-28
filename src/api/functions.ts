import { ApiError, supabase } from './supabase';

/** Gọi một Edge Function; ném ApiError với lời nhắn tiếng Việt do hàm trả về (nếu có). */
export async function invokeFunction(name: string, body: Record<string, string>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return (data ?? {}) as Record<string, unknown>;
  let message = error.message;
  const res = (error as { context?: Response }).context;
  if (res && typeof res.json === 'function') {
    try {
      message = (await res.json()).error ?? message;
    } catch {
      /* giữ message mặc định */
    }
  }
  throw new ApiError(message);
}
