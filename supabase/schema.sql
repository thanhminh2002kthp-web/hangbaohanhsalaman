-- =====================================================================
-- SALAMAN · Trung tâm bảo hành — lược đồ Supabase (Postgres)
-- Chạy toàn bộ file này trong Supabase → SQL Editor. Có thể chạy lại an toàn.
-- BƯỚC BẮT BUỘC: sửa email quản trị đầu tiên ở mục 6 trước khi chạy.
-- =====================================================================

-- 1. Thành viên và quyền -------------------------------------------------
create table if not exists public.members (
  email      text primary key check (email = lower(email)),
  role       text not null check (role in ('admin', 'editor', 'viewer')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Trả về quyền của người đang đăng nhập (null nếu chưa được cấp quyền / bị khóa).
create or replace function public.app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.members
  where email = lower(coalesce(auth.jwt() ->> 'email', '')) and active
$$;

-- 2. Hồ sơ bảo hành -------------------------------------------------------
create table if not exists public.warranty_records (
  id             text primary key,
  version        integer not null default 1,
  received_date  date not null,
  channel        text not null default 'KHÁC',
  order_code     text not null,
  customer       text not null,
  phone          text not null default '',
  address        text not null default '',
  product        text not null default '',
  reason         text not null default '',
  test_result    text not null default '',
  replacement    text not null default '',
  inbound_code   text not null default '',
  outbound_code  text not null default '',
  sent_date      date,
  due_date       date,
  priority       text not null default 'Bình thường' check (priority in ('Gấp', 'Bình thường', 'Hoãn lại')),
  status         text not null default 'Chờ nhận hàng' check (status in
                   ('Chờ nhận hàng','Chờ kiểm tra','Đang xử lý','Đã gửi hàng','Hoàn tất','Hoàn tiền','Từ chối bảo hành')),
  ship_flag      boolean not null default false,
  ship_in        bigint check (ship_in  is null or ship_in  >= 0),
  ship_out       bigint check (ship_out is null or ship_out >= 0),
  parts          bigint check (parts    is null or parts    >= 0),
  labor          bigint check (labor    is null or labor    >= 0),
  other          bigint check (other    is null or other    >= 0),
  refund         bigint check (refund   is null or refund   >= 0),
  extra          bigint check (extra    is null or extra    >= 0),
  cost_reviewed  boolean not null default false,
  note           text not null default '',
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  created_by     text not null default '',
  updated_at     timestamptz not null default now(),
  updated_by     text not null default '',
  -- Đã đối soát thì phải nhập đủ các ô tiền (khoản không phát sinh nhập 0).
  constraint reviewed_needs_all_costs check (
    not cost_reviewed or (
      ship_in is not null and ship_out is not null and parts is not null and
      labor is not null and other is not null and refund is not null and extra is not null)
  )
);

create index if not exists warranty_records_received_idx on public.warranty_records (received_date desc);
create index if not exists warranty_records_order_idx    on public.warranty_records (order_code);

-- 3. Lịch sử cập nhật (chỉ thêm, không sửa/xóa) ---------------------------
create table if not exists public.record_history (
  id        bigserial primary key,
  record_id text not null references public.warranty_records (id),
  version   integer not null,
  at        timestamptz not null default now(),
  actor     text not null default '',
  status    text not null,
  snapshot  jsonb not null
);
create index if not exists record_history_record_idx on public.record_history (record_id, at desc);

-- 4. Trigger: tự tăng version, ghi người sửa, ghi lịch sử -----------------
create or replace function public.records_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare actor text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  new.updated_at := now();
  new.updated_by := actor;
  if tg_op = 'INSERT' then
    new.version    := 1;
    new.created_at := now();
    new.created_by := actor;
    new.deleted_at := null;
  else
    new.id         := old.id;
    new.created_at := old.created_at;
    new.created_by := old.created_by;
    new.version    := old.version + 1;
  end if;
  return new;
end $$;

create or replace function public.records_after_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.record_history (record_id, version, actor, status, snapshot)
  values (new.id, new.version, new.updated_by, new.status, to_jsonb(new));
  return new;
end $$;

drop trigger if exists trg_records_before on public.warranty_records;
create trigger trg_records_before before insert or update on public.warranty_records
  for each row execute function public.records_before_write();

drop trigger if exists trg_records_after on public.warranty_records;
create trigger trg_records_after after insert or update on public.warranty_records
  for each row execute function public.records_after_write();

-- 5. Row Level Security ---------------------------------------------------
alter table public.members          enable row level security;
alter table public.warranty_records enable row level security;
alter table public.record_history   enable row level security;

revoke all on public.members, public.warranty_records, public.record_history from anon;
revoke delete on public.members, public.warranty_records, public.record_history from authenticated;
revoke update, insert on public.record_history from authenticated;

-- members: mỗi người đọc được dòng của mình; admin đọc/ghi tất cả.
drop policy if exists members_select on public.members;
create policy members_select on public.members for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')) or public.app_role() = 'admin');

drop policy if exists members_insert on public.members;
create policy members_insert on public.members for insert to authenticated
  with check (public.app_role() = 'admin');

drop policy if exists members_update on public.members;
create policy members_update on public.members for update to authenticated
  using (public.app_role() = 'admin') with check (public.app_role() = 'admin');

-- warranty_records: mọi thành viên đang hoạt động được xem; admin/editor được thêm và sửa.
drop policy if exists records_select on public.warranty_records;
create policy records_select on public.warranty_records for select to authenticated
  using (public.app_role() is not null);

drop policy if exists records_insert on public.warranty_records;
create policy records_insert on public.warranty_records for insert to authenticated
  with check (public.app_role() in ('admin', 'editor'));

drop policy if exists records_update on public.warranty_records;
create policy records_update on public.warranty_records for update to authenticated
  using (public.app_role() in ('admin', 'editor'))
  with check (public.app_role() in ('admin', 'editor'));

-- record_history: chỉ đọc; ghi qua trigger.
drop policy if exists history_select on public.record_history;
create policy history_select on public.record_history for select to authenticated
  using (public.app_role() is not null);

-- 6. Quản trị viên đầu tiên ----------------------------------------------
-- >>> ĐỔI EMAIL DƯỚI ĐÂY thành Gmail của bạn (viết thường) trước khi chạy <<<
insert into public.members (email, role, active)
values ('doi-email-cua-ban@gmail.com', 'admin', true)
on conflict (email) do nothing;
