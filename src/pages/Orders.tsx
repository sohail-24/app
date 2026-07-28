import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { getAppRole } from "@/lib/roles";
import { PageHeader } from "@/components/freshflow/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Calendar, ClipboardList, Search } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type DeliveryEstimate =
  | "same_day"
  | "next_day"
  | "within_2_days"
  | "within_3_5_days";

type OrderSummary = {
  id: number;
  orderNumber: string;
  totalAmount: unknown;
  status: OrderStatus;
  deliveryEstimate: DeliveryEstimate | null;
  orderedAt: Date;
  relatedCompanyName: string | null;
  itemCount: number;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  ready_for_dispatch: "Ready for Dispatch",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const deliveryLabels: Record<DeliveryEstimate, string> = {
  same_day: "Same Day",
  next_day: "Next Day",
  within_2_days: "Within 2 Days",
  within_3_5_days: "Within 3-5 Days",
};

const pageSize = 10;

export default function Orders() {
  const { user } = useAuth();
  const ownerMode = getAppRole(user) !== "buyer";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | "all">("all");
  const [page, setPage] = useState(1);

  const ordersQuery = trpc.order.list.useQuery(
    {
      type: ownerMode ? "supplier" : "buyer",
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
      deliveryEstimate: deliveryEstimate === "all" ? undefined : deliveryEstimate,
      page,
      size: pageSize,
    },
    { retry: false, refetchInterval: ownerMode ? 10000 : false },
  );

  const orders = (ordersQuery.data?.items ?? []) as OrderSummary[];
  const total = ordersQuery.data?.total ?? 0;
  const hasNextPage = page * pageSize < total;

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <PageHeader backTo="/dashboard" backLabel="Back to Dashboard" title={ownerMode ? "Orders" : "My Orders"} />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search Orders..."
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(value) => { setStatus(value as OrderStatus | "all"); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={deliveryEstimate} onValueChange={(value) => { setDeliveryEstimate(value as DeliveryEstimate | "all"); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Delivery" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Delivery</SelectItem>
              {Object.entries(deliveryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {ordersQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load orders</AlertTitle>
          <AlertDescription>{ordersQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {ordersQuery.isLoading ? (
        <OrderListSkeleton />
      ) : orders.length ? (
        <>
          {ownerMode ? (
            <OwnerOrdersTable orders={orders} />
          ) : (
            <div className="grid gap-3">
              {orders.map((order) => <BuyerOrderCard key={order.id} order={order} />)}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {orders.length} of {total} orders
            </p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Previous
              </Button>
              <Button variant="outline" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function OwnerOrdersTable({ orders }: { orders: OrderSummary[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.relatedCompanyName ?? "Customer"}</TableCell>
                  <TableCell>{order.itemCount}</TableCell>
                  <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                  <TableCell>{formatDelivery(order.deliveryEstimate)}</TableCell>
                  <TableCell>{formatDate(order.orderedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="grid gap-3 p-3 md:hidden">
          {orders.map((order) => <BuyerOrderCard key={order.id} order={order} customerLabel="Customer" />)}
        </div>
      </CardContent>
    </Card>
  );
}

function BuyerOrderCard({ order, customerLabel = "Supplier" }: { order: OrderSummary; customerLabel?: string }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Order #{order.orderNumber}</h2>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(order.orderedAt)}
            </p>
          </div>
          <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
        </div>
        <div className="rounded-lg border bg-muted/20 p-3 text-sm">
          <p className="font-medium">{customerLabel}: {order.relatedCompanyName ?? "Not set"}</p>
          <p className="text-muted-foreground">Items: {order.itemCount}</p>
          <p className="text-muted-foreground">Delivery: {formatDelivery(order.deliveryEstimate)}</p>
        </div>
        <Link to={`/orders/${order.id}`}>
          <Button variant="outline" size="sm">
            <ClipboardList className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={status === "cancelled" ? "destructive" : status === "delivered" ? "default" : "secondary"} className="rounded-md">
      {statusLabels[status]}
    </Badge>
  );
}

function formatDelivery(value: DeliveryEstimate | null) {
  return value ? deliveryLabels[value] : "Not set";
}

function EmptyOrders() {
  return (
    <Card>
      <CardContent className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
        <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="font-semibold">No orders found.</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Orders matching the current filters will appear here.
        </p>
      </CardContent>
    </Card>
  );
}

function OrderListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28" />
      ))}
    </div>
  );
}
