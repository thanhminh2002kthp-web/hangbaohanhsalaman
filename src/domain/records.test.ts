import { describe, expect, it } from 'vitest';
import { costReviewError, emptyFilters, emptyRecord, fee, filterRecords, maskPhone, net, parseBackup, toCsv, today } from './records';

const rec = (patch = {}) => ({ ...emptyRecord(), ...patch });

describe('chi phí', () => {
  it('chi phí ròng = tổng chi − thu thêm', () => {
    const r = rec({ shipIn: 25000, shipOut: 30000, parts: 100000, labor: 20000, other: 0, refund: 0, extra: 30000 });
    expect(fee(r)).toBe(175000);
    expect(net(r)).toBe(145000);
  });

  it('ô trống không tính vào chi phí', () => {
    expect(fee(rec())).toBe(0);
  });

  it('không cho đối soát khi còn ô tiền trống', () => {
    expect(costReviewError(rec({ costReviewed: true, shipIn: 1 }))).not.toBeNull();
    const full = rec({ costReviewed: true, shipIn: 0, shipOut: 0, parts: 0, labor: 0, other: 0, refund: 0, extra: 0 });
    expect(costReviewError(full)).toBeNull();
  });
});

describe('lọc hồ sơ', () => {
  const rows = [
    rec({ id: 'A', customer: 'Nguyễn Văn A', channel: 'SHOPEE', status: 'Hoàn tất', received: '2026-10-01' }),
    rec({ id: 'B', customer: 'Trần Thị B', channel: 'TIKTOK', status: 'Chờ nhận hàng', received: '2026-09-15' })
  ];

  it('lọc theo từ khóa tiếng Việt không phân biệt hoa thường', () => {
    expect(filterRecords(rows, { ...emptyFilters, query: 'nguyễn' })).toHaveLength(1);
  });

  it('lọc theo kênh và trạng thái', () => {
    expect(filterRecords(rows, { ...emptyFilters, channel: 'TIKTOK' })[0].id).toBe('B');
    expect(filterRecords(rows, { ...emptyFilters, status: 'Hoàn tất' })[0].id).toBe('A');
  });

  const custom = { ...emptyFilters, datePreset: 'custom' };

  it('lọc theo khoảng ngày tùy chọn, gồm cả hai đầu mút', () => {
    expect(filterRecords(rows, { ...custom, dateFrom: '2026-09-15', dateTo: '2026-09-15' }).map((r) => r.id)).toEqual(['B']);
    expect(filterRecords(rows, { ...custom, dateFrom: '2026-09-01', dateTo: '2026-10-01' })).toHaveLength(2);
    expect(filterRecords(rows, { ...custom, dateFrom: '2026-09-16' }).map((r) => r.id)).toEqual(['A']);
    expect(filterRecords(rows, { ...custom, dateTo: '2026-09-30' }).map((r) => r.id)).toEqual(['B']);
    expect(filterRecords(rows, custom)).toHaveLength(2);
  });

  it('lọc nhanh theo tháng này / tháng trước', () => {
    const [y, m] = today().split('-').map(Number); // cùng múi giờ Việt Nam với bộ lọc
    const ym = (offset: number) => new Date(Date.UTC(y, m - 1 + offset, 15)).toISOString().slice(0, 10);
    const data = [rec({ id: 'now', received: ym(0) }), rec({ id: 'prev', received: ym(-1) }), rec({ id: 'old', received: ym(-5) })];
    expect(filterRecords(data, { ...emptyFilters, datePreset: 'this-month' }).map((r) => r.id)).toEqual(['now']);
    expect(filterRecords(data, { ...emptyFilters, datePreset: 'last-month' }).map((r) => r.id)).toEqual(['prev']);
  });
});

describe('maskPhone', () => {
  it('che phần giữa của số điện thoại', () => {
    expect(maskPhone('0982123456')).toBe('0982 ••• 456');
    expect(maskPhone('0982 123 456')).toBe('0982 ••• 456');
    expect(maskPhone('12345')).toBe('12345');
    expect(maskPhone('')).toBe('');
  });
});

describe('CSV', () => {
  it('chặn công thức Excel ở đầu ô', () => {
    expect(toCsv([rec({ customer: '=HYPERLINK("x")' })])).toContain(`"'=HYPERLINK(""x"")"`);
  });
});

describe('sao lưu JSON', () => {
  it('chấp nhận tệp hợp lệ', () => {
    const text = JSON.stringify({ version: 1, records: [rec()] });
    expect(parseBackup(text)).toHaveLength(1);
  });

  it('từ chối sai phiên bản, trùng mã hoặc số tiền âm', () => {
    const r = rec();
    expect(() => parseBackup(JSON.stringify({ version: 2, records: [] }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ version: 1, records: [r, r] }))).toThrow();
    expect(() => parseBackup(JSON.stringify({ version: 1, records: [{ ...r, extra: -1 }] }))).toThrow();
  });
});
