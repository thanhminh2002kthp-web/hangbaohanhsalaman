// Quy tắc email / mật khẩu cho tài khoản nhân viên.
// LƯU Ý: bản sao của các quy tắc này nằm trong supabase/functions/admin-users/index.ts (máy chủ
// kiểm tra lại mọi yêu cầu). Sửa ở đây thì phải sửa cả bên đó.

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export interface PasswordRule {
  id: 'length' | 'letter' | 'digit' | 'special';
  label: string;
  test(password: string): boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: `Tối thiểu ${PASSWORD_MIN} ký tự`, test: (p) => p.length >= PASSWORD_MIN },
  { id: 'letter', label: 'Có chữ cái', test: (p) => /\p{L}/u.test(p) },
  { id: 'digit', label: 'Có chữ số', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'Có ký tự đặc biệt (ví dụ ! @ # $ %)', test: (p) => /[^\p{L}\d\s]/u.test(p) }
];

/** Trả về danh sách lỗi (rỗng nếu mật khẩu hợp lệ). */
export function validatePassword(password: string): string[] {
  const errors = PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label);
  if (password.length > PASSWORD_MAX) errors.push(`Tối đa ${PASSWORD_MAX} ký tự`);
  return errors;
}

/**
 * Kiểm tra form đổi mật khẩu. `current` = undefined khi không cần mật khẩu hiện tại
 * (đặt mật khẩu mới sau khi kích hoạt từ email). Trả về lỗi đầu tiên hoặc null.
 */
export function checkPasswordChange(input: { current?: string; next: string; confirm: string }): string | null {
  if (input.current !== undefined && !input.current) return 'Nhập mật khẩu hiện tại.';
  if (validatePassword(input.next).length) return 'Mật khẩu mới chưa đạt yêu cầu.';
  if (input.next !== input.confirm) return 'Mật khẩu nhập lại không khớp.';
  if (input.current !== undefined && input.current === input.next) return 'Mật khẩu mới phải khác mật khẩu hiện tại.';
  return null;
}

export const normalizeEmail = (raw: string): string => raw.trim().toLowerCase();

const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** Trả về thông báo lỗi, hoặc null nếu email hợp lệ. */
export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) return 'Nhập email.';
  const [local = ''] = email.split('@');
  if (
    email.length > 254 ||
    local.length > 64 ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    email.includes('..') ||
    !EMAIL_RE.test(email) ||
    !/\.[a-z]{2,}$/.test(email)
  ) {
    return 'Email không hợp lệ (ví dụ: ten@congty.com).';
  }
  return null;
}
