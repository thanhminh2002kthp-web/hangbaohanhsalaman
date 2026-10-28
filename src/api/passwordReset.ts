import { invokeFunction } from './functions';

/** Yêu cầu gửi mật khẩu mới + liên kết kích hoạt về email. Luôn thành công nếu email hợp lệ (không tiết lộ email có tồn tại). */
export async function requestPasswordReset(email: string): Promise<void> {
  await invokeFunction('password-reset', { action: 'request', email });
}

/** Kích hoạt mật khẩu mới từ mã trong liên kết. Trả về email của tài khoản. */
export async function activatePasswordReset(token: string): Promise<string> {
  const data = await invokeFunction('password-reset', { action: 'activate', token });
  return String(data.email ?? '');
}
