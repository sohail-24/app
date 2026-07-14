import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useGuestCart } from "@/lib/guestCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Package,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Store,
} from "lucide-react";

export default function Cart() {
  const { user } = useAuth();
  const guestCart = useGuestCart();
  const isAuthenticated = !!user;
  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const utils = trpc.useUtils();

  const updateMutation = trpc.cart.update.useMutation({
    onSuccess: () => utils.cart.list.invalidate(),
  });
  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.list.invalidate(),
  });
  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => utils.cart.list.invalidate(),
  });

  const items = isAuthenticated ? (cartQuery.data?.items ?? []) : guestCart.items;
  const total = isAuthenticated ? (cartQuery.data?.total ?? 0) : guestCart.total;
  const isLoading = isAuthenticated && cartQuery.isLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Review and manage your items before checkout
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              isAuthenticated ? clearMutation.mutate() : guestCart.clear()
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Browse our catalog and add products to your cart
            </p>
            <Link to="/products">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Store className="mr-2 h-4 w-4" />
                Browse Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const unitPrice = parseFloat(item.unitPrice?.toString() ?? "0");
              const itemTotal = unitPrice * item.quantity;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.productImage ? (
                          <img
                            src={item.productImage ?? undefined}
                            alt={item.productName ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/products/${item.productSlug}`}
                              className="font-medium text-sm hover:text-emerald-600 transition-colors"
                            >
                              {item.productName}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.productUnitSize}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                            onClick={() =>
                              isAuthenticated
                                ? removeMutation.mutate({ cartItemId: item.id })
                                : guestCart.remove(item.productId)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                isAuthenticated
                                  ? updateMutation.mutate({
                                      cartItemId: item.id,
                                      quantity: Math.max(1, item.quantity - 1),
                                    })
                                  : guestCart.update(
                                      item.productId,
                                      Math.max(1, item.quantity - 1),
                                    )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                isAuthenticated
                                  ? updateMutation.mutate({
                                      cartItemId: item.id,
                                      quantity: item.quantity + 1,
                                    })
                                  : guestCart.update(
                                      item.productId,
                                      item.quantity + 1,
                                    )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold">
                            ${itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-emerald-600">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-emerald-600">Calculated at checkout</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-emerald-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <Link to="/checkout">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
