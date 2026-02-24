import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetCart, useClearCart, useAddToCart } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useState } from 'react';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to format weight display
function formatWeight(grams: number, unitType: string): string {
  if (unitType === 'kg') {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 2)} Kg`;
    }
    return `${grams} g`;
  } else if (unitType === 'gram') {
    return `${grams} Gram`;
  }
  return `${grams}`;
}

// Helper function to parse weight input
function parseWeightToGrams(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  const kgMatch = trimmed.match(/^(\d+\.?\d*)\s*kg$/);
  const gramMatch = trimmed.match(/^(\d+\.?\d*)\s*g$/);
  
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    if (!isNaN(kg) && kg > 0) {
      return Math.round(kg * 1000);
    }
  } else if (gramMatch) {
    const grams = parseFloat(gramMatch[1]);
    if (!isNaN(grams) && grams > 0) {
      return Math.round(grams);
    }
  }
  
  return null;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { data: cart = [] } = useGetCart();
  const clearCart = useClearCart();
  const addToCart = useAddToCart();
  const navigate = useNavigate();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [editingWeight, setEditingWeight] = useState<{ [key: string]: string }>({});

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.product.priceInRupees) * Number(item.quantity),
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    onOpenChange(false);
    navigate({ to: '/checkout' });
  };

  const handleClearCart = async () => {
    try {
      await clearCart.mutateAsync();
      toast.success('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const handleUpdateQuantity = async (productId: bigint, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      toast.error('Quantity must be at least 1');
      return;
    }

    try {
      // Clear cart and re-add with new quantity
      await clearCart.mutateAsync();
      
      // Re-add all items except the one being updated
      for (const item of cart) {
        if (item.product.id === productId) {
          await addToCart.mutateAsync({ productId, quantity: BigInt(newQty) });
        } else {
          await addToCart.mutateAsync({ productId: item.product.id, quantity: item.quantity });
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  const handleUpdateWeight = async (productId: bigint, weightInput: string) => {
    const grams = parseWeightToGrams(weightInput);
    if (grams === null) {
      toast.error('Invalid weight format. Use formats like "100g", "0.5kg"');
      return;
    }

    try {
      // Clear cart and re-add with new weight
      await clearCart.mutateAsync();
      
      // Re-add all items
      for (const item of cart) {
        if (item.product.id === productId) {
          await addToCart.mutateAsync({ productId, quantity: BigInt(grams) });
        } else {
          await addToCart.mutateAsync({ productId: item.product.id, quantity: item.quantity });
        }
      }
      
      setEditingWeight((prev) => {
        const newState = { ...prev };
        delete newState[productId.toString()];
        return newState;
      });
      toast.success('Weight updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update weight');
    }
  };

  // Swipe gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isRightSwipe) {
      onOpenChange(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-lg flex flex-col"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cart.length})
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {cart.map((item) => {
                  const imageUrl = item.product.image.getDirectURL();
                  const isWeightBased = item.product.unitType === 'kg' || item.product.unitType === 'gram';
                  const isEditing = editingWeight[item.product.id.toString()];
                  
                  return (
                    <div key={Number(item.product.id)} className="flex gap-4">
                      <img
                        src={imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.product.category}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          {isWeightBased ? (
                            <div className="flex items-center gap-2">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <Input
                                    className="w-24 h-8 text-sm"
                                    placeholder="e.g., 100g"
                                    value={isEditing}
                                    onChange={(e) => setEditingWeight((prev) => ({
                                      ...prev,
                                      [item.product.id.toString()]: e.target.value,
                                    }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleUpdateWeight(item.product.id, isEditing);
                                      }
                                    }}
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2"
                                    onClick={() => handleUpdateWeight(item.product.id, isEditing)}
                                  >
                                    ✓
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  className="text-sm underline"
                                  onClick={() => setEditingWeight((prev) => ({
                                    ...prev,
                                    [item.product.id.toString()]: formatWeight(Number(item.quantity), item.product.unitType),
                                  }))}
                                >
                                  {formatWeight(Number(item.quantity), item.product.unitType)}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleUpdateQuantity(item.product.id, Number(item.quantity), -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm min-w-[60px] text-center">
                                {Number(item.quantity)} {item.product.unitType.charAt(0).toUpperCase() + item.product.unitType.slice(1)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleUpdateQuantity(item.product.id, Number(item.quantity), 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          <span className="font-semibold">
                            ₹{Number(item.product.priceInRupees) * Number(item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>

              <Button onClick={handleCheckout} className="w-full min-h-[48px]" size="lg">
                Proceed to Checkout
              </Button>

              <Button
                onClick={handleClearCart}
                variant="outline"
                className="w-full gap-2 min-h-[48px]"
                disabled={clearCart.isPending}
              >
                <Trash2 className="h-4 w-4" />
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
