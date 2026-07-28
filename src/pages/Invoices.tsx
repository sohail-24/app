import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { PageHeader } from "@/components/freshflow/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, FileText, Search } from "lucide-react";

type InvoiceStatus = "generated";

type InvoiceSummary = {
  id: number;
  invoiceNumber: string;
  orderNumber: string;
  status: InvoiceStatus;
  invoiceDate: Date;
  customerName: string;
  totalAmount: unknown;
};

const pageSize = 10;

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const invoicesQuery = trpc.invoice.list.useQuery(
    {
      search: search.trim() || undefined,
      status: status === "all" ? undefined : status,
      page,
      size: pageSize,
    },
    { retry: false },
  );

  const invoices = (invoicesQuery.data?.items ?? []) as InvoiceSummary[];
  const total = invoicesQuery.data?.total ?? 0;
  const hasNextPage = page * pageSize < total;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
      <PageHeader backTo="/dashboard" backLabel="Back to Dashboard" title="Invoices" />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search invoice, customer, or order..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as InvoiceStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="generated">Generated</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {invoicesQuery.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load invoices</AlertTitle>
          <AlertDescription>{invoicesQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {invoicesQuery.isLoading ? (
        <InvoiceListSkeleton />
      ) : invoices.length ? (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{invoice.orderNumber}</TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell><InvoiceStatusBadge status={invoice.status} /></TableCell>
                        <TableCell className="text-right">
                          <Link to={`/invoices/${invoice.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-3 p-3 md:hidden">
                {invoices.map((invoice) => (
                  <InvoiceCard key={invoice.id} invoice={invoice} />
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Showing {invoices.length} of {total} invoices
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
        <EmptyInvoices />
      )}
    </div>
  );
}

function InvoiceCard({ invoice }: { invoice: InvoiceSummary }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="rounded-lg border bg-muted/20 p-3 text-sm">
          <p>Order: {invoice.orderNumber}</p>
          <p>Date: {formatDate(invoice.invoiceDate)}</p>
          <p className="font-medium">Total: {formatCurrency(invoice.totalAmount)}</p>
        </div>
        <Link to={`/invoices/${invoice.id}`}>
          <Button variant="outline" size="sm">View Invoice</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge className="rounded-md capitalize">{status}</Badge>;
}

function EmptyInvoices() {
  return (
    <Card>
      <CardContent className="flex min-h-[260px] flex-col items-center justify-center p-8 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="font-semibold">No invoices found.</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Generated invoices for delivered orders will appear here.
        </p>
      </CardContent>
    </Card>
  );
}

function InvoiceListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28" />
      ))}
    </div>
  );
}
