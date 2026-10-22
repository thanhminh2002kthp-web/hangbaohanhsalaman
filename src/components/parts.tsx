import type { ReactNode } from 'react';
import { channelClass } from '../domain/records';
import type { Priority, Status } from '../types';

export function ChannelBadge({ value }: { value: string }) {
  return <span className={'channel-chip ' + channelClass(value)}>{value || 'Khác'}</span>;
}

export function StatusBadge({ status }: { status: Status }) {
  const tone = status === 'Chờ nhận hàng' || status === 'Chờ kiểm tra' ? 'wait' : status === 'Đã gửi hàng' ? 'blue' : '';
  return <span className={'badge ' + tone}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone = priority === 'Gấp' ? 'urgent' : priority === 'Hoãn lại' ? 'deferred' : 'normal';
  return <span className={'badge priority-' + tone}>{priority || 'Bình thường'}</span>;
}

export function Stat(props: { label: string; value: ReactNode; sub: string; feature?: boolean }) {
  return (
    <div className={'stat ' + (props.feature ? 'feature' : '')}>
      <small>{props.label}</small>
      <strong>{props.value}</strong>
      <em>{props.sub}</em>
    </div>
  );
}

export function TitleBar(props: {
  title: string;
  subtitle: string;
  canCreate: boolean;
  onExport(): void;
  onCreate(): void;
}) {
  return (
    <div className="titlebar">
      <div>
        <div className="eyebrow">SALAMAN SERVICE CENTER</div>
        <h1>{props.title}</h1>
        <p>{props.subtitle}</p>
      </div>
      <div className="actions">
        <button className="btn" onClick={props.onExport}>
          ↓ Xuất CSV
        </button>
        {props.canCreate && (
          <button className="primary" onClick={props.onCreate}>
            ＋ Tiếp nhận mới
          </button>
        )}
      </div>
    </div>
  );
}
