import { useEffect, useRef, useState, type FormEvent } from 'react';
import { loadHistory } from '../api/records';
import { PRODUCT_CATALOG } from '../domain/productCatalog';
import { channelClass, CHANNELS, costReviewError, money, MONEY_KEYS, PRIORITIES, STATUSES } from '../domain/records';
import { printRecord } from '../domain/print';
import type { HistoryEntry, MoneyKey, Priority, Status, WarrantyRecord } from '../types';
import { useToast } from './Toast';

interface Props {
  record: WarrantyRecord;
  existing: boolean;
  readOnly: boolean;
  /** Các hồ sơ hiện có, dùng để cảnh báo trùng mã đơn. */
  others: WarrantyRecord[];
  onSave(r: WarrantyRecord): Promise<void>;
  onClose(): void;
}

type Draft = Omit<WarrantyRecord, MoneyKey> & Record<MoneyKey, string>;

const MONEY_LABELS: [string, MoneyKey][] = [
  ['Người gửi trả phí', 'shipIn'],
  ['Người nhận trả phí', 'shipOut'],
  ['Giá vốn hàng đổi / linh kiện', 'parts'],
  ['Công xử lý', 'labor'],
  ['Chi khác', 'other'],
  ['Tiền hoàn khách', 'refund'],
  ['Tổng tiền thu thêm', 'extra']
];

function toDraft(r: WarrantyRecord): Draft {
  const d = { ...r } as unknown as Draft;
  for (const k of MONEY_KEYS) d[k] = r[k] === null ? '' : String(r[k]);
  return d;
}

function fromDraft(d: Draft): WarrantyRecord {
  const r = { ...d } as unknown as WarrantyRecord;
  for (const k of MONEY_KEYS) r[k] = d[k] === '' ? null : Number(d[k]);
  return r;
}

interface ProductPickerProps {
  label: string;
  value: string;
  listId: string;
  onChange(value: string): void;
}

function ProductPicker({ label, value, listId, onChange }: ProductPickerProps) {
  const product = PRODUCT_CATALOG.find((item) => item.variants.some((variant) => variant.value === value));
  const variant = product?.variants.find((item) => item.value === value);
  const hasColors = product?.variants.some((item) => item.color) ?? false;

  return (
    <>
      <label>
        {label}
        <input
          type="text"
          list={listId}
          value={product?.name ?? value}
          placeholder="Gõ để tìm hoặc chọn sản phẩm"
          onChange={(e) => {
            const next = e.target.value;
            const selected = PRODUCT_CATALOG.find((item) => item.name === next);
            onChange(selected ? selected.variants[0].value : next);
          }}
        />
        <datalist id={listId}>
          {PRODUCT_CATALOG.map((item) => (
            <option key={item.name} value={item.name} />
          ))}
        </datalist>
      </label>
      <label>
        Màu sắc
        <select
          value={variant?.color ?? ''}
          disabled={!product || !hasColors}
          onChange={(e) => {
            const next = product?.variants.find((item) => item.color === e.target.value);
            if (next) onChange(next.value);
          }}
        >
          {hasColors ? (
            product?.variants.filter((item) => item.color).map((item) => (
              <option key={item.color} value={item.color}>{item.color}</option>
            ))
          ) : (
            <option value="">Không áp dụng</option>
          )}
        </select>
      </label>
    </>
  );
}

