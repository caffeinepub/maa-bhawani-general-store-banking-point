import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useGetAllProducts, useRemoveProduct } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProductList() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const removeProduct = useRemoveProduct();

  const handleRemove = async (productId: bigint, productName: string) => {
    try {
      await removeProduct.mutateAsync(productId);
      toast.success(`${productName} removed successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove product');
    }
  };

  // Format unit type for display
  const formatUnitType = (unitType: string) => {
    return unitType.charAt(0).toUpperCase() + unitType.slice(1);
  };

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
    <Card className="shadow-md">
      <CardHeader className="border-b bg-gray-50">
        <CardTitle className="text-xl">All Products ({products.length})</CardTitle>
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
                  <TableHead className="font-semibold">Unit Type</TableHead>
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Barcode</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={Number(product.id)} className="hover:bg-gray-50">
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
