# Salaman · Trung tâm bảo hành

Ứng dụng quản lý hồ sơ bảo hành / đổi trả: React + Vite + TypeScript, dữ liệu và đăng nhập trên Supabase (Postgres + Auth + RLS).

## Cấu trúc

```
src/
  api/        gọi Supabase (records, members)
  auth/       đăng nhập, phân quyền, màn hình đăng nhập
  domain/     logic nghiệp vụ thuần (chi phí ròng, lọc, CSV, sao lưu) + test
  components/ thành phần dùng chung (bảng, form hồ sơ, toast)
  views/      từng màn hình
  workspace/  khung ứng dụng sau đăng nhập
supabase/schema.sql   bảng, trigger, chính sách RLS
```

## Thiết lập Supabase

1. Tạo project tại https://supabase.com (nên dùng gói Pro cho dữ liệu thật để có sao lưu tự động).
2. Mở `supabase/schema.sql`, **đổi email quản trị ở cuối file** thành Gmail của bạn (viết thường), rồi dán toàn bộ vào **SQL Editor → Run**.
3. **Authentication → Providers → Email**: bật đăng nhập bằng email + mật khẩu. Nếu muốn nhân viên tự tạo tài khoản thì giữ bật "Allow new users to sign up" (họ vẫn không xem được dữ liệu nếu email chưa được thêm ở trang *Quản lý tài khoản*).
4. **Project Settings → API**: lấy `Project URL` và khóa `anon` / `publishable`.
5. Sao chép `.env.example` thành `.env` và điền hai giá trị. **Không dùng khóa `service_role` trong web.**

## Chạy

```bash
npm install
npm run dev      # chạy thử
npm test         # kiểm thử logic nghiệp vụ
npm run build    # build bản chạy thật vào dist/
```

Lần đầu: mở web, chọn **Tạo tài khoản** với đúng email quản trị đã ghi trong SQL, xác nhận email (nếu bật), rồi đăng nhập. Vào **Quản lý tài khoản** để thêm nhân viên.

## Triển khai Vercel

Import repo, framework **Vite**, thêm hai biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.

## Phân quyền

| Quyền   | Xem | Thêm/sửa hồ sơ | Quản lý tài khoản |
|---------|:---:|:--------------:|:-----------------:|
| admin   | ✔   | ✔              | ✔                 |
| editor  | ✔   | ✔              |                   |
| viewer  | ✔   |                |                   |

Quyền được ép ở cơ sở dữ liệu (RLS), không chỉ ở giao diện. Hồ sơ không thể bị xóa từ web; mọi lần sửa được ghi vào bảng `record_history`.
