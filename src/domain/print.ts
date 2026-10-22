import type { WarrantyRecord } from '../types';
import { money, net } from './records';

const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** Mở cửa sổ in phiếu bảo hành. Trả về false nếu trình duyệt chặn cửa sổ. */
export function printRecord(r: WarrantyRecord): boolean {
  const w = window.open('', '_blank');
  if (!w) return false;
  const rows: [string, string][] = [
    ['Khách hàng', r.customer],
    ['Điện thoại', r.phone],
    ['Mã đơn', r.order],
    ['Ngày nhận', r.received],
    ['Sản phẩm', r.product],
    ['Lý do', r.reason],
    ['Kết quả test', r.test],
    ['Mẫu đổi', r.replacement],
    ['Mã vận đơn thu hồi hàng lỗi', r.inbound],
    ['Mã vận đơn gửi hàng mới', r.outbound],
    ['Trạng thái', r.status],
    ['Mức độ cần xử lý', r.priority],
    ['Chi phí đã đối soát', r.costReviewed ? money(net(r)) : 'Chưa đối soát'],
    ['Ghi chú', r.note]
  ];
  w.document.write(
    '<meta charset="utf-8"><title>Phiếu bảo hành</title><style>body{font-family:Arial,Helvetica,sans-serif}</style>' +
      `<h1>SALAMAN · Phiếu bảo hành ${esc(r.id)}</h1>` +
      rows.map(([l, v]) => `<p><b>${l}: </b>${esc(v)}</p>`).join('')
  );
  w.document.close();
  w.print();
  return true;
}
