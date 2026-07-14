import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Warehouse,
  AlertTriangle,
  Package,
  Search,
  MapPin,
  TrendingDown,
  Boxes,
} from "lucide-react";

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  in_stock: { color: "bg-emerald-100 text-emerald-700", icon: Package, label: "In Stock" },
  low_stock: { color: "bg-amber-100 text-amber-700", icon: AlertTriangle, label: "Low Stock" },
  out_of_stock: { color: "bg-red-100 text-red-700", icon: TrendingDown, label: "Out of Stock" },
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: inventory, isLoading } = trpc.inventory.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: stats } = trpc.inventory.stats.useQuery(undefined, { retry: false });

  const filtered = inventory?.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.productName?.toLowerCase().includes(q) ?? false
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Track stock levels and manage your warehouse
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: stats?.totalItems ?? 0, icon: Boxes, color: "text-blue-600" },
          { label: "In Stock", value: (stats?.totalItems ?? 0) - (stats?.lowStock ?? 0) - (stats?.outOfStock ?? 0), icon: Package, color: "text-emerald-600" },
          { label: "Low Stock", value: stats?.lowStock ?? 0, icon: AlertTriangle, color: "text-amber-600" },
          { label: "Out of Stock", value: stats?.outOfStock ?? 0, icon: TrendingDown, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{s.value}</p>
                </div>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "in_stock", "low_stock", "out_of_stock"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {s === "all" ? "All" : statusConfig[s]?.label ?? s}
            </Button>
          ))}
        </div>
      </div>

      {/* Inventory List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((item) => {
            const config = statusConfig[item.status] ?? statusConfig.in_stock;
            const StatusIcon = config.icon;
            const qty = item.quantityOnHand ?? 0;
            const reserved = item.quantityReserved ?? 0;
            const available = item.quantityAvailable ?? 0;
            const reorder = item.reorderLevel ?? 0;

            return (
              <Card key={item.id} className="hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {item.productName ?? `Product #${item.productId}`}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.warehouseLocation ?? "N/A"}
                          </span>
                          <span>{item.supplierName ?? "Unknown Supplier"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">On Hand</p>
                            <p className="font-semibold">{qty}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Reserved</p>
                            <p className="font-semibold">{reserved}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Available</p>
                            <p className="font-semibold text-emerald-600">{available}</p>
                          </div>
                        </div>
                        {/* Stock bar */}
                        <div className="mt-2 h-1.5 w-32 bg-muted rounded-full overflow-hidden ml-auto">
                          <div
                            className={`h-full rounded-full ${
                              item.status === "in_stock"
                                ? "bg-emerald-500"
                                : item.status === "low_stock"
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(100, (qty / (reorder * 3 || 100)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <Badge className={`${config.color} shrink-0`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Warehouse className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No inventory found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? "Try a different search term" : "Inventory records will appear here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
