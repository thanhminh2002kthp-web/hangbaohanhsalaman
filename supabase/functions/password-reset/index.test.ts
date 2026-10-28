// Kiểm thử phần thuần (mã hóa, sinh mật khẩu, kiểm tra email) của Edge Function password-reset.
// Hàm chạy trên Deno nên không import trực tiếp được; test này cắt đúng đoạn code đó từ index.ts,
// bỏ kiểu TypeScript bằng esbuild rồi chạy trong Node, nhờ vậy test luôn bám sát mã thật.
import { readFileSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { describe, expect, it } from 'vitest';

const source = readFileSync(new URL('./index.ts', import.meta.url), 'utf8');
const start = source.indexOf('// Quy tắc email');
const end = source.indexOf('// Gửi thư (Resend)');
if (start < 0 || end < 0) throw new Error('Không tìm thấy đoạn code cần kiểm thử trong index.ts');

const wrapped = `(() => {${source.slice(start, end)}
return { validateEmail, passwordIsValid, generatePassword, newToken, lookupHash, seal, unseal };})()`;
const js = transformSync(wrapped, { loader: 'ts', target: 'es2020' }).code;

interface Helpers {
  validateEmail(email: string): boolean;
  passwordIsValid(p: string): boolean;
  generatePassword(length?: number): string;
  newToken(): string;
  lookupHash(token: string): Promise<string>;
  seal(token: string, plain: string): Promise<string>;
  unseal(token: string, sealed: string): Promise<string>;
}
const h = new Function('return ' + js)() as Helpers;

describe('sinh mật khẩu tạm', () => {
  it('luôn đạt quy tắc, đủ 14 ký tự, không có ký tự dễ nhầm', () => {
    for (let i = 0; i < 300; i++) {
      const p = h.generatePassword();
      expect(p).toHaveLength(14);
      expect(h.passwordIsValid(p), p).toBe(true);
      expect(p).not.toMatch(/[0O1lI]/);
      expect(p).not.toMatch(/[&<>"'\s]/); // an toàn khi chèn vào HTML và email
    }
  });

  it('không lặp lại giữa các lần sinh', () => {
    const set = new Set(Array.from({ length: 200 }, () => h.generatePassword()));
    expect(set.size).toBe(200);
  });
});

describe('mã trong liên kết', () => {
  it('đúng định dạng, đủ dài và không trùng', () => {
    const tokens = Array.from({ length: 100 }, () => h.newToken());
    for (const t of tokens) expect(t).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(new Set(tokens).size).toBe(100);
  });

  it('băm tra cứu ổn định, 64 ký tự hex, và khác nhau theo mã', async () => {
    const t = h.newToken();
    const a = await h.lookupHash(t);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await h.lookupHash(t)).toBe(a);
    expect(await h.lookupHash(h.newToken())).not.toBe(a);
  });
});

describe('mã hóa mật khẩu tạm bằng mã trong liên kết', () => {
  it('giải mã lại đúng mật khẩu, kể cả ký tự đặc biệt', async () => {
    const t = h.newToken();
    const p = h.generatePassword();
    const sealed = await h.seal(t, p);
    expect(sealed).not.toContain(p);
    expect(await h.unseal(t, sealed)).toBe(p);
  });

  it('mã sai thì không giải mã được', async () => {
    const sealed = await h.seal(h.newToken(), 'Mat@khau12345');
    await expect(h.unseal(h.newToken(), sealed)).rejects.toThrow();
  });

  it('mỗi lần mã hóa cho kết quả khác nhau (iv ngẫu nhiên)', async () => {
    const t = h.newToken();
    expect(await h.seal(t, 'abc')).not.toBe(await h.seal(t, 'abc'));
  });
});

describe('kiểm tra email trong function', () => {
  it('chấp nhận và từ chối đúng', () => {
    expect(h.validateEmail('nhan.vien@gmail.com')).toBe(true);
    for (const bad of ['', 'abc', 'a@b', 'a..b@c.com', 'a b@c.com', '@c.com']) expect(h.validateEmail(bad), bad).toBe(false);
  });
});
