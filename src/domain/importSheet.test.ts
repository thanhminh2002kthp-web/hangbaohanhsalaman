import { describe, expect, it } from 'vitest';
import { inferStatus, parseCsv, parseDate, planImport, rowsToRecords } from './importSheet';

// Dữ liệu giả lập, cùng cấu trúc cột với bảng tổng hợp thật.
const CSV = [
  'BẢNG TỔNG HỢP ĐƠN BẢO HÀNH - ĐỔI TRẢ,,,,,,,,,,,,,,,',
  'NGÀY,SÀN ,MÃ ĐƠN HÀNG,MÃ VẬN ĐƠN THU HỒI HÀNG,KẾT QUẢ TEST SẢN PHẨM CỦA KHO,MÃ VẬN ĐƠN GIAO KHÁCH,NGÀY GIAO,TÊN KHÁCH HÀNG ,SĐT ,ĐỊA CHỈ ,MẪU BAN ĐẦU ,LÝ DO BH- ĐỔI TRẢ,MẪU ĐỔI  ,PHÍ SHIP,TỔNG TIỀN THU THÊM,GHI CHÚ ',
  '23/04,tiktok,1001,SPX111,,SPX222,27/04,Khách A,0900000001,"Số 1, Phố X, Hà Nội",Sản phẩm A,Không lên nguồn,,FALSE,,',
  '24/04,SHOPEE,1002,SPX333,,KHO CHƯA NHẬN HÀNG,,Khách B,900000002,Địa chỉ B,"Combo A\nVariation: đen",Lỗi dây,,TRUE,"30.000",ghi chú',
  ',,,,,,,,,,,,,,,',
  'xx/yy,SHOPEE,1003,,,,,Khách C,0900000003,,Sản phẩm C,,,FALSE,,',
  '24/04,TIKTOK,1001,SPX111,,SPX222,27/04,Khách A,0900000001,"Số 1, Phố X, Hà Nội",Sản phẩm A,Không lên nguồn,,FALSE,,'
].join('\r\n');

describe('parseCsv', () => {
  it('giữ dấu phẩy và xuống dòng trong ô có ngoặc kép', () => {
    const rows = parseCsv(CSV);
    expect(rows[2][9]).toBe('Số 1, Phố X, Hà Nội');
    expect(rows[3][10]).toBe('Combo A\nVariation: đen');
  });
});

describe('parseDate', () => {
  it('đọc dd/mm với năm được chọn, dd/mm/yyyy và số serial Excel', () => {
    expect(parseDate('05/05', 2026)).toBe('2026-05-05');
    expect(parseDate('5/5/2025', 2026)).toBe('2025-05-05');
    expect(parseDate(46143, 2026)).toBe('2026-05-01');
    expect(parseDate('31/02', 2026)).toBeNull();
    expect(parseDate('', 2026)).toBeNull();
  });
});

describe('inferStatus', () => {
  it('suy trạng thái từ cột vận đơn giao', () => {
    expect(inferStatus('KHO CHƯA NHẬN HÀNG', '')).toBe('Chờ nhận hàng');
    expect(inferStatus('TRẢ HÀNG HOÀN TIỀN', '')).toBe('Hoàn tiền');
    expect(inferStatus('KHÔNG ĐỦ ĐIỀU KIỆN BẢO HÀNH', '')).toBe('Từ chối bảo hành');
    expect(inferStatus('SPX123', '')).toBe('Đã gửi hàng');
    expect(inferStatus('', 'đang test')).toBe('Đang xử lý');
    expect(inferStatus('', '')).toBe('Chờ kiểm tra');
  });
});

