import { describe, expect, it } from 'vitest';
import { costReviewError, emptyFilters, emptyRecord, fee, filterRecords, net, parseBackup, toCsv } from './records';

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

  it('lọc theo kênh, trạng thái và tháng', () => {
    expect(filterRecords(rows, { ...emptyFilters, channel: 'TIKTOK' })[0].id).toBe('B');
    expect(filterRecords(rows, { ...emptyFilters, status: 'Hoàn tất' })[0].id).toBe('A');
    expect(filterRecords(rows, { ...emptyFilters, month: '2026-09' })[0].id).toBe('B');
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