export function RecordEditor({ record, existing, readOnly, others, onSave, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const toast = useToast();
  const [d, setD] = useState<Draft>(() => toDraft(record));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    if (existing) loadHistory(record.id).then(setHistory).catch(() => setHistory([]));
  }, [existing, record.id]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((prev) => ({ ...prev, [k]: v }));
  const text = (label: string, k: keyof Draft, type = 'text') => (
    <label>
      {label}
      <input
        type={type}
        value={String(d[k] ?? '')}
        min={type === 'number' ? 0 : undefined}
        step={type === 'number' ? 1 : undefined}
        required={k === 'order' || k === 'customer' || k === 'received'}
        onChange={(e) => set(k, e.target.value as never)}
      />
    </label>
  );
  const area = (label: string, k: keyof Draft, wide = false) => (
    <label className={wide ? 'wide' : undefined}>
      {label}
      <textarea value={String(d[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} />
    </label>
  );

  const total = MONEY_KEYS.filter((k) => k !== 'extra').reduce((s, k) => s + (Number(d[k]) || 0), 0) - (Number(d.extra) || 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next = fromDraft(d);
    const problem = costReviewError(next);
    if (problem) return toast(problem);
    if (
      others.some((x) => x.id !== next.id && x.order === next.order) &&
      !confirm('Mã đơn đã có hồ sơ khác. Vẫn lưu lần bảo hành này?')
    ) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave(next);
    } catch (err) {
      const e2 = err as Error & { status?: number };
      setError(
        e2.message +
          (e2.status === 409 ? ' Hãy giữ lại nội dung cần sửa, đóng phiếu và mở lại bản mới. Hệ thống chưa ghi đè dữ liệu.' : '')
      );
      toast(e2.message);
      setBusy(false);
    }
  }

  const channels = [...new Set([...CHANNELS, d.channel])];

  return (
    <dialog ref={dialog} onClose={onClose} onCancel={onClose}>
      <form onSubmit={submit}>
        <div className="split">
          <div>
            <div className="eyebrow">{readOnly ? 'XEM HỒ SƠ' : existing ? 'CẬP NHẬT HỒ SƠ' : 'TIẾP NHẬN BẢO HÀNH'}</div>
            <h1 style={{ fontSize: 23 }}>{d.id}</h1>
          </div>
          <button type="button" className="btn" onClick={() => dialog.current?.close()}>
            Đóng ×
          </button>
        </div>

        <fieldset disabled={readOnly || busy}>
          <div className="formsection">01 · Thông tin khách hàng & đơn hàng</div>
          <div className="formgrid">
            {text('Mã đơn hàng *', 'order')}
            {text('Ngày tiếp nhận *', 'received', 'date')}
            {text('Khách hàng *', 'customer')}
            {text('Số điện thoại', 'phone')}
            <label>
              Kênh bán
              <select
                className={'channel-select ' + channelClass(d.channel)}
                value={d.channel}
                onChange={(e) => set('channel', e.target.value)}
              >
                {channels.map((c) => (
                  <option key={c} className={channelClass(c)}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Trạng thái
              <select value={d.status} onChange={(e) => set('status', e.target.value as Status)}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            {area('Địa chỉ', 'address', true)}
          </div>

          <div className="formsection">02 · Sản phẩm & quá trình xử lý</div>
          <div className="formgrid">
            <ProductPicker label="Sản phẩm ban đầu" value={d.product} listId="original-products" onChange={(value) => set('product', value)} />
            {area('Lý do bảo hành / đổi trả', 'reason')}
            {area('Kết quả kiểm tra của kho', 'test')}
            <ProductPicker label="Sản phẩm / mẫu đổi" value={d.replacement} listId="replacement-products" onChange={(value) => set('replacement', value)} />
            {text('Mã vận đơn thu hồi hàng lỗi', 'inbound')}
            {text('Mã vận đơn gửi hàng mới', 'outbound')}
            {text('Ngày gửi hàng', 'sent', 'date')}
            {text('Hạn xử lý', 'due', 'date')}
            <label>
              Mức độ cần xử lý
              <select value={d.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="formsection">03 · Chi phí thực tế (VND)</div>
          <p style={{ fontSize: 11 }}>
            Để trống khoản chưa biết; nhập 0 khi đã xác nhận không phát sinh. Giá sản phẩm trong mô tả không tự động tính vào chi phí.
          </p>
          <div className="formgrid">
            {MONEY_LABELS.map(([label, k]) => (
              <div key={k}>{text(label, k, 'number')}</div>
            ))}
            <label style={{ justifyContent: 'center' }}>
              <span>
                <input type="checkbox" checked={d.shipFlag} onChange={(e) => set('shipFlag', e.target.checked)} /> Dấu tích phí ship từ bảng gốc
              </span>
            </label>
            <label className="wide">
              <span>
                <input type="checkbox" checked={d.costReviewed} onChange={(e) => set('costReviewed', e.target.checked)} /> Đã đối soát đầy đủ chi phí (cần nhập đủ các ô tiền)
              </span>
            </label>
            {area('Ghi chú', 'note', true)}
          </div>
        </fieldset>

        <div className="formfoot">
          <span className="moneytotal">Chi phí ròng tạm tính: {money(total)}</span>
          <div className="actions">
            {existing && (
              <button
                className="btn"
                type="button"
                onClick={() => printRecord(fromDraft(d)) || toast('Trình duyệt đã chặn cửa sổ in')}
              >
                In phiếu
              </button>
            )}
            {!readOnly && (
              <button className="primary" type="submit" disabled={busy}>
                {busy ? 'Đang lưu…' : 'Lưu hồ sơ'}
              </button>
            )}
          </div>
        </div>
        {error && <div className="notice" style={{ marginTop: 18 }}>{error}</div>}
        {history.length > 0 && (
          <p style={{ marginTop: 18, fontSize: 11 }}>
            Lịch sử cập nhật:
            {history.map((h, i) => (
              <span key={i}>
                <br />
                {new Date(h.at).toLocaleString('vi-VN')} · {h.actor || 'Nhập dữ liệu'} · {h.status}
              </span>
            ))}
          </p>
        )}
      </form>
    </dialog>
  );
}
