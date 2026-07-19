import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { categories, productSamples } from "@/lib/freshflowData";
import { MetricCard } from "@/components/freshflow/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Bell,
  ChartNoAxesCombined,
  CheckCircle2,
  ClipboardList,
  FolderTree,
  IndianRupee,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

const ownerNav = [
  "Dashboard",
  "Product Catalog",
  "Categories",
  "Inventory",
  "Orders",
  "Customers",
  "Delivery Zones",
  "GST Rules",
  "Shipping Rules",
  "Coupons",
  "Reports",
  "Notifications",
  "Staff",
  "Settings",
];

const ownerStats = [
  ["Products", "120", Package],
  ["Orders", "42", ClipboardList],
  ["Customers", "18", Users],
  ["Revenue", "₹4,52,600", IndianRupee],
  ["Low Stock", "12", AlertTriangle],
  ["Pending PO", "8", ShoppingCart],
  ["Suppliers", "25", Truck],
  ["Coupons", "3", Settings],
] as const;

export default function Dashboard() {
  const { user } = useAuth();
  const role = getAppRole(user);

  const productsQuery = trpc.product.list.useQuery(
    { status: role === "buyer" ? "active" : undefined, sortBy: "newest" },
    { retry: false },
  );
  const categoriesQuery = trpc.category.list.useQuery(undefined, { retry: false });
  const recentOrdersQuery = trpc.order.recent.useQuery({ limit: 5 }, { retry: false, enabled: !!user });

  if (role === "buyer") {
    return (
      <BuyerDashboard
        products={productsQuery.data ?? []}
        productsLoading={productsQuery.isLoading}
        categoryCount={categoriesQuery.data?.length ?? categories.length}
        recentOrders={recentOrdersQuery.data ?? []}
        ordersLoading={recentOrdersQuery.isLoading}
      />
    );
  }

  return <OwnerDashboard />;
}

function BuyerDashboard({
  products,
  productsLoading,
  categoryCount,
  recentOrders,
  ordersLoading,
}: {
  products: Array<{
    id: number;
    name: string;
    slug: string;
    categoryName: string | null;
    supplierName: string | null;
    unitPrice: unknown;
    unitType: string;
    minimumOrderQuantity: number;
  }>;
  productsLoading: boolean;
  categoryCount: number;
  recentOrders: Array<{ id: number; orderNumber: string; totalAmount: unknown; status: string; orderedAt: Date; supplierName: string | null }>;
  ordersLoading: boolean;
}) {
  const featured = products.length ? products.slice(0, 4) : productSamples;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
        <Badge variant="secondary" className="mb-3 rounded-md">Buyer Workspace</Badge>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Buy wholesale products, review recent orders, and continue to the product catalog.
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
          <Input className="h-12 rounded-lg pl-12 text-base" placeholder="Search products..." />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ShoppingCart} title="Cart Items" value="Backend" caption="Cart count placeholder" />
        <MetricCard icon={Truck} title="Pending Deliveries" value={formatNumber(recentOrders.filter((order) => order.status !== "delivered").length)} caption="From order history" loading={ordersLoading} />
        <MetricCard icon={FolderTree} title="Categories" value={formatNumber(categoryCount)} caption="Active catalog groups" />
        <MetricCard icon={ClipboardList} title="Recent Orders" value={formatNumber(recentOrders.length)} caption="Order history" loading={ordersLoading} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Featured Products</CardTitle>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-56" />)}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {featured.map((product) => (
                  <Link key={product.id} to={`/products/${product.slug}`} className="rounded-lg border bg-card p-3 shadow-sm hover:bg-muted/40">
                    <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted text-lg font-semibold text-muted-foreground">
                      {"icon" in product ? product.icon : product.name}
                    </div>
                    <div className="mt-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {"supplier" in product ? product.supplier : product.supplierName ?? "Supplier"} · MOQ {"moq" in product ? product.moq : product.minimumOrderQuantity}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-56" />
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
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">Order history will appear here.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function OwnerDashboard() {
  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="rounded-lg border bg-card p-3 shadow-sm">
        <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">Dashboard</p>
        <nav className="grid gap-1">
          {ownerNav.map((item) => (
            <Link
              key={item}
              to={ownerPath(item)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 space-y-6">
        <section className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome Back, Admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">Monitor your wholesale business from one place.</p>
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search..." />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ownerStats.map(([title, value, Icon]) => (
            <MetricCard key={title} title={title} value={value} icon={Icon} />
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ChartNoAxesCombined className="h-4 w-4" />
              Sales Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
              Weekly / Monthly Sales Chart placeholder
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-2">
          <DashboardList title="Recent Orders" items={["#ORD-1001   Pending", "#ORD-1002   Packed", "#ORD-1003   Delivered"]} />
          <DashboardList title="Low Stock Alerts" items={["Mango        Only 8 kg", "Apple        Only 12 kg", "Tomato       Only 15 kg"]} />
          <DashboardList title="Recent Customers" items={["Fresh Mart", "Green Wholesale", "Hyderabad Super Market"]} />
          <DashboardList title="Recent Notifications" items={["New Order Received", "Low Stock Alert", "Payment Received"]} icon={Bell} />
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {["Add Product", "Add Category", "Create Coupon", "Add Supplier", "Inventory", "Delivery Zone", "GST Settings", "Shipping Rule"].map((action) => (
              <Button key={action} variant="outline" className="justify-start">
                <Plus className="mr-2 h-4 w-4" />
                {action}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {["Database", "Server", "Payment", "WhatsApp API", "Email Service", "Storage"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{item}</span>
                <span className="inline-flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {item === "Storage" ? "Healthy" : item === "Server" ? "Running" : item === "Payment" ? "Active" : "Connected"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DashboardList({ title, items, icon: Icon }: { title: string; items: string[]; icon?: typeof Bell }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          {Icon && <Icon className="h-4 w-4" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y rounded-lg border">
          {items.map((item) => (
            <div key={item} className="px-3 py-2 text-sm">{item}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ownerPath(label: string) {
  const paths: Record<string, string> = {
    Dashboard: "/dashboard",
    "Product Catalog": "/products",
    Categories: "/categories",
    Inventory: "/inventory",
    Orders: "/orders",
    Reports: "/reports",
    Settings: "/settings",
  };
  return paths[label] ?? "/dashboard";
}
