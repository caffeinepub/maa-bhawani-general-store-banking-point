import React from 'react';
import { Product } from '../backend';
import { useAddToCart } from '../hooks/useQueries';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductCardProps {
  product: Product;
  isShopClosed?: boolean;
}

export default function ProductCard({ product, isShopClosed = false }: ProductCardProps) {
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async () => {
    if (isShopClosed || addToCartMutation.isPending) return;
    try {
      await addToCartMutation.mutateAsync({ productId: product.id, quantity: BigInt(1) });
    } catch {
      // error handled by mutation
    }
  };

  const unitLabel = product.unitType === 'kg' ? '/kg'
    : product.unitType === 'gram' ? '/g'
    : product.unitType === 'packet' ? '/pkt'
    : '/pc';

  const isDisabled = isShopClosed || addToCartMutation.isPending;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={product.image.getDirectURL()}
          alt={product.name}
          className="w-full h-36 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/product-aata.dim_300x300.png';
          }}
        />
        {Number(product.stock) < 5 && Number(product.stock) > 0 && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Low Stock
          </span>
        )}
        {Number(product.stock) === 0 && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Out of Stock
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-[#0056b3] font-bold text-base">
            ₹{product.priceInRupees.toString()}<span className="text-xs font-normal text-gray-500">{unitLabel}</span>
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleAddToCart}
                  disabled={isDisabled}
                  className="flex items-center gap-1 bg-[#0056b3] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#004494] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label={isShopClosed ? 'Shop is currently closed' : 'Add to cart'}
                >
                  {addToCartMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShoppingCart className="h-3 w-3" />
                  )}
                  <span>{addToCartMutation.isPending ? '...' : 'Add'}</span>
                </button>
              </TooltipTrigger>
              {isShopClosed && (
                <TooltipContent>
                  <p>Shop is currently closed</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {addToCartMutation.isError && (
          <p className="text-red-500 text-xs mt-1">{addToCartMutation.error?.message ?? 'Failed to add to cart'}</p>
        )}
        {addToCartMutation.isSuccess && (
          <p className="text-green-600 text-xs mt-1">✓ Added to cart!</p>
        )}
      </div>
    </div>
  );
}
