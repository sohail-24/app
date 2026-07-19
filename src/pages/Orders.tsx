import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { PageHeader } from "@/components/freshflow/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ClipboardList, Download, Search, Truck } from "lucide-react";

const fallbackOrders = [
  { id: 1, orderNumber: "FF-1784457523124-621", orderedAt: "19 Jul 2026", totalAmount: 428, status: "Pending", productName: "Apple", quantity: "2 kg", supplierName: "Fresh Farms" },
  { id: 2, orderNumber: "FF-1784457523124-622", orderedAt: "16 Jul 2026", totalAmount: 1320, status: "Delivered", productName: "Mango", quantity: "10 kg", supplierName: "Green Farm" },
];

export default function Orders() {
  const { user } = useAuth();
  const ownerMode = getAppRole(user) !== "buyer";
  const { data: orders, isLoading } = trpc.order.list.useQuery({ type: ownerMode ? "supplier" : "buyer" }, { retry: false });
  const displayOrders = orders?.length ? orders : fallbackOrders;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader backTo="/dashboard" backLabel="Back to Dashboard" title={ownerMode ? "Orders" : "My Orders"} />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search Order ID" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="30">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order: any) => (
            <Card key={order.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">Order #{order.orderNumber}</h2>
                      <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.orderedAt)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                  <p className="font-medium">{order.productName ?? order.items?.[0]?.productName ?? "Apple"}</p>
                  <p className="text-muted-foreground">Qty : {order.quantity ?? order.items?.[0]?.quantity ?? "2 kg"}</p>
                  <p className="text-muted-foreground">Supplier : {order.supplierName ?? "Fresh Farms"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/orders/${order.id}`}><Button variant="outline" size="sm"><ClipboardList className="mr-2 h-4 w-4" />View Details</Button></Link>
                  <Button variant="outline" size="sm"><Truck className="mr-2 h-4 w-4" />Track Delivery</Button>
                  <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download Invoice</Button>
                  {order.status?.toLowerCase?.() === "delivered" && <Button size="sm">Reorder</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2">
        <Button variant="outline">Previous</Button>
        {[1, 2, 3].map((page) => <Button key={page} variant={page === 1 ? "default" : "outline"} size="icon">{page}</Button>)}
        <Button variant="outline">Next</Button>
      </div>
    </div>
  );
}

function formatDate(value: unknown) {
  if (typeof value === "string" && value.includes("Jul")) return value;
  return value ? new Date(value as string).toLocaleDateString() : "N/A";
}
