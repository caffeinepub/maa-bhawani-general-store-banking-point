import React, { useState } from 'react';
import { Plus, Minus, Zap, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Product, UnitType } from '../backend';
import { useAddToCart } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  shopIsClosed?: boolean;
}

export default function ProductCard({ product, shopIsClosed = false }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [kgValue, setKgValue] = useState('');
  const addToCart = useAddToCart();

  const isKgOrGram = product.unitType === UnitType.kg || product.unitType === UnitType.gram;

  const getUnitLabel = () => {
    switch (product.unitType) {
      case UnitType.kg: return 'kg';
      case UnitType.gram: return 'g';
      case UnitType.packet: return 'pkt';
      default: return 'pc';
    }
  };

  const handleAddToCart = async () => {
    if (shopIsClosed) {
      toast.error('Shop is currently closed. Cannot add to cart.');
      return;
    }
    try {
      let qty = quantity;
      if (isKgOrGram) {
        const parsed = parseFloat(kgValue);
        if (!kgValue || isNaN(parsed) || parsed <= 0) {
          toast.error('Please enter a valid quantity');
          return;
        }
        qty = product.unitType === UnitType.kg ? Math.round(parsed * 1000) : Math.round(parsed);
      }
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(qty) });
      toast.success(`${product.name} added to cart!`);
      if (isKgOrGram) setKgValue('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add to cart');
    }
  };

  const isAddDisabled = addToCart.isPending || shopIsClosed;

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col ${shopIsClosed ? 'opacity-75' : ''}`}>
      {/* Product Image */}
      <div className="relative">
        <img
          src={product.image.getDirectURL()}
          alt={product.name}
          className="w-full object-cover"
          style={{ aspectRatio: '1/1' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/product-rice.dim_300x300.png';
          }}
        />
        {/* Delivery Badge */}
        <div className="absolute top-1.5 left-1.5">
          <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
            <Zap className="w-2.5 h-2.5" />
            10 Mins
          </span>
        </div>
        {/* Shop Closed Overlay */}
        {shopIsClosed && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Closed
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2.5 flex flex-col flex-1">
        <h3 className="font-bold text-card-foreground text-sm leading-tight mb-0.5 line-clamp-2">
          {product.name}
        </h3>

        {/* Delivery tag below name */}
        <span className="inline-flex items-center gap-0.5 text-green-700 text-[10px] font-semibold mb-1.5">
          <Zap className="w-2.5 h-2.5" />
          Delivery in 10 Mins
        </span>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-primary">
            ₹{Number(product.priceInRupees)}
            <span className="text-[10px] font-normal text-muted-foreground ml-0.5">/{getUnitLabel()}</span>
          </span>
        </div>

        {/* Quantity Controls */}
        {isKgOrGram ? (
          <div className="flex gap-1.5 mt-auto">
            <Input
              type="number"
              placeholder={`Qty (${getUnitLabel()})`}
              value={kgValue}
              onChange={(e) => setKgValue(e.target.value)}
              className="h-9 text-xs"
              min="0"
              step="0.1"
              disabled={shopIsClosed}
            />
            <button
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className={`h-9 px-3 rounded-lg text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
                shopIsClosed
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {shopIsClosed ? <Lock className="w-3.5 h-3.5" /> : '+ ADD'}
            </button>
          </div>
        ) : (
          <div className="mt-auto">
            {/* Quantity stepper */}
            <div className={`flex items-center justify-between border border-border rounded-lg overflow-hidden mb-1.5 ${shopIsClosed ? 'opacity-50' : ''}`}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2.5 py-1.5 hover:bg-muted transition-colors disabled:cursor-not-allowed"
                disabled={shopIsClosed}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-semibold min-w-[1.5rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-2.5 py-1.5 hover:bg-muted transition-colors disabled:cursor-not-allowed"
                disabled={shopIsClosed}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* ADD button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddDisabled}
              className={`w-full h-9 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 ${
                shopIsClosed
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm'
              }`}
            >
              {addToCart.isPending ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : shopIsClosed ? (
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Shop Closed
                </span>
              ) : (
                '+ ADD'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
