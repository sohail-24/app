import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Package,
  IndianRupee,
  ArrowDownRight,
} from "lucide-react";

export default function Reports() {
  const cartQuery = trpc.cart.list.useQuery(undefined, { retry: false });
  const recentOrdersQuery = trpc.order.recent.useQuery({ limit: 10 }, { retry: false });
  const inventoryStatsQuery = trpc.inventory.stats.useQuery(undefined, { retry: false });
  const productsQuery = trpc.product.list.useQuery({});

  const isLoading = cartQuery.isLoading || recentOrdersQuery.isLoading || inventoryStatsQuery.isLoading;

  const cartTotal = cartQuery.data?.total ?? 0;
  const orderCount = recentOrdersQuery.data?.length ?? 0;
  const orderTotal = (recentOrdersQuery.data ?? []).reduce(
    (sum, o) => sum + parseFloat(o.totalAmount?.toString() ?? "0"),
    0
  );
  const inventoryTotal = inventoryStatsQuery.data?.totalItems ?? 0;
  const lowStockCount = inventoryStatsQuery.data?.lowStock ?? 0;
  const productCount = productsQuery.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Overview of your marketplace metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Cart Value",
            value: formatCurrency(cartTotal),
            description: "Items in cart",
            icon: ShoppingCart,
            trend: null,
          },
          {
            title: "Total Orders",
            value: String(orderCount),
            description: "Recent orders",
            icon: Package,
            trend: null,
          },
          {
            title: "Order Value",
            value: formatCurrency(orderTotal),
            description: "Recent order total",
            icon: IndianRupee,
            trend: null,
          },
          {
            title: "Products",
            value: String(productCount),
            description: "Active products",
            icon: BarChart3,
            trend: null,
          },
        ].map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold">{kpi.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory Overview
            </CardTitle>
            <CardDescription>Current stock status across all products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">In Stock</p>
                      <p className="text-xs text-muted-foreground">Available for ordering</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">
                    {inventoryTotal - lowStockCount - (inventoryStatsQuery.data?.outOfStock ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Low Stock</p>
                      <p className="text-xs text-muted-foreground">Below reorder level</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-amber-600">
                    {lowStockCount}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Out of Stock</p>
                      <p className="text-xs text-muted-foreground">Unavailable for ordering</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    {inventoryStatsQuery.data?.outOfStock ?? 0}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Order Values */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Recent Order Values
            </CardTitle>
            <CardDescription>Last 10 order amounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : recentOrdersQuery.data && recentOrdersQuery.data.length > 0 ? (
              <div className="space-y-3">
                {recentOrdersQuery.data.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{order.supplierName}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
