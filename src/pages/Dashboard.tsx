import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate, formatNumber, toNumber } from "@/lib/i18n";
import { getAppRole, getRoleLabel } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  IndianRupee,
  Package,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const salesTrend = [
  { day: "Mon", sales: 142000, orders: 18 },
  { day: "Tue", sales: 168000, orders: 24 },
  { day: "Wed", sales: 126000, orders: 16 },
  { day: "Thu", sales: 194000, orders: 28 },
  { day: "Fri", sales: 212000, orders: 31 },
  { day: "Sat", sales: 171000, orders: 21 },
  { day: "Sun", sales: 98000, orders: 12 },
];

const statusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  confirmed: "bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200",
  processing: "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200",
  shipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-200",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-200",
};

export default function Dashboard() {
  const { user } = useAuth();
  const companyQuery = trpc.company.byId.useQuery(
    { id: user?.companyId ?? 0 },
    { enabled: !!user?.companyId, retry: false },
  );
  const productsQuery = trpc.product.list.useQuery({ sortBy: "newest" }, { retry: false });
  const recentOrdersQuery = trpc.order.recent.useQuery({ limit: 5 }, { retry: false });
  const inventoryStatsQuery = trpc.inventory.stats.useQuery(undefined, { retry: false });
  const orderStatsQuery = trpc.order.stats.useQuery(undefined, { retry: false });

  const company = companyQuery.data ?? null;
  const role = getAppRole(user, company);
  const products = productsQuery.data ?? [];
  const recentOrders = recentOrdersQuery.data ?? [];
  const inventoryStats = inventoryStatsQuery.data;
  const orderCount = orderStatsQuery.data?.reduce((total, item) => total + Number(item.count ?? 0), 0) ?? recentOrders.length;
  const todaySales = recentOrders.reduce((total, order) => total + toNumber(order.totalAmount), 0);
  const inventoryValue = toNumber(inventoryStats?.totalValue);
  const lowStock = inventoryStats?.lowStock ?? 0;
  const topProducts = products.slice(0, 5).map((product) => ({
    name: product.name,
    value: toNumber(product.unitPrice) * (product.minimumOrderQuantity ?? 1),
  }));

  const ownerMode = role !== "buyer";

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-md">
              {getRoleLabel(role)}
            </Badge>
            <Badge variant="outline" className="rounded-md">
              {company?.type ? company.type.replace("_", " ") : "workspace"}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {ownerMode ? "Operations Command Center" : "Procurement Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {ownerMode
              ? "Monitor sales, stock movement, fulfillment, and product health in one place."
              : "Track purchase orders, supplier activity, and replenishment signals for your business."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={ownerMode ? "/products/new" : "/products"}>
            <Button>
              {ownerMode ? <Plus className="mr-2 h-4 w-4" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
              {ownerMode ? "Add Product" : "Create Purchase Order"}
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="outline">
              <Warehouse className="mr-2 h-4 w-4" />
              Inventory
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          title="Today's Sales"
          value={formatCurrency(todaySales)}
          caption={recentOrders.length ? "From recent purchase orders" : "No orders recorded today"}
          icon={IndianRupee}
          loading={recentOrdersQuery.isLoading}
          tone="emerald"
        />
        <KpiCard
          title="Orders"
          value={formatNumber(orderCount)}
          caption="Open and recent order flow"
          icon={ClipboardList}
          loading={orderStatsQuery.isLoading && recentOrdersQuery.isLoading}
          tone="sky"
        />
        <KpiCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue)}
          caption={`${formatNumber(inventoryStats?.totalItems ?? 0)} stocked items`}
          icon={Boxes}
          loading={inventoryStatsQuery.isLoading}
          tone="indigo"
        />
        <KpiCard
          title="Customers"
          value={ownerMode ? "42" : "8"}
          caption={ownerMode ? "Active buyer accounts" : "Approved suppliers"}
          icon={Users}
          loading={false}
          tone="slate"
        />
        <KpiCard
          title="Low Stock"
          value={formatNumber(lowStock)}
          caption={lowStock ? "Needs replenishment review" : "No critical alerts"}
          icon={AlertTriangle}
          loading={inventoryStatsQuery.isLoading}
          tone={lowStock ? "amber" : "emerald"}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Sales and Orders</CardTitle>
                <p className="text-sm text-muted-foreground">Weekly operational trend</p>
              </div>
              <Badge variant="outline" className="rounded-md">Live view</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value, name) =>
                      name === "sales" ? [formatCurrency(value), "Sales"] : [value, "Orders"]
                    }
                    contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))" }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#059669" fill="url(#salesFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">Common business workflows</p>
          </CardHeader>
          <CardContent className="grid gap-2">
            {(ownerMode
              ? [
                  { label: "Create product", href: "/products/new", icon: Plus },
                  { label: "Review low stock", href: "/inventory", icon: AlertTriangle },
                  { label: "Open order desk", href: "/orders", icon: ClipboardList },
                ]
              : [
                  { label: "Browse supplier catalog", href: "/products", icon: ShoppingBag },
                  { label: "Track orders", href: "/orders", icon: ClipboardList },
                  { label: "Update settings", href: "/settings", icon: SlidersHorizontal },
                ]).map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="flex items-center gap-3 font-medium">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <action.icon className="h-4 w-4" />
                  </span>
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <p className="text-sm text-muted-foreground">Latest purchase order activity</p>
              </div>
              <Link to="/orders">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrdersQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-14 w-full" />
                ))}
              </div>
            ) : recentOrders.length ? (
              <div className="divide-y rounded-lg border">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="flex items-center justify-between gap-4 p-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{order.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.supplierName ?? "Supplier"} · {formatDate(order.orderedAt)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</div>
                      <Badge className={`rounded-md text-[11px] capitalize ${statusClass[order.status] ?? ""}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No order activity yet"
                description="Orders will appear here as buyers and suppliers transact through FreshFlow."
                actionLabel="Open Products"
                actionHref="/products"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products</CardTitle>
            <p className="text-sm text-muted-foreground">Highest catalog value by minimum order</p>
          </CardHeader>
          <CardContent>
            {productsQuery.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : topProducts.length ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 6, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Catalog value"]}
                      contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))" }}
                    />
                    <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No active products"
                description="Add active products to start tracking catalog performance."
                actionLabel={ownerMode ? "Add Product" : "Browse Catalog"}
                actionHref={ownerMode ? "/products/new" : "/products"}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({
  title,
  value,
  caption,
  icon: Icon,
  loading,
  tone,
}: {
  title: string;
  value: string;
  caption: string;
  icon: typeof Package;
  loading: boolean;
  tone: "emerald" | "sky" | "indigo" | "slate" | "amber";
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-400/10 dark:text-slate-200",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{title}</p>
            {loading ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="mt-2 text-2xl font-semibold">{value}</p>}
            <p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
          <TrendingUp className="h-3.5 w-3.5" />
          Healthy trend
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      <Link to={actionHref}>
        <Button variant="outline" size="sm" className="mt-4">
          {actionLabel}
        </Button>
      </Link>
    </div>
  );
}
