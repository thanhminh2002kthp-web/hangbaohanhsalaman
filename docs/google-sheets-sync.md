# Kết nối Google Sheets hai chiều

Đích cố định: https://docs.google.com/spreadsheets/d/168W-IbuIKa742qK7YnWcA-JlfzUD_dJ-b5bwPAqDIks/edit

## Kích hoạt một lần

1. Trong Google Cloud Console, tạo/chọn project, bật **Google Sheets API**.
2. Vào **IAM & Admin → Service Accounts**, tạo tài khoản dịch vụ. Không cần cấp vai trò quản trị project. Tạo khóa JSON ở mục **Keys**.
3. Mở Google Sheets đích, **Chia sẻ** cho địa chỉ `client_email` trong JSON quyền **Người chỉnh sửa**. Giữ bảng ở chế độ hạn chế, không công khai dữ liệu khách hàng.
4. Supabase → **Edge Functions → Secrets**: thêm `GOOGLE_SERVICE_ACCOUNT_JSON`, giá trị là toàn bộ nội dung JSON. Không thêm khóa này vào Vercel, mã frontend hoặc GitHub. Không gửi khóa qua chat.
5. Supabase → **SQL Editor**: chạy `supabase/google-sheets-sync.sql`. Không cần chạy lại schema chính hoặc thay email admin.
6. Từ máy có Supabase CLI và mã nguồn, triển khai:

   ```sh
   supabase functions deploy google-sheets-sync --project-ref YOUR_PROJECT_REF
   ```

   Thư mục function có **hai file**: `index.ts` và `model.ts`; phải triển khai cả thư mục. Giữ kiểm tra JWT bật. Lệnh CLI đọc `supabase/config.toml` trong repository.
7. Gộp thay đổi frontend để Vercel xây dựng bản mới. Đăng nhập bằng admin → **Dữ liệu & hướng dẫn → Kiểm tra kết nối → Đồng bộ ngay**.
8. Lần đầu tạo trang **Salaman Sync** và đưa hồ sơ từ website vào đó. Hai trang có sẵn không bị sửa.

## Cách sử dụng

- Đồng bộ theo yêu cầu bằng nút **Đồng bộ ngay**, chưa tự chạy nền. Sửa trên Sheets xong phải bấm nút này để website nhận thay đổi. Thành viên khác nhìn thấy sau khi tải mới.
- Chỉ sửa các cột nghiệp vụ trong Salaman Sync. Giữ nguyên mã hồ sơ, phiên bản, tiêu đề và `_sync_signature`. Không đổi tên trang hoặc thu nhỏ lưới; không chỉnh/sắp xếp bảng trong lúc đồng bộ.
- Ngày dùng chuỗi `YYYY-MM-DD`, ví dụ `2026-10-29`. Nếu Sheets tự đổi thành ngày, định dạng ô thành văn bản thuần rồi nhập lại. Tiền là số nguyên không âm, không nhập dấu phân cách hoặc ký hiệu tiền. Ô trống nghĩa là chưa rõ; `0` nghĩa là không phát sinh. Cờ dùng `TRUE`/`FALSE`.
- Số điện thoại, mã đơn và vận đơn nên để văn bản thuần để giữ số 0 đầu. Hệ thống xuất dữ liệu bằng RAW, không biến chuỗi thành công thức.
- Thêm mới trên Sheets: thêm dòng đầy đủ, mã hồ sơ duy nhất, phiên bản `0`, để trống `_sync_signature`. Bắt buộc ngày nhận, mã đơn, khách hàng, ưu tiên và trạng thái hợp lệ. Nếu chưa quen, tạo mới trên website rồi đồng bộ.
- Xóa dòng Sheets không xóa hồ sơ trên website; lần đồng bộ sau dòng được tạo lại. Không hỗ trợ xóa hồ sơ qua Sheets.
- Người có quyền sửa Sheet có thể thay đổi nội dung sẽ được nhập khi admin đồng bộ. Chỉ chia sẻ quyền sửa cho người được phép sửa hồ sơ; lịch sử website ghi nhận admin thực hiện đồng bộ, không xác định danh tính người sửa Google Sheets.

## Xung đột và lỗi

- Nếu cùng sửa một hồ sơ ở hai nơi, phiên đồng bộ dừng trước khi nhập dữ liệu, liệt kê mã xung đột. Đối chiếu hai bản, lưu nội dung cuối cùng trên website, sao lưu dòng Sheets ra nơi khác rồi xóa dòng xung đột khỏi Salaman Sync. Đồng bộ lại sẽ đưa bản website vào Sheets. Không tự sửa cột phiên bản để vượt kiểm tra.
- Ghi dữ liệu website kiểm tra phiên bản từng hồ sơ và giữ nguyên RLS/lịch sử. Google Sheets không có giao dịch chung với Supabase: phiên có thể hoàn tất một phần khi lỗi mạng hoặc có người sửa dữ liệu trong lúc chạy. Thông báo cho biết số đã nhập; tải mới, kiểm tra và chạy lại. Không tự hoàn tác hồ sơ đã lưu.
- Hệ thống đọc lại Sheets trước khi ghi để phát hiện chỉnh sửa/sắp xếp trong phiên, nhưng Google Sheets không hỗ trợ so sánh-và-ghi nguyên tử. Vì vậy cần tạm ngừng chỉnh Sheet trong khi đồng bộ. Khóa trên Supabase ngăn hai phiên đồng bộ chạy đồng thời, tự hết hạn sau 10 phút nếu phiên bị ngắt.
- Giới hạn hiện tại 5000 hồ sơ và lưới 5001 dòng, 29 cột. Không thêm dữ liệu bên ngoài vùng này. Có thể cần tăng giới hạn/thời gian xử lý cho dữ liệu lớn.
- Lỗi 403 từ Google: kiểm tra Sheets API và quyền Người chỉnh sửa của `client_email`. Lỗi function chưa tồn tại: triển khai bước 6. Lỗi khóa đồng bộ: chạy SQL bước 5.

## Kiểm tra trước khi dùng dữ liệu thật

Kiểm tra logic và handler bằng Node.js 24: `npm run test:sync`. Các kiểm tra handler dùng mô phỏng Google/Supabase; không thay thế kiểm tra kết nối thật. Chạy thêm `npm test` và `npm run build` trong môi trường đã cài dependencies.

Sao lưu JSON từ website trước lần đồng bộ đầu. Chạy với một hồ sơ thử: xuất từ website, sửa ghi chú trên Sheets rồi đồng bộ và kiểm tra website; sửa lại trên website rồi đồng bộ và kiểm tra Sheets. Thử sửa cùng hồ sơ ở hai nơi để xác nhận báo xung đột. Chỉ xác nhận tích hợp hoạt động sau khi kiểm tra đủ các bước này.

Tài liệu API: https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/update
