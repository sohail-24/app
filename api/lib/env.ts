import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret:
    required("JWT_ACCESS_SECRET") || "dev-access-secret-change-me",
  jwtRefreshSecret:
    required("JWT_REFRESH_SECRET") || "dev-refresh-secret-change-me",
  mockOtpCode: process.env.MOCK_OTP_CODE ?? "123456",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  adminOrderEmail: process.env.ADMIN_ORDER_EMAIL ?? process.env.OWNER_EMAIL ?? "",
  appUrl: process.env.APP_URL ?? "",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpFrom: process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? "FreshFlow <orders@freshflow.com>",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
};
