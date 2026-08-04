import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeFrontendMobileNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.length === 10 ? `+91${digits}` : (digits.startsWith("91") ? `+${digits}` : `+91${digits}`);
  return normalized;
}

export function isValidIndianMobileNumber(input: string) {
  if (!input) return false;
  const normalized = normalizeFrontendMobileNumber(input);
  return /^\+91[6-9]\d{9}$/.test(normalized);
}
