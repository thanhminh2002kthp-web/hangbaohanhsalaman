import { describe, expect, it } from 'vitest';
import { checkPasswordChange } from './accountValidation';

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

  it('không đòi mật khẩu hiện tại khi bỏ trống tham số current', () => {
    expect(checkPasswordChange({ next: 'Moi@12345', confirm: 'Moi@12345' })).toBeNull();
  });
});
