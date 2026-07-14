import bcrypt from "bcryptjs";

const PASSWORD_COST = 12;

export function hashSecret(value: string) {
  return bcrypt.hash(value, PASSWORD_COST);
}

export function verifySecret(value: string, hash: string) {
  return bcrypt.compare(value, hash);
}
