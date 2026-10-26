import { describe, expect, it } from 'vitest';
import { normalizeEmail, validateEmail, validatePassword } from './accountValidation';

describe('validateEmail', () => {
  it('chấp nhận email hợp lệ và chuẩn hóa về chữ thường', () => {
    expect(validateEmail('Nhan.Vien+kho@Gmail.com')).toBeNull();
    expect(normalizeEmail('  A@B.com ')).toBe('a@b.com');
    expect(validateEmail('ten@sub.congty.vn')).toBeNull();
  });

  it('từ chối email sai', () => {
    for (const bad of ['', 'abc', 'a@b', 'a@b.', '@b.com', 'a b@c.com', 'a@@b.com', 'a..b@c.com', '.a@b.com', 'a.@b.com', 'a@b.c', 'a@-b.com']) {
      expect(validateEmail(bad), bad).not.toBeNull();
    }
  });
});

describe('validatePassword', () => {
  it('chấp nhận mật khẩu đủ chữ, số, ký tự đặc biệt, từ 8 ký tự', () => {
    expect(validatePassword('Salaman@2026')).toEqual([]);
    expect(validatePassword('abc12345!')).toEqual([]);
  });

  it('báo từng điều kiện còn thiếu', () => {
    expect(validatePassword('abc123!')).toEqual(['Tối thiểu 8 ký tự']);
    expect(validatePassword('abcdefgh!')).toEqual(['Có chữ số']);
    expect(validatePassword('12345678!')).toEqual(['Có chữ cái']);
    expect(validatePassword('abcd1234')).toEqual(['Có ký tự đặc biệt (ví dụ ! @ # $ %)']);
    expect(validatePassword('')).toHaveLength(4);
  });

  it('giới hạn tối đa 72 ký tự', () => {
    expect(validatePassword('a1!' + 'x'.repeat(70))).toEqual(['Tối đa 72 ký tự']);
  });
});
