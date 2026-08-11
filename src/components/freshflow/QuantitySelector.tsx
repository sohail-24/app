import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QuantitySelectorProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  moq: number;
  stock: number;
  isOutOfStock: boolean;
  unitLabel: string;
}

export function QuantitySelector({
  quantity,
  setQuantity,
  moq,
  stock,
  isOutOfStock,
  unitLabel,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-1 sm:p-2">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 sm:h-10 sm:w-10 bg-card rounded-md shadow-sm transition-transform active:scale-95"
        onClick={() => setQuantity(Math.max(moq, quantity - 1))}
        disabled={quantity <= moq || isOutOfStock}
      >
        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
      <span className="min-w-12 sm:min-w-20 text-center font-semibold text-xs sm:text-sm">
        {quantity} {unitLabel}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 sm:h-10 sm:w-10 bg-card rounded-md shadow-sm transition-transform active:scale-95"
        onClick={() => {
          if (quantity >= stock) {
            toast.error(`Only ${stock} available.`);
          } else {
            setQuantity(quantity + 1);
          }
        }}
        disabled={isOutOfStock}
      >
        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
