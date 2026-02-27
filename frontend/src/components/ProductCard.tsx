import { useState } from 'react';
import { Product } from '../backend';
import { useAddToCart } from '../hooks/useQueries';
import { Minus, Plus, Clock } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isShopClosed?: boolean;
}

export default function ProductCard({ product, isShopClosed = false }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useAddToCart();

  const unitLabel =
    product.unitType === 'kg'
      ? 'kg'
      : product.unitType === 'gram'
      ? 'g'
      : product.unitType === 'packet'
      ? 'pkt'
      : 'pc';

  const handleAddToCart = async () => {
    if (isShopClosed) return;
    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(quantity) });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.image.getDirectURL()}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/coming-soon.dim_400x300.png';
          }}
        />
        {/* Delivery badge */}
        <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <Clock size={9} />
          10 Mins
        </div>
        {/* Shop closed overlay */}
        {isShopClosed && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              Shop Closed
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-2 flex flex-col flex-1 gap-1">
        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">
          {product.name}
        </p>
        <p className="text-xs text-gray-500">{product.category}</p>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-sm font-bold text-[#0056b3]">₹{product.priceInRupees.toString()}</span>
          <span className="text-[10px] text-gray-400">/{unitLabel}</span>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center gap-1 mt-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            disabled={isShopClosed}
          >
            <Minus size={10} />
          </button>
          <span className="text-xs font-medium w-5 text-center">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            disabled={isShopClosed}
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isShopClosed || addToCart.isPending}
          className={`w-full mt-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isShopClosed
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : added
              ? 'bg-emerald-500 text-white'
              : 'bg-[#0056b3] text-white hover:bg-[#004494] active:scale-95'
          }`}
        >
          {isShopClosed ? 'Shop Closed' : added ? '✓ Added!' : '+ ADD'}
        </button>
      </div>
    </div>
  );
}
