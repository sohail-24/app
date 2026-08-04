import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidIndianMobileNumber(input: string) {
  if (!input) return false;
  const digits = input.replace(/\D/g, "");
  const normalized = digits.startsWith("91") ? `+${digits}` : `+91${digits}`;
  return /^\+91[6-9]\d{9}$/.test(normalized);
}
