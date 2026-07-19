import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem } from "@/lib/guestCart";
import { productSamples } from "@/lib/freshflowData";
import { formatCurrency, toNumber, unitLabels } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Heart, Minus, Package, Plus, Share2, ShoppingCart, Zap } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imageFailed, setImageFailed] = useState(false);
  const { data, isLoading } = trpc.product.bySlug.useQuery({ slug: slug! }, { enabled: !!slug, retry: false });
  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: async () => {
      await utils.cart.list.invalidate();
      toast.success("Product added to cart.");
    },
    onError: (error) => toast.error(error.message || "Could not add product to cart."),
  });
  const fallback = productSamples.find((item) => item.slug === slug) ?? productSamples[0];
  const product: any = data ?? fallback;
  const minQty = product.minimumOrderQuantity ?? product.moq ?? 1;
  const [quantity, setQuantity] = useState(minQty);
  const price = toNumber(product.unitPrice ?? product.price);
  const compareAt = toNumber(product.compareAtPrice ?? product.compareAt);
  const unit = product.unitType ?? product.unit ?? "kg";
  const discount = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 15;
  const related = useMemo(() => productSamples.filter((item) => item.slug !== product.slug), [product.slug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    );
  }

  function addProduct(destination?: string) {
    if (user && data) {
      addToCart.mutate({ productId: data.id, quantity }, { onSuccess: () => destination && navigate(destination) });
      return;
    }

    addGuestCartItem({
      id: product.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image ?? null,
      productUnitType: unit,
      productUnitSize: product.unitSize ?? unit,
      quantity,
      unitPrice: String(price),
    });
    toast.success("Product added to cart.");
    if (destination) navigate(destination);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Heart className="mr-2 h-4 w-4" />Wishlist</Button>
          <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" />Share</Button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-lg border bg-muted">
          <div className="flex aspect-square items-center justify-center text-xl font-semibold text-muted-foreground">
            {product.image && !imageFailed ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
            ) : product.icon ? product.icon : <Package className="h-16 w-16" />}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{product.categoryName ?? product.category}</Badge>
            <Badge variant="secondary">{product.grade ?? "Grade A"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">⭐ {product.rating ?? "4.8"} (356 Reviews)</p>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">by {product.supplierName ?? product.supplier ?? "Fresh Farms"}</p>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-emerald-700">{formatCurrency(price)}</span>
            <span className="text-sm text-muted-foreground">/ {unitLabels[unit] ?? unit}</span>
            {compareAt > 0 && <span className="text-lg text-muted-foreground line-through">{formatCurrency(compareAt)}</span>}
            <Badge>{discount}% OFF</Badge>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Stock : {product.stock ?? "Backend"} {unit}</p>
            <p>MOQ : {minQty} {unit}</p>
            <p>Origin: {product.origin ?? "Himachal Pradesh"}</p>
            <p>Delivery: {product.delivery ?? "Tomorrow"}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Quantity</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(minQty, quantity - 1))} disabled={quantity <= minQty}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-20 text-center font-medium">{quantity} {unit}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-lg font-semibold">Total : {formatCurrency(price * quantity)}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="h-12" onClick={() => addProduct()}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add & Continue Shopping
            </Button>
            <Button className="h-12 bg-emerald-600 hover:bg-emerald-700" onClick={() => addProduct("/checkout")}>
              <Zap className="mr-2 h-4 w-4" />
              Buy Now
            </Button>
            <Button className="h-12 md:col-span-2" onClick={() => addProduct("/cart")} disabled={addToCart.isPending}>
              <Check className="mr-2 h-4 w-4" />
              Add to Cart & Go to Cart
            </Button>
          </div>
        </div>
      </section>

      <DetailSection title="Product Description">
        {product.description ?? "Fresh premium products harvested and packed for wholesale buyers."}
      </DetailSection>
      <DetailSection title="Supplier Information">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>Supplier Name: {product.supplierName ?? product.supplier ?? "Fresh Farms"}</p>
          <p>Address: Backend placeholder</p>
          <p>Rating: {product.rating ?? "4.8"}</p>
          <p>Contact: Backend placeholder</p>
        </div>
      </DetailSection>
      <DetailSection title="Related Products">
        <div className="flex flex-wrap gap-2">
          {related.map((item) => (
            <Link key={item.slug} to={`/products/${item.slug}`} className="rounded-md border px-3 py-2 text-sm hover:bg-muted">
              {item.icon} {item.name}
            </Link>
          ))}
        </div>
      </DetailSection>
    </div>
  );
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
