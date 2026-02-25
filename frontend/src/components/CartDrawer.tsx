import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useGetCart, useClearCart, useAddToCart, useGetShopOpenStatus } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useState } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to format weight in grams to display format
function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toFixed(kg % 1 === 0 ? 0 : 2)} Kg`;
  }
  return `${grams} g`;
}

// Helper function to format quantity with unit type
function formatQuantityWithUnit(quantity: number, unitType: string): string {
  const isWeightBased = unitType === 'kg' || unitType === 'gram';
  
  if (isWeightBased) {
    return formatWeight(quantity);
  }
  
  const unitDisplay = unitType.charAt(0).toUpperCase() + unitType.slice(1);
  return `${quantity} ${unitDisplay}`;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { data: cart = [] } = useGetCart();
  const { data: isShopOpen } = useGetShopOpenStatus();
  const clearCart = useClearCart();
  const addToCart = useAddToCart();
  const navigate = useNavigate();
  const [editingItemId, setEditingItemId] = useState<bigint | null>(null);
  const [editWeight, setEditWeight] = useState('');

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear cart');
    }
  };

  const handleUpdateQuantity = async (productId: bigint, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity <= 0) return;

    try {
      await addToCart.mutateAsync({ productId, quantity: BigInt(newQuantity) });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId: bigint) => {
    try {
      await addToCart.mutateAsync({ productId, quantity: BigInt(0) });
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!isShopOpen) {
      toast.error('Shop is currently closed. Cannot proceed to checkout.');
      return;
    }
    onClose();
    navigate({ to: '/checkout' });
  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + Number(item.product.priceInRupees) * Number(item.quantity);
  }, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-white">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Shopping Cart</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">Add some products to get started!</p>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => {
                const isWeightBased = item.product.unitType === 'kg' || item.product.unitType === 'gram';
                
                return (
                  <div key={Number(item.product.id)} className="flex gap-4 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow">
                    <img
                      src={item.product.image.getDirectURL()}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2 mb-1">{item.product.name}</h4>
                      <p className="text-primary font-bold mb-2">₹{Number(item.product.priceInRupees)}</p>
                      
                      {isWeightBased ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={formatWeight(Number(item.quantity))}
                            readOnly
                            className="w-24 h-8 text-sm text-center"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.product.id, Number(item.quantity), -1)}
                            disabled={Number(item.quantity) <= 1}
                            className="h-8 w-8 p-0 hover:bg-primary/5 hover:border-primary"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium text-sm">
                            {formatQuantityWithUnit(Number(item.quantity), item.product.unitType)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.product.id, Number(item.quantity), 1)}
                            className="h-8 w-8 p-0 hover:bg-primary/5 hover:border-primary"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <p className="font-bold text-sm">
                        ₹{Number(item.product.priceInRupees) * Number(item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-4">
              {!isShopOpen && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-900">
                  Shop is currently closed. Checkout is unavailable.
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">₹{totalPrice}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  disabled={clearCart.isPending}
                  className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                >
                  Clear Cart
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={!isShopOpen}
                  className={`flex-1 bg-primary hover:bg-primary/90 text-white min-h-[44px] ${
                    !isShopOpen ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
