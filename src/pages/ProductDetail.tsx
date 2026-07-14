import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { addGuestCartItem } from "@/lib/guestCart";
import { formatCurrency } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  ArrowLeft,
  Leaf,
  MapPin,
  Calendar,
  Award,
  Package,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { useState } from "react";

const gradeLabels: Record<string, string> = {
  premium: "Premium",
  grade_a: "Grade A",
  grade_b: "Grade B",
  standard: "Standard",
};

const unitLabels: Record<string, string> = {
  kg: "KG", lb: "LB", case: "Case", pallet: "Pallet",
  each: "Each", bunch: "Bunch", box: "Box", bag: "Bag",
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

  const { data: product, isLoading } = trpc.product.bySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const cartQuery = trpc.cart.list.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      cartQuery.refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-80" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const unitPrice = parseFloat(product.unitPrice?.toString() ?? "0");
  const totalPrice = unitPrice * quantity;
  const minQty = product.minimumOrderQuantity ?? 1;

  const certifications = product.certifications
    ? JSON.parse(product.certifications as string)
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden bg-muted border aspect-square">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {product.categoryName}
              </Badge>
              {product.organic && (
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs">
                  <Leaf className="mr-1 h-3 w-3" />
                  Organic
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {gradeLabels[product.grade] ?? product.grade}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              by{" "}
              <Link
                to={`/products?supplier=${product.supplierId}`}
                className="text-emerald-600 hover:underline"
              >
                {product.supplierName}
              </Link>
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Pricing */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(unitPrice)}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {unitLabels[product.unitType] ?? product.unitType}
                </span>
                {product.compareAtPrice && parseFloat(product.compareAtPrice.toString()) > 0 && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>

              <Separator />

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                    disabled={quantity <= minQty}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(minQty, parseInt(e.target.value) || minQty))
                    }
                    className="w-20 text-center"
                    min={minQty}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Min: {minQty}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 bg-muted/50 rounded-lg px-3">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">{formatCurrency(totalPrice)}</span>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11"
                onClick={() => {
                  if (user) {
                    addToCart.mutate({
                      productId: product.id,
                      quantity,
                    });
                    return;
                  }

                  addGuestCartItem({
                    id: product.id,
                    productId: product.id,
                    productSlug: product.slug,
                    productName: product.name,
                    productImage: product.image,
                    productUnitType: product.unitType,
                    productUnitSize: product.unitSize,
                    quantity,
                    unitPrice: product.unitPrice.toString(),
                  });
                  navigate("/cart");
                }}
                disabled={addToCart.isPending}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Origin", value: product.origin },
              { icon: Calendar, label: "Season", value: product.season },
              { icon: Package, label: "Unit Size", value: product.unitSize },
              { icon: Award, label: "Grade", value: gradeLabels[product.grade] },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value ?? "N/A"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert: string) => (
                  <Badge key={cert} variant="outline" className="text-xs">
                    <Check className="mr-1 h-3 w-3 text-emerald-500" />
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
