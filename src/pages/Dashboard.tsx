import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  ClipboardList,
  Warehouse,
  TrendingUp,
  ArrowRight,
  Package,
  AlertTriangle,
} from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  loading,
  variant = "default",
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  href: string;
  loading: boolean;
  variant?: "default" | "warning" | "success";
}) {
  const variantStyles = {
    default: "bg-card",
    warning: "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30",
    success: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30",
  };

  return (
    <Link to={href}>
      <Card className={`hover:shadow-md transition-all cursor-pointer h-full ${variantStyles[variant]}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              variant === "warning" ? "bg-amber-100 text-amber-600" :
              variant === "success" ? "bg-emerald-100 text-emerald-600" :
              "bg-muted"
            }`}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Dashboard() {
  const cartQuery = trpc.cart.list.useQuery(undefined, { retry: false });
  const recentOrdersQuery = trpc.order.recent.useQuery({ limit: 5 }, { retry: false });
  const inventoryStatsQuery = trpc.inventory.stats.useQuery(undefined, { retry: false });

  const cartCount = cartQuery.data?.count ?? 0;
  const cartTotal = cartQuery.data?.total ?? 0;
  const inventoryStats = inventoryStatsQuery.data;
  const recentOrders = recentOrdersQuery.data ?? [];

  const orderStatusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    confirmed: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    processing: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    shipped: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
    delivered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Overview of your marketplace activity
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/products">
            <Button variant="outline" size="sm">
              <Package className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </Link>
          <Link to="/cart">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Cart
              {cartCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-white/20 text-white hover:bg-white/20">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cart Items"
          value={String(cartCount)}
          description={cartCount > 0 ? `${cartTotal.toFixed(2)} USD total` : "Your cart is empty"}
          icon={ShoppingCart}
          href="/cart"
          loading={cartQuery.isLoading}
        />
        <StatCard
          title="Active Orders"
          value={String(recentOrders.length)}
          description="Recent purchase orders"
          icon={ClipboardList}
          href="/orders"
          loading={recentOrdersQuery.isLoading}
        />
        <StatCard
          title="Total Inventory"
          value={String(inventoryStats?.totalItems ?? 0)}
          description="Products tracked in system"
          icon={Warehouse}
          href="/inventory"
          loading={inventoryStatsQuery.isLoading}
          variant="success"
        />
        <StatCard
          title="Low Stock Alerts"
          value={String(inventoryStats?.lowStock ?? 0)}
          description="Items below reorder level"
          icon={AlertTriangle}
          href="/inventory"
          loading={inventoryStatsQuery.isLoading}
          variant={inventoryStats && inventoryStats.lowStock > 0 ? "warning" : "default"}
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <CardDescription>Your latest purchase orders</CardDescription>
          </div>
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
              View All
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrdersQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No orders yet</p>
              <Link to="/products" className="text-emerald-600 hover:underline text-sm mt-1 inline-block">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium group-hover:text-emerald-600 transition-colors">
                        {order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.supplierName ?? "Unknown Supplier"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      ${parseFloat(order.totalAmount?.toString() ?? "0").toFixed(2)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${orderStatusColor[order.status] ?? ""}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Browse Products",
            desc: "Explore our catalog of fresh produce from verified suppliers.",
            icon: Package,
            href: "/products",
            color: "bg-blue-50 text-blue-600",
          },
          {
            title: "Manage Inventory",
            desc: "Track stock levels and get low-stock alerts.",
            icon: Warehouse,
            href: "/inventory",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            title: "View Reports",
            desc: "Analyze your purchasing patterns and trends.",
            icon: TrendingUp,
            href: "/reports",
            color: "bg-purple-50 text-purple-600",
          },
        ].map((action) => (
          <Link key={action.title} to={action.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{action.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
