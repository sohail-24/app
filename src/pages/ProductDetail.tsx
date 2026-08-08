import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem } from "@/lib/guestCart";
import { formatCurrency, toNumber, unitLabels } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Heart, Minus, Package, Plus, Share2, ShoppingCart, Zap } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { data, isLoading, isError, error } = trpc.product.bySlug.useQuery({ slug: slug! }, { enabled: !!slug, retry: false });
  const relatedQuery = trpc.product.featured.useQuery({ limit: 5 }, { retry: false });
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });
  const product = data;
  const minQty = product?.minimumOrderQuantity ?? 1;
  const stock = product?.stock ?? 0;
  const isOutOfStock = stock < minQty;
  const price = toNumber(product?.unitPrice);
  const compareAt = toNumber(product?.compareAtPrice);
  const unit = product?.unitType ?? "kg";
  const discount = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;
  const related = useMemo(
    () => (relatedQuery.data ?? []).filter((item) => item.slug !== product?.slug).slice(0, 4),
    [product?.slug, relatedQuery.data],
  );

  useEffect(() => {
    setQuantity(minQty);
  }, [minQty]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  if (!product || isError) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-xl flex-col items-center justify-center text-center">
        <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h1 className="text-xl font-semibold">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error?.message ?? "This product may have been archived or is not available."}
        </p>
        <Link to="/products">
          <Button className="mt-5" variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }
  const currentProduct = product;

  function addProduct(destination?: string) {
    if (quantity > stock) {
      toast.error("Requested quantity exceeds available stock.");
      return;
    }
    if (user && data) {
      addToCart.mutate({ productId: data.id, quantity }, { onSuccess: () => destination && navigate(destination) });
      return;
    }

    addGuestCartItem({
      id: currentProduct.id,
      productId: currentProduct.id,
      productSlug: currentProduct.slug,
      productName: currentProduct.name,
      productImage: currentProduct.image ?? null,
      productUnitType: unit,
      productUnitSize: currentProduct.unitSize ?? unit,
      quantity,
      unitPrice: String(price),
    });
    toast.success("Product added to cart.");
    if (destination) navigate(destination);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 md:px-0">
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur px-4 py-3 -mx-4 mb-5 border-b md:static md:bg-transparent md:p-0 md:mx-0 md:mb-0 md:border-b md:pb-3 flex flex-wrap items-center justify-between gap-3">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Heart className="mr-2 h-4 w-4" />Wishlist</Button>
          <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" />Share</Button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="overflow-hidden rounded-xl border bg-muted">
          <div className="flex aspect-square items-center justify-center text-xl font-semibold text-muted-foreground">
            {product.image && !imageFailed ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
            ) : (
              <Package className="h-16 w-16" />
            )}
          </div>
        </div>

        <div className="space-y-5 md:space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{product.categoryName ?? "Uncategorized"}</Badge>
            <Badge variant="secondary">{product.grade ?? "Grade A"}</Badge>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">by {product.supplierName ?? "Supplier"}</p>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-emerald-700">{formatCurrency(price)}</span>
            <span className="text-sm text-muted-foreground">/ {unitLabels[unit] ?? unit}</span>
            {compareAt > 0 && <span className="text-lg text-muted-foreground line-through">{formatCurrency(compareAt)}</span>}
            {discount > 0 && <Badge>{discount}% OFF</Badge>}
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Stock : {product.stock ?? "Not set"} {unit}</p>
            <p>MOQ : {minQty} {unit}</p>
            <p>Origin: {product.origin ?? "Not set"}</p>
            <p>Grade: {product.grade ?? "Not set"}</p>
          </div>

          <div className="flex flex-col gap-3 mt-6 md:mt-0">
            <div className="flex flex-col gap-2 md:block md:space-y-2">
              <p className="text-sm font-medium hidden md:block">Quantity</p>
              <div className="flex items-center justify-between md:justify-start gap-4">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" className="h-10 w-10 shadow-sm" onClick={() => setQuantity(Math.max(minQty, quantity - 1))} disabled={quantity <= minQty || isOutOfStock}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-16 text-center font-semibold">{quantity} {unit}</span>
                  <Button variant="outline" size="icon" className="h-10 w-10 shadow-sm" onClick={() => {
                    if (quantity >= stock) {
                      toast.error(`Only ${stock} available.`);
                    } else {
                      setQuantity(quantity + 1);
                    }
                  }} disabled={isOutOfStock}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right md:mt-4 md:text-left">
                  <p className="text-sm text-muted-foreground md:hidden">Live Total</p>
                  <p className="text-lg font-bold text-foreground md:text-xl">Total : {formatCurrency(price * quantity)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:hidden mt-2">
              <Button variant="outline" className="h-12 bg-card" onClick={() => addProduct("/products")} disabled={isOutOfStock}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Add & Continue Shopping"}
              </Button>
              <Button variant="outline" className="h-12 bg-card" onClick={() => addProduct("/cart")} disabled={isOutOfStock}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart & Go to Cart"}
              </Button>
              <Button className="h-12 bg-primary hover:bg-primary/90" onClick={() => addProduct("/checkout")} disabled={isOutOfStock}>
                <Zap className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            </div>
            <div className="hidden md:grid gap-3 grid-cols-2 md:mt-4">
              <Button variant="outline" className="h-12 bg-card" onClick={() => addProduct()} disabled={isOutOfStock}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button className="h-12 bg-primary hover:bg-primary/90" onClick={() => addProduct("/checkout")} disabled={isOutOfStock}>
                <Zap className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <DetailSection title="Product Description">
        {product.description ?? "No description has been added for this product."}
      </DetailSection>
      <DetailSection title="Product Specifications">
        No specifications have been added for this product.
      </DetailSection>
      <DetailSection title="Supplier Information">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>Supplier Name: {product.supplierName ?? "Not set"}</p>
          <p>Address: {formatSupplierAddress(product)}</p>
          <p>Contact: {product.supplierPhone ?? "Not set"}</p>
          <p>Status: {product.inventoryStatus ?? product.status ?? "Not set"}</p>
        </div>
      </DetailSection>
      {related.length > 0 && (
        <DetailSection title="Related Products">
          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <Link key={item.slug} to={`/products/${item.slug}`} className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
                {item.name}
              </Link>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  );
}

function formatSupplierAddress(product: {
  supplierAddressLine1?: string | null;
  supplierAddressLine2?: string | null;
  supplierCity?: string | null;
  supplierState?: string | null;
  supplierPostalCode?: string | null;
  supplierCountry?: string | null;
}) {
  return [
    product.supplierAddressLine1,
    product.supplierAddressLine2,
    product.supplierCity,
    product.supplierState,
    product.supplierPostalCode,
    product.supplierCountry,
  ].filter(Boolean).join(", ") || "Not set";
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h2 className="font-semibold">{title}</h2>
        <div className="text-sm text-muted-foreground">{children}</div>
      </CardContent>
    </Card>
  );
}
