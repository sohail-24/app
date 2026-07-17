import { useMemo, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  ClipboardList,
  History,
  MapPin,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusConfig: Record<string, { label: string; className: string }> = {
  in_stock: {
    label: "In Stock",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-200",
  },
};

type InventoryItem = {
  id: number;
  productId: number;
  productName: string | null;
  productImage: string | null;
  supplierName: string | null;
  warehouseLocation: string | null;
  batchNumber: string | null;
  receivedDate: Date | null;
  lastCountedAt: Date | null;
  updatedAt: Date;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderLevel: number;
  status: string;
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const inventoryQuery = trpc.inventory.list.useQuery(
    { status: status !== "all" ? status : undefined },
    { retry: false },
  );
  const statsQuery = trpc.inventory.stats.useQuery(undefined, { retry: false });

  const inventory = inventoryQuery.data ?? [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inventory;
    return inventory.filter((item) =>
      [item.productName, item.supplierName, item.warehouseLocation, item.batchNumber]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [inventory, search]);

  const lowStockItems = filtered.filter((item) => item.status === "low_stock" || item.status === "out_of_stock");
  const totalAvailable = filtered.reduce((total, item) => total + (item.quantityAvailable ?? 0), 0);
  const reserved = filtered.reduce((total, item) => total + (item.quantityReserved ?? 0), 0);

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track availability, low-stock risk, warehouse placement, and stock movements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Stock Item
            </Button>
          </Link>
          <Button variant="outline">
            <ClipboardList className="mr-2 h-4 w-4" />
            Cycle Count
          </Button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <InventoryMetric label="Inventory Value" value={formatCurrency(statsQuery.data?.totalValue ?? 0)} loading={statsQuery.isLoading} icon={Warehouse} />
        <InventoryMetric label="Tracked Items" value={formatNumber(statsQuery.data?.totalItems ?? 0)} loading={statsQuery.isLoading} icon={Package} />
        <InventoryMetric label="Available Units" value={formatNumber(totalAvailable)} loading={inventoryQuery.isLoading} icon={ArrowUpRight} />
        <InventoryMetric label="Reserved Units" value={formatNumber(reserved)} loading={inventoryQuery.isLoading} icon={ArrowDownLeft} />
        <InventoryMetric label="Low Stock" value={formatNumber(statsQuery.data?.lowStock ?? 0)} loading={statsQuery.isLoading} icon={AlertTriangle} />
      </section>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, warehouse, batch, supplier..."
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full lg:w-[190px]">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="w-full justify-start overflow-x-auto rounded-lg border bg-card p-1 sm:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock-in">Stock In</TabsTrigger>
          <TabsTrigger value="stock-out">Stock Out</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <InventoryTable items={filtered} loading={inventoryQuery.isLoading} />
        </TabsContent>
        <TabsContent value="stock-in">
          <MovementPanel
            icon={ArrowDownLeft}
            title="Stock In"
            description="Recently received batches and supplier replenishments."
            items={filtered.filter((item) => item.receivedDate || item.quantityOnHand > 0)}
            loading={inventoryQuery.isLoading}
            mode="in"
          />
        </TabsContent>
        <TabsContent value="stock-out">
          <MovementPanel
            icon={ArrowUpRight}
            title="Stock Out"
            description="Reserved and committed stock for active orders."
            items={filtered.filter((item) => item.quantityReserved > 0)}
            loading={inventoryQuery.isLoading}
            mode="out"
          />
        </TabsContent>
        <TabsContent value="adjustments">
          <MovementPanel
            icon={SlidersHorizontal}
            title="Adjustments"
            description="Stock records that need count review or reorder planning."
            items={filtered.filter((item) => item.quantityOnHand <= item.reorderLevel || item.lastCountedAt)}
            loading={inventoryQuery.isLoading}
            mode="adjust"
          />
        </TabsContent>
        <TabsContent value="transfers">
          <MovementPanel
            icon={ArrowRightLeft}
            title="Transfers"
            description="Warehouse placement and batch movement overview."
            items={filtered.filter((item) => item.warehouseLocation)}
            loading={inventoryQuery.isLoading}
            mode="transfer"
          />
        </TabsContent>
        <TabsContent value="history">
          <MovementPanel
            icon={History}
            title="Inventory History"
            description="Latest count, receipt, and update events."
            items={filtered}
            loading={inventoryQuery.isLoading}
            mode="history"
          />
        </TabsContent>
        <TabsContent value="low-stock">
          <InventoryTable items={lowStockItems} loading={inventoryQuery.isLoading} emptyTitle="No low-stock items" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InventoryMetric({
  label,
  value,
  loading,
  icon: Icon,
}: {
  label: string;
  value: string;
  loading: boolean;
  icon: typeof Package;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-3 h-7 w-24" /> : <p className="mt-2 truncate text-2xl font-semibold">{value}</p>}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryTable({
  items,
  loading,
  emptyTitle = "No inventory records found",
}: {
  items: InventoryItem[];
  loading: boolean;
  emptyTitle?: string;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card>
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
          <Warehouse className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="font-semibold">{emptyTitle}</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Inventory records will appear here once products and warehouse stock are available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Product</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>On Hand</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Reorder</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4">Last Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pl-4">
                  <div className="flex min-w-[240px] items-center gap-3">
                    <InventoryImage src={item.productImage} alt={item.productName ?? "Product"} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.productName ?? `Product #${item.productId}`}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.supplierName ?? "Unknown supplier"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {item.warehouseLocation ?? "Unassigned"}
                  </span>
                </TableCell>
                <TableCell>{formatNumber(item.quantityOnHand)}</TableCell>
                <TableCell>{formatNumber(item.quantityReserved)}</TableCell>
                <TableCell className="font-medium">{formatNumber(item.quantityAvailable)}</TableCell>
                <TableCell>{formatNumber(item.reorderLevel)}</TableCell>
                <TableCell>
                  <InventoryStatus status={item.status} />
                </TableCell>
                <TableCell className="pr-4">{formatDate(item.lastCountedAt ?? item.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InventoryImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {src && !failed ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 text-emerald-700 dark:from-emerald-950/30 dark:to-sky-950/30 dark:text-emerald-200">
          <Package className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function MovementPanel({
  icon: Icon,
  title,
  description,
  items,
  loading,
  mode,
}: {
  icon: typeof Package;
  title: string;
  description: string;
  items: InventoryItem[];
  loading: boolean;
  mode: "in" | "out" | "adjust" | "transfer" | "history";
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {items.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.productName ?? `Product #${item.productId}`}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.warehouseLocation ?? "Unassigned warehouse"}</p>
                  </div>
                  <InventoryStatus status={item.status} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <Mini label="On hand" value={formatNumber(item.quantityOnHand)} />
                  <Mini label={mode === "out" ? "Reserved" : "Available"} value={formatNumber(mode === "out" ? item.quantityReserved : item.quantityAvailable)} />
                  <Mini label="Reorder" value={formatNumber(item.reorderLevel)} />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {mode === "history"
                    ? `Updated ${formatDate(item.updatedAt)}`
                    : mode === "in"
                      ? `Received ${formatDate(item.receivedDate)}`
                      : `Batch ${item.batchNumber ?? "not assigned"}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <TrendingDown className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <h3 className="font-semibold">No matching stock movements</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Matching inventory events will be grouped here as stock is received, reserved, counted, or transferred.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InventoryStatus({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.in_stock;
  return <Badge className={`rounded-md ${config.className}`}>{config.label}</Badge>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
