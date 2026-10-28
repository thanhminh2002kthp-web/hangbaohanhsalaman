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

## Quên mật khẩu và đổi mật khẩu

- **Đổi mật khẩu** (đang đăng nhập): bấm "Đổi mật khẩu" ở góc trên. Cần nhập mật khẩu hiện tại; đổi xong các thiết bị khác bị đăng xuất.
- **Quên mật khẩu**: ở màn hình đăng nhập bấm "Quên mật khẩu?", nhập email. Hệ thống gửi email chứa **mật khẩu mới** và **liên kết kích hoạt**.
  - Mật khẩu mới chỉ có hiệu lực **sau khi bấm liên kết** (một lần, hết hạn sau 30 phút). Trước đó mật khẩu cũ vẫn dùng được, nên người khác bấm "quên mật khẩu" hộ cũng không khóa được bạn.
  - Sau khi kích hoạt, đăng nhập bằng mật khẩu trong thư; app **bắt buộc đặt mật khẩu riêng** trước khi vào.
  - Mỗi email tối đa 3 yêu cầu/giờ. Hệ thống luôn trả lời giống nhau dù email có tồn tại hay không.
  - Mật khẩu tạm được mã hóa trong cơ sở dữ liệu bằng chính mã trong liên kết, mã chỉ lưu dạng băm.

**Thiết lập (một lần):**
1. Chạy lại phần mới trong `supabase/schema.sql` (mục 6, bảng `password_resets`) trong SQL Editor.
2. Tạo tài khoản gửi thư tại https://resend.com, **xác minh tên miền** của bạn (Domains → Add Domain, thêm các bản ghi DNS), tạo API key.
3. Supabase → Edge Functions → **Secrets**, thêm 3 secret:
   - `RESEND_API_KEY`: khóa API của Resend
   - `MAIL_FROM`: ví dụ `Salaman <no-reply@tenmiencuaban.com>` (phải thuộc tên miền đã xác minh)
   - `SITE_URL`: địa chỉ web, ví dụ `https://ten-du-an.vercel.app` (không có dấu `/` ở cuối)
4. Deploy Edge Function mới: Edge Functions → *Deploy a new function* → tên **`password-reset`** → dán `supabase/functions/password-reset/index.ts` → **tắt công tắc "Verify JWT"** (bắt buộc, vì người quên mật khẩu chưa đăng nhập) → Deploy. Với CLI: `supabase functions deploy password-reset --no-verify-jwt`.

Nếu chưa cấu hình gửi thư, nút "Gửi mật khẩu mới" sẽ báo "Hệ thống chưa cấu hình gửi thư"; khi đó vẫn dùng được cách nhờ admin bấm "Đặt mật khẩu".

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
