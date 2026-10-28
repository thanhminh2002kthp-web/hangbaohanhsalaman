import { describe, expect, it } from 'vitest';
import { checkPasswordChange } from './accountValidation';
import { parseActivationToken } from './passwordReset';

const TOKEN = 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v';

describe('parseActivationToken', () => {
  it('lấy mã từ phần # của địa chỉ', () => {
    expect(TOKEN).toHaveLength(43);
    expect(parseActivationToken('#activate=' + TOKEN)).toBe(TOKEN);
    expect(parseActivationToken('#foo=1&activate=' + TOKEN)).toBe(TOKEN);
  });

  it('bỏ qua mã sai định dạng hoặc không có', () => {
    expect(parseActivationToken('')).toBeNull();
    expect(parseActivationToken('#activate=ngan')).toBeNull();
    expect(parseActivationToken('#activate=' + TOKEN + '<script>')).toBeNull();
    expect(parseActivationToken('?activate=' + TOKEN)).toBeNull();
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

  it('không đòi mật khẩu hiện tại khi đặt mật khẩu sau kích hoạt', () => {
    expect(checkPasswordChange({ next: 'Moi@12345', confirm: 'Moi@12345' })).toBeNull();
  });
});
