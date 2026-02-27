import { useState } from 'react';
import { useGetAllProducts, useGetShopStatus } from '../hooks/useQueries';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductGrid() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const { data: isShopOpen, isFetched: shopStatusFetched } = useGetShopStatus();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // shopIsClosed is only true once we have a confirmed server response saying closed
  const shopIsClosed = shopStatusFetched && isShopOpen === false;

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="w-full rounded-xl" style={{ aspectRatio: '1/1' }} />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <img
            src="/assets/generated/coming-soon.dim_400x300.png"
            alt="Coming Soon"
            className="w-48 h-36 object-contain mb-4 opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <h3 className="text-lg font-bold text-foreground mb-1">Coming Soon!</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Products are being added to this category. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={Number(product.id)}
              product={product}
              shopIsClosed={shopIsClosed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
