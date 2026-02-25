import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { Product } from '../backend';
import { useAddToCart, useGetShopOpenStatus } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

// Helper function to parse weight input (e.g., "100g", "0.5kg", "1.5kg", "250g")
function parseWeightToGrams(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  
  // Match patterns like "100g", "0.5kg", "1.5kg"
  const kgMatch = trimmed.match(/^(\d+\.?\d*)\s*kg$/);
  const gramMatch = trimmed.match(/^(\d+\.?\d*)\s*g$/);
  
  if (kgMatch) {
    const kg = parseFloat(kgMatch[1]);
    if (!isNaN(kg) && kg > 0) {
      return Math.round(kg * 1000); // Convert kg to grams
    }
  } else if (gramMatch) {
    const grams = parseFloat(gramMatch[1]);
    if (!isNaN(grams) && grams > 0) {
      return Math.round(grams);
    }
  }
  
  return null;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();
  const { identity } = useInternetIdentity();
  const { data: isShopOpen } = useGetShopOpenStatus();
  const [weightInput, setWeightInput] = useState('');

  const isWeightBased = product.unitType === 'kg' || product.unitType === 'gram';

  const handleAddToCart = async () => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!isShopOpen) {
      toast.error('Shop is currently closed. Cannot add items to cart.');
      return;
    }

    try {
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
      toast.success(`${product.name} added to cart!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const handleAddWeightToCart = async () => {
    if (!identity) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!isShopOpen) {
      toast.error('Shop is currently closed. Cannot add items to cart.');
      return;
    }

    if (!weightInput.trim()) {
      toast.error('Please enter a weight');
      return;
    }

    const grams = parseWeightToGrams(weightInput);
    if (grams === null) {
      toast.error('Invalid weight format. Use formats like "100g", "0.5kg", "1.5kg"');
      return;
    }

    try {
      // Store weight in grams as quantity
      await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(grams) });
      toast.success(`${product.name} (${weightInput}) added to cart!`);
      setWeightInput('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const imageUrl = product.image.getDirectURL();

  // Format unit type for display
  const unitTypeDisplay = product.unitType.charAt(0).toUpperCase() + product.unitType.slice(1);

  const isDisabled = !isShopOpen || addToCart.isPending;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-2">
          <Badge variant="secondary" className="text-xs bg-secondary text-white">
            {product.category}
          </Badge>
          <Badge variant="outline" className="text-xs border-primary text-primary">
            {unitTypeDisplay}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-2xl font-bold text-primary">₹{Number(product.priceInRupees)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {isWeightBased ? (
          <div className="w-full space-y-2">
            <Input
              placeholder="e.g., 100g, 0.5kg, 1.5kg"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddWeightToCart();
                }
              }}
              disabled={!isShopOpen}
            />
            <Button
              onClick={handleAddWeightToCart}
              disabled={isDisabled}
              title={!isShopOpen ? 'Shop is closed' : ''}
              className={`w-full gap-2 bg-primary hover:bg-primary/90 text-white min-h-[44px] ${
                !isShopOpen ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={isDisabled}
            title={!isShopOpen ? 'Shop is closed' : ''}
            className={`w-full gap-2 bg-primary hover:bg-primary/90 text-white min-h-[44px] ${
              !isShopOpen ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
