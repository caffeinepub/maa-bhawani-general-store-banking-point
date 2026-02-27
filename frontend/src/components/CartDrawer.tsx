import React, { useState } from 'react';
import { useGetCart, useClearCart, useShopStatus } from '../hooks/useQueries';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { data: cartItems, isLoading: cartLoading } = useGetCart();
  const clearCartMutation = useClearCart();
  const shopStatusQuery = useShopStatus();
  const navigate = useNavigate();

  const isShopClosed = shopStatusQuery.data === false;

  const total = cartItems?.reduce(
    (sum, item) => sum + Number(item.product.priceInRupees) * Number(item.quantity),
    0
  ) ?? 0;

  const handleCheckout = () => {
    onClose();
    navigate({ to: '/checkout' });
  };

  const handleClearCart = async () => {
    try {
      await clearCartMutation.mutateAsync();
    } catch {
      // handled by mutation
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#0056b3]" />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cartLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : !cartItems || cartItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm">Add some products to get started!</p>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.product.image.getDirectURL()}
                  alt={item.product.name}
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/generated/product-aata.dim_300x300.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity.toString()}</p>
                </div>
                <p className="font-bold text-[#0056b3] text-sm">
                  ₹{(Number(item.product.priceInRupees) * Number(item.quantity)).toFixed(0)}
                </p>
              </div>
            ))
          )}
        </div>

        {cartItems && cartItems.length > 0 && (
          <>
            <Separator />
            <div className="py-3 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="font-bold text-lg text-gray-800">₹{total.toFixed(0)}</span>
              </div>
              <p className="text-xs text-gray-500">* Delivery charges calculated at checkout</p>

              {isShopClosed && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-red-600 text-sm font-medium">🔴 Shop is currently closed</p>
                  <p className="text-red-500 text-xs mt-1">Checkout is unavailable until the shop reopens.</p>
                </div>
              )}
            </div>

            <SheetFooter className="flex flex-col gap-2 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="w-full">
                      <Button
                        onClick={handleCheckout}
                        disabled={isShopClosed}
                        className="w-full bg-[#0056b3] hover:bg-[#004494] text-white font-bold py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isShopClosed ? 'Checkout Unavailable' : `Proceed to Checkout — ₹${total.toFixed(0)}`}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {isShopClosed && (
                    <TooltipContent>
                      <p>Checkout unavailable: Shop is currently closed</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={clearCartMutation.isPending}
                className="w-full border-red-300 text-red-600 hover:bg-red-50 font-medium"
              >
                {clearCartMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Cart
                  </>
                )}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
