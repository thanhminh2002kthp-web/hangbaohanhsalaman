/**
 * Khi liên kết trong email hết hạn hoặc đã dùng, Supabase chuyển về web kèm lỗi ở phần "#",
 * ví dụ "#error=access_denied&error_code=otp_expired&error_description=...".
 * Trả về lời nhắn tiếng Việt, hoặc null nếu địa chỉ không có lỗi.
 */
export function parseAuthLinkError(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const code = params.get('error_code');
  const error = params.get('error');
  if (!code && !error) return null;
  if (code === 'otp_expired') {
    return 'Liên kết đặt lại mật khẩu đã hết hạn hoặc đã được dùng. Hãy bấm "Quên mật khẩu?" để nhận liên kết mới.';
  }
  return 'Liên kết không hợp lệ. Hãy bấm "Quên mật khẩu?" để nhận liên kết mới.';
}
