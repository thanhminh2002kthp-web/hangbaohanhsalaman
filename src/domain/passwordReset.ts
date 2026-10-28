/**
 * Lấy mã kích hoạt từ phần "#" của địa chỉ, ví dụ "#activate=abc…".
 * Mã nằm ở phần fragment nên không bao giờ gửi lên máy chủ web hay lưu trong nhật ký truy cập.
 */
export function parseActivationToken(hash: string): string | null {
  const m = hash.match(/[#&]activate=([A-Za-z0-9_-]{40,60})(?:&|$)/);
  return m ? m[1] : null;
}
