import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { otpVerifications } from "@db/schema";
import { getDb } from "../queries/connection";
import { hashSecret, verifySecret } from "./password";

export function generateOtpCode(mockCode?: string) {
  if (mockCode) return mockCode;
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtpVerification(
  mobileNumber: string,
  code: string,
) {
  await getDb().insert(otpVerifications).values({
    mobileNumber,
    codeHash: await hashSecret(code),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
}

export async function verifyOtpCode(mobileNumber: string, code: string) {
  const rows = await getDb()
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.mobileNumber, mobileNumber),
        isNull(otpVerifications.consumedAt),
        gt(otpVerifications.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  const verification = rows.at(0);
  if (!verification) return false;

  const valid = await verifySecret(code, verification.codeHash);
  if (!valid) return false;

  await getDb()
    .update(otpVerifications)
    .set({ consumedAt: new Date() })
    .where(eq(otpVerifications.id, verification.id));

  return true;
}
