import { useState } from "react";
import type { ElementType, ReactNode } from "react";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertCircle,
  ClipboardList,
  FileText,
  IndianRupee,
  Package,
  Warehouse,
} from "lucide-react";

type ReportPeriod = "today" | "this_week" | "this_month";

type ProductPerformance = {
  productId: number;
  productName: string;
  quantitySold: number;
  revenue: number;
};

const periodLabels: Record<ReportPeriod, string> = {
  today: "Today",
  this_week: "This Week",
  this_month: "This Month",
};

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>("today");
  const summaryQuery = trpc.report.businessSummary.useQuery({ period }, { retry: false });
  const summary = summaryQuery.data;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard / Reports</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Reports</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Read-only business intelligence from products, inventory, orders, and invoices.
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Reporting period" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(periodLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {summaryQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load reports</AlertTitle>
          <AlertDescription>{summaryQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {summaryQuery.isLoading ? (
        <ReportsSkeleton />
      ) : summary ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard title="Revenue" value={formatCurrency(summary.dashboard.revenue)} description={periodLabels[period]} icon={IndianRupee} />
            <KpiCard title="Orders" value={formatNumber(summary.dashboard.orders)} description="Orders received" icon={ClipboardList} />
            <KpiCard title="Products" value={formatNumber(summary.dashboard.products)} description="Catalog products" icon={Package} />
            <KpiCard title="Inventory" value={formatNumber(summary.dashboard.inventory)} description="Available stock" icon={Warehouse} />
            <KpiCard title="Invoices" value={formatNumber(summary.dashboard.invoices)} description="Generated invoices" icon={FileText} />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ReportCard title="Sales Report" description="Revenue, order count, and average order value.">
              <MetricRow label="Total Sales" value={formatCurrency(summary.sales.revenue)} />
              <MetricRow label="Number of Orders" value={formatNumber(summary.sales.orderCount)} />
              <MetricRow label="Average Order Value" value={formatCurrency(summary.sales.averageOrderValue)} />
            </ReportCard>

            <ReportCard title="Order Report" description="Operational order status summary.">
              <MetricRow label="Total Orders" value={formatNumber(summary.orders.totalOrders)} />
              <MetricRow label="Pending Orders" value={formatNumber(summary.orders.pendingOrders)} />
              <MetricRow label="Confirmed Orders" value={formatNumber(summary.orders.confirmedOrders)} />
              <MetricRow label="Delivered Orders" value={formatNumber(summary.orders.deliveredOrders)} />
            </ReportCard>

            <ReportCard title="Inventory Report" description="Available stock and restocking signals.">
              <MetricRow label="Available Stock" value={formatNumber(summary.inventory.availableStock)} />
              <MetricRow label="Low Stock Products" value={formatNumber(summary.inventory.lowStockProducts)} />
              <MetricRow label="Out of Stock Products" value={formatNumber(summary.inventory.outOfStockProducts)} />
              <LowStockList items={summary.inventory.lowStockItems} />
            </ReportCard>

            <ReportCard title="Invoice Report" description="Invoice counts and financial invoice activity.">
              <MetricRow label="Total Invoices" value={formatNumber(summary.invoices.totalInvoices)} />
              <MetricRow label="Daily Invoice Count" value={formatNumber(summary.invoices.dailyInvoiceCount)} />
              <MetricRow label="Monthly Invoice Count" value={formatNumber(summary.invoices.monthlyInvoiceCount)} />
              <MetricRow label="Invoice Total" value={formatCurrency(summary.invoices.invoiceTotal)} />
            </ReportCard>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ProductTable title="Best Selling Products" products={summary.products.bestSellingProducts} empty="No best-selling product data available." />
            <ProductTable title="Least Selling Products" products={summary.products.leastSellingProducts} empty="No slow-moving product data available." />
          </section>

          <ReportCard title="Recent Invoices" description="Latest generated financial records.">
            {summary.invoices.recentInvoices.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.invoices.recentInvoices.map((invoice) => (
                      <TableRow key={invoice.invoiceNumber}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyInline message="No invoice data available." />
            )}
          </ReportCard>
        </>
      ) : (
        <EmptyInline message="No report data available." />
      )}
    </div>
  );
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[120px] items-start justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function ReportCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function LowStockList({
  items,
}: {
  items: Array<{ productId: number; productName: string | null; availableStock: number; status: string }>;
}) {
  if (!items.length) {
    return <EmptyInline message="No low stock items." />;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Low Stock Items</p>
      {items.map((item) => (
        <div key={item.productId} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
          <span>{item.productName ?? "Product"}</span>
          <Badge variant="secondary" className="rounded-md">{formatNumber(item.availableStock)} available</Badge>
        </div>
      ))}
    </div>
  );
}

function ProductTable({
  title,
  products,
  empty,
}: {
  title: string;
  products: ProductPerformance[];
  empty: string;
}) {
  return (
    <ReportCard title={title} description="Product rankings based on sold quantity.">
      {products.length ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={`${title}-${product.productId}`}>
                  <TableCell className="font-medium">{product.productName}</TableCell>
                  <TableCell>{formatNumber(product.quantitySold)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyInline message={empty} />
      )}
    </ReportCard>
  );
}

function EmptyInline({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-72" />
        ))}
      </div>
    </div>
  );
}
