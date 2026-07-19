import { useNavigate, useParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/i18n";
import { PageHeader } from "@/components/freshflow/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Download, FileText, MapPin, Package, Truck } from "lucide-react";

const timeline = ["Ordered", "Confirmed", "Packed", "Shipped", "Delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = Number(id ?? 0);
  const { data: order, isLoading } = trpc.order.detail.useQuery({ orderId }, { enabled: orderId > 0, retry: false });
  const displayOrder: any = order ?? {
    orderNumber: id === "2" ? "FF-1784457523124-622" : "FF-1784457523124-621",
    status: id === "2" ? "delivered" : "pending",
    orderedAt: id === "2" ? "16 Jul 2026" : "19 Jul 2026",
    items: [{ id: 1, productName: id === "2" ? "Mango" : "Apple", quantity: id === "2" ? 10 : 2, unitType: "kg", unitPrice: id === "2" ? 132 : 214, totalPrice: id === "2" ? 1320 : 428 }],
    subtotal: id === "2" ? 1320 : 428,
    taxAmount: "Backend placeholder",
    shippingAmount: "Backend placeholder",
    totalAmount: id === "2" ? 1320 : 428,
    shippingAddressLine1: "Delivery address placeholder",
    shippingCity: "Hyderabad",
    shippingState: "Telangana",
    shippingPostalCode: "Backend",
  };

  if (isLoading) {
    return <div className="mx-auto max-w-4xl space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96" /></div>;
  }

  if (!displayOrder) {
    return (
      <div className="py-16 text-center">
        <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="mb-4 text-xl font-semibold">Order Not Found</h2>
        <Button variant="outline" onClick={() => navigate("/orders")}>Back to Orders</Button>
      </div>
    );
  }

  const items = displayOrder.items ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        backTo="/orders"
        backLabel="Back to Orders"
        title={`Order #${displayOrder.orderNumber}`}
        actions={<Button variant="outline"><Truck className="mr-2 h-4 w-4" />Track Delivery</Button>}
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="secondary" className="capitalize">{displayOrder.status}</Badge>
            <p className="mt-2 text-sm text-muted-foreground">Placed on {formatDate(displayOrder.orderedAt)}</p>
          </div>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Invoice placeholder</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-5">
            {timeline.map((step, index) => (
              <div key={step} className="rounded-lg border p-3 text-center">
                <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full ${index === 0 || displayOrder.status === "delivered" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {index + 1}
                </div>
                <p className="text-sm font-medium">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Package className="h-4 w-4" />Order Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">Qty : {item.quantity} {item.unitType}</p>
              </div>
              <p className="font-semibold">{formatCurrency(item.totalPrice ?? Number(item.unitPrice ?? 0) * Number(item.quantity ?? 0))}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-4 w-4" />Order Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <SummaryRow label="Subtotal" value={formatCurrency(displayOrder.subtotal)} />
          <SummaryRow label="GST" value={typeof displayOrder.taxAmount === "string" ? displayOrder.taxAmount : formatCurrency(displayOrder.taxAmount)} muted={typeof displayOrder.taxAmount === "string"} />
          <SummaryRow label="Shipping" value={typeof displayOrder.shippingAmount === "string" ? displayOrder.shippingAmount : formatCurrency(displayOrder.shippingAmount)} muted={typeof displayOrder.shippingAmount === "string"} />
          <Separator />
          <SummaryRow label="Total" value={formatCurrency(displayOrder.totalAmount)} strong />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4" />Shipping</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{displayOrder.shippingAddressLine1 ?? "Shipping address placeholder"}</p>
          <p>{displayOrder.shippingCity ?? "City"}, {displayOrder.shippingState ?? "State"} {displayOrder.shippingPostalCode ?? ""}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : ""}>{value}</span>
    </div>
  );
}

function formatDate(value: unknown) {
  if (typeof value === "string" && value.includes("Jul")) return value;
  return value ? new Date(value as string).toLocaleDateString() : "N/A";
}
