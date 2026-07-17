export const BUSINESS_OWNER_EMAIL = "mdsohail88008@gmail.com";

export const futureBusinessRoles = [
  "manager",
  "warehouse_staff",
  "sales_executive",
  "platform_admin",
] as const;

export type FutureBusinessRole = (typeof futureBusinessRoles)[number];
export type AppRole = "buyer" | "business_owner" | "platform_admin";

export type UserLike = {
  email?: string | null;
  role?: string | null;
};

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

export function isOwner(user?: UserLike | null) {
  return normalizeEmail(user?.email) === BUSINESS_OWNER_EMAIL;
}

export function isPlatformAdmin(user?: UserLike | null) {
  return user?.role === "admin";
}

export function getAppRole(user?: UserLike | null): AppRole {
  if (isPlatformAdmin(user)) return "platform_admin";
  if (isOwner(user)) return "business_owner";
  return "buyer";
}

export function getRoleLabel(role: AppRole) {
  const labels: Record<AppRole, string> = {
    buyer: "Buyer Workspace",
    business_owner: "Business Owner",
    platform_admin: "Platform Admin",
  };
  return labels[role];
}
