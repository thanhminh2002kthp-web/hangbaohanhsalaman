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
- **Quên mật khẩu**: ở màn hình đăng nhập bấm "Quên mật khẩu?", nhập email. Supabase gửi email có **liên kết đặt lại mật khẩu**; bấm liên kết, web mở màn hình **Đặt mật khẩu mới** (nhập 2 lần, đủ điều kiện) rồi vào app.
  - Người dùng bấm liên kết là bị buộc đặt mật khẩu mới trước khi vào được app (kể cả khi tải lại trang).
  - Liên kết dùng một lần và hết hạn sau 1 giờ (mặc định của Supabase). Liên kết hết hạn thì màn hình đăng nhập báo rõ để yêu cầu lại.
  - Hệ thống luôn báo "nếu email có tài khoản thì đã gửi", không tiết lộ email nào tồn tại.
  - Đặt xong, các thiết bị khác bị đăng xuất.

**Thiết lập gửi thư bằng Gmail (một lần, trong Supabase, không cần sửa code):**
1. **Gmail:** bật *Xác minh 2 bước* cho tài khoản Gmail dùng để gửi thư, rồi tạo **Mật khẩu ứng dụng** tại https://myaccount.google.com/apppasswords (đặt tên "Salaman", Google cho 16 ký tự). Dùng chính mật khẩu ứng dụng này, không dùng mật khẩu Gmail.
2. **Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP**:
   - Sender email: địa chỉ Gmail đó (người nhận sẽ thấy đúng địa chỉ này)
   - Sender name: `Salaman`
   - Host: `smtp.gmail.com`, Port: `465`
   - Username: địa chỉ Gmail đó; Password: mật khẩu ứng dụng 16 ký tự
3. **Supabase → Authentication → URL Configuration:** *Site URL* = địa chỉ Vercel của web; *Redirect URLs* thêm địa chỉ Vercel đó và `http://localhost:5173` (để thử trên máy).
4. **Supabase → Authentication → Emails → Templates → Reset Password:** đổi tiêu đề và nội dung sang tiếng Việt (mẫu bên dưới), giữ nguyên `{{ .ConfirmationURL }}`.
5. (Tùy chọn) **Authentication → Rate Limits:** chỉnh số thư gửi mỗi giờ cho phù hợp.

Mẫu thư (Subject: `Đặt lại mật khẩu Salaman`):

```html
<h2>Đặt lại mật khẩu</h2>
<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Salaman của bạn.</p>
<p><a href="{{ .ConfirmationURL }}">Bấm vào đây để đặt mật khẩu mới</a></p>
<p>Liên kết dùng một lần và sẽ hết hạn sau ít phút. Nếu bạn không yêu cầu, hãy bỏ qua thư này; mật khẩu hiện tại vẫn dùng bình thường.</p>
```

Gmail cho gửi khoảng 500 thư/ngày, dư dùng cho hệ thống nội bộ. Nếu chưa cấu hình SMTP, Supabase chỉ gửi được rất ít thư và chỉ tới thành viên nhóm của dự án; khi đó dùng cách nhờ admin bấm "Đặt mật khẩu".

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
