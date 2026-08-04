import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { citiesByState, indianStates } from "@/lib/freshflowData";
import { formatCurrency } from "@/lib/i18n";
import { isValidIndianMobileNumber } from "@/lib/utils";

import { PageHeader } from "@/components/freshflow/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, ShoppingCart, Truck } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const cartQuery = trpc.cart.list.useQuery(undefined, { retry: false });
  const profileQuery = trpc.profile.current.useQuery(undefined, { retry: false });
  const createOrder = trpc.order.create.useMutation({
    onSuccess: async (data) => {
      await Promise.all([
        utils.cart.list.invalidate(),
        utils.order.list.invalidate(),
        utils.order.recent.invalidate(),
        utils.order.stats.invalidate(),
        utils.inventory.list.invalidate(),
        utils.inventory.stats.invalidate(),
        utils.report.dashboardSummary.invalidate(),
      ]);
      navigate(`/orders/${data.orderId}`);
    },
    onError: (error) => toast.error(error.message || "Could not create order."),
  });
  const [form, setForm] = useState({
    contactName: "",
    mobileNumber: "",
    state: "Telangana",
    city: "Hyderabad",
    address: "",
    landmark: "",
    slot: "",
    notes: "",
    confirmAddress: false,
    agreeTerms: false,
  });
  const hasAutoFilled = useRef(false);
  useEffect(() => {
    if (profileQuery.data && !hasAutoFilled.current) {
      setForm((prev) => ({
        ...prev,
        contactName: prev.contactName || profileQuery.data.name || "",
        mobileNumber: prev.mobileNumber || profileQuery.data.phone || "",
        address: prev.address || profileQuery.data.addressLine1 || "",
        city: prev.city || profileQuery.data.city || "Hyderabad",
        state: prev.state || profileQuery.data.state || "Telangana",
      }));
      hasAutoFilled.current = true;
    }
  }, [profileQuery.data]);

  const cities = useMemo(() => citiesByState[form.state] ?? [], [form.state]);
  const items = cartQuery.data?.items ?? [];
  const subtotal = cartQuery.data?.total ?? 0;
  const quoteQuery = trpc.order.quote.useQuery(
    { shippingState: form.state },
    { enabled: items.length > 0 && !!form.state, retry: false },
  );
  const shippingAmount = quoteQuery.data?.shippingAmount ?? 0;
  const taxAmount = quoteQuery.data?.taxAmount ?? 0;
  const total = quoteQuery.data?.totalAmount ?? subtotal + shippingAmount + taxAmount;
  const deliveryUnavailable = quoteQuery.data ? !quoteQuery.data.deliveryAvailable : false;

  if (cartQuery.isLoading) {
    return <div className="py-16 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValidIndianMobileNumber(form.mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    createOrder.mutate({
      shippingAddressLine1: form.address,
      shippingCity: form.city,
      shippingState: form.state,
      shippingCountry: "IND",
      shippingMethod: form.slot || undefined,
      buyerNotes: form.notes || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader backTo="/cart" backLabel="Back to Cart" title="Checkout" />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Truck className="h-4 w-4" />Shipping Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person Name</Label>
                <Input id="contactName" value={form.contactName} onChange={(event) => setForm({ ...form, contactName: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input id="mobileNumber" value={form.mobileNumber} onChange={(event) => setForm({ ...form, mobileNumber: event.target.value })} required />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>State *</Label>
                <Select value={form.state} onValueChange={(state) => setForm({ ...form, state, city: citiesByState[state]?.[0] ?? "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Select value={form.city} onValueChange={(city) => setForm({ ...form, city })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea id="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input id="landmark" value={form.landmark} onChange={(event) => setForm({ ...form, landmark: event.target.value })} />
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Delivery Slot (Optional)</Label>
              <RadioGroup value={form.slot} onValueChange={(slot) => setForm({ ...form, slot })} className="grid gap-3 sm:grid-cols-3">
                {["Morning", "Afternoon", "Evening"].map((slot) => (
                  <Label key={slot} className="flex items-center gap-2 rounded-lg border p-3">
                    <RadioGroupItem value={slot} />
                    {slot}
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea id="notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </div>
            <Separator />
            <Label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.confirmAddress} onCheckedChange={(checked) => setForm({ ...form, confirmAddress: checked === true })} />
              I confirm the delivery address is correct.
            </Label>
            <Label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.agreeTerms} onCheckedChange={(checked) => setForm({ ...form, agreeTerms: checked === true })} />
              I agree to the Terms & Conditions.
            </Label>
            <Button type="submit" className="h-11 w-full bg-emerald-600 hover:bg-emerald-700" disabled={createOrder.isPending || quoteQuery.isLoading || deliveryUnavailable || !form.confirmAddress || !form.agreeTerms}>
              {createOrder.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Order
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-44 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted"><Package className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryRow label="Shipping" value={quoteQuery.isLoading ? "Calculating..." : formatCurrency(shippingAmount)} muted />
            <SummaryRow label="GST" value={quoteQuery.isLoading ? "Calculating..." : formatCurrency(taxAmount)} muted />
            {quoteQuery.data?.deliveryEstimate && (
              <SummaryRow label="Estimate" value={quoteQuery.data.deliveryEstimate.replaceAll("_", " ")} muted />
            )}
            {deliveryUnavailable && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Delivery is not available for the selected state.
              </div>
            )}
            <Separator />
            <SummaryRow label="Total" value={formatCurrency(total)} strong />
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function SummaryRow({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 text-sm ${strong ? "text-base font-semibold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={muted ? "text-muted-foreground" : ""}>{value}</span>
    </div>
  );
}
