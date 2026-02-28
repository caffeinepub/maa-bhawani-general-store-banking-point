import React, { useState, useMemo } from 'react';
import { Search, X, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetAllProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: products, isLoading } = useGetAllProducts();

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9 bg-gray-50 border-gray-200"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && query && (
          <p className="text-sm text-gray-500 mb-3">
            {filtered.length === 0
              ? `No results for "${query}"`
              : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product) => (
              <ProductCard key={product.id.toString()} product={product} isShopClosed={false} />
            ))}
          </div>
        )}

        {/* Empty state — no query */}
        {!isLoading && !query && products && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id.toString()} product={product} isShopClosed={false} />
            ))}
          </div>
        )}

        {/* Empty state — no products at all */}
        {!isLoading && !query && (!products || products.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No products yet</h3>
            <p className="text-gray-400 text-sm mt-1">Products will appear here once added.</p>
          </div>
        )}

        {/* No search results */}
        {!isLoading && query && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No results found</h3>
            <p className="text-gray-400 text-sm mt-1">
              Try searching with different keywords.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
