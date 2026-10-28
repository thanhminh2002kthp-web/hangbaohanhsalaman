import { PASSWORD_MAX, PASSWORD_RULES } from '../domain/accountValidation';

/** Danh sách điều kiện mật khẩu, đổi sang ✓ khi đạt. */
export function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="rules" aria-label="Yêu cầu mật khẩu">
      {PASSWORD_RULES.map((r) => (
        <li key={r.id} className={r.test(password) ? 'rule-ok' : 'rule-bad'}>
          {r.test(password) ? '✓' : '○'} {r.label}
        </li>
      ))}
      {password.length > PASSWORD_MAX && <li className="rule-fail">✗ Tối đa {PASSWORD_MAX} ký tự</li>}
    </ul>
  );
}
