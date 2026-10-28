import { ApiError, supabase } from './supabase';

/**
 * Yêu cầu Supabase gửi email đặt lại mật khẩu (kèm liên kết). Email gửi qua SMTP đã cấu hình trong Supabase.
 * Supabase trả lời giống nhau dù email có tồn tại hay không, nên giao diện cũng luôn báo "đã gửi nếu có tài khoản".
 * Chỉ báo lỗi khi bị giới hạn tần suất (429).
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (!error) return;
  if (error.status === 429 || /rate limit|too many|seconds/i.test(error.message)) {
    throw new ApiError('Bạn yêu cầu quá nhanh. Hãy đợi ít phút rồi thử lại.');
  }
  // Lỗi khác (ví dụ SMTP chưa cấu hình): không tiết lộ cho người dùng, chỉ ghi nhật ký để quản trị viên xem.
  console.error('resetPasswordForEmail:', error.message);
}
