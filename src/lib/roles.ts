export type AppRole = "buyer" | "business_owner" | "platform_admin";

type UserLike = {
  role?: string | null;
};

type CompanyLike = {
  type?: string | null;
};

export function getAppRole(user?: UserLike | null, company?: CompanyLike | null): AppRole {
  if (user?.role === "admin") return "platform_admin";
  if (company?.type === "supplier" || company?.type === "both") return "business_owner";
  return "buyer";
}

export function getRoleLabel(role: AppRole) {
  const labels: Record<AppRole, string> = {
    buyer: "Buyer Workspace",
    business_owner: "Business Owner",
    platform_admin: "Business Owner",
  };
  return labels[role];
}
