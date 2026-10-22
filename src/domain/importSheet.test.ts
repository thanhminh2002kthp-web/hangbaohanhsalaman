import { describe, expect, it } from 'vitest';
import { inferStatus, parseCsv, parseDate, rowsToRecords } from './importSheet';

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
