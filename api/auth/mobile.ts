const INDIA_MOBILE_RE = /^\+91[6-9]\d{9}$/;

export function normalizeIndianMobileNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  const normalized = digits.startsWith("91")
    ? `+${digits}`
    : `+91${digits}`;

  if (!INDIA_MOBILE_RE.test(normalized)) {
    throw new Error("Enter a valid +91 mobile number.");
  }

  return normalized;
}
