import { useGetCart, useClearCart, useGetShopStatus } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, AlertTriangle, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { data: cartItems, isLoading } = useGetCart();
  const clearCart = useClearCart();
  const { data: isOpen } = useGetShopStatus();

  const isShopClosed = isOpen === false;

  const subtotal = (cartItems ?? []).reduce(
    (sum, item) => sum + Number(item.product.priceInRupees) * Number(item.quantity),
    0
  );

  const FREE_DELIVERY_THRESHOLD = 51;
  const DELIVERY_FEE = 5;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (isShopClosed) return;
    onClose();
    navigate({ to: '/checkout' });
  };

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full max-w-sm flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {/* Shop Closed Warning */}
        {isShopClosed && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-sm">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Shop is currently closed. You cannot checkout right now.</span>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-14 h-14 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (cartItems ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <ShoppingCart size={40} className="mb-2 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            (cartItems ?? []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={item.product.image.getDirectURL()}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      '/assets/generated/coming-soon.dim_400x300.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">
                    ₹{item.product.priceInRupees.toString()} × {item.quantity.toString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#0056b3]">
                  ₹{(Number(item.product.priceInRupees) * Number(item.quantity)).toFixed(0)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Price Breakdown */}
        {(cartItems ?? []).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2 py-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span className="flex items-center gap-1">
                  <Truck size={13} />
                  Delivery Fee
                </span>
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-semibold">FREE</span>
                ) : (
                  <span>₹{deliveryFee}</span>
                )}
              </div>
              {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                  Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for FREE delivery!
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-[#0056b3]">₹{total.toFixed(0)}</span>
              </div>
            </div>
          </>
        )}

        <SheetFooter className="flex flex-col gap-2 pt-2">
          {(cartItems ?? []).length > 0 && (
            <button
              onClick={handleClearCart}
              disabled={clearCart.isPending}
              className="w-full py-2 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={14} />
              Clear Cart
            </button>
          )}
          <button
            onClick={handleCheckout}
            disabled={isShopClosed || (cartItems ?? []).length === 0}
            className="w-full py-2.5 rounded-lg bg-[#0056b3] text-white text-sm font-bold hover:bg-[#004494] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isShopClosed ? 'Shop Closed' : 'Proceed to Checkout'}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