describe('planImport (cập nhật theo file)', () => {
  const incoming = () => rowsToRecords(parseCsv(CSV), { year: 2026 }).records;
  const stored = () => incoming().map((r) => ({ ...r, version: 1 }));

  it('không có gì khác thì không cập nhật', () => {
    const plan = planImport(incoming(), stored());
    expect(plan.fresh).toHaveLength(0);
    expect(plan.updates).toHaveLength(0);
    expect(plan.unchanged).toBe(3);
  });

  it('hồ sơ mới trong file được thêm', () => {
    const plan = planImport(incoming(), stored().slice(0, 2));
    expect(plan.fresh).toHaveLength(1);
  });

  it('cập nhật trạng thái và vận đơn khi file thay đổi (file là chuẩn)', () => {
    const inc = incoming();
    const cur = stored();
    cur[1] = { ...cur[1], outbound: 'KHO CHƯA NHẬN HÀNG', status: 'Chờ nhận hàng' };
    inc[1] = { ...inc[1], outbound: 'SPX999', status: 'Đã gửi hàng' };
    const plan = planImport(inc, cur);
    expect(plan.updates).toHaveLength(1);
    expect(plan.updates[0].next).toMatchObject({ outbound: 'SPX999', status: 'Đã gửi hàng', version: 1 });
    expect(plan.updates[0].changes.map((c) => c.key)).toEqual(['status', 'outbound']);
  });

  it('không hạ trạng thái bạn đã chỉnh tay khi vận đơn/test không đổi', () => {
    const cur = stored();
    cur[0] = { ...cur[0], status: 'Hoàn tất' };
    const plan = planImport(incoming(), cur);
    expect(plan.updates).toHaveLength(0);
  });

  it('ô trống trong file không xóa dữ liệu đang có', () => {
    const cur = stored();
    cur[0] = { ...cur[0], note: 'đã gọi khách' };
    expect(planImport(incoming(), cur).updates).toHaveLength(0);
  });

  it('không đổi tiền thu thêm của hồ sơ đã đối soát', () => {
    const inc = incoming();
    const cur = stored();
    inc[1] = { ...inc[1], extra: 50000 };
    cur[1] = { ...cur[1], extra: 30000, costReviewed: true };
    expect(planImport(inc, cur).updates).toHaveLength(0);
  });

  it('ghép được hồ sơ có mã khác qua khóa nhận diện khi chỉ có một ứng viên', () => {
    const cur = stored().map((r, i) => ({ ...r, id: 'BH-MANUAL' + i }));
    const plan = planImport(incoming(), cur);
    expect(plan.fresh).toHaveLength(0);
  });
});

describe('rowsToRecords', () => {
  const result = rowsToRecords(parseCsv(CSV), { year: 2026 });

  it('nhận ra dòng tiêu đề dù có dòng tên bảng phía trên', () => {
    expect(result.headerLine).toBe(2);
  });

  it('chuyển đúng các trường', () => {
    const [a, b] = result.records;
    expect(a).toMatchObject({ received: '2026-04-23', channel: 'TIKTOK', order: '1001', sent: '2026-04-27', status: 'Đã gửi hàng', shipFlag: false, extra: null });
    expect(b).toMatchObject({ phone: '0900000002', status: 'Chờ nhận hàng', shipFlag: true, extra: 30000, note: 'ghi chú' });
  });

  it('bỏ dòng trống, báo dòng lỗi ngày', () => {
    expect(result.records).toHaveLength(3);
    expect(result.skipped).toEqual([{ line: 6, reason: 'Thiếu hoặc không đọc được ngày nhận' }]);
  });

  it('mã hồ sơ ổn định và không trùng', () => {
    const again = rowsToRecords(parseCsv(CSV), { year: 2026 });
    expect(again.records.map((r) => r.id)).toEqual(result.records.map((r) => r.id));
    expect(new Set(result.records.map((r) => r.id)).size).toBe(3);
  });

  it('báo không nhận ra bảng khi thiếu tiêu đề', () => {
    expect(rowsToRecords([['a', 'b'], ['1', '2']], { year: 2026 }).headerLine).toBe(0);
  });
});
