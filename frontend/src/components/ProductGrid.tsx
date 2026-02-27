import { useGetAllProducts, useGetShopStatus } from '../hooks/useQueries';
import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  selectedCategory?: string;
}

export default function ProductGrid({ selectedCategory }: ProductGridProps) {
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: isOpen } = useGetShopStatus();

  const isShopClosed = isOpen === false;

  const filtered =
    selectedCategory && selectedCategory !== 'All'
      ? (products ?? []).filter((p) => p.category === selectedCategory)
      : (products ?? []);

  if (productsLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-2 space-y-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-7 w-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <img
          src="/assets/generated/coming-soon.dim_400x300.png"
          alt="Coming Soon"
          className="w-40 h-auto mb-4 opacity-70"
        />
        <p className="text-muted-foreground font-medium">No products found</p>
        <p className="text-xs text-muted-foreground mt-1">Check back soon for new arrivals!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {filtered.map((product) => (
        <ProductCard key={product.id.toString()} product={product} isShopClosed={isShopClosed} />
      ))}
    </div>
  );
}
