import { useParams } from "react-router";
import type { ElementType, ReactNode } from "react";
import { trpc } from "@/providers/trpc";
import { formatCurrency, formatDate } from "@/lib/i18n";
import { PageHeader } from "@/components/freshflow/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Building2, FileText, Printer, User } from "lucide-react";

type InvoiceItem = {
  id: number;
  productName: string;
  quantity: number;
  unitType: string;
  unitPrice: unknown;
  totalPrice: unknown;
};

type InvoiceDetailData = {
  id: number;
  invoiceNumber: string;
  orderNumber: string;
  status: "generated";
  invoiceDate: Date;
  companyName: string;
  companyPhone: string | null;
  companyAddress: string | null;
  customerName: string;
  customerPhone: string | null;
  billingAddress: string | null;
  subtotal: unknown;
  totalAmount: unknown;
  items: InvoiceItem[];
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const invoiceId = Number(id ?? 0);
  const invoiceQuery = trpc.invoice.detail.useQuery({ invoiceId }, { enabled: invoiceId > 0, retry: false });
  const invoice = invoiceQuery.data as InvoiceDetailData | undefined;

  if (invoiceQuery.isLoading) {
    return <InvoiceDetailSkeleton />;
  }

  if (!invoice || invoiceQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load invoice</AlertTitle>
          <AlertDescription>{invoiceQuery.error?.message ?? "Invoice not found."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 print:max-w-none">
      <PageHeader
        backTo="/invoices"
        backLabel="Back to Invoices"
        title={`Invoice ${invoice.invoiceNumber}`}
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        }
      />

      <Card className="print:border-0 print:shadow-none">
        <CardContent className="space-y-6 p-5 sm:p-8">
          <section className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-semibold">{invoice.invoiceNumber}</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Order {invoice.orderNumber}</p>
            </div>
            <div className="text-left sm:text-right">
              <Badge className="rounded-md capitalize">{invoice.status}</Badge>
              <p className="mt-2 text-sm text-muted-foreground">{formatDate(invoice.invoiceDate)}</p>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <SnapshotCard icon={Building2} title="Company Information">
              <ReadOnly label="Company" value={invoice.companyName} />
              <ReadOnly label="Contact Number" value={invoice.companyPhone} />
              <ReadOnly label="Address" value={invoice.companyAddress} />
            </SnapshotCard>
            <SnapshotCard icon={User} title="Customer Information">
              <ReadOnly label="Customer" value={invoice.customerName} />
              <ReadOnly label="Phone Number" value={invoice.customerPhone} />
              <ReadOnly label="Billing Address" value={invoice.billingAddress} />
            </SnapshotCard>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">Product Line Items</h2>
            <div className="hidden overflow-x-auto rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.unitType}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {invoice.items.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unitType} x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="ml-auto w-full max-w-sm space-y-2">
            <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            <Separator />
            <SummaryRow label="Grand Total" value={formatCurrency(invoice.totalAmount)} strong />
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

function SnapshotCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">{children}</CardContent>
    </Card>
  );
}

function ReadOnly({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value || "Not set"}</p>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InvoiceDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-[620px]" />
    </div>
  );
}
