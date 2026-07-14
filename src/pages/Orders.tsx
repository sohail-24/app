import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  Package,
  ArrowRight,
  Calendar,
  Store,
} from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  confirmed: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  processing: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  shipped: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
  delivered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
  refunded: "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

const paymentColors: Record<string, string> = {
  pending: "text-amber-600",
  authorized: "text-blue-600",
  paid: "text-emerald-600",
  partially_paid: "text-orange-600",
  failed: "text-red-600",
};

export default function Orders() {
  const { data: orders, isLoading } = trpc.order.list.useQuery({});
  const { data: stats } = trpc.order.stats.useQuery(undefined, { retry: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            View and track your purchase orders
          </p>
        </div>
        <Link to="/products">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Store className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>

      {/* Status Summary */}
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <Badge key={s.status} variant="secondary" className="text-xs capitalize">
              {s.status}: {s.count}
            </Badge>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm group-hover:text-emerald-600 transition-colors">
                            {order.orderNumber}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-xs capitalize ${statusColors[order.status] ?? ""}`}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {order.supplierName ?? "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {order.orderedAt
                              ? new Date(order.orderedAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className={`text-xs capitalize ${paymentColors[order.paymentStatus] ?? ""}`}>
                          {order.paymentStatus?.replace("_", " ")}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start placing orders to see them here
            </p>
            <Link to="/products">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
