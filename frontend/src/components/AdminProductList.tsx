import { useState } from 'react';
import { Trash2, AlertTriangle, Package, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useGetAllProducts, useRemoveProduct, useUpdateProductStock } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const LOW_STOCK_THRESHOLD = 5;

export default function AdminProductList() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const removeProduct = useRemoveProduct();
  const updateStock = useUpdateProductStock();

  // Track which product is being edited for stock
  const [editingStockId, setEditingStockId] = useState<bigint | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>('');

  const handleRemove = async (productId: bigint, productName: string) => {
    try {
      await removeProduct.mutateAsync(productId);
      toast.success(`${productName} removed successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove product');
    }
  };

  const handleStartEditStock = (productId: bigint, currentStock: bigint) => {
    setEditingStockId(productId);
    setEditingStockValue(Number(currentStock).toString());
  };

  const handleCancelEditStock = () => {
    setEditingStockId(null);
    setEditingStockValue('');
  };

  const handleSaveStock = async (productId: bigint, productName: string) => {
    const newStock = parseInt(editingStockValue);
    if (isNaN(newStock) || newStock < 0) {
      toast.error('Please enter a valid stock quantity (0 or more)');
      return;
    }
    try {
      await updateStock.mutateAsync({ productId, newStock: BigInt(newStock) });
      toast.success(`Stock updated for "${productName}"`);
      setEditingStockId(null);
      setEditingStockValue('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stock');
    }
  };

  // Format unit type for display
  const formatUnitType = (unitType: string) => {
    switch (unitType) {
      case 'kg': return 'Kg';
      case 'gram': return 'g';
      case 'packet': return 'Pkt';
      case 'piece': return 'Pcs';
      default: return unitType.charAt(0).toUpperCase() + unitType.slice(1);
    }
  };

  const lowStockCount = products.filter(p => Number(p.stock) < LOW_STOCK_THRESHOLD).length;

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-xl">All Products</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="shadow-md">
        <CardHeader className="border-b bg-gray-50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-xl">All Products ({products.length})</CardTitle>
            {lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span className="text-sm font-semibold text-red-700">
                  {lowStockCount} item{lowStockCount > 1 ? 's' : ''} low on stock
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No products added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Image</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Unit</TableHead>
                    <TableHead className="font-semibold">Price</TableHead>
                    <TableHead className="font-semibold">Stock</TableHead>
                    <TableHead className="font-semibold">Barcode</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockNum = Number(product.stock);
                    const isLowStock = stockNum < LOW_STOCK_THRESHOLD;
                    const isEditingThis = editingStockId === product.id;
                    const isSavingThis = updateStock.isPending && editingStockId === product.id;

                    return (
                      <TableRow
                        key={Number(product.id)}
                        className={isLowStock ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-gray-50'}
                      >
                        <TableCell>
                          <img
                            src={product.image.getDirectURL()}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatUnitType(product.unitType)}</TableCell>
                        <TableCell className="font-semibold text-primary">₹{Number(product.priceInRupees)}</TableCell>

                        {/* Stock Cell */}
                        <TableCell>
                          {isEditingThis ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min="0"
                                value={editingStockValue}
                                onChange={(e) => setEditingStockValue(e.target.value)}
                                className="h-7 w-20 text-sm px-2"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveStock(product.id, product.name);
                                  if (e.key === 'Escape') handleCancelEditStock();
                                }}
                                disabled={isSavingThis}
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleSaveStock(product.id, product.name)}
                                disabled={isSavingThis}
                                title="Save stock"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-gray-500 hover:text-gray-700"
                                onClick={handleCancelEditStock}
                                disabled={isSavingThis}
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => handleStartEditStock(product.id, product.stock)}
                                    className="flex items-center gap-1.5 group"
                                    title="Click to edit stock"
                                  >
                                    <span className={`text-sm font-semibold ${isLowStock ? 'text-red-700' : 'text-gray-800'}`}>
                                      {stockNum}
                                    </span>
                                    <Pencil className="h-3 w-3 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Click to update stock</p>
                                </TooltipContent>
                              </Tooltip>
                              {isLowStock && (
                                <Badge
                                  className="bg-red-600 hover:bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 leading-none flex items-center gap-0.5 shrink-0"
                                >
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                  Low Stock
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="font-mono text-sm">{product.barcode || '-'}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemove(product.id, product.name)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
