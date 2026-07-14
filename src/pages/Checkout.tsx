import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  Package,
  ArrowLeft,
  CreditCard,
  Truck,
  Check,
  Loader2,
} from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const cartQuery = trpc.cart.list.useQuery(undefined, { retry: false });
  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      navigate(`/orders/${data.orderId}`);
    },
  });

  const [shipping, setShipping] = useState({
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "IND",
    method: "standard",
  });
  const [buyerNotes, setBuyerNotes] = useState("");

  const items = cartQuery.data?.items ?? [];
  const subtotal = cartQuery.data?.total ?? 0;
  const shippingCost = shipping.method === "express" ? 2500 : 1000;
  const tax = subtotal * 0.18;
  const total = subtotal + shippingCost + tax;

  if (cartQuery.isLoading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
        <p className="text-muted-foreground mt-4">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Add products to your cart before checking out
        </p>
        <Link to="/products">
          <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default supplier for order (server will validate)
    const supplierId = 1;
    createOrder.mutate({
      supplierId,
      shippingAddressLine1: shipping.addressLine1,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingPostalCode: shipping.postalCode,
      shippingCountry: shipping.country,
      shippingMethod: shipping.method === "express" ? "Express Shipping" : "Standard Shipping",
      buyerNotes: buyerNotes || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/cart"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Address Line 1</Label>
                  <Input
                    id="address"
                    value={shipping.addressLine1}
                    onChange={(e) =>
                      setShipping({ ...shipping, addressLine1: e.target.value })
                    }
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postal">Postal Code</Label>
                  <Input
                    id="postal"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping({ ...shipping, postalCode: e.target.value })
                    }
                    placeholder="400001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={shipping.country}
                    onValueChange={(v) => setShipping({ ...shipping, country: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IND">India</SelectItem>
                      <SelectItem value="ARE">United Arab Emirates</SelectItem>
                      <SelectItem value="GBR">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="method">Shipping Method</Label>
                <Select
                  value={shipping.method}
                  onValueChange={(v) => setShipping({ ...shipping, method: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      Standard Shipping ({formatCurrency(1000)}) - 5-7 business days
                    </SelectItem>
                    <SelectItem value="express">
                      Express Shipping ({formatCurrency(2500)}) - 2-3 business days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Order Notes (optional)</Label>
                <Input
                  id="notes"
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Special delivery instructions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(item.unitPrice?.toString() ?? "0") * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(total)}
                </span>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-emerald-500" />
                SSL Secure Checkout
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
