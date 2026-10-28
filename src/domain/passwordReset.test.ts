import { describe, expect, it } from 'vitest';
import { checkPasswordChange } from './accountValidation';
import { parseAuthLinkError } from './passwordReset';

describe('parseAuthLinkError', () => {
  it('nhận ra liên kết hết hạn', () => {
    const hash = '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    expect(parseAuthLinkError(hash)).toContain('hết hạn');
  });

  it('báo chung cho lỗi khác', () => {
    expect(parseAuthLinkError('#error=server_error')).toContain('không hợp lệ');
  });

  it('không báo gì khi địa chỉ không có lỗi', () => {
    expect(parseAuthLinkError('')).toBeNull();
    expect(parseAuthLinkError('#access_token=abc&type=recovery')).toBeNull();
  });
});

describe('checkPasswordChange', () => {
  const ok = { current: 'Cu@12345', next: 'Moi@12345', confirm: 'Moi@12345' };

  it('chấp nhận form hợp lệ', () => {
    expect(checkPasswordChange(ok)).toBeNull();
  });

  it('báo lỗi theo từng trường hợp', () => {
    expect(checkPasswordChange({ ...ok, current: '' })).toBe('Nhập mật khẩu hiện tại.');
    expect(checkPasswordChange({ ...ok, next: 'yeu', confirm: 'yeu' })).toBe('Mật khẩu mới chưa đạt yêu cầu.');
    expect(checkPasswordChange({ ...ok, confirm: 'Khac@12345' })).toBe('Mật khẩu nhập lại không khớp.');
    expect(checkPasswordChange({ ...ok, next: ok.current, confirm: ok.current })).toBe('Mật khẩu mới phải khác mật khẩu hiện tại.');
  });

  it('không đòi mật khẩu hiện tại khi đặt lại qua email', () => {
    expect(checkPasswordChange({ next: 'Moi@12345', confirm: 'Moi@12345' })).toBeNull();
  });
});
