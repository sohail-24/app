import { useMemo } from "react";
import { useLocation } from "react-router";
import { PageHeader } from "@/components/freshflow/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const titles: Record<string, string> = {
  "/customers": "Customers",
  "/delivery-zones": "Delivery Zones",
  "/gst-rules": "GST Rules",
  "/shipping-rules": "Shipping Rules",
  "/coupons": "Coupons",
  "/notifications": "Notifications",
  "/staff": "Staff",
};

export default function OwnerPlaceholder() {
  const location = useLocation();
  const title = useMemo(() => titles[location.pathname] ?? "Owner Section", [location.pathname]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        backTo="/dashboard"
        backLabel="Back to Dashboard"
        title={title}
        description="This owner workspace section is available for backend-powered controls."
      />
      <Card>
        <CardContent className="flex min-h-72 items-center justify-center p-8 text-center text-sm text-muted-foreground">
          {title} placeholder for backend APIs.
        </CardContent>
      </Card>
    </div>
  );
}
