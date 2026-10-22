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
3. **Authentication → Sign In / Providers**: bật Email, và **TẮT "Allow new users to sign up"** (hệ thống nội bộ, không ai tự đăng ký được). Tắt luôn "Confirm email" cho gọn.
4. **Tạo admin đầu tiên**: Authentication → Users → Add user → *Create new user* với đúng email đã ghi trong SQL, đặt mật khẩu, tick *Auto Confirm User*.
5. **Deploy Edge Function** để admin tạo tài khoản ngay trong app: Edge Functions → *Deploy a new function* → đặt tên `admin-users` → dán nội dung `supabase/functions/admin-users/index.ts` → Deploy. (Hoặc dùng CLI: `supabase functions deploy admin-users`.) Function tự có khóa `service_role` ở phía máy chủ; web không bao giờ giữ khóa này.
6. **Project Settings → API**: lấy `Project URL` và khóa `anon` / `publishable`.
7. Sao chép `.env.example` thành `.env` và điền hai giá trị. **Không dùng khóa `service_role` trong web.**

## Chạy

```bash
npm install
npm run dev      # chạy thử
npm test         # kiểm thử logic nghiệp vụ
npm run build    # build bản chạy thật vào dist/
```

Lần đầu: đăng nhập bằng tài khoản admin ở bước 4. Vào **Quản lý tài khoản** để tạo tài khoản nhân viên, đổi quyền, khóa hoặc đặt lại mật khẩu.

## Triển khai Vercel

Import repo, framework **Vite**, thêm hai biến môi trường `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`.

## CI/CD

- **Bật workflow:** hai file mẫu nằm ở `ci-templates/`. GitHub không cho token thường tạo file trong `.github/workflows/`, nên hãy tạo chúng bằng giao diện web GitHub (Add file → Create new file → đường dẫn `.github/workflows/ci.yml`, dán nội dung) hoặc push bằng token có quyền `workflow`.
- **CI** (`ci-templates/ci.yml`): mỗi lần push lên `main` hoặc mở Pull Request, GitHub tự chạy `npm ci`, `npm test`, `npm run build` (gồm kiểm tra kiểu TypeScript) và quét lỗ hổng. Không cần secret.
- **CD web**: Vercel tự deploy mỗi khi có commit mới lên `main` (và tạo bản xem thử cho mỗi Pull Request). Để chỉ deploy khi CI xanh: bật **Branch protection** cho `main` (Settings → Branches → Require status checks → chọn *Test & Build*) và làm việc qua Pull Request.
- **CD Edge Function** (`ci-templates/deploy-edge-function.yml`): khi file trong `supabase/functions/` đổi, tự deploy `admin-users`. Cần 2 secret ở GitHub → Settings → Secrets and variables → Actions:
  - `SUPABASE_ACCESS_TOKEN`: tạo ở supabase.com/dashboard/account/tokens
  - `SUPABASE_PROJECT_REF`: chuỗi trong URL project (`https://<ref>.supabase.co`)
  Chưa khai báo thì workflow tự bỏ qua.
- Thay đổi cấu trúc bảng (`schema.sql`) **không** tự chạy; hãy chạy tay trong SQL Editor để tránh làm hỏng dữ liệu thật.

## Phân quyền

| Quyền   | Xem | Thêm/sửa hồ sơ | Quản lý tài khoản |
|---------|:---:|:--------------:|:-----------------:|
| admin   | ✔   | ✔              | ✔                 |
| editor  | ✔   | ✔              |                   |
| viewer  | ✔   |                |                   |

Quyền được ép ở cơ sở dữ liệu (RLS), không chỉ ở giao diện. Hồ sơ không thể bị xóa từ web; mọi lần sửa được ghi vào bảng `record_history`.
