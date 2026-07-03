export interface PasswordStrength {
  score: number;
  label: string;
  passed: boolean;
  checks: { label: string; ok: boolean }[];
}

export function checkPassword(password: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "At least one uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", ok: /[a-z]/.test(password) },
    { label: "At least one number", ok: /[0-9]/.test(password) },
    { label: "At least one special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.ok).length;
  const labels = ["Very weak", "Weak", "Fair", "Strong", "Very strong"];

  return {
    score,
    label: labels[score] ?? "Very weak",
    passed: score >= 4,
    checks,
  };
}
