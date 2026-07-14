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
};
