import { Link } from "react-router";
import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate, formatNumber, toNumber, unitLabels } from "@/lib/i18n";
import { getAppRole, getRoleLabel } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderTree,
  IndianRupee,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  ShoppingCart,
  Truck,
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

const buyerStatuses = [
  { label: "Quoted", count: 3 },
  { label: "Confirmed", count: 5 },
  { label: "In transit", count: 2 },
  { label: "Delivered", count: 11 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const role = getAppRole(user);

  const productsQuery = trpc.product.list.useQuery(
    { status: role === "buyer" ? "active" : undefined, sortBy: "newest" },
    { retry: false },
  );
  const productStatsQuery = trpc.product.stats.useQuery(undefined, {
    retry: false,
    enabled: role !== "buyer",
  });
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const inventoryStatsQuery = trpc.inventory.stats.useQuery(undefined, {
    retry: false,
    enabled: role !== "buyer",
  });
  const orderStatsQuery = trpc.order.stats.useQuery(undefined, {
    retry: false,
    enabled: !!user && role !== "buyer",
  });
  const recentOrdersQuery = trpc.order.recent.useQuery(
    { limit: 5 },
    { retry: false, enabled: !!user },
  );

  if (role === "buyer") {
    return (
      <BuyerDashboard
        products={productsQuery.data ?? []}
        productsLoading={productsQuery.isLoading}
        categories={categoriesQuery.data ?? []}
        categoriesLoading={categoriesQuery.isLoading}
        recentOrders={recentOrdersQuery.data ?? []}
        ordersLoading={recentOrdersQuery.isLoading}
      />
    );
  }

  const products = productsQuery.data ?? [];
  const inventoryStats = inventoryStatsQuery.data;
  const productStats = productStatsQuery.data;
  const orderStats = orderStatsQuery.data ?? [];
  const pendingOrders = orderStats.find((item) => item.status === "pending")?.count ?? 0;
  const recentOrders = recentOrdersQuery.data ?? [];
  const revenue = recentOrders.reduce((total, order) => total + toNumber(order.totalAmount), 0);
  const todaysOrders = recentOrders.filter((order) => {
    const orderedAt = order.orderedAt instanceof Date ? order.orderedAt : new Date(String(order.orderedAt));
    return orderedAt.toDateString() === new Date().toDateString();
  }).length;
  const topProducts = products.slice(0, 5).map((product) => ({
    name: product.name,
    value: toNumber(product.unitPrice) * (product.minimumOrderQuantity ?? 1),
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2 rounded-md">
            {getRoleLabel(role)}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Operations Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor catalog health, inventory value, order flow, and recent business activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Products" value={formatNumber(productStats?.totalProducts ?? 0)} caption="All catalog records" icon={Package} loading={productStatsQuery.isLoading} />
        <KpiCard title="Categories" value={formatNumber(categoriesQuery.data?.length ?? 0)} caption="Active category records" icon={FolderTree} loading={categoriesQuery.isLoading} />
        <KpiCard title="Inventory Value" value={formatCurrency(inventoryStats?.totalValue ?? 0)} caption="Stock value on hand" icon={Warehouse} loading={inventoryStatsQuery.isLoading} />
        <KpiCard title="Revenue" value={formatCurrency(revenue)} caption="Recent order value" icon={IndianRupee} loading={recentOrdersQuery.isLoading} />
        <KpiCard title="Today's Orders" value={formatNumber(todaysOrders)} caption="Placed today" icon={ClipboardList} loading={recentOrdersQuery.isLoading} />
        <KpiCard title="Pending Orders" value={formatNumber(pendingOrders)} caption="Awaiting approval" icon={AlertTriangle} loading={orderStatsQuery.isLoading} />
        <KpiCard title="Low Stock" value={formatNumber(inventoryStats?.lowStock ?? 0)} caption="Needs attention" icon={Boxes} loading={inventoryStatsQuery.isLoading} />
        <KpiCard title="Active Products" value={formatNumber(productStats?.activeProducts ?? 0)} caption="Visible for ordering" icon={CheckCircle2} loading={productStatsQuery.isLoading} />
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
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest purchase-order movement</p>
          </CardHeader>
          <CardContent>
            {recentOrdersQuery.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : recentOrders.length ? (
              <div className="divide-y rounded-lg border">
                {recentOrders.map((order) => (
                  <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.supplierName ?? "Supplier"} · {formatDate(order.orderedAt)}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-md capitalize">{order.status}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={ClipboardList} title="No recent activity" description="Order activity will appear here once buyers start purchasing." />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Recent Products</CardTitle>
                <p className="text-sm text-muted-foreground">Latest catalog records from the database</p>
              </div>
              <Link to="/products">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {productStatsQuery.isLoading ? (
              <Skeleton className="h-[280px] w-full" />
            ) : productStats?.recentlyAdded?.length ? (
              <div className="divide-y rounded-lg border">
                {productStats.recentlyAdded.map((product) => (
                  <Link key={product.id} to={`/products/${product.slug}`} className="flex items-center justify-between gap-4 p-3 hover:bg-muted/60">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.categoryName ?? "Uncategorized"} · {formatDate(product.createdAt)}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-semibold">{formatCurrency(product.unitPrice)}</div>
                      <Badge variant="secondary" className="rounded-md text-[11px] capitalize">{product.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={Package} title="No products yet" description="Created products will appear here immediately after publishing." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Selling Products</CardTitle>
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
                    <Tooltip formatter={(value) => [formatCurrency(value), "Catalog value"]} contentStyle={{ borderRadius: 8, borderColor: "hsl(var(--border))" }} />
                    <Bar dataKey="value" fill="#2563eb" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState icon={Package} title="No active products" description="Add active products to start tracking catalog performance." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function BuyerDashboard({
  products,
  productsLoading,
  categories,
  categoriesLoading,
  recentOrders,
  ordersLoading,
}: {
  products: Array<{
    id: number;
    name: string;
    slug: string;
    image: string | null;
    categoryName: string | null;
    supplierName: string | null;
    unitPrice: unknown;
    unitType: string;
    minimumOrderQuantity: number;
  }>;
  productsLoading: boolean;
  categories: Array<{ id: number; name: string; slug: string; description: string | null }>;
  categoriesLoading: boolean;
  recentOrders: Array<{ id: number; orderNumber: string; totalAmount: unknown; status: string; orderedAt: Date; supplierName: string | null }>;
  ordersLoading: boolean;
}) {
  const featured = products.slice(0, 4);
  const recommended = products.slice(4, 8);
  const pendingDeliveries = recentOrders.filter((order) => ["confirmed", "processing", "shipped"].includes(order.status));

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <Badge variant="secondary" className="mb-3 rounded-md">Buyer Workspace</Badge>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Procurement Dashboard</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Find wholesale products, reorder frequent purchases, and track active purchase orders.
            </p>
          </div>
          <Link to="/products">
            <Button>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </Link>
        </div>
        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-13 rounded-lg pl-12 text-base" placeholder="Search fruits, vegetables, dairy, grocery supplies..." />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <BuyerMetric icon={ShoppingCart} label="Quick Reorder" value={formatNumber(recentOrders.length)} caption="Recent purchases" loading={ordersLoading} />
        <BuyerMetric icon={Truck} label="Pending Deliveries" value={formatNumber(pendingDeliveries.length)} caption="Confirmed or shipped" loading={ordersLoading} />
        <BuyerMetric icon={FileText} label="Recent Invoices" value={formatNumber(recentOrders.length)} caption="Ready for download" loading={ordersLoading} />
        <BuyerMetric icon={ClipboardList} label="Open Orders" value={formatNumber(buyerStatuses.reduce((sum, item) => sum + item.count, 0))} caption="Across suppliers" loading={false} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Featured Products</CardTitle>
            <p className="text-sm text-muted-foreground">Fresh listings available for wholesale purchasing</p>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <ProductGridSkeleton />
            ) : featured.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {featured.map((product) => (
                  <BuyerProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState icon={Package} title="No products available" description="Active supplier products will appear here." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Status</CardTitle>
            <p className="text-sm text-muted-foreground">Current procurement flow</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {buyerStatuses.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">{item.label}</span>
                <Badge variant="secondary" className="rounded-md">{item.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Popular Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : categories.length ? (
              <div className="grid gap-2">
                {categories.slice(0, 6).map((category) => (
                  <Link key={category.id} to={`/products?category=${category.slug}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/60">
                    <span className="text-sm font-medium">{category.name}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={FolderTree} title="No categories" description="Categories will appear once the catalog is configured." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommended Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productsLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : recommended.length ? (
              recommended.map((product) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:bg-muted/60">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.supplierName ?? "Supplier"} · MOQ {product.minimumOrderQuantity}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold">{formatCurrency(product.unitPrice)}</span>
                </Link>
              ))
            ) : (
              <EmptyState icon={ShoppingBag} title="No recommendations" description="More products will appear as the catalog grows." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : recentOrders.length ? (
              <div className="divide-y rounded-lg border">
                {recentOrders.map((order) => (
                  <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/60">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.supplierName ?? "Supplier"} · {formatDate(order.orderedAt)}</p>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon={RotateCcw} title="No orders yet" description="Your order history and quick reorder list will appear here." />
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
}: {
  title: string;
  value: string;
  caption: string;
  icon: typeof Package;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          {loading ? <Skeleton className="mt-3 h-8 w-24" /> : <p className="mt-2 text-2xl font-semibold">{value}</p>}
          <p className="mt-1 truncate text-xs text-muted-foreground">{caption}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function BuyerMetric({
  icon: Icon,
  label,
  value,
  caption,
  loading,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  caption: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-2 h-7 w-16" /> : <p className="mt-1 text-2xl font-semibold">{value}</p>}
          <p className="truncate text-xs text-muted-foreground">{caption}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BuyerProductCard({
  product,
}: {
  product: {
    name: string;
    slug: string;
    image: string | null;
    categoryName: string | null;
    unitPrice: unknown;
    unitType: string;
    minimumOrderQuantity: number;
  };
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="aspect-[4/3] bg-muted">
        <ProductImage src={product.image} alt={product.name} />
      </div>
      <div className="space-y-3 p-3">
        <div className="min-w-0">
          <Link to={`/products/${product.slug}`} className="line-clamp-1 text-sm font-medium hover:text-primary">
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{product.categoryName ?? "Uncategorized"}</p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{formatCurrency(product.unitPrice)}</p>
            <p className="text-xs text-muted-foreground">MOQ {product.minimumOrderQuantity} {unitLabels[product.unitType] ?? product.unitType}</p>
          </div>
          <Link to={`/products/${product.slug}`}>
            <Button size="sm" variant="outline">View</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  return src && !failed ? (
    <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-700 dark:from-emerald-950/30 dark:to-sky-950/30 dark:text-emerald-200">
      <Package className="h-10 w-10" />
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-56 w-full" />
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Package;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
      <Icon className="mb-4 h-10 w-10 text-muted-foreground/50" />
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
