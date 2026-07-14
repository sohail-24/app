import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  Package,
  ArrowLeft,
  Truck,
  Calendar,
  MapPin,
  IndianRupee,
  Loader2,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-cyan-100 text-cyan-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

const statusFlow = [
  { key: "ordered", label: "Ordered", field: "orderedAt" },
  { key: "confirmed", label: "Confirmed", field: "confirmedAt" },
  { key: "shipped", label: "Shipped", field: "shippedAt" },
  { key: "delivered", label: "Delivered", field: "deliveredAt" },
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = parseInt(id ?? "0");

  const { data: order, isLoading } = trpc.order.detail.useQuery(
    { orderId },
    { enabled: orderId > 0 }
  );

  const utils = trpc.useUtils();
  const updateStatus = trpc.order.status.useMutation({
    onSuccess: () => {
      utils.order.detail.invalidate({ orderId });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <Link to="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const items = order.items ?? [];
  const subtotal = parseFloat(order.subtotal?.toString() ?? "0");
  const tax = parseFloat(order.taxAmount?.toString() ?? "0");
  const shipping = parseFloat(order.shippingAmount?.toString() ?? "0");
  const total = parseFloat(order.totalAmount?.toString() ?? "0");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </button>

      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
            <Badge className={`${statusColors[order.status] ?? ""}`}>
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on{" "}
            {order.orderedAt
              ? new Date(order.orderedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>
        {order.status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              updateStatus.mutate({ orderId, status: "cancelled" })
            }
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Cancel Order
          </Button>
        )}
      </div>

      {/* Progress Tracker */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between relative">
            {statusFlow.map((step, i) => {
              const date = (order as any)[step.field];
              const isCompleted = !!date;
              const isCurrent =
                !isCompleted &&
                (i === 0 || !!(order as any)[statusFlow[i - 1].field]);

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-amber-100 text-amber-700 border-2 border-amber-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Package className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="text-xs mt-1.5 font-medium">{step.label}</span>
                  {date && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => {
            const unitPrice = parseFloat(item.unitPrice?.toString() ?? "0");
            const totalPrice = parseFloat(item.totalPrice?.toString() ?? "0");

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                <div className="h-14 w-14 rounded-lg bg-white border overflow-hidden shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} x {formatCurrency(unitPrice)} / {item.unitType}
                  </p>
                </div>
                <span className="font-semibold text-sm">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Shipping */}
      {order.shippingAddressLine1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Shipping Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-sm">
                <p>{order.shippingAddressLine1}</p>
                {order.shippingAddressLine2 && <p>{order.shippingAddressLine2}</p>}
                <p className="text-muted-foreground">
                  {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                </p>
                <p className="text-muted-foreground">{order.shippingCountry}</p>
              </div>
            </div>
            {order.shippingMethod && (
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{order.shippingMethod}</span>
              </div>
            )}
            {order.trackingNumber && (
              <div className="flex items-center gap-3 text-sm">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Tracking: {order.trackingNumber}</span>
              </div>
            )}
            {order.estimatedDeliveryDate && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  Estimated delivery:{" "}
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(shipping)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-emerald-600">
              {formatCurrency(total)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.buyerNotes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-1">Your Notes</p>
            <p className="text-sm text-muted-foreground">{order.buyerNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
