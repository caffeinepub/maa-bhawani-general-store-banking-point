import React, { useState } from 'react';
import { useGetAllProducts, useUpdateProductStock, useRemoveProduct, useToggleProductExclusion, useGetExcludedProducts } from '../hooks/useQueries';
import { Product } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Loader2, Pencil, Trash2, Check, X } from 'lucide-react';

interface StockEditState {
  productId: bigint;
  value: string;
}

export default function AdminProductList() {
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: excludedProducts } = useGetExcludedProducts();
  const updateStockMutation = useUpdateProductStock();
  const removeProductMutation = useRemoveProduct();
  const toggleExclusionMutation = useToggleProductExclusion();

  const [editingStock, setEditingStock] = useState<StockEditState | null>(null);
  const [stockErrors, setStockErrors] = useState<Record<string, string>>({});
  const [removeErrors, setRemoveErrors] = useState<Record<string, string>>({});

  const isExcluded = (productId: bigint) =>
    excludedProducts?.some((id) => id === productId) ?? false;

  const handleEditStock = (product: Product) => {
    setEditingStock({ productId: product.id, value: product.stock.toString() });
    setStockErrors((prev) => {
      const next = { ...prev };
      delete next[product.id.toString()];
      return next;
    });
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
  };

  const handleSaveStock = async (productId: bigint) => {
    if (!editingStock) return;
    const newStock = parseInt(editingStock.value, 10);
    if (isNaN(newStock) || newStock < 0) {
      setStockErrors((prev) => ({ ...prev, [productId.toString()]: 'Invalid stock value' }));
      return;
    }
    try {
      await updateStockMutation.mutateAsync({ productId, newStock: BigInt(newStock) });
      setEditingStock(null);
      setStockErrors((prev) => {
        const next = { ...prev };
        delete next[productId.toString()];
        return next;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update stock';
      setStockErrors((prev) => ({ ...prev, [productId.toString()]: msg }));
    }
  };

  const handleRemoveProduct = async (productId: bigint) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await removeProductMutation.mutateAsync(productId);
      setRemoveErrors((prev) => {
        const next = { ...prev };
        delete next[productId.toString()];
        return next;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove product';
      setRemoveErrors((prev) => ({ ...prev, [productId.toString()]: msg }));
    }
  };

  const handleToggleExclusion = async (productId: bigint) => {
    try {
      await toggleExclusionMutation.mutateAsync(productId);
    } catch {
      // silently handled
    }
  };

  if (productsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const lowStockProducts = products?.filter((p) => Number(p.stock) < 5) ?? [];

  return (
    <div className="space-y-4">
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {lowStockProducts.length} product(s) have low stock (below 5 units): {lowStockProducts.map((p) => p.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {updateStockMutation.isError && !editingStock && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to update stock: {updateStockMutation.error?.message ?? 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {removeProductMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to remove product: {removeProductMutation.error?.message ?? 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {(!products || products.length === 0) ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-medium">No products yet</p>
          <p className="text-sm">Add your first product using the form above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {products.map((product) => {
                const isLowStock = Number(product.stock) < 5;
                const isEditing = editingStock?.productId === product.id;
                const isSaving = updateStockMutation.isPending && isEditing;
                const isRemoving = removeProductMutation.isPending;
                const stockError = stockErrors[product.id.toString()];
                const removeError = removeErrors[product.id.toString()];
                const excluded = isExcluded(product.id);

                return (
                  <tr
                    key={product.id.toString()}
                    className={`${isLowStock ? 'bg-red-950/30' : 'bg-slate-900'} hover:bg-slate-800/50 transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image.getDirectURL()}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/generated/product-aata.dim_300x300.png';
                          }}
                        />
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.barcode || 'No barcode'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{product.category}</td>
                    <td className="px-4 py-3 text-slate-300">₹{product.priceInRupees.toString()}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editingStock.value}
                              onChange={(e) =>
                                setEditingStock({ productId: product.id, value: e.target.value })
                              }
                              className="w-20 h-7 text-xs bg-slate-700 border-slate-600 text-white"
                              min="0"
                              disabled={isSaving}
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveStock(product.id)}
                              disabled={isSaving}
                              className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50"
                              title="Save"
                            >
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditStock(product)}
                            className="flex items-center gap-1 group"
                            disabled={updateStockMutation.isPending}
                          >
                            <span className={`font-medium ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                              {product.stock.toString()}
                            </span>
                            <Pencil className="h-3 w-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          </button>
                        )}
                        {isLowStock && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            Low Stock
                          </Badge>
                        )}
                        {stockError && (
                          <p className="text-xs text-red-400">{stockError}</p>
                        )}
                        {removeError && (
                          <p className="text-xs text-red-400">{removeError}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleExclusion(product.id)}
                        disabled={toggleExclusionMutation.isPending}
                        className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                          excluded
                            ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50'
                            : 'bg-green-900/50 text-green-300 hover:bg-green-800/50'
                        } disabled:opacity-50`}
                      >
                        {excluded ? 'Hidden' : 'Visible'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveProduct(product.id)}
                        disabled={isRemoving || updateStockMutation.isPending}
                        className="h-7 text-xs"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        <span className="ml-1">Remove</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
